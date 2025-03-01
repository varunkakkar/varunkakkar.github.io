# Installing Keycloak 26 on Ubuntu 24.04

Keycloak is a powerful open-source identity and access management solution. In this guide, I'll walk you through the steps to set up Keycloak 26 on Ubuntu 24.04, securing it with SSL certificates via Certbot, and configuring it to run on port 443 with MySQL as the database.

## What You Need To Get Started

- A Linux server running Ubuntu 24.04 (x86)
- A Fully Qualified Domain Name (FQDN) and access to your domain's DNS

## 1. Update Ubuntu

When first connecting, it's best practice to update all packages. Run each command separately:

```bash
sudo -i
```

```bash
sudo apt update
```

```bash
sudo apt upgrade
```

```bash
sudo apt dist-upgrade
```

```bash
sudo apt autoremove
```

```bash
sudo shutdown -r now
```

- After the reboot, reconnect to your instance.

## 2. Install and Configure MySQL

### Keycloak needs a database. Here's how to install MySQL on Ubuntu

First install MySQL:

```bash
sudo apt install mysql-server
```

```bash
sudo mysql
```

### Set the root user's MySQL password

Set the root password:

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'MYSQL_DATABASE_PASSWORD';
exit;
```

- Secure the MySQL installation:

```bash
sudo mysql_secure_installation
```

- Follow the prompts (answer "Yes" to remove anonymous users, disallow root remote login, etc.).

- Create the Keycloak database and user:

```bash
# Log in to MySQL
sudo mysql -u root -pMYSQL_DATABASE_PASSWORD
```

- In MySQL, run these commands:

Create database and user:

```sql
CREATE DATABASE keycloak CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```sql
CREATE USER 'keycloak'@'localhost' IDENTIFIED BY 'MYSQL_DATABASE_PASSWORD';
```

```sql
GRANT ALL PRIVILEGES ON keycloak.* TO 'keycloak'@'localhost';
```

```sql
FLUSH PRIVILEGES;
exit;
```

- *Note: Replace `MYSQL_DATABASE_PASSWORD` with a strong, unique password.*

## 3. Install Certbot (for SSL Certificates)

We'll use Certbot (via snap) to generate and manage SSL certificates. Run each command separately:

```bash
sudo snap install core
```

```bash
sudo snap refresh core
```

```bash
sudo snap install --classic certbot
```

```bash
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

- Reboot to apply changes

```bash
sudo shutdown -r now
```

- After the reboot, reconnect again.

## 4. Configure the Firewall

We'll open only the necessary ports. Ubuntu's default firewall tool is **ufw**. Run each command separately:

```bash
sudo ufw allow ssh
```

```bash
sudo ufw allow 80/tcp
```

```bash
sudo ufw allow 8443/tcp
```

```bash
sudo ufw enable
```

## 5. Obtain an SSL Certificate

Choose your domain name and make sure your DNS is pointed to your server's IP address.

- *Note: Replace `keycloak.yourdomain.com` with your actual domain name.*

- Obtain and verify certificate:

```bash
# Test certificate acquisition
cd ~
sudo certbot certonly --standalone --preferred-challenges http -d keycloak.yourdomain.com --dry-run
sudo certbot certonly --standalone --preferred-challenges http -d keycloak.yourdomain.com
```

- Configure Hooks for Auto-Renew:

```bash
# Create pre-hook script
cd /etc/letsencrypt/renewal-hooks/pre
sudo nano pre-hook.sh
```

- Contents of pre-hook.sh:

```bash
#!/bin/bash
# Open port 80
ufw allow 80/tcp
```

- Make it executable:

```bash
sudo chmod +x pre-hook.sh
```

- Then create the post-hook:

```bash
# Create post-hook script
cd /etc/letsencrypt/renewal-hooks/post
sudo nano post-hook.sh
```

- Contents of post-hook.sh:

```bash
#!/bin/bash
# Close port 80
ufw deny 80/tcp
# Reboot Server
sudo shutdown -r now
```

- Make it executable:

```bash
sudo chmod +x post-hook.sh
```

- Test renewal:

```bash
sudo certbot renew --dry-run
```

## 6. Install Java & Other Dependencies

Keycloak 26 requires Java 17 or later. Let's install OpenJDK 21:

```bash
sudo apt install openjdk-21-jdk
```

## 7. Download and Prepare Keycloak

```bash
# Install dependencies and create directories
sudo apt install zip
sudo mkdir -p /opt/keycloak
cd /opt/keycloak

