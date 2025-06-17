# ECS Configuration for Backend API (Optional)

# ECS Cluster
resource "aws_ecs_cluster" "api" {
  count = var.enable_backend ? 1 : 0
  name  = "${local.name_prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = var.enable_monitoring ? "enabled" : "disabled"
  }

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-ecs-cluster"
    Description = "ECS cluster for RHEI Word add-in API"
  })
}

# ECS Cluster Capacity Providers
resource "aws_ecs_cluster_capacity_providers" "api" {
  count        = var.enable_backend ? 1 : 0
  cluster_name = aws_ecs_cluster.api[0].name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "FARGATE"
  }
}

# CloudWatch Log Group for ECS
resource "aws_cloudwatch_log_group" "api" {
  count             = var.enable_backend ? 1 : 0
  name              = "/ecs/${local.name_prefix}-api"
  retention_in_days = var.log_retention_days

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-api-logs"
    Description = "CloudWatch logs for RHEI Word add-in API"
  })
}

# ECS Task Definition
resource "aws_ecs_task_definition" "api" {
  count                    = var.enable_backend ? 1 : 0
  family                   = "${local.name_prefix}-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.ecs_cpu
  memory                   = var.ecs_memory
  execution_role_arn       = aws_iam_role.ecs_execution[0].arn
  task_role_arn            = aws_iam_role.ecs_task[0].arn

  container_definitions = jsonencode([
    {
      name  = "api"
      image = var.api_image_uri
      
      portMappings = [
        {
          containerPort = 8000
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "ENVIRONMENT"
          value = var.environment
        },
        {
          name  = "AWS_REGION"
          value = var.aws_region
        },
        {
          name  = "LOG_LEVEL"
          value = "INFO"
        }
      ]

      secrets = var.enable_database ? [
        {
          name      = "DATABASE_URL"
          valueFrom = aws_secretsmanager_secret.db_credentials[0].arn
        }
      ] : []

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.api[0].name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }

      healthCheck = {
        command = ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"]
        interval = 30
        timeout = 5
        retries = 3
        startPeriod = 60
      }

      essential = true
    }
  ])

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-api-task"
    Description = "ECS task definition for RHEI Word add-in API"
  })
}

# Application Load Balancer
resource "aws_lb" "api" {
  count              = var.enable_backend ? 1 : 0
  name               = "${local.name_prefix}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb[0].id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = var.enable_deletion_protection

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-alb"
    Description = "Application Load Balancer for RHEI Word add-in API"
  })
}

# ALB Target Group
resource "aws_lb_target_group" "api" {
  count       = var.enable_backend ? 1 : 0
  name        = "${local.name_prefix}-api-tg"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main[0].id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-api-target-group"
    Description = "Target group for RHEI Word add-in API"
  })
}

# ALB Listener (HTTP - redirects to HTTPS)
resource "aws_lb_listener" "api_http" {
  count             = var.enable_backend ? 1 : 0
  load_balancer_arn = aws_lb.api[0].arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }

  tags = local.common_tags
}

# ALB Listener (HTTPS)
resource "aws_lb_listener" "api_https" {
  count             = var.enable_backend ? 1 : 0
  load_balancer_arn = aws_lb.api[0].arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = var.enable_custom_domain && var.api_domain != "" ? aws_acm_certificate.api[0].arn : aws_acm_certificate.word_addin[0].arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api[0].arn
  }

  tags = local.common_tags
}

# ECS Service
resource "aws_ecs_service" "api" {
  count           = var.enable_backend ? 1 : 0
  name            = "${local.name_prefix}-api-service"
  cluster         = aws_ecs_cluster.api[0].id
  task_definition = aws_ecs_task_definition.api[0].arn
  desired_count   = var.ecs_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.api[0].id]
    subnets          = aws_subnet.private[*].id
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api[0].arn
    container_name   = "api"
    container_port   = 8000
  }

  depends_on = [
    aws_lb_listener.api_https,
    aws_iam_role_policy_attachment.ecs_execution_role_policy
  ]

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-api-service"
    Description = "ECS service for RHEI Word add-in API"
  })
}

# Auto Scaling Target
resource "aws_appautoscaling_target" "api" {
  count              = var.enable_backend ? 1 : 0
  max_capacity       = 10
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.api[0].name}/${aws_ecs_service.api[0].name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"

  tags = local.common_tags
}

# Auto Scaling Policy - CPU
resource "aws_appautoscaling_policy" "api_cpu" {
  count              = var.enable_backend ? 1 : 0
  name               = "${local.name_prefix}-api-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api[0].resource_id
  scalable_dimension = aws_appautoscaling_target.api[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.api[0].service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

# Auto Scaling Policy - Memory
resource "aws_appautoscaling_policy" "api_memory" {
  count              = var.enable_backend ? 1 : 0
  name               = "${local.name_prefix}-api-memory-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api[0].resource_id
  scalable_dimension = aws_appautoscaling_target.api[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.api[0].service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value = 80.0
  }
}

# CloudWatch Alarms for ECS
resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
  count               = var.enable_backend && var.enable_monitoring ? 1 : 0
  alarm_name          = "${local.name_prefix}-ecs-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ECS CPU utilization"

  dimensions = {
    ServiceName = aws_ecs_service.api[0].name
    ClusterName = aws_ecs_cluster.api[0].name
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "ecs_memory_high" {
  count               = var.enable_backend && var.enable_monitoring ? 1 : 0
  alarm_name          = "${local.name_prefix}-ecs-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "85"
  alarm_description   = "This metric monitors ECS memory utilization"

  dimensions = {
    ServiceName = aws_ecs_service.api[0].name
    ClusterName = aws_ecs_cluster.api[0].name
  }

  tags = local.common_tags
}
