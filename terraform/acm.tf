# ACM (AWS Certificate Manager) Configuration for SSL Certificates

# SSL certificate for the main domain (must be in us-east-1 for CloudFront)
resource "aws_acm_certificate" "word_addin" {
  count           = var.enable_custom_domain && var.domain_name != "" ? 1 : 0
  provider        = aws.us_east_1
  domain_name     = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = [
    "www.${var.domain_name}"
  ]

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-certificate"
    Description = "SSL certificate for RHEI Word add-in"
  })
}

# SSL certificate for API domain (if backend is enabled)
resource "aws_acm_certificate" "api" {
  count           = var.enable_custom_domain && var.enable_backend && var.api_domain != "" ? 1 : 0
  domain_name     = var.api_domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-api-certificate"
    Description = "SSL certificate for RHEI Word add-in API"
  })
}

# DNS validation records for main domain certificate
resource "aws_route53_record" "word_addin_validation" {
  count   = var.enable_custom_domain && var.domain_name != "" ? 1 : 0
  for_each = {
    for dvo in aws_acm_certificate.word_addin[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.word_addin[0].zone_id
}

# DNS validation records for API certificate
resource "aws_route53_record" "api_validation" {
  count   = var.enable_custom_domain && var.enable_backend && var.api_domain != "" ? 1 : 0
  for_each = {
    for dvo in aws_acm_certificate.api[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.word_addin[0].zone_id
}

# Certificate validation for main domain
resource "aws_acm_certificate_validation" "word_addin" {
  count           = var.enable_custom_domain && var.domain_name != "" ? 1 : 0
  provider        = aws.us_east_1
  certificate_arn = aws_acm_certificate.word_addin[0].arn
  validation_record_fqdns = [
    for record in aws_route53_record.word_addin_validation[0] : record.fqdn
  ]

  timeouts {
    create = "5m"
  }
}

# Certificate validation for API domain
resource "aws_acm_certificate_validation" "api" {
  count           = var.enable_custom_domain && var.enable_backend && var.api_domain != "" ? 1 : 0
  certificate_arn = aws_acm_certificate.api[0].arn
  validation_record_fqdns = [
    for record in aws_route53_record.api_validation[0] : record.fqdn
  ]

  timeouts {
    create = "5m"
  }
}

# CloudWatch alarm for certificate expiration
resource "aws_cloudwatch_metric_alarm" "certificate_expiry" {
  count               = var.enable_custom_domain && var.enable_monitoring && var.domain_name != "" ? 1 : 0
  alarm_name          = "${local.name_prefix}-certificate-expiry"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "DaysToExpiry"
  namespace           = "AWS/CertificateManager"
  period              = "86400"
  statistic           = "Average"
  threshold           = "30"
  alarm_description   = "This metric monitors SSL certificate expiry"
  treat_missing_data  = "breaching"

  dimensions = {
    CertificateArn = aws_acm_certificate.word_addin[0].arn
  }

  tags = local.common_tags
}

# CloudWatch alarm for API certificate expiration
resource "aws_cloudwatch_metric_alarm" "api_certificate_expiry" {
  count               = var.enable_custom_domain && var.enable_backend && var.enable_monitoring && var.api_domain != "" ? 1 : 0
  alarm_name          = "${local.name_prefix}-api-certificate-expiry"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "DaysToExpiry"
  namespace           = "AWS/CertificateManager"
  period              = "86400"
  statistic           = "Average"
  threshold           = "30"
  alarm_description   = "This metric monitors API SSL certificate expiry"
  treat_missing_data  = "breaching"

  dimensions = {
    CertificateArn = aws_acm_certificate.api[0].arn
  }

  tags = local.common_tags
}