# Download and extract Keycloak
sudo wget https://github.com/keycloak/keycloak/releases/download/26.1.0/keycloak-26.1.0.zip
sudo unzip keycloak-26.1.0.zip -d /opt/keycloak
sudo rm keycloak-26.1.0.zip
```

- Create Keycloak user and group:

```bash
# Create user and group
sudo groupadd -r keycloak
sudo useradd -r -g keycloak -d /opt/keycloak -s /sbin/nologin keycloak
```

- Give keycloak user ownership and privileges:

```bash
# Set permissions
cd /opt
sudo chown -R keycloak: keycloak
sudo chmod -R 755 /opt/keycloak/keycloak-26.1.0/bin/
sudo chmod -R 755 /etc/letsencrypt
```

## 8. Configure Keycloak

Edit Keycloak configuration:

```bash
sudo nano /opt/keycloak/keycloak-26.1.0/conf/keycloak.conf
```

- Insert/Update the following configuration (replace with your values):

```env
# Database configuration
db=mysql
db-username=keycloak
db-password=MYSQL_DATABASE_PASSWORD

# SSL configuration
https-certificate-file=/etc/letsencrypt/live/keycloak.yourdomain.com/fullchain.pem
https-certificate-key-file=/etc/letsencrypt/live/keycloak.yourdomain.com/privkey.pem

# Host configuration
hostname=keycloak.yourdomain.com
https-port=8443
```

- *Note: Replace keycloak.yourdomain.com with your domain name*

- Build and start Keycloak:

```bash
cd /opt/keycloak/keycloak-26.1.0
sudo bin/kc.sh build
sudo -E bin/kc.sh bootstrap-admin user
sudo -E bin/kc.sh start
```

- Keycloak should now be running on [https://keycloak.yourdomain.com:8443/](https://keycloak.yourdomain.com:8443/).

- Log into keycloak using the account created above and create a new user. Make sure to give this new user all available roles.

## 9. Configure Keycloak to Start Automatically

Press **Ctrl+C** to stop Keycloak, then create a systemd service:

```bash
sudo nano /etc/systemd/system/keycloak.service
```

- Sample Contents (adjust as needed):

```ini
[Unit]
Description=Keycloak Server
After=syslog.target network.target mysql.service
Before=httpd.service

[Service]
User=keycloak
Group=keycloak
SuccessExitStatus=0 143
ExecStart=/opt/keycloak/keycloak-26.1.0/bin/kc.sh start

[Install]
WantedBy=multi-user.target
```

- Enable and Reboot:

```bash
# Enable service and reboot
sudo systemctl daemon-reload
sudo systemctl enable keycloak
sudo shutdown -r now
```

- After reboot, check status:

```bash
sudo systemctl status keycloak
```

## 10. Changing to Port 443

Adjust keycloak.conf:

```bash
sudo nano /opt/keycloak/keycloak-26.1.0/conf/keycloak.conf
```

- Change (or add):

```env
# Use standard HTTPS port
https-port=443
```

- Rebuild Keycloak:

```bash
# Rebuild with new configuration
cd /opt/keycloak/keycloak-26.1.0
sudo bin/kc.sh build
```

- Update Firewall Rules:

```bash
# Update firewall rules
sudo ufw delete allow 8443/tcp
sudo ufw allow 443/tcp
sudo shutdown -r now
```

- Keycloak will now listen on standard HTTPS port **443**, accessible at [https://keycloak.yourdomain.com](https://keycloak.yourdomain.com).

## Conclusion

You've successfully installed Keycloak 26 on Ubuntu 24.04, configured MySQL as the backend, and secured Keycloak with a valid SSL certificate using Certbot. You've also set up systemd to ensure Keycloak starts automatically on reboot and moved it to port 443 for a cleaner URL.

### Next Steps

- Log in to your Keycloak admin console at [https://keycloak.yourdomain.com](https://keycloak.yourdomain.com) using the admin username/password you created
- Configure your realms, clients, and identity providers as needed
- Review Keycloak logs and manage system resources to ensure optimal performance

With your identity and access management solution in place, you can focus on integrating Keycloak into your applications and services!
