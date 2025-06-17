# RDS Configuration for Database (Optional)

# Random password for database
resource "random_password" "db_password" {
  count   = var.enable_database ? 1 : 0
  length  = 32
  special = true
}

# Secrets Manager secret for database credentials
resource "aws_secretsmanager_secret" "db_credentials" {
  count                   = var.enable_database ? 1 : 0
  name                    = "${local.name_prefix}-db-credentials"
  description             = "Database credentials for RHEI Word add-in"
  recovery_window_in_days = 7

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-db-secret"
    Description = "Database credentials secret"
  })
}

# Secrets Manager secret version
resource "aws_secretsmanager_secret_version" "db_credentials" {
  count     = var.enable_database ? 1 : 0
  secret_id = aws_secretsmanager_secret.db_credentials[0].id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db_password[0].result
    engine   = "postgres"
    host     = aws_db_instance.word_addin[0].endpoint
    port     = aws_db_instance.word_addin[0].port
    dbname   = var.db_name
    url      = "postgresql://${var.db_username}:${random_password.db_password[0].result}@${aws_db_instance.word_addin[0].endpoint}:${aws_db_instance.word_addin[0].port}/${var.db_name}"
  })
}

# RDS Parameter Group
resource "aws_db_parameter_group" "word_addin" {
  count  = var.enable_database ? 1 : 0
  family = "postgres15"
  name   = "${local.name_prefix}-db-params"

  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-db-parameter-group"
    Description = "Parameter group for RHEI Word add-in database"
  })
}

# RDS Option Group (for PostgreSQL extensions)
resource "aws_db_option_group" "word_addin" {
  count                    = var.enable_database ? 1 : 0
  name                     = "${local.name_prefix}-db-options"
  option_group_description = "Option group for RHEI Word add-in database"
  engine_name              = "postgres"
  major_engine_version     = "15"

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-db-option-group"
    Description = "Option group for RHEI Word add-in database"
  })
}

# RDS Instance
resource "aws_db_instance" "word_addin" {
  count                   = var.enable_database ? 1 : 0
  identifier              = "${local.name_prefix}-db"
  allocated_storage       = var.db_allocated_storage
  max_allocated_storage   = var.db_allocated_storage * 2
  storage_type            = "gp3"
  storage_encrypted       = true
  engine                  = "postgres"
  engine_version          = var.db_engine_version
  instance_class          = var.db_instance_class
  db_name                 = var.db_name
  username                = var.db_username
  password                = random_password.db_password[0].result
  parameter_group_name    = aws_db_parameter_group.word_addin[0].name
  option_group_name       = aws_db_option_group.word_addin[0].name
  db_subnet_group_name    = aws_db_subnet_group.word_addin[0].name
  vpc_security_group_ids  = [aws_security_group.database[0].id]
  
  # Backup configuration
  backup_retention_period = var.backup_retention_period
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  # Monitoring
  monitoring_interval = var.enable_monitoring ? 60 : 0
  monitoring_role_arn = var.enable_monitoring ? aws_iam_role.rds_monitoring[0].arn : null
  
  # Performance Insights
  performance_insights_enabled = var.enable_monitoring
  performance_insights_retention_period = var.enable_monitoring ? 7 : null
  
  # Security
  deletion_protection = var.enable_deletion_protection
  skip_final_snapshot = !var.enable_deletion_protection
  final_snapshot_identifier = var.enable_deletion_protection ? "${local.name_prefix}-db-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null
  
  # Logging
  enabled_cloudwatch_logs_exports = ["postgresql"]
  
  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-database"
    Description = "PostgreSQL database for RHEI Word add-in"
  })
}

# RDS Read Replica (for production workloads)
resource "aws_db_instance" "word_addin_replica" {
  count                  = var.enable_database && var.environment == "prod" ? 1 : 0
  identifier             = "${local.name_prefix}-db-replica"
  replicate_source_db    = aws_db_instance.word_addin[0].identifier
  instance_class         = var.db_instance_class
  publicly_accessible    = false
  auto_minor_version_upgrade = false
  
  # Monitoring
  monitoring_interval = var.enable_monitoring ? 60 : 0
  monitoring_role_arn = var.enable_monitoring ? aws_iam_role.rds_monitoring[0].arn : null
  
  # Performance Insights
  performance_insights_enabled = var.enable_monitoring
  performance_insights_retention_period = var.enable_monitoring ? 7 : null
  
  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-database-replica"
    Description = "Read replica for RHEI Word add-in database"
  })
}

# IAM role for RDS monitoring
resource "aws_iam_role" "rds_monitoring" {
  count = var.enable_database && var.enable_monitoring ? 1 : 0
  name  = "${local.name_prefix}-rds-monitoring"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = local.common_tags
}

# IAM role policy attachment for RDS monitoring
resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  count      = var.enable_database && var.enable_monitoring ? 1 : 0
  role       = aws_iam_role.rds_monitoring[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# CloudWatch alarms for RDS
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  count               = var.enable_database && var.enable_monitoring ? 1 : 0
  alarm_name          = "${local.name_prefix}-rds-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors RDS CPU utilization"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.word_addin[0].id
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "rds_connections" {
  count               = var.enable_database && var.enable_monitoring ? 1 : 0
  alarm_name          = "${local.name_prefix}-rds-connections-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors RDS connection count"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.word_addin[0].id
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "rds_free_storage" {
  count               = var.enable_database && var.enable_monitoring ? 1 : 0
  alarm_name          = "${local.name_prefix}-rds-free-storage-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "2000000000" # 2GB in bytes
  alarm_description   = "This metric monitors RDS free storage space"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.word_addin[0].id
  }

  tags = local.common_tags
}

# CloudWatch log group for RDS logs
resource "aws_cloudwatch_log_group" "rds_logs" {
  count             = var.enable_database && var.enable_monitoring ? 1 : 0
  name              = "/aws/rds/instance/${aws_db_instance.word_addin[0].id}/postgresql"
  retention_in_days = var.log_retention_days

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-rds-logs"
    Description = "RDS PostgreSQL logs for RHEI Word add-in"
  })
}
