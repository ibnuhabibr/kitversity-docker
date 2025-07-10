# 🚀 Panduan Deployment Kitversity

## 📋 Ringkasan Konfigurasi

Berdasarkan data yang telah Anda berikan, berikut adalah konfigurasi yang akan digunakan:

### 🌐 Domain & Server
- **Domain**: kitversity.com
- **IP VPS**: 31.97.67.197
- **SSH User**: root

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

## 🛠️ Langkah Deployment

### 1. Persiapan VPS

```bash
# Update sistem
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Git
apt install git -y