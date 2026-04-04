# VPS Deployment Guide (2 Core / 2GB RAM / 20GB Disk)

This guide is optimized for your current VPS size.

## Recommended architecture for stability

- Run only 3 containers on VPS: `nginx`, `frontend`, `backend`
- Use external MongoDB (Atlas or your existing remote MongoDB)
- Access app by VPS public IP first, add domain later

Why this is optimal on 2GB RAM:

- MongoDB on the same VPS can consume too much memory and cause restarts
- Keeping DB external gives better uptime and smoother page/API response

---

## 1) Prepare VPS (Ubuntu 22.04)

SSH into VPS, then run:

sudo apt update && sudo apt -y upgrade
sudo timedatectl set-timezone Asia/Ho_Chi_Minh

### Create swap (important for 2GB RAM)

sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h

---

## 2) Install Docker + Compose plugin

sudo apt -y install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker

sudo usermod -aG docker $USER
newgrp docker

docker --version
docker compose version

---

## 3) Open firewall ports

sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status

---

## 4) Pull source code

cd /opt
sudo git clone <YOUR_REPO_GIT_URL> stone-showroom-web
sudo chown -R $USER:$USER /opt/stone-showroom-web
cd /opt/stone-showroom-web

---

## 5) Configure production env

cp .env.vps.example .env
nano .env

Set required values:

- NEXT_PUBLIC_SITE_URL=http://YOUR_SERVER_IP
- NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP/api
- INTERNAL_API_URL=http://backend:4000/api
- FRONTEND_URL=http://YOUR_SERVER_IP
- DATABASE_URL=your mongodb atlas url
- MONGODB_URI=your mongodb atlas url
- JWT_SECRET=long random string

Tip: generate JWT secret quickly:

openssl rand -base64 48

---

## 6) Deploy with optimized compose file

Use the VPS-optimized file (without local MongoDB):

docker compose -f docker-compose.vps.yml up -d --build

docker compose -f docker-compose.vps.yml ps

---

## 7) Verify by IP (no domain yet)

Replace YOUR_SERVER_IP and test:

curl -I http://YOUR_SERVER_IP
curl -I http://YOUR_SERVER_IP/api/showroom
curl -I http://YOUR_SERVER_IP/api/catalog

Expected:

- frontend route returns 200 (or 307/308 then 200)
- API routes return 200

---

## 8) Basic operations

### View logs

docker compose -f docker-compose.vps.yml logs -f nginx
docker compose -f docker-compose.vps.yml logs -f backend
docker compose -f docker-compose.vps.yml logs -f frontend

### Restart

docker compose -f docker-compose.vps.yml restart

### Update code and redeploy

cd /opt/stone-showroom-web
git pull
docker compose -f docker-compose.vps.yml up -d --build

### Stop all

docker compose -f docker-compose.vps.yml down

---

## 9) If VPS runs out of memory

- Keep swap enabled (2GB)
- Do not run local MongoDB on this VPS
- Reduce background processes
- Optional: reboot during off-hours after deploy

Check resource usage:

docker stats
free -h
df -h

---

## 10) When domain is ready

- Point domain A record to VPS IP
- Change these values in .env:
  - NEXT_PUBLIC_SITE_URL=https://your-domain.com
  - NEXT_PUBLIC_API_URL=https://your-domain.com/api
  - FRONTEND_URL=https://your-domain.com
- Rebuild and restart:
  - docker compose -f docker-compose.vps.yml up -d --build

You can add TLS later with Caddy or Nginx + Certbot.
