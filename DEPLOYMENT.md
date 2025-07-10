# 🚀 Panduan Deployment Kitversity Production

## 📋 Ringkasan Konfigurasi

Berdasarkan data yang telah Anda berikan, berikut adalah konfigurasi yang akan digunakan:

### 🌐 Domain & Server
- **Domain**: kitversity.com
- **IP VPS**: 31.97.67.197
- **SSH User**: root
- **Repository**: https://github.com/ibnuhabibr/kitversity-docker

### 🔐 Kredensial
- **Admin Email**: admin@kitversity.com
- **Database Password**: kikqthksbu
- **Admin Password**: kikqthksbu
- **Redis Password**: kikqthksbu
- **Grafana Password**: kikqthksbu

### 💳 Pembayaran
- **Bank**: BCA
- **Rekening**: 7355211282
- **Atas Nama**: Ibnu Habib Ridwansyah
- **WhatsApp**: 085135706028
- **Grup WhatsApp**: https://chat.whatsapp.com/Bw8P8G4UNG23FJFs6g66uI

---

# 📝 TO-DO LIST DEPLOYMENT PRODUCTION

## 🎯 FASE 1: PERSIAPAN INFRASTRUKTUR

### ✅ 1.1 Setup DNS Domain
- [ ] Login ke panel domain provider (Namecheap, Cloudflare, dll)
- [ ] Tambahkan A Record: `kitversity.com` → `31.97.67.197`
- [ ] Tambahkan A Record: `www.kitversity.com` → `31.97.67.197`
- [ ] Tambahkan A Record: `grafana.kitversity.com` → `31.97.67.197`
- [ ] Tambahkan A Record: `traefik.kitversity.com` → `31.97.67.197`
- [ ] Tambahkan A Record: `prometheus.kitversity.com` → `31.97.67.197`
- [ ] Tunggu propagasi DNS (5-30 menit)
- [ ] Test DNS dengan: `nslookup kitversity.com`

### ✅ 1.2 Akses VPS
- [ ] SSH ke VPS: `ssh root@31.97.67.197`
- [ ] Verifikasi akses berhasil
- [ ] Update sistem: `apt update && apt upgrade -y`

### ✅ 1.3 Install Dependencies
- [ ] Install Docker: `curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh`
- [ ] Install Docker Compose: `curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose`
- [ ] Set permission: `chmod +x /usr/local/bin/docker-compose`
- [ ] Install Git: `apt install git -y`
- [ ] Install utilities: `apt install curl wget htop nano -y`
- [ ] Verifikasi instalasi: `docker --version && docker-compose --version`

## 🎯 FASE 2: SETUP PROJECT

### ✅ 2.1 Clone Repository
- [ ] Masuk ke direktori: `cd /opt`
- [ ] Clone project: `git clone https://github.com/ibnuhabibr/kitversity-docker.git kitversity`
- [ ] Masuk ke folder: `cd kitversity`
- [ ] Verifikasi file: `ls -la`

### ✅ 2.2 Konfigurasi Environment
- [ ] Copy file environment: `cp .env.example .env.production`
- [ ] Edit file: `nano .env.production`
- [ ] Isi semua konfigurasi sesuai data yang sudah diberikan
- [ ] Simpan file: `Ctrl+X, Y, Enter`
- [ ] Verifikasi konfigurasi: `cat .env.production`

### ✅ 2.3 Setup Permissions
- [ ] Set permission script: `chmod +x deploy.sh`
- [ ] Set permission backup: `chmod +x scripts/backup.sh`
- [ ] Buat direktori backup: `mkdir -p /var/backups/kitversity`

## 🎯 FASE 3: DEPLOYMENT

### ✅ 3.1 Pre-Deployment Check
- [ ] Verifikasi DNS sudah propagasi: `nslookup kitversity.com`
- [ ] Check port 80 dan 443 terbuka: `netstat -tlnp | grep -E ':80|:443'`
- [ ] Pastikan tidak ada service lain di port tersebut
- [ ] Check disk space: `df -h`
- [ ] Check memory: `free -h`

