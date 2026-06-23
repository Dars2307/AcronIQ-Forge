# Production Deployment Guide

## Overview

This guide covers deploying AcronIQ Forge to production. The application has been configured with production-ready security, monitoring, and infrastructure.

## Prerequisites

### Required
- Docker and Docker Compose
- PostgreSQL 15+ (or managed database service)
- Domain name with DNS configured
- SSL certificates (Let's Encrypt or commercial)
- Production environment variables

### Optional but Recommended
- Redis for caching and sessions
- Managed database (AWS RDS, Google Cloud SQL, etc.)
- CDN for static assets
- Load balancer (AWS ALB, Nginx, etc.)
- Monitoring service (Datadog, New Relic, etc.)
- Error tracking (Sentry)

## Environment Configuration

### API Server Environment Variables

Create `apps/api-server/.env.production`:

```env
PORT=3001
NODE_ENV=production

# Database Configuration
DATABASE_URL=postgresql://user:password@production-host:5432/forge
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=20

# Session Configuration
SESSION_SECRET=CHANGE_THIS_TO_A_SECURE_RANDOM_STRING_IN_PRODUCTION
SESSION_MAX_AGE=86400000

# CORS Configuration
ALLOWED_ORIGINS=https://forge.acroniq.com,https://app.acroniq.com

# OIDC Authentication (Optional - for production auth)
OIDC_ISSUER=https://your-oidc-provider.com
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
OIDC_REDIRECT_URI=https://forge.acroniq.com/auth/callback

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Monitoring (Optional)
SENTRY_DSN=
SENTRY_ENVIRONMENT=production
```

### Web App Environment Variables

Create `apps/forge/.env.production`:

```env
VITE_API_BASE_URL=https://api.forge.acroniq.com
VITE_APP_URL=https://forge.acroniq.com

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true

# Sentry (Optional)
VITE_SENTRY_DSN=
VITE_SENTRY_ENVIRONMENT=production
```

## Deployment Steps

### 1. Database Setup

#### Option A: Using Docker Compose (Development/Staging)

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Run migrations
cd db/migrations
node migrate.mjs

# Verify database
psql -h localhost -U forge -d forge
```

#### Option B: Using Managed Database (Production)

1. Create PostgreSQL instance (AWS RDS, Google Cloud SQL, etc.)
2. Configure security groups/firewall rules
3. Run migrations:
```bash
export DATABASE_URL="postgresql://user:password@host:5432/forge"
cd db/migrations
node migrate.mjs
```

### 2. Build Docker Images

```bash
# Build API Server
docker build --target api-server -t forge-api-server:latest .

# Build Web App
docker build --target web-app -t forge-web-app:latest .
```

### 3. Deploy with Docker Compose

```bash
# Copy environment files
cp apps/api-server/.env.production apps/api-server/.env
cp apps/forge/.env.production apps/forge/.env

# Start all services
docker-compose up -d

# Verify services
docker-compose ps
docker-compose logs api-server
docker-compose logs web-app
```

### 4. Configure SSL/HTTPS

#### Using Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificates
sudo certbot certonly --nginx -d forge.acroniq.com

# Copy certificates to nginx
sudo cp /etc/letsencrypt/live/forge.acroniq.com/fullchain.pem ./nginx-ssl/
sudo cp /etc/letsencrypt/live/forge.acroniq.com/privkey.pem ./nginx-ssl/

# Update docker-compose.yml to use SSL config
```

#### Using Commercial Certificates

1. Purchase SSL certificate
2. Upload certificate files to server
3. Update nginx configuration with certificate paths
4. Restart nginx

### 5. Configure Load Balancer (Optional)

#### Using AWS Application Load Balancer

1. Create ALB in AWS console
2. Configure target groups for API server (port 3001) and web app (port 80)
3. Configure SSL certificate
4. Set up health checks
5. Update DNS to point to ALB

#### Using Nginx as Reverse Proxy

```nginx
upstream api_server {
    server localhost:3001;
}

upstream web_app {
    server localhost:80;
}

server {
    listen 443 ssl http2;
    server_name forge.acroniq.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    location /api/ {
        proxy_pass http://api_server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://web_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Database Backup and Restore

### Automated Backups

Set up cron job for daily backups:

```bash
# Add to crontab
0 2 * * * /path/to/scripts/backup-database.sh
```

### Manual Backup

```bash
cd scripts
./backup-database.sh custom_backup_name
```

### Restore from Backup

```bash
cd scripts
./restore-database.sh forge_backup_20240623_120000.dump.gz
```

## Monitoring

### Health Checks

- API Server: `GET /healthz` - Returns overall health and database status
- Web App: `GET /healthz` - Returns nginx status
- Database: PostgreSQL health check in docker-compose

### Logs

```bash
# View API server logs
docker-compose logs -f api-server

# View web app logs
docker-compose logs -f web-app

# View database logs
docker-compose logs -f postgres
```

### Metrics

The application uses Pino for structured logging. Configure log aggregation:

- **Datadog**: Install Datadog agent and configure log forwarding
- **ELK Stack**: Configure Filebeat to send logs to Elasticsearch
- **CloudWatch**: Configure AWS CloudWatch Logs agent

## Scaling

### Horizontal Scaling

1. Deploy multiple instances of API server behind load balancer
2. Use Redis for shared session storage
3. Configure database connection pooling appropriately

### Vertical Scaling

1. Increase database instance size
2. Increase API server resources (CPU, RAM)
3. Optimize database queries and add indexes

## Security Checklist

Before going to production, ensure:

- [ ] All environment variables are set with strong values
- [ ] SESSION_SECRET is changed from default
- [ ] Database credentials are strong
- [ ] SSL/HTTPS is configured with valid certificates
- [ ] CORS origins are restricted to production domains
- [ ] Rate limiting is enabled
- [ ] Security headers are configured
- [ ] Database backups are automated
- [ ] Monitoring and alerting are configured
- [ ] Firewall rules restrict access
- [ ] OIDC authentication is configured (if using auth)

## Troubleshooting

### Database Connection Issues

```bash
# Check database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
psql -h localhost -U forge -d forge
```

### API Server Not Starting

```bash
# Check logs
docker-compose logs api-server

# Check environment variables
docker-compose config

# Verify database connection
curl http://localhost:3001/healthz
```

### Web App Not Loading

```bash
# Check nginx logs
docker-compose logs web-app

# Verify build
docker build --target web-app -t test-web-app .
docker run -p 8080:80 test-web-app
```

## Rollback Procedure

If deployment fails:

1. Stop current deployment:
```bash
docker-compose down
```

2. Restore previous Docker images:
```bash
docker load < forge-api-server-backup.tar
docker load < forge-web-app-backup.tar
```

3. Restore database if needed:
```bash
cd scripts
./restore-database.sh backup_file.dump.gz
```

4. Restart services:
```bash
docker-compose up -d
```

## Performance Optimization

### Database

- Add indexes for frequently queried columns
- Enable query caching
- Use read replicas for read-heavy workloads
- Optimize connection pool size

### Application

- Enable gzip compression (configured in nginx)
- Cache static assets (configured in nginx)
- Use CDN for static assets
- Implement API response caching

### Infrastructure

- Use SSD storage for database
- Place services in same region for low latency
- Use load balancer for high availability
- Enable auto-scaling for API servers

## Support and Maintenance

### Regular Tasks

- **Daily**: Monitor logs and metrics
- **Weekly**: Review security alerts
- **Monthly**: Update dependencies
- **Quarterly**: Security audit
- **Annually**: Disaster recovery drill

### Emergency Contacts

- Database Administrator: [contact]
- DevOps Engineer: [contact]
- Security Team: [contact]

## Additional Resources

- [Architecture Documentation](./architecture.md)
- [Database Documentation](./database.md)
- [Security Audit Checklist](./security-audit.md)
- [Deployment Documentation](./deployment.md)
