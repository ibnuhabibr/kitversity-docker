import { dbManager } from '../lib/db/config';
import { createTables } from '../lib/db/schema';
import { ProductModel, UserModel } from '../lib/db/models';
import bcrypt from 'bcryptjs';

async function waitForDatabase(maxRetries = 30, delay = 2000): Promise<boolean> {
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
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  throw new Error('❌ Failed to connect to database after maximum retries');
}

async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');
    
    // Wait for database to be ready
    await waitForDatabase();
    
    // Create tables
    console.log('📋 Creating database tables...');
    await createTables();
    console.log('✅ Database tables created successfully');

    // Check if admin user already exists
    console.log('👤 Checking for admin user...');
    const existingAdmin = await UserModel.findByEmail('admin@kitversity.com');
    
    if (!existingAdmin) {
      // Create admin user
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      const admin = await UserModel.create({
        name: 'Admin Kitversity',
        email: 'admin@kitversity.com',
        phone: '081234567890',
        university: 'Universitas Airlangga',
        address: 'Surabaya, Jawa Timur',
        role: 'admin'
      });
      
      if (admin) {
        console.log('✅ Admin user created:', admin.email);
        console.log('🔑 Admin password:', adminPassword);
      } else {
        console.log('❌ Failed to create admin user');
      }
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Check if products exist
    console.log('📦 Checking for initial products...');
    const existingProducts = await ProductModel.findAll();
    
    if (existingProducts.length === 0) {
      console.log('📦 Adding initial products...');
      
      const initialProducts = [
        {
          name: 'Tas Ransel Kampus Premium',
          description: 'Tas ransel berkualitas tinggi dengan desain modern dan kompartemen laptop',
          specifications: 'Material: Polyester 600D, Ukuran: 45x30x15cm, Kompartemen laptop 15 inch',
          price: 299000,
          originalPrice: 399000,
          discount: 25,
          stock: 50,
          image_url: '/images/products/tas-ransel-kampus.jpg',
          category: 'Tas & Aksesoris',
          rating: 4.8,
          sold: 127,
          variants: JSON.stringify([
            { name: 'Warna', options: ['Hitam', 'Navy', 'Abu-abu'] },
            { name: 'Ukuran', options: ['Medium', 'Large'] }
          ])
        },
        {
          name: 'Set Alat Tulis Lengkap',
          description: 'Paket lengkap alat tulis untuk kebutuhan kuliah dan kantor',
          specifications: 'Isi: Pulpen 5pcs, Pensil 3pcs, Penghapus, Penggaris, Stabilo 3 warna',
          price: 85000,
          originalPrice: 120000,
          discount: 29,
          stock: 100,
          image_url: '/images/products/alat-tulis-set.jpg',
          category: 'Alat Tulis',
          rating: 4.6,
          sold: 89,
          variants: JSON.stringify([
            { name: 'Tema', options: ['Classic', 'Colorful', 'Minimalist'] }
          ])
        },
        {
          name: 'Laptop Stand Adjustable',
          description: 'Stand laptop yang dapat disesuaikan untuk posisi kerja yang ergonomis',
          specifications: 'Material: Aluminum Alloy, Sudut: 0-60°, Support: 10-17 inch laptop',
          price: 175000,
          originalPrice: 225000,
          discount: 22,
          stock: 30,
          image_url: '/images/products/laptop-stand.jpg',
          category: 'Aksesoris Elektronik',
          rating: 4.9,
          sold: 45,
          variants: JSON.stringify([
            { name: 'Warna', options: ['Silver', 'Space Gray'] }
          ])
        },
        {
          name: 'Buku Catatan Premium A5',
          description: 'Buku catatan dengan kertas berkualitas tinggi dan cover elegan',
          specifications: 'Ukuran: A5 (14.8x21cm), Halaman: 200, Kertas: 80gsm, Hard cover',
          price: 45000,
          originalPrice: 65000,
          discount: 31,
          stock: 75,
          image_url: '/images/products/buku-catatan.jpg',
          category: 'Alat Tulis',
          rating: 4.7,
          sold: 156,
          variants: JSON.stringify([
            { name: 'Cover', options: ['Hitam', 'Coklat', 'Navy'] },
            { name: 'Jenis Garis', options: ['Bergaris', 'Polos', 'Kotak-kotak'] }
          ])
        },
        {
          name: 'Power Bank 20000mAh',
          description: 'Power bank kapasitas besar dengan fast charging dan multiple port',
          specifications: 'Kapasitas: 20000mAh, Input: USB-C PD 18W, Output: 2x USB-A + 1x USB-C',
          price: 245000,
          originalPrice: 320000,
          discount: 23,
          stock: 25,
          image_url: '/images/products/power-bank.jpg',
          category: 'Aksesoris Elektronik',
          rating: 4.8,
          sold: 78,
          variants: JSON.stringify([
            { name: 'Warna', options: ['Hitam', 'Putih', 'Biru'] }
          ])
        }
      ];

      for (const productData of initialProducts) {
        try {
          const product = await ProductModel.create(productData);
          if (product) {
            console.log(`✅ Product created: ${product.name}`);
          }
        } catch (error) {
          console.error(`❌ Failed to create product: ${productData.name}`, error);
        }
      }
    } else {
      console.log(`ℹ️ Found ${existingProducts.length} existing products`);
    }

    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    // Close database connection
    await dbManager.close();
  }
}

// Run initialization
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Initialization script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Initialization script failed:', error);
      process.exit(1);
    });
}

export { initializeDatabase };