### ✅ 3.2 Build dan Deploy
- [ ] Jalankan deployment: `./deploy.sh`
- [ ] Monitor proses build (tunggu 5-10 menit)
- [ ] Verifikasi tidak ada error
- [ ] Check status container: `docker-compose -f docker-compose.prod.yml ps`

### ✅ 3.3 Verifikasi Services
- [ ] Check database: `docker-compose -f docker-compose.prod.yml exec kitversity-db mysqladmin ping -h localhost -u root -pkikqthksbu`
- [ ] Check Redis: `docker-compose -f docker-compose.prod.yml exec kitversity-redis redis-cli -a kikqthksbu ping`
- [ ] Check aplikasi: `curl -f http://localhost:3000/api/health`
- [ ] Check logs: `docker-compose -f docker-compose.prod.yml logs -f --tail=50`

## 🎯 FASE 4: TESTING & VERIFIKASI

### ✅ 4.1 Test Website
- [ ] Akses website: `https://kitversity.com`
- [ ] Verifikasi SSL certificate (ikon gembok hijau)
- [ ] Test redirect www: `https://www.kitversity.com`
- [ ] Test halaman utama loading dengan benar
- [ ] Test navigasi menu

### ✅ 4.2 Test Admin Dashboard
- [ ] Akses admin: `https://kitversity.com/admin/login`
- [ ] Login dengan: `admin@kitversity.com` / `kikqthksbu`
- [ ] Verifikasi dashboard loading
- [ ] Test CRUD produk
- [ ] Test manajemen order

### ✅ 4.3 Test Pembayaran
- [ ] Buat test order
- [ ] Verifikasi halaman checkout
- [ ] Check data rekening BCA: `7355211282`
- [ ] Check nama: `Ibnu Habib Ridwansyah`
- [ ] Test WhatsApp button: `085135706028`
- [ ] Verifikasi grup WhatsApp link

### ✅ 4.4 Test Monitoring
- [ ] Akses Grafana: `https://grafana.kitversity.com`
- [ ] Login dengan: `admin` / `kikqthksbu`
- [ ] Verifikasi dashboard monitoring
- [ ] Akses Traefik: `https://traefik.kitversity.com`
- [ ] Akses Prometheus: `https://prometheus.kitversity.com`

## 🎯 FASE 5: PRODUCTION SETUP

### ✅ 5.1 Setup Backup Otomatis
- [ ] Edit crontab: `crontab -e`
- [ ] Tambahkan backup harian: `0 2 * * * cd /opt/kitversity && ./scripts/backup.sh`
- [ ] Test backup manual: `./scripts/backup.sh`
- [ ] Verifikasi file backup: `ls -la /var/backups/kitversity/`

### ✅ 5.2 Setup Monitoring Logs
- [ ] Install logrotate: `apt install logrotate -y`
- [ ] Setup log rotation untuk Docker
- [ ] Test monitoring: `docker stats`
- [ ] Setup alert (opsional)

### ✅ 5.3 Security Hardening
- [ ] Setup firewall: `ufw enable`
- [ ] Allow SSH: `ufw allow 22`
- [ ] Allow HTTP: `ufw allow 80`
- [ ] Allow HTTPS: `ufw allow 443`
- [ ] Check firewall: `ufw status`
- [ ] Disable root SSH (opsional)
- [ ] Setup fail2ban (opsional)

## 🎯 FASE 6: GO LIVE

### ✅ 6.1 Final Testing
- [ ] Test semua fitur website
- [ ] Test order flow end-to-end
- [ ] Test admin dashboard
- [ ] Test monitoring
- [ ] Test backup & restore
- [ ] Load testing (opsional)

### ✅ 6.2 Documentation
- [ ] Update README.md
- [ ] Dokumentasi kredensial
- [ ] Dokumentasi prosedur maintenance
- [ ] Dokumentasi troubleshooting

### ✅ 6.3 Launch
- [ ] Announce go-live
- [ ] Monitor traffic
- [ ] Monitor error logs
- [ ] Monitor performance
- [ ] Siap melayani customer! 🎉

---

# 🛠️ TUTORIAL STEP-BY-STEP DETAIL

## 1. Persiapan VPS (15 menit)

### SSH ke VPS
```bash
ssh root@31.97.67.197`