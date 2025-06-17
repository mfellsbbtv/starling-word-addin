# Route53 Configuration for Custom Domain (Optional)

# Route53 hosted zone (only if custom domain is enabled)
resource "aws_route53_zone" "word_addin" {
  count = var.enable_custom_domain && var.domain_name != "" ? 1 : 0
  name  = var.domain_name

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-zone"
    Description = "Route53 hosted zone for RHEI Word add-in"
  })
}

# Route53 record for the main domain
resource "aws_route53_record" "word_addin" {
  count   = var.enable_custom_domain && var.domain_name != "" ? 1 : 0
  zone_id = aws_route53_zone.word_addin[0].zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.word_addin.domain_name
    zone_id                = aws_cloudfront_distribution.word_addin.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route53 record for www subdomain
resource "aws_route53_record" "word_addin_www" {
  count   = var.enable_custom_domain && var.domain_name != "" ? 1 : 0
  zone_id = aws_route53_zone.word_addin[0].zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.word_addin.domain_name
    zone_id                = aws_cloudfront_distribution.word_addin.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route53 record for API subdomain (if backend is enabled)
resource "aws_route53_record" "api" {
  count   = var.enable_custom_domain && var.enable_backend && var.api_domain != "" ? 1 : 0
  zone_id = aws_route53_zone.word_addin[0].zone_id
  name    = var.api_domain
  type    = "A"

  alias {
    name                   = aws_lb.api[0].dns_name
    zone_id                = aws_lb.api[0].zone_id
    evaluate_target_health = true
  }
}

# Route53 health check for the main domain
resource "aws_route53_health_check" "word_addin" {
  count                           = var.enable_custom_domain && var.enable_monitoring && var.domain_name != "" ? 1 : 0
  fqdn                            = var.domain_name
  port                            = 443
  type                            = "HTTPS"
  resource_path                   = "/taskpane.html"
  failure_threshold               = "3"
  request_interval                = "30"
  cloudwatch_alarm_region         = var.aws_region
  cloudwatch_alarm_name           = "${local.name_prefix}-domain-health"
  insufficient_data_health_status = "Failure"

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-health-check"
    Description = "Health check for RHEI Word add-in domain"
  })
}

# CloudWatch alarm for Route53 health check
resource "aws_cloudwatch_metric_alarm" "domain_health" {
  count               = var.enable_custom_domain && var.enable_monitoring && var.domain_name != "" ? 1 : 0
  alarm_name          = "${local.name_prefix}-domain-health"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HealthCheckStatus"
  namespace           = "AWS/Route53"
  period              = "60"
  statistic           = "Minimum"
  threshold           = "1"
  alarm_description   = "This metric monitors domain health"
  treat_missing_data  = "breaching"

  dimensions = {
    HealthCheckId = aws_route53_health_check.word_addin[0].id
  }

  tags = local.common_tags
}

# Route53 query logging (optional)
resource "aws_route53_query_log" "word_addin" {
  count                    = var.enable_custom_domain && var.enable_monitoring && var.domain_name != "" ? 1 : 0
  depends_on               = [aws_cloudwatch_log_group.route53_query_logs]
  destination_arn          = aws_cloudwatch_log_group.route53_query_logs[0].arn
  hosted_zone_id           = aws_route53_zone.word_addin[0].zone_id
}

# CloudWatch log group for Route53 query logs
resource "aws_cloudwatch_log_group" "route53_query_logs" {
  count             = var.enable_custom_domain && var.enable_monitoring && var.domain_name != "" ? 1 : 0
  name              = "/aws/route53/${var.domain_name}"
  retention_in_days = var.log_retention_days

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-route53-logs"
    Description = "Route53 query logs for RHEI Word add-in"
  })
}

# IAM role for Route53 query logging
resource "aws_iam_role" "route53_query_logging" {
  count = var.enable_custom_domain && var.enable_monitoring && var.domain_name != "" ? 1 : 0
  name  = "${local.name_prefix}-route53-query-logging"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "route53.amazonaws.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

# IAM policy for Route53 query logging
resource "aws_iam_role_policy" "route53_query_logging" {
  count = var.enable_custom_domain && var.enable_monitoring && var.domain_name != "" ? 1 : 0
  name  = "${local.name_prefix}-route53-query-logging"
  role  = aws_iam_role.route53_query_logging[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = aws_cloudwatch_log_group.route53_query_logs[0].arn
      }
    ]
  })
}
