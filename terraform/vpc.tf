# VPC Configuration for Backend Infrastructure (Optional)

# Data source for availability zones
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC for backend infrastructure (only if backend is enabled)
resource "aws_vpc" "main" {
  count                = var.enable_backend ? 1 : 0
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-vpc"
    Description = "VPC for RHEI Word add-in backend"
  })
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  count  = var.enable_backend ? 1 : 0
  vpc_id = aws_vpc.main[0].id

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-igw"
    Description = "Internet Gateway for RHEI Word add-in"
  })
}

# Public subnets for load balancer
resource "aws_subnet" "public" {
  count                   = var.enable_backend ? 2 : 0
  vpc_id                  = aws_vpc.main[0].id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-public-subnet-${count.index + 1}"
    Description = "Public subnet ${count.index + 1} for load balancer"
    Type        = "Public"
  })
}

# Private subnets for ECS tasks and database
resource "aws_subnet" "private" {
  count             = var.enable_backend ? 2 : 0
  vpc_id            = aws_vpc.main[0].id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-private-subnet-${count.index + 1}"
    Description = "Private subnet ${count.index + 1} for ECS and RDS"
    Type        = "Private"
  })
}

# Database subnets (isolated)
resource "aws_subnet" "database" {
  count             = var.enable_database ? 2 : 0
  vpc_id            = aws_vpc.main[0].id
  cidr_block        = "10.0.${count.index + 20}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-database-subnet-${count.index + 1}"
    Description = "Database subnet ${count.index + 1} for RDS"
    Type        = "Database"
  })
}

# Elastic IPs for NAT Gateways
resource "aws_eip" "nat" {
  count  = var.enable_backend ? 2 : 0
  domain = "vpc"

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-nat-eip-${count.index + 1}"
    Description = "Elastic IP for NAT Gateway ${count.index + 1}"
  })

  depends_on = [aws_internet_gateway.main]
}

# NAT Gateways for private subnet internet access
resource "aws_nat_gateway" "main" {
  count         = var.enable_backend ? 2 : 0
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-nat-gateway-${count.index + 1}"
    Description = "NAT Gateway ${count.index + 1} for private subnets"
  })

  depends_on = [aws_internet_gateway.main]
}

# Route table for public subnets
resource "aws_route_table" "public" {
  count  = var.enable_backend ? 1 : 0
  vpc_id = aws_vpc.main[0].id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main[0].id
  }

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-public-rt"
    Description = "Route table for public subnets"
  })
}

# Route tables for private subnets
resource "aws_route_table" "private" {
  count  = var.enable_backend ? 2 : 0
  vpc_id = aws_vpc.main[0].id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-private-rt-${count.index + 1}"
    Description = "Route table for private subnet ${count.index + 1}"
  })
}

# Route table for database subnets (no internet access)
resource "aws_route_table" "database" {
  count  = var.enable_database ? 1 : 0
  vpc_id = aws_vpc.main[0].id

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-database-rt"
    Description = "Route table for database subnets"
  })
}

# Route table associations for public subnets
resource "aws_route_table_association" "public" {
  count          = var.enable_backend ? 2 : 0
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public[0].id
}

# Route table associations for private subnets
resource "aws_route_table_association" "private" {
  count          = var.enable_backend ? 2 : 0
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# Route table associations for database subnets
resource "aws_route_table_association" "database" {
  count          = var.enable_database ? 2 : 0
  subnet_id      = aws_subnet.database[count.index].id
  route_table_id = aws_route_table.database[0].id
}

# VPC Endpoints for AWS services (cost optimization)
resource "aws_vpc_endpoint" "s3" {
  count        = var.enable_backend ? 1 : 0
  vpc_id       = aws_vpc.main[0].id
  service_name = "com.amazonaws.${var.aws_region}.s3"
  
  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-s3-endpoint"
    Description = "VPC endpoint for S3"
  })
}

resource "aws_vpc_endpoint" "ecr_dkr" {
  count              = var.enable_backend ? 1 : 0
  vpc_id             = aws_vpc.main[0].id
  service_name       = "com.amazonaws.${var.aws_region}.ecr.dkr"
  vpc_endpoint_type  = "Interface"
  subnet_ids         = aws_subnet.private[*].id
  security_group_ids = [aws_security_group.vpc_endpoints[0].id]
  
  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-ecr-dkr-endpoint"
    Description = "VPC endpoint for ECR Docker"
  })
}

resource "aws_vpc_endpoint" "ecr_api" {
  count              = var.enable_backend ? 1 : 0
  vpc_id             = aws_vpc.main[0].id
  service_name       = "com.amazonaws.${var.aws_region}.ecr.api"
  vpc_endpoint_type  = "Interface"
  subnet_ids         = aws_subnet.private[*].id
  security_group_ids = [aws_security_group.vpc_endpoints[0].id]
  
  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-ecr-api-endpoint"
    Description = "VPC endpoint for ECR API"
  })
}

resource "aws_vpc_endpoint" "logs" {
  count              = var.enable_backend ? 1 : 0
  vpc_id             = aws_vpc.main[0].id
  service_name       = "com.amazonaws.${var.aws_region}.logs"
  vpc_endpoint_type  = "Interface"
  subnet_ids         = aws_subnet.private[*].id
  security_group_ids = [aws_security_group.vpc_endpoints[0].id]
  
  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-logs-endpoint"
    Description = "VPC endpoint for CloudWatch Logs"
  })
}

# Security group for VPC endpoints
resource "aws_security_group" "vpc_endpoints" {
  count       = var.enable_backend ? 1 : 0
  name        = "${local.name_prefix}-vpc-endpoints"
  description = "Security group for VPC endpoints"
  vpc_id      = aws_vpc.main[0].id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main[0].cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-vpc-endpoints-sg"
    Description = "Security group for VPC endpoints"
  })
}

# DB subnet group for RDS
resource "aws_db_subnet_group" "word_addin" {
  count      = var.enable_database ? 1 : 0
  name       = "${local.name_prefix}-db-subnet-group"
  subnet_ids = aws_subnet.database[*].id

  tags = merge(local.common_tags, {
    Name        = "${local.name_prefix}-db-subnet-group"
    Description = "Database subnet group for RHEI Word add-in"
  })
}
