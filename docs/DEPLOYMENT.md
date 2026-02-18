# 🚀 Deployment Guide

This guide explains how to deploy Coder Arena to production.

## Prerequisites

- Node.js 18+ or Docker
- Git
- A server with at least 1GB RAM
- Domain name (optional but recommended)

## Deployment Options

### Option 1: Docker Compose (Recommended)

**Pros:** Easy setup, consistent environment
**Cons:** Requires Docker

1. **Clone the repository**
```bash
git clone https://github.com/aadeshshukla/coder-arena.git
cd coder-arena
```

2. **Configure environment variables**
```bash
cp .env.example .env
nano .env  # Edit with your values
```

Important variables:
- `JWT_SECRET` - Change this to a secure random string!
- `CORS_ORIGIN` - Your domain (e.g., https://coder-arena.com)
- `PORT` - Server port (default: 3001)

3. **Build and run**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

4. **Verify deployment**
```bash
# Check if containers are running
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Test health endpoint
curl http://localhost:3001/health
```

5. **Access the application**
- Open browser: http://your-server-ip:3000

### Option 2: Manual Deployment

**Pros:** More control, no Docker needed
**Cons:** More setup steps

1. **Clone and install dependencies**
```bash
git clone https://github.com/aadeshshukla/coder-arena.git
cd coder-arena
npm run install:all
```

2. **Build the application**
```bash
npm run build
```

This will:
- Compile TypeScript server code
- Build React client for production
- Output to `dist/` directory

3. **Set environment variables**
```bash
export NODE_ENV=production
export PORT=3001
export JWT_SECRET=your-secure-secret-here
```

4. **Start the server**
```bash
npm start
```

5. **Keep it running with PM2** (recommended)
```bash
npm install -g pm2
pm2 start dist/server/src/index.js --name coder-arena
pm2 save
pm2 startup  # Follow instructions to enable auto-start
```

## Reverse Proxy Setup (Nginx)

For production, use Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Client (React app)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## SSL/HTTPS Setup

Use Let's Encrypt for free SSL:

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | Yes |
| `PORT` | Server port | `3001` | No |
| `JWT_SECRET` | Secret for JWT tokens | - | Yes |
| `CORS_ORIGIN` | Allowed CORS origin | `*` | No |
| `LOG_LEVEL` | Logging level | `info` | No |

## Performance Tuning

### Server Resources
- **Minimum:** 1GB RAM, 1 CPU core
- **Recommended:** 2GB RAM, 2 CPU cores
- **High Traffic:** 4GB+ RAM, 4+ CPU cores

### Node.js Optimization
```bash
# Increase memory limit if needed
NODE_OPTIONS="--max-old-space-size=2048" npm start
```

### Database (Future)
Currently uses in-memory storage. For production scale:
- Add Redis for session management
- Add PostgreSQL/MongoDB for persistent storage

## Monitoring

### Health Check
The `/health` endpoint returns server status:
```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": 1234567890,
  "uptime": 3600
}
```

### PM2 Monitoring
```bash
pm2 monit          # Real-time monitoring
pm2 logs           # View logs
pm2 status         # Check status
```

### Docker Monitoring
```bash
docker stats       # Resource usage
docker logs -f <container-id>  # Logs
```

## Backup Strategy

### What to Backup
- **Configuration:** `.env` file
- **Player Data:** Currently in memory (add DB later)
- **Logs:** `/var/log/` or Docker logs

### Automated Backups
```bash
# Example backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf backup_$DATE.tar.gz .env data/
```

## Scaling

### Horizontal Scaling
To handle more players:
1. Add load balancer (Nginx, HAProxy)
2. Run multiple instances
3. Use Redis for shared state
4. Add database for persistence

### Vertical Scaling
1. Increase server resources
2. Optimize code (already done)
3. Enable caching
4. Use CDN for static assets

## Troubleshooting Deployment

### Server won't start
```bash
# Check logs
pm2 logs coder-arena
# or
docker logs <container-id>

# Common issues:
# - Port already in use: Change PORT in .env
# - Missing dependencies: Run npm install
# - Build errors: Check TypeScript compilation
```

### WebSocket connection fails
- Check firewall: Port 3001 must be open
- Verify CORS settings in .env
- Check proxy configuration

### High memory usage
- Check for memory leaks with PM2 monitoring
- Restart server periodically
- Increase memory limit

## Updates

To update to latest version:

```bash
# Pull latest code
git pull origin main

# Rebuild
npm run build

# Restart
pm2 restart coder-arena
# or
docker-compose -f docker-compose.prod.yml restart
```

## Security Checklist

- [ ] Change JWT_SECRET from default
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (only ports 80, 443 open)
- [ ] Keep dependencies updated
- [ ] Use environment variables (never commit secrets)
- [ ] Enable rate limiting (coming soon)
- [ ] Regular backups
- [ ] Monitor logs for suspicious activity

## Support

Need help with deployment?
- Check [Troubleshooting Guide](TROUBLESHOOTING.md)
- Open GitHub Issue
- Join Discord community

---

**Happy Deploying!** 🚀
