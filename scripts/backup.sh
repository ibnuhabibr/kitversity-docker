#!/bin/bash

# ===================================
# KITVERSITY BACKUP SCRIPT
# ===================================

set -e

# Load environment variables
if [ -f ".env.production" ]; then
    source .env.production
else
    echo "Error: .env.production file not found!"
    exit 1
fi

# Create backup directory
BACKUP_DIR="/var/backups/kitversity"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="kitversity_backup_${DATE}.sql"

mkdir -p ${BACKUP_DIR}

echo "🔄 Starting backup process..."

# Database backup
echo "📦 Creating database backup..."
docker-compose -f docker-compose.prod.yml exec -T kitversity-db mysqldump \
    -u root -p${DB_ROOT_PASSWORD} \
    --single-transaction \
    --routines \
    --triggers \
    ${DB_DATABASE} > ${BACKUP_DIR}/${BACKUP_FILE}

# Compress backup
echo "🗜️ Compressing backup..."
gzip ${BACKUP_DIR}/${BACKUP_FILE}

# Remove old backups (keep last 7 days)
echo "🧹 Cleaning old backups..."
find ${BACKUP_DIR} -name "kitversity_backup_*.sql.gz" -mtime +7 -delete

echo "✅ Backup completed: ${BACKUP_DIR}/${BACKUP_FILE}.gz"

# Optional: Upload to cloud storage
if [ ! -z "${AWS_ACCESS_KEY_ID}" ] && [ ! -z "${AWS_SECRET_ACCESS_KEY}" ] && [ ! -z "${AWS_S3_BUCKET}" ]; then
    echo "☁️ Uploading to S3..."
    aws s3 cp ${BACKUP_DIR}/${BACKUP_FILE}.gz s3://${AWS_S3_BUCKET}/backups/
    echo "✅ Backup uploaded to S3"
fi

echo "🎉 Backup process completed successfully!"