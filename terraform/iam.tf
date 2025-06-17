# IAM Configuration for RHEI Word Add-in

# ECS Task Execution Role (for pulling images and logging)
resource "aws_iam_role" "ecs_execution" {
  count = var.enable_backend ? 1 : 0
  name  = "${local.name_prefix}-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-ecs-execution-role"
    Description = "ECS task execution role for RHEI Word add-in"
  })
}

# ECS Task Role (for application permissions)
resource "aws_iam_role" "ecs_task" {
  count = var.enable_backend ? 1 : 0
  name  = "${local.name_prefix}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-ecs-task-role"
    Description = "ECS task role for RHEI Word add-in"
  })
}

# ECS Execution Role Policy Attachment
resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  count      = var.enable_backend ? 1 : 0
  role       = aws_iam_role.ecs_execution[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Custom policy for ECS execution role (for Secrets Manager access)
resource "aws_iam_role_policy" "ecs_execution_secrets" {
  count = var.enable_backend && var.enable_database ? 1 : 0
  name  = "${local.name_prefix}-ecs-execution-secrets"
  role  = aws_iam_role.ecs_execution[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.db_credentials[0].arn
        ]
      }
    ]
  })
}

# Custom policy for ECS task role (application permissions)
resource "aws_iam_role_policy" "ecs_task_policy" {
  count = var.enable_backend ? 1 : 0
  name  = "${local.name_prefix}-ecs-task-policy"
  role  = aws_iam_role.ecs_task[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "${aws_s3_bucket.word_addin.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.word_addin.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = [
          "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/ecs/${local.name_prefix}-api:*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = var.enable_database ? [
          aws_secretsmanager_secret.db_credentials[0].arn
        ] : []
      }
    ]
  })
}

# CloudFront Origin Access Identity (deprecated, using OAC instead)
# Keeping for reference and potential fallback
resource "aws_cloudfront_origin_access_identity" "word_addin" {
  comment = "OAI for RHEI Word add-in S3 bucket"
}

# IAM role for CloudFront to access S3
resource "aws_iam_role" "cloudfront_s3_access" {
  name = "${local.name_prefix}-cloudfront-s3-access"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-cloudfront-s3-role"
    Description = "CloudFront role for S3 access"
  })
}

# IAM policy for CloudFront S3 access
resource "aws_iam_role_policy" "cloudfront_s3_access" {
  name = "${local.name_prefix}-cloudfront-s3-access"
  role = aws_iam_role.cloudfront_s3_access.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject"
        ]
        Resource = [
          "${aws_s3_bucket.word_addin.arn}/*"
        ]
      }
    ]
  })
}

# IAM role for Lambda functions (if needed for automation)
resource "aws_iam_role" "lambda_execution" {
  count = var.enable_monitoring ? 1 : 0
  name  = "${local.name_prefix}-lambda-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-lambda-execution-role"
    Description = "Lambda execution role for automation"
  })
}

# Lambda basic execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  count      = var.enable_monitoring ? 1 : 0
  role       = aws_iam_role.lambda_execution[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Custom policy for Lambda automation functions
resource "aws_iam_role_policy" "lambda_automation" {
  count = var.enable_monitoring ? 1 : 0
  name  = "${local.name_prefix}-lambda-automation"
  role  = aws_iam_role.lambda_execution[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation",
          "cloudfront:ListInvalidations"
        ]
        Resource = [
          aws_cloudfront_distribution.word_addin.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.word_addin.arn,
          "${aws_s3_bucket.word_addin.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ecs:UpdateService",
          "ecs:DescribeServices",
          "ecs:DescribeTasks"
        ]
        Resource = var.enable_backend ? [
          aws_ecs_service.api[0].id
        ] : []
      }
    ]
  })
}

# IAM user for CI/CD deployments (optional)
resource "aws_iam_user" "deployment" {
  count = var.environment == "prod" ? 1 : 0
  name  = "${local.name_prefix}-deployment-user"
  path  = "/"

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-deployment-user"
    Description = "IAM user for CI/CD deployments"
  })
}

# IAM access key for deployment user
resource "aws_iam_access_key" "deployment" {
  count = var.environment == "prod" ? 1 : 0
  user  = aws_iam_user.deployment[0].name
}

# IAM policy for deployment user
resource "aws_iam_user_policy" "deployment" {
  count = var.environment == "prod" ? 1 : 0
  name  = "${local.name_prefix}-deployment-policy"
  user  = aws_iam_user.deployment[0].name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]
        Resource = [
          aws_s3_bucket.word_addin.arn,
          "${aws_s3_bucket.word_addin.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation",
          "cloudfront:ListInvalidations"
        ]
        Resource = [
          aws_cloudfront_distribution.word_addin.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecs:UpdateService",
          "ecs:DescribeServices"
        ]
        Resource = var.enable_backend ? [
          aws_ecs_service.api[0].id
        ] : []
      }
    ]
  })
}

# Store deployment credentials in Secrets Manager
resource "aws_secretsmanager_secret" "deployment_credentials" {
  count                   = var.environment == "prod" ? 1 : 0
  name                    = "${local.name_prefix}-deployment-credentials"
  description             = "Deployment credentials for CI/CD"
  recovery_window_in_days = 7

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-deployment-secret"
    Description = "Deployment credentials secret"
  })
}

resource "aws_secretsmanager_secret_version" "deployment_credentials" {
  count     = var.environment == "prod" ? 1 : 0
  secret_id = aws_secretsmanager_secret.deployment_credentials[0].id
  secret_string = jsonencode({
    access_key_id     = aws_iam_access_key.deployment[0].id
    secret_access_key = aws_iam_access_key.deployment[0].secret
    region           = var.aws_region
    s3_bucket        = aws_s3_bucket.word_addin.bucket
    cloudfront_distribution_id = aws_cloudfront_distribution.word_addin.id
  })
}
