# Variables for RHEI AI Legal Assistant AWS Infrastructure

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "rhei-word-addin"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "owner" {
  description = "Owner of the resources"
  type        = string
  default     = "RHEI"
}

variable "domain_name" {
  description = "Custom domain name for the Word add-in (optional)"
  type        = string
  default     = ""
}

variable "api_domain" {
  description = "Custom domain name for the API (optional)"
  type        = string
  default     = ""
}

variable "enable_backend" {
  description = "Whether to deploy the backend API infrastructure"
  type        = bool
  default     = false
}

variable "enable_database" {
  description = "Whether to deploy RDS database"
  type        = bool
  default     = false
}

variable "enable_custom_domain" {
  description = "Whether to use custom domain with Route53"
  type        = bool
  default     = false
}

# S3 Configuration
variable "s3_bucket_name" {
  description = "Name for the S3 bucket (optional, will be generated if not provided)"
  type        = string
  default     = ""
}

variable "enable_s3_versioning" {
  description = "Enable versioning on S3 bucket"
  type        = bool
  default     = true
}

# CloudFront Configuration
variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
  validation {
    condition = contains([
      "PriceClass_All",
      "PriceClass_200",
      "PriceClass_100"
    ], var.cloudfront_price_class)
    error_message = "CloudFront price class must be PriceClass_All, PriceClass_200, or PriceClass_100."
  }
}

variable "cloudfront_minimum_protocol_version" {
  description = "Minimum SSL protocol version for CloudFront"
  type        = string
  default     = "TLSv1.2_2021"
}

# ECS Configuration (for backend API)
variable "ecs_cpu" {
  description = "CPU units for ECS task"
  type        = number
  default     = 256
}

variable "ecs_memory" {
  description = "Memory for ECS task"
  type        = number
  default     = 512
}

variable "ecs_desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 1
}

variable "api_image_uri" {
  description = "Docker image URI for the API"
  type        = string
  default     = "nginx:latest"  # Placeholder
}

# RDS Configuration
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_engine_version" {
  description = "PostgreSQL engine version"
  type        = string
  default     = "15.4"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "rhei_word_addin"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "rhei_admin"
}

# Security Configuration
variable "allowed_origins" {
  description = "Allowed origins for CORS"
  type        = list(string)
  default = [
    "https://word.office.com",
    "https://word-edit.officeapps.live.com",
    "https://outlook.office.com",
    "https://outlook.live.com"
  ]
}

variable "api_rate_limit" {
  description = "API rate limit per minute"
  type        = number
  default     = 100
}

# Monitoring Configuration
variable "enable_monitoring" {
  description = "Enable CloudWatch monitoring and alarms"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

# Backup Configuration
variable "backup_retention_period" {
  description = "RDS backup retention period in days"
  type        = number
  default     = 7
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection for RDS"
  type        = bool
  default     = true
}
