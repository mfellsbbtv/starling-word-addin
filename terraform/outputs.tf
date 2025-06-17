# Outputs for RHEI AI Legal Assistant AWS Infrastructure

# S3 Outputs
output "s3_bucket_name" {
  description = "Name of the S3 bucket hosting the Word add-in"
  value       = aws_s3_bucket.word_addin.bucket
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.word_addin.arn
}

output "s3_website_endpoint" {
  description = "S3 website endpoint"
  value       = aws_s3_bucket_website_configuration.word_addin.website_endpoint
}

# CloudFront Outputs
output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.word_addin.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.word_addin.domain_name
}

output "word_addin_url" {
  description = "URL for the Word add-in"
  value       = var.enable_custom_domain && var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.word_addin.domain_name}"
}

# SSL Certificate Outputs
output "ssl_certificate_arn" {
  description = "ARN of the SSL certificate"
  value       = var.enable_custom_domain ? aws_acm_certificate.word_addin[0].arn : null
}

# Route53 Outputs (if custom domain is enabled)
output "route53_zone_id" {
  description = "Route53 hosted zone ID"
  value       = var.enable_custom_domain ? aws_route53_zone.word_addin[0].zone_id : null
}

output "route53_name_servers" {
  description = "Route53 name servers"
  value       = var.enable_custom_domain ? aws_route53_zone.word_addin[0].name_servers : null
}

# Backend API Outputs (if enabled)
output "api_load_balancer_dns" {
  description = "API load balancer DNS name"
  value       = var.enable_backend ? aws_lb.api[0].dns_name : null
}

output "api_url" {
  description = "API URL"
  value       = var.enable_backend ? (var.enable_custom_domain && var.api_domain != "" ? "https://${var.api_domain}" : "https://${aws_lb.api[0].dns_name}") : null
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = var.enable_backend ? aws_ecs_cluster.api[0].name : null
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = var.enable_backend ? aws_ecs_service.api[0].name : null
}

# Database Outputs (if enabled)
output "rds_endpoint" {
  description = "RDS endpoint"
  value       = var.enable_database ? aws_db_instance.word_addin[0].endpoint : null
  sensitive   = true
}

output "rds_port" {
  description = "RDS port"
  value       = var.enable_database ? aws_db_instance.word_addin[0].port : null
}

output "database_name" {
  description = "Database name"
  value       = var.enable_database ? aws_db_instance.word_addin[0].db_name : null
}

# VPC Outputs (if backend is enabled)
output "vpc_id" {
  description = "VPC ID"
  value       = var.enable_backend ? aws_vpc.main[0].id : null
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = var.enable_backend ? aws_subnet.private[*].id : null
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = var.enable_backend ? aws_subnet.public[*].id : null
}

# Security Group Outputs
output "api_security_group_id" {
  description = "API security group ID"
  value       = var.enable_backend ? aws_security_group.api[0].id : null
}

output "database_security_group_id" {
  description = "Database security group ID"
  value       = var.enable_database ? aws_security_group.database[0].id : null
}

# IAM Outputs
output "ecs_task_role_arn" {
  description = "ECS task role ARN"
  value       = var.enable_backend ? aws_iam_role.ecs_task[0].arn : null
}

output "ecs_execution_role_arn" {
  description = "ECS execution role ARN"
  value       = var.enable_backend ? aws_iam_role.ecs_execution[0].arn : null
}

# CloudWatch Outputs
output "log_group_name" {
  description = "CloudWatch log group name"
  value       = var.enable_backend ? aws_cloudwatch_log_group.api[0].name : null
}

# Deployment Information
output "deployment_instructions" {
  description = "Instructions for deploying the Word add-in"
  value = <<-EOT
    Deployment Instructions:
    
    1. Build your Word add-in:
       npm run build
    
    2. Upload files to S3:
       aws s3 sync ./dist/ s3://${aws_s3_bucket.word_addin.bucket}/ --delete
    
    3. Invalidate CloudFront cache:
       aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.word_addin.id} --paths "/*"
    
    4. Update your manifest.xml with the new URL:
       ${var.enable_custom_domain && var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.word_addin.domain_name}"}
    
    ${var.enable_custom_domain ? "5. Update your domain's nameservers to: ${join(", ", aws_route53_zone.word_addin[0].name_servers)}" : ""}
    
    ${var.enable_backend ? "6. Deploy your API container to ECR and update the ECS service" : ""}
  EOT
}

# Configuration for updating the Word add-in
output "manifest_urls" {
  description = "URLs to update in manifest.xml"
  value = {
    taskpane_url = "${var.enable_custom_domain && var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.word_addin.domain_name}"}/taskpane.html"
    commands_url = "${var.enable_custom_domain && var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.word_addin.domain_name}"}/commands.html"
    icon_16_url  = "${var.enable_custom_domain && var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.word_addin.domain_name}"}/assets/icon-16.png"
    icon_32_url  = "${var.enable_custom_domain && var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.word_addin.domain_name}"}/assets/icon-32.png"
    icon_80_url  = "${var.enable_custom_domain && var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.word_addin.domain_name}"}/assets/icon-80.png"
  }
}
