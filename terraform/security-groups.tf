# Security Groups for RHEI Word Add-in Infrastructure

# Security Group for Application Load Balancer
resource "aws_security_group" "alb" {
  count       = var.enable_backend ? 1 : 0
  name        = "${local.name_prefix}-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.main[0].id

  # HTTP access from anywhere
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS access from anywhere
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound traffic to ECS tasks
  egress {
    description     = "To ECS tasks"
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.api[0].id]
  }

  # Health check traffic
  egress {
    description = "Health checks"
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main[0].cidr_block]
  }

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-alb-sg"
    Description = "Security group for ALB"
  })
}

# Security Group for ECS API Tasks
resource "aws_security_group" "api" {
  count       = var.enable_backend ? 1 : 0
  name        = "${local.name_prefix}-api-sg"
  description = "Security group for ECS API tasks"
  vpc_id      = aws_vpc.main[0].id

  # API port from ALB
  ingress {
    description     = "API port from ALB"
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb[0].id]
  }

  # Outbound HTTPS for external API calls
  egress {
    description = "HTTPS outbound"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound HTTP for health checks and package downloads
  egress {
    description = "HTTP outbound"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Database access
  egress {
    description     = "Database access"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = var.enable_database ? [aws_security_group.database[0].id] : []
  }

  # DNS resolution
  egress {
    description = "DNS"
    from_port   = 53
    to_port     = 53
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "DNS TCP"
    from_port   = 53
    to_port     = 53
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-api-sg"
    Description = "Security group for API tasks"
  })
}

# Security Group for RDS Database
resource "aws_security_group" "database" {
  count       = var.enable_database ? 1 : 0
  name        = "${local.name_prefix}-database-sg"
  description = "Security group for RDS database"
  vpc_id      = aws_vpc.main[0].id

  # PostgreSQL access from API tasks
  ingress {
    description     = "PostgreSQL from API"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.api[0].id]
  }

  # PostgreSQL access from bastion host (if needed for maintenance)
  ingress {
    description     = "PostgreSQL from bastion"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = var.enable_backend ? [aws_security_group.bastion[0].id] : []
  }

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-database-sg"
    Description = "Security group for database"
  })
}

# Security Group for Bastion Host (optional, for database access)
resource "aws_security_group" "bastion" {
  count       = var.enable_backend && var.enable_database ? 1 : 0
  name        = "${local.name_prefix}-bastion-sg"
  description = "Security group for bastion host"
  vpc_id      = aws_vpc.main[0].id

  # SSH access from specific IP ranges (customize as needed)
  ingress {
    description = "SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # CHANGE THIS TO YOUR IP RANGE
  }

  # Outbound access to database
  egress {
    description     = "Database access"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.database[0].id]
  }

  # Outbound HTTPS for package updates
  egress {
    description = "HTTPS outbound"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound HTTP for package updates
  egress {
    description = "HTTP outbound"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-bastion-sg"
    Description = "Security group for bastion host"
  })
}

# Security Group for Lambda Functions
resource "aws_security_group" "lambda" {
  count       = var.enable_monitoring ? 1 : 0
  name        = "${local.name_prefix}-lambda-sg"
  description = "Security group for Lambda functions"
  vpc_id      = var.enable_backend ? aws_vpc.main[0].id : null

  # Outbound HTTPS for AWS API calls
  egress {
    description = "HTTPS outbound"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound HTTP for external APIs
  egress {
    description = "HTTP outbound"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-lambda-sg"
    Description = "Security group for Lambda functions"
  })
}

# Security Group Rules for Cross-Service Communication

# Allow ALB to communicate with API tasks
resource "aws_security_group_rule" "alb_to_api" {
  count                    = var.enable_backend ? 1 : 0
  type                     = "egress"
  from_port                = 8000
  to_port                  = 8000
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.api[0].id
  security_group_id        = aws_security_group.alb[0].id
  description              = "ALB to API communication"
}

# Allow API tasks to communicate with database
resource "aws_security_group_rule" "api_to_database" {
  count                    = var.enable_backend && var.enable_database ? 1 : 0
  type                     = "egress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.database[0].id
  security_group_id        = aws_security_group.api[0].id
  description              = "API to database communication"
}

# Allow bastion to communicate with database
resource "aws_security_group_rule" "bastion_to_database" {
  count                    = var.enable_backend && var.enable_database ? 1 : 0
  type                     = "egress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.database[0].id
  security_group_id        = aws_security_group.bastion[0].id
  description              = "Bastion to database communication"
}

# Network ACL for additional security (optional)
resource "aws_network_acl" "main" {
  count  = var.enable_backend ? 1 : 0
  vpc_id = aws_vpc.main[0].id

  # Allow inbound HTTP
  ingress {
    protocol   = "tcp"
    rule_no    = 100
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 80
    to_port    = 80
  }

  # Allow inbound HTTPS
  ingress {
    protocol   = "tcp"
    rule_no    = 110
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 443
    to_port    = 443
  }

  # Allow inbound ephemeral ports
  ingress {
    protocol   = "tcp"
    rule_no    = 120
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 1024
    to_port    = 65535
  }

  # Allow outbound traffic
  egress {
    protocol   = "-1"
    rule_no    = 100
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 0
    to_port    = 0
  }

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-main-nacl"
    Description = "Main network ACL"
  })
}

# Associate Network ACL with subnets
resource "aws_network_acl_association" "public" {
  count          = var.enable_backend ? 2 : 0
  network_acl_id = aws_network_acl.main[0].id
  subnet_id      = aws_subnet.public[count.index].id
}

resource "aws_network_acl_association" "private" {
  count          = var.enable_backend ? 2 : 0
  network_acl_id = aws_network_acl.main[0].id
  subnet_id      = aws_subnet.private[count.index].id
}
