// Lokasi: lib/db/models.ts

import { dbManager } from './config';
import { Order, OrderItem, Payment, User, Product } from '@/types/database';
import type { ResultSetHeader } from 'mysql2/promise';

// Helper untuk mengambil baris pertama dari hasil query
function getFirstRow<T>(rows: any): T | undefined {
  if (Array.isArray(rows) && rows.length > 0) {
    return rows[0] as T;
  }
  return undefined;
}

// User Model
export class UserModel {
  static async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | undefined> {
    const { name, email, phone, university, address, role } = user;
    const [result] = await dbManager.executeQuery<ResultSetHeader>(
      `INSERT INTO users (name, email, phone, university, address, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, phone, university, address, role || 'user']
    );
    return this.findById(result.insertId);
  }

  static async findById(id: number): Promise<User | undefined> {
    const [rows] = await dbManager.executeQuery('SELECT * FROM users WHERE id = ?', [id]);
    return getFirstRow<User>(rows);
  }

  static async findByEmail(email: string): Promise<User | undefined> {
    const [rows] = await dbManager.executeQuery('SELECT * FROM users WHERE email = ?', [email]);
    return getFirstRow<User>(rows);
  }

  static async findAll(): Promise<User[]> {
    const [rows] = await dbManager.executeQuery('SELECT * FROM users ORDER BY created_at DESC');
    return rows as User[];
  }
}

// Product Model
export class ProductModel {
  static async create(product: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<Product | undefined> {
    const {
        name, description, specifications, price, originalPrice,
        discount, stock, image_url, category, rating = 5.0, sold = 0, variants
    } = product;

    const [result] = await dbManager.executeQuery<ResultSetHeader>(
      `INSERT INTO products (
        name, description, specifications, price, originalPrice,
        discount, stock, image_url, category, rating, sold, variants
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, description, specifications, price, originalPrice,
        discount, stock, image_url, category, rating, sold, variants
      ]
    );
    return this.findById(result.insertId);
  }

  static async findById(id: number): Promise<Product | undefined> {
    const [rows] = await dbManager.executeQuery('SELECT * FROM products WHERE id = ?', [id]);
    return getFirstRow<Product>(rows);
  }

  static async findAll(): Promise<Product[]> {
    const [rows] = await dbManager.executeQuery('SELECT * FROM products ORDER BY id DESC');
    return rows as Product[];
  }

  static async update(id: number, product: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<Product | undefined> {
    const existingProduct = await this.findById(id);
    if (!existingProduct) {
        throw new Error("Produk tidak ditemukan untuk diupdate");
    }

    const fields = Object.keys(product).map(key => `${key} = ?`).join(', ');
    const values = Object.values(product);
    
    await dbManager.executeQuery(
        `UPDATE products SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, id]
    );
    return this.findById(id);
  }

  static async deleteById(id: number): Promise<boolean> {
      const [result] = await dbManager.executeQuery<ResultSetHeader>(
          'DELETE FROM products WHERE id = ?',
          [id]
      );
      return result.affectedRows > 0;
  }
}

// Order Model
export class OrderModel {
  static async create(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order | undefined> {
    const { user_id, total_amount, status, shipping_address, shipping_method, payment_method, customer_info, payment_proof, admin_notes } = order;
    const [result] = await dbManager.executeQuery<ResultSetHeader>(
      `INSERT INTO orders (user_id, total_amount, status, shipping_address, shipping_method, payment_method, customer_info, payment_proof, admin_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, total_amount, status, shipping_address, shipping_method, payment_method, customer_info, payment_proof, admin_notes]
    );
    return this.findById(result.insertId);
  }

  static async findById(id: number): Promise<Order | undefined> {
    const [rows] = await dbManager.executeQuery('SELECT * FROM orders WHERE id = ?', [id]);
    return getFirstRow<Order>(rows);
  }

  static async findAll(): Promise<Order[]> {
    const [rows] = await dbManager.executeQuery('SELECT * FROM orders ORDER BY created_at DESC');
    return rows as Order[];
  }

  static async updateStatus(id: number, status: Order['status'], adminNotes?: string): Promise<Order | undefined> {
    await dbManager.executeQuery(
      'UPDATE orders SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, adminNotes, id]
    );
    return this.findById(id);
  }
}

// OrderItem Model
export class OrderItemModel {
  static async create(item: Omit<OrderItem, 'id' | 'created_at'>): Promise<OrderItem | undefined> {
    const { order_id, product_id, quantity, price } = item;
    const [result] = await dbManager.executeQuery<ResultSetHeader>(
      `INSERT INTO order_items (order_id, product_id, quantity, price)
       VALUES (?, ?, ?, ?)`,
      [order_id, product_id, quantity, price]
    );
    const [newRows] = await dbManager.executeQuery('SELECT * FROM order_items WHERE id = ?', [result.insertId]);
    return getFirstRow<OrderItem>(newRows);
  }

  static async findByOrderId(orderId: number): Promise<OrderItem[]> {
    const [rows] = await dbManager.executeQuery('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    return rows as OrderItem[];
  }
}

// Payment Model (Simplified for manual payment)
export class PaymentModel {
  static async create(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment | undefined> {
    const { order_id, amount, payment_method, status, payment_proof, confirmed_by, confirmed_at, notes } = payment;
    const [result] = await dbManager.executeQuery<ResultSetHeader>(
      `INSERT INTO payments (order_id, amount, payment_method, status, payment_proof, confirmed_by, confirmed_at, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [order_id, amount, payment_method, status, payment_proof, confirmed_by, confirmed_at, notes]
    );
    return this.findByOrderId(order_id);
  }

  static async findByOrderId(orderId: number): Promise<Payment | undefined> {
    const [rows] = await dbManager.executeQuery('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1', [orderId]);
    return getFirstRow<Payment>(rows);
  }

  static async confirmPayment(orderId: number, confirmedBy: number, notes?: string): Promise<Payment | undefined> {
    await dbManager.executeQuery(
      'UPDATE payments SET status = ?, confirmed_by = ?, confirmed_at = CURRENT_TIMESTAMP, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?',
      ['confirmed', confirmedBy, notes, orderId]
    );
    return this.findByOrderId(orderId);
  }
}

export { UserModel, ProductModel, OrderModel, OrderItemModel, PaymentModel };