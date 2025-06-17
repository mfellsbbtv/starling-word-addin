# CloudFront Configuration for Word Add-in

# Origin Access Control for S3
resource "aws_cloudfront_origin_access_control" "word_addin" {
  name                              = "${local.name_prefix}-oac"
  description                       = "OAC for RHEI Word add-in S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront distribution
resource "aws_cloudfront_distribution" "word_addin" {
  origin {
    domain_name              = aws_s3_bucket.word_addin.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.word_addin.id
    origin_id                = "S3-${aws_s3_bucket.word_addin.bucket}"

    custom_header {
      name  = "X-Forwarded-Proto"
      value = "https"
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "RHEI Word Add-in Distribution"
  default_root_object = "taskpane.html"

  # Custom domain configuration
  aliases = var.enable_custom_domain && var.domain_name != "" ? [var.domain_name] : []

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.word_addin.bucket}"

    forwarded_values {
      query_string = false
      headers      = ["Origin", "Access-Control-Request-Headers", "Access-Control-Request-Method"]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true

    # Security headers
    response_headers_policy_id = aws_cloudfront_response_headers_policy.word_addin.id
  }

  # Cache behavior for manifest files (no caching)
  ordered_cache_behavior {
    path_pattern     = "manifest*.xml"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.word_addin.bucket}"

    forwarded_values {
      query_string = false
      headers      = ["Origin"]

      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  # Cache behavior for static assets (long caching)
  ordered_cache_behavior {
    path_pattern     = "assets/*"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.word_addin.bucket}"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  # Cache behavior for JavaScript files (medium caching)
  ordered_cache_behavior {
    path_pattern     = "*.js"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.word_addin.bucket}"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  price_class = var.cloudfront_price_class

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL certificate configuration
  viewer_certificate {
    cloudfront_default_certificate = var.enable_custom_domain ? false : true
    acm_certificate_arn            = var.enable_custom_domain ? aws_acm_certificate.word_addin[0].arn : null
    ssl_support_method             = var.enable_custom_domain ? "sni-only" : null
    minimum_protocol_version       = var.cloudfront_minimum_protocol_version
  }

  # Custom error responses
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/taskpane.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/taskpane.html"
  }

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-distribution"
    Description = "CloudFront distribution for RHEI Word add-in"
  })

  depends_on = [
    aws_acm_certificate_validation.word_addin
  ]
}

# CloudFront Response Headers Policy for security
resource "aws_cloudfront_response_headers_policy" "word_addin" {
  name    = "${local.name_prefix}-security-headers"
  comment = "Security headers for RHEI Word add-in"

  cors_config {
    access_control_allow_credentials = false

    access_control_allow_headers {
      items = ["*"]
    }

    access_control_allow_methods {
      items = ["GET", "HEAD", "OPTIONS"]
    }

    access_control_allow_origins {
      items = concat(var.allowed_origins, [
        "https://*.office.com",
        "https://*.officeapps.live.com",
        "https://*.outlook.com",
        "https://*.live.com"
      ])
    }

    access_control_expose_headers {
      items = ["Date", "ETag"]
    }

    access_control_max_age_sec = 86400
    origin_override            = true
  }

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      override                   = true
    }

    content_type_options {
      override = true
    }

    frame_options {
      frame_option = "SAMEORIGIN"
      override     = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }
  }
}

# CloudWatch alarms for CloudFront (if monitoring is enabled)
resource "aws_cloudwatch_metric_alarm" "cloudfront_4xx_errors" {
  count               = var.enable_monitoring ? 1 : 0
  alarm_name          = "${local.name_prefix}-cloudfront-4xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "4xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = "300"
  statistic           = "Average"
  threshold           = "5"
  alarm_description   = "This metric monitors CloudFront 4xx error rate"
  alarm_actions       = []

  dimensions = {
    DistributionId = aws_cloudfront_distribution.word_addin.id
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "cloudfront_5xx_errors" {
  count               = var.enable_monitoring ? 1 : 0
  alarm_name          = "${local.name_prefix}-cloudfront-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "5xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = "300"
  statistic           = "Average"
  threshold           = "1"
  alarm_description   = "This metric monitors CloudFront 5xx error rate"
  alarm_actions       = []

  dimensions = {
    DistributionId = aws_cloudfront_distribution.word_addin.id
  }

  tags = local.common_tags
}
