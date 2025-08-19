# 🚀 Deployment Guide - HealthCare Plus

## AWS Linux Server Deployment

This guide will help you deploy HealthCare Plus on your AWS Linux server.

### Prerequisites

- AWS EC2 instance running Amazon Linux 2 or similar
- SSH access to your server
- Domain name (optional but recommended)

### Step 1: Server Setup

```bash
# Update system packages
sudo yum update -y

# Install Node.js (using NodeSource repository)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install MongoDB
sudo tee /etc/yum.repos.d/mongodb-org-5.0.repo <<EOF
[mongodb-org-5.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/5.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-5.0.asc
EOF

sudo yum install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 for process management
sudo npm install -g pm2

# Install Git
sudo yum install -y git
```

### Step 2: Clone and Setup Application

```bash
# Clone your repository
git clone https://github.com/yourusername/healthcare-plus.git
cd healthcare-plus

# Install dependencies
cd backend
npm install

# Create production environment file
sudo nano .env.production
```

Add the following to `.env.production`:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/hospital_management_prod

# Session Secret (generate a strong secret)
SESSION_SECRET=your_super_strong_session_secret_here

# JWT Secret (generate a strong secret)
JWT_SECRET=your_super_strong_jwt_secret_here

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server Configuration
PORT=5000
NODE_ENV=production
```

### Step 3: Security Configuration

```bash
# Create non-root user for application
sudo useradd -m -s /bin/bash healthcare
sudo usermod -aG wheel healthcare

# Set up firewall
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload

# Set proper permissions
sudo chown -R healthcare:healthcare /home/healthcare/healthcare-plus
```

### Step 4: Nginx Setup (Recommended)

```bash
# Install Nginx
sudo yum install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/conf.d/healthcare-plus.conf
```

Add the following Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration (you'll need to set up SSL certificates)
    ssl_certificate /etc/ssl/certs/your-cert.crt;
    ssl_certificate_key /etc/ssl/private/your-key.key;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Main application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:5000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Step 5: SSL Certificate Setup (Let's Encrypt)

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Set up automatic renewal
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### Step 6: Start Application with PM2

```bash
# Switch to healthcare user
sudo su - healthcare

# Navigate to application directory
cd healthcare-plus/backend

# Create PM2 ecosystem file
nano ecosystem.config.js
```

Add the following PM2 configuration:

```javascript
module.exports = {
  apps: [{
    name: 'healthcare-plus',
    script: 'app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
};
```

```bash
# Create logs directory
mkdir logs

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Set up PM2 startup script
pm2 startup
# Follow the instructions provided by PM2
```

### Step 7: Start Services

```bash
# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check application status
pm2 status
pm2 logs healthcare-plus
```

### Step 8: Database Setup

```bash
# Connect to MongoDB and create initial admin user (optional)
mongo hospital_management_prod

# In MongoDB shell:
# db.doctors.insertOne({
#   name: "Dr. John Smith",
#   department: "General Medicine",
#   timeSlots: [
#     { start: "09:00", end: "12:00" },
#     { start: "14:00", end: "17:00" }
#   ],
#   fee: "500"
# });
```

### Step 9: Monitoring and Logs

```bash
# View application logs
pm2 logs healthcare-plus

# Monitor system resources
pm2 monit

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Monitor MongoDB
sudo systemctl status mongod
```

### Step 10: Backup Strategy

```bash
# Create backup script
nano ~/backup-healthcare.sh
```

Add the following backup script:

```bash
#!/bin/bash

# Backup MongoDB
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/healthcare/backups"
mkdir -p $BACKUP_DIR

# Backup database
mongodump --db hospital_management_prod --out $BACKUP_DIR/mongodb_$TIMESTAMP

# Backup application files
tar -czf $BACKUP_DIR/app_$TIMESTAMP.tar.gz /home/healthcare/healthcare-plus

# Keep only last 7 days of backups
find $BACKUP_DIR -name "mongodb_*" -mtime +7 -delete
find $BACKUP_DIR -name "app_*" -mtime +7 -delete

echo "Backup completed: $TIMESTAMP"
```

```bash
# Make backup script executable
chmod +x ~/backup-healthcare.sh

# Set up daily backup cron job
crontab -e
# Add: 0 2 * * * /home/healthcare/backup-healthcare.sh
```

## Troubleshooting

### Common Issues

1. **Port 5000 not accessible**
   ```bash
   sudo firewall-cmd --list-all
   sudo netstat -tlnp | grep :5000
   ```

2. **MongoDB connection issues**
   ```bash
   sudo systemctl status mongod
   sudo journalctl -u mongod
   ```

3. **PM2 process crashes**
   ```bash
   pm2 logs healthcare-plus
   pm2 restart healthcare-plus
   ```

4. **Nginx configuration issues**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Performance Optimization

1. **Enable gzip compression in Nginx**
   ```nginx
   gzip on;
   gzip_vary on;
   gzip_min_length 1024;
   gzip_types text/css text/javascript application/javascript;
   ```

2. **Set up MongoDB indexes**
   ```bash
   mongo hospital_management_prod
   db.appointments.createIndex({date: 1, time: 1});
   db.patients.createIndex({username: 1});
   ```

3. **Configure PM2 for optimal performance**
   ```bash
   pm2 set pm2:autodump true
   pm2 install pm2-server-monit
   ```

## Security Checklist

- [ ] Changed default admin credentials
- [ ] Set up SSL certificates
- [ ] Configured firewall rules
- [ ] Created non-root user for application
- [ ] Set up regular backups
- [ ] Enabled Nginx security headers
- [ ] Generated strong JWT and session secrets
- [ ] Configured MongoDB authentication (if needed)
- [ ] Set up monitoring and logging
- [ ] Tested all application features

## Post-Deployment Testing

1. Visit your domain and test:
   - Home page loads correctly
   - Patient registration and login
   - Appointment booking
   - Admin panel access
   - Mobile responsiveness

2. Check logs for any errors:
   ```bash
   pm2 logs healthcare-plus --lines 100
   ```

3. Monitor system resources:
   ```bash
   top
   df -h
   pm2 monit
   ```

Your HealthCare Plus application should now be successfully deployed and running on your AWS Linux server! 🎉
