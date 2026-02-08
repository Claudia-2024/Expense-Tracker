// SQLite Database Schema and Initialization

import * as SQLite from 'expo-sqlite';

const DB_NAME = 'budgitup.db';
const DB_VERSION = 1;

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initializationPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
    // If already initialized, return the instance
    if (dbInstance) {
        return dbInstance;
    }

    // If initialization is in progress, wait for it
    if (initializationPromise) {
        return initializationPromise;
    }

    // Start initialization
    initializationPromise = initializeDatabase();
    return initializationPromise;
};

export const initializeDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
    try {
        // Open database
        if (!dbInstance) {
            dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
        }

        const db = dbInstance;

        console.log('🔧 Initializing database...');

        // Users table
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        default_currency TEXT DEFAULT 'XAF',
        monthly_budget REAL DEFAULT 0.0,
        has_completed_onboarding INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        token_version INTEGER DEFAULT 0
      );
    `);

        // Categories table
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        icon TEXT NOT NULL,
        is_default INTEGER DEFAULT 0,
        user_id INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

        // Expenses table
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        currency TEXT,
        note TEXT,
        date TEXT,
        user_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      );
    `);

        // Incomes table
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS incomes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        currency TEXT,
        note TEXT,
        date TEXT,
        user_id INTEGER NOT NULL,
        category_id INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );
    `);

        // Budgets table
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        currency TEXT,
        user_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        UNIQUE(user_id, category_id)
      );
    `);

        // Seed default categories if empty
        await seedDefaultCategories(db);

        console.log('✅ Database initialized successfully');

        // Clear the initialization promise since we're done
        initializationPromise = null;

        return db;
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        // Reset on error so initialization can be retried
        dbInstance = null;
        initializationPromise = null;
        throw error;
    }
};

const seedDefaultCategories = async (db: SQLite.SQLiteDatabase) => {
    try {
        // Check if default categories exist
        const result = await db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM categories WHERE is_default = 1 AND user_id IS NULL'
        );

        if (result && result.count > 0) {
            console.log('✅ Default categories already exist');
            return;
        }

        // Insert default categories
        const defaults = [
            { name: 'Food', color: '#FFB3AB', icon: 'fast-food-outline' },
            { name: 'Transport', color: '#88C8FC', icon: 'car-outline' },
            { name: 'Airtime', color: '#F7D07A', icon: 'phone-portrait-outline' },
            { name: 'Social Events', color: '#D291BC', icon: 'people-outline' },
            { name: 'Shopping', color: '#E6A8D7', icon: 'cart-outline' },
            { name: 'Rent', color: '#A0CED9', icon: 'home-outline' },
            { name: 'Bills', color: '#9F8AC2', icon: 'document-text-outline' },
            { name: 'Emergency', color: '#FF9E9E', icon: 'alert-circle-outline' },
            { name: 'Medical expenses', color: '#81C784', icon: 'medkit-outline' }
        ];

        for (const cat of defaults) {
            await db.runAsync(
                'INSERT INTO categories (name, color, icon, is_default, user_id) VALUES (?, ?, ?, 1, NULL)',
                [cat.name, cat.color, cat.icon]
            );
        }

        console.log('✅ Default categories seeded');
    } catch (error) {
        console.error('❌ Error seeding default categories:', error);
        throw error;
    }
};

// Database utility functions
export const clearAllData = async () => {
    const db = await getDatabase();
    await db.execAsync(`
    DELETE FROM budgets;
    DELETE FROM incomes;
    DELETE FROM expenses;
    DELETE FROM categories;
    DELETE FROM users;
  `);
    console.log('✅ All data cleared');
};

export const dropAllTables = async () => {
    const db = await getDatabase();
    await db.execAsync(`
    DROP TABLE IF EXISTS budgets;
    DROP TABLE IF EXISTS incomes;
    DROP TABLE IF EXISTS expenses;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS users;
  `);

    // Reset instance so it can be reinitialized
    dbInstance = null;
    initializationPromise = null;

    console.log('✅ All tables dropped');
};