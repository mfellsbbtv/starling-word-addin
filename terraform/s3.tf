# S3 Configuration for Word Add-in Static Hosting

# S3 bucket for hosting the Word add-in static files
resource "aws_s3_bucket" "word_addin" {
  bucket = var.s3_bucket_name != "" ? var.s3_bucket_name : "${local.name_prefix}-${random_id.suffix.hex}"

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-bucket"
    Description = "S3 bucket for RHEI Word add-in static files"
  })
}

# S3 bucket versioning
resource "aws_s3_bucket_versioning" "word_addin" {
  bucket = aws_s3_bucket.word_addin.id
  versioning_configuration {
    status = var.enable_s3_versioning ? "Enabled" : "Disabled"
  }
}

# S3 bucket server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "word_addin" {
  bucket = aws_s3_bucket.word_addin.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# S3 bucket public access block
resource "aws_s3_bucket_public_access_block" "word_addin" {
  bucket = aws_s3_bucket.word_addin.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 bucket website configuration
resource "aws_s3_bucket_website_configuration" "word_addin" {
  bucket = aws_s3_bucket.word_addin.id

  index_document {
    suffix = "taskpane.html"
  }

  error_document {
    key = "error.html"
  }

  routing_rule {
    condition {
      key_prefix_equals = "manifest.xml"
    }
    redirect {
      replace_key_with = "manifest.xml"
    }
  }
}

# S3 bucket policy for public read access
resource "aws_s3_bucket_policy" "word_addin" {
  bucket = aws_s3_bucket.word_addin.id
  depends_on = [aws_s3_bucket_public_access_block.word_addin]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.word_addin.arn}/*"
        Condition = {
          StringEquals = {
            "s3:ExistingObjectTag/Environment" = var.environment
          }
        }
      },
      {
        Sid       = "AllowCloudFrontAccess"
        Effect    = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.word_addin.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.word_addin.arn
          }
        }
      }
    ]
  })
}

# S3 bucket CORS configuration for Office add-ins
resource "aws_s3_bucket_cors_configuration" "word_addin" {
  bucket = aws_s3_bucket.word_addin.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = concat(var.allowed_origins, [
      "https://*.office.com",
      "https://*.officeapps.live.com",
      "https://*.outlook.com",
      "https://*.live.com"
    ])
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }

  cors_rule {
    allowed_headers = ["Authorization", "Content-Type"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}

# S3 bucket lifecycle configuration
resource "aws_s3_bucket_lifecycle_configuration" "word_addin" {
  bucket = aws_s3_bucket.word_addin.id

  rule {
    id     = "delete_incomplete_multipart_uploads"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }

  rule {
    id     = "transition_old_versions"
    status = var.enable_s3_versioning ? "Enabled" : "Disabled"

    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }

    noncurrent_version_transition {
      noncurrent_days = 60
      storage_class   = "GLACIER"
    }

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

# S3 bucket notification for CloudFront invalidation (optional)
resource "aws_s3_bucket_notification" "word_addin" {
  bucket = aws_s3_bucket.word_addin.id

  cloudwatch_configuration {
    cloudwatch_configuration_id = "EntireBucket"
    events                      = ["s3:ObjectCreated:*", "s3:ObjectRemoved:*"]
  }
}

# CloudWatch log group for S3 access logs (optional)
resource "aws_cloudwatch_log_group" "s3_access_logs" {
  count             = var.enable_monitoring ? 1 : 0
  name              = "/aws/s3/${aws_s3_bucket.word_addin.bucket}/access-logs"
  retention_in_days = var.log_retention_days

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-s3-access-logs"
    Description = "S3 access logs for Word add-in bucket"
  })
}
