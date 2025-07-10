import { dbManager } from '../lib/db/config';
import { createTables } from '../lib/db/schema';
import bcrypt from 'bcryptjs';

async function waitForDatabase(maxRetries = 60, delay = 2000): Promise<boolean> {
  console.log('🔄 Waiting for database connection...');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await dbManager.initialize();
      const isHealthy = await dbManager.testConnection();
      if (isHealthy) {
        console.log('✅ Database connection established');
        return true;
      }
    } catch (error) {
      console.log(`⏳ Waiting for database... (${i + 1}/${maxRetries})`);
      if (i === maxRetries - 1) {
        console.error('Database connection error:', error);
      }
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  throw new Error('❌ Failed to connect to database after maximum retries');
}

async function initializeDatabase() {
  try {
    console.log('🚀 Starting Docker database initialization...');
    
    // Wait for database to be ready (longer timeout for Docker)
    await waitForDatabase();
    
    // Create tables
    console.log('📋 Creating database tables...');
    await createTables();
    console.log('✅ Database tables created successfully');

    // Create default admin user
    console.log('👤 Creating default admin user...');
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@kitversity.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Check if admin already exists
    const [existingAdmin] = await dbManager.executeQuery(
      'SELECT id FROM users WHERE email = ? AND role = ?', 
      [adminEmail, 'admin']
    );

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      await dbManager.executeQuery(
        `INSERT INTO users (name, email, phone, university, address, role) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          'Admin Kitversity',
          adminEmail,
          '081234567890',
          'Universitas Airlangga',
          'Surabaya, Jawa Timur',
          'admin'
        ]
      );
      
      console.log('✅ Default admin user created');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
      console.log('⚠️ Please change the default password after first login!');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Add sample products if none exist
    const [productCount] = await dbManager.executeQuery(
      'SELECT COUNT(*) as count FROM products'
    );

    if (productCount.count === 0) {
      console.log('📦 Adding sample products...');
      
      const sampleProducts = [
        ['Tas Ransel Kampus Premium', 'Tas ransel berkualitas tinggi', 'Material: Polyester 600D', 299000, 399000, 25, 50, '/images/products/tas-ransel.jpg', 'Tas & Aksesoris', 4.8, 127],
        ['Set Alat Tulis Lengkap', 'Paket lengkap alat tulis', 'Isi: Pulpen, Pensil, Penghapus', 85000, 120000, 29, 100, '/images/products/alat-tulis.jpg', 'Alat Tulis', 4.6, 89],
        ['Laptop Stand Adjustable', 'Stand laptop ergonomis', 'Material: Aluminum, Sudut: 0-60°', 175000, 225000, 22, 30, '/images/products/laptop-stand.jpg', 'Aksesoris Elektronik', 4.9, 45]
      ];

      for (const product of sampleProducts) {
        await dbManager.executeQuery(
          `INSERT INTO products (name, description, specifications, price, originalPrice, discount, stock, image_url, category, rating, sold) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          product
        );
      }
      
      console.log('✅ Sample products added');
    } else {
      console.log(`ℹ️ Found ${productCount.count} existing products`);
    }

    console.log('🎉 Docker database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Docker database initialization failed:', error);
    throw error;
  }
}

// Run initialization
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Docker initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Docker initialization failed:', error);
      process.exit(1);
    });
}

export { initializeDatabase };