# AWS WAF v2 Configuration for Word Add-in Access Control

# WAF Web ACL for CloudFront
resource "aws_wafv2_web_acl" "word_addin" {
  count = var.enable_access_control ? 1 : 0
  name  = "${local.name_prefix}-waf-acl"
  scope = "CLOUDFRONT"

  default_action {
    allow {}
  }

  # Rule 1: IP Whitelist (if enabled)
  dynamic "rule" {
    for_each = var.enable_ip_whitelist && length(var.allowed_ip_ranges) > 0 ? [1] : []
    content {
      name     = "IPWhitelistRule"
      priority = 1

      override_action {
        none {}
      }

      statement {
        ip_set_reference_statement {
          arn = aws_wafv2_ip_set.allowed_ips[0].arn
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                 = "${local.name_prefix}-ip-whitelist"
        sampled_requests_enabled    = true
      }

      action {
        allow {}
      }
    }
  }

  # Rule 2: Geographic Blocking (if enabled)
  dynamic "rule" {
    for_each = var.enable_geo_blocking && length(var.allowed_countries) > 0 ? [1] : []
    content {
      name     = "GeoBlockingRule"
      priority = 2

      override_action {
        none {}
      }

      statement {
        not_statement {
          statement {
            geo_match_statement {
              country_codes = var.allowed_countries
            }
          }
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                 = "${local.name_prefix}-geo-blocking"
        sampled_requests_enabled    = true
      }

      action {
        block {}
      }
    }
  }

  # Rule 3: Rate Limiting
  rule {
    name     = "RateLimitRule"
    priority = 3

    override_action {
      none {}
    }

    statement {
      rate_based_statement {
        limit              = var.api_rate_limit
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                 = "${local.name_prefix}-rate-limit"
      sampled_requests_enabled    = true
    }

    action {
      block {}
    }
  }

  # Rule 4: Office 365 User-Agent Validation
  rule {
    name     = "Office365UserAgentRule"
    priority = 4

    override_action {
      none {}
    }

    statement {
      or_statement {
        statement {
          byte_match_statement {
            search_string = "Office"
            field_to_match {
              single_header {
                name = "user-agent"
              }
            }
            text_transformation {
              priority = 0
              type     = "LOWERCASE"
            }
            positional_constraint = "CONTAINS"
          }
        }
        statement {
          byte_match_statement {
            search_string = "word"
            field_to_match {
              single_header {
                name = "user-agent"
              }
            }
            text_transformation {
              priority = 0
              type     = "LOWERCASE"
            }
            positional_constraint = "CONTAINS"
          }
        }
        statement {
          byte_match_statement {
            search_string = "outlook"
            field_to_match {
              single_header {
                name = "user-agent"
              }
            }
            text_transformation {
              priority = 0
              type     = "LOWERCASE"
            }
            positional_constraint = "CONTAINS"
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                 = "${local.name_prefix}-office365-ua"
      sampled_requests_enabled    = true
    }

    action {
      allow {}
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                 = "${local.name_prefix}-waf-acl"
    sampled_requests_enabled    = true
  }

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-waf-acl"
    Description = "WAF ACL for RHEI Word add-in access control"
  })
}

# IP Set for allowed IP ranges (if IP whitelist is enabled)
resource "aws_wafv2_ip_set" "allowed_ips" {
  count              = var.enable_ip_whitelist && length(var.allowed_ip_ranges) > 0 ? 1 : 0
  name               = "${local.name_prefix}-allowed-ips"
  scope              = "CLOUDFRONT"
  ip_address_version = "IPV4"
  addresses          = var.allowed_ip_ranges

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-allowed-ips"
    Description = "Allowed IP ranges for RHEI Word add-in"
  })
}

# CloudWatch Log Group for WAF
resource "aws_cloudwatch_log_group" "waf_logs" {
  count             = var.enable_access_control && var.enable_monitoring ? 1 : 0
  name              = "/aws/wafv2/${local.name_prefix}"
  retention_in_days = var.log_retention_days

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-waf-logs"
    Description = "WAF logs for RHEI Word add-in"
  })
}

# WAF Logging Configuration
resource "aws_wafv2_web_acl_logging_configuration" "word_addin" {
  count                   = var.enable_access_control && var.enable_monitoring ? 1 : 0
  resource_arn            = aws_wafv2_web_acl.word_addin[0].arn
  log_destination_configs = [aws_cloudwatch_log_group.waf_logs[0].arn]

  redacted_fields {
    single_header {
      name = "authorization"
    }
  }

  redacted_fields {
    single_header {
      name = "cookie"
    }
  }
}
