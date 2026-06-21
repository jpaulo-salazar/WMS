-- ============================================================
-- WMS - Warehouse Management System
-- CHERENZ GLOBAL MFG. INC.
-- Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS wms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wms_db;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- ITEM CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS item_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- SUPPLIERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(200),
    contact_number VARCHAR(50),
    email VARCHAR(200),
    address VARCHAR(500),
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- CUSTOMERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(200),
    contact_number VARCHAR(50),
    email VARCHAR(200),
    address VARCHAR(500),
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- BINS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS bins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bin_number VARCHAR(50) NOT NULL UNIQUE,
    aisle VARCHAR(50) NOT NULL,
    capacity INT DEFAULT 0,
    current_qty INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- STAGING AREAS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS staging_areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    area_number INT NOT NULL,
    capacity INT DEFAULT 0,
    current_qty INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- DELIVERY IN TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS delivery_in (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_code VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    qty INT NOT NULL,
    item_category_id INT NOT NULL,
    po_number VARCHAR(100),
    supplier_id INT,
    dr_number VARCHAR(100),
    delivery_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    received_by INT,
    status ENUM('received', 'transferred', 'stored') DEFAULT 'received',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (item_category_id) REFERENCES item_categories(id) ON UPDATE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON UPDATE CASCADE,
    FOREIGN KEY (received_by) REFERENCES users(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TRANSFERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS transfers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    delivery_in_id INT NOT NULL,
    transfer_type ENUM('bin', 'aisle') NOT NULL,
    from_bin_id INT,
    to_bin_id INT NOT NULL,
    from_aisle VARCHAR(50),
    to_aisle VARCHAR(50),
    qty INT NOT NULL,
    transferred_by INT,
    transfer_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_in_id) REFERENCES delivery_in(id) ON UPDATE CASCADE,
    FOREIGN KEY (from_bin_id) REFERENCES bins(id) ON UPDATE CASCADE,
    FOREIGN KEY (to_bin_id) REFERENCES bins(id) ON UPDATE CASCADE,
    FOREIGN KEY (transferred_by) REFERENCES users(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- DELIVERY OUT TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS delivery_out (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_code VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    qty INT NOT NULL,
    item_category_id INT NOT NULL,
    so_number VARCHAR(100),
    customer_id INT,
    staging_area_id INT,
    moved_to_staging TINYINT(1) DEFAULT 0,
    moved_to_staging_at DATETIME,
    released TINYINT(1) DEFAULT 0,
    release_date DATETIME,
    departure_time DATETIME,
    released_by INT,
    delivery_out_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'staging', 'released', 'departed') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (item_category_id) REFERENCES item_categories(id) ON UPDATE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON UPDATE CASCADE,
    FOREIGN KEY (staging_area_id) REFERENCES staging_areas(id) ON UPDATE CASCADE,
    FOREIGN KEY (released_by) REFERENCES users(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_delivery_in_item_code ON delivery_in(item_code);
CREATE INDEX idx_delivery_in_status ON delivery_in(status);
CREATE INDEX idx_delivery_in_supplier ON delivery_in(supplier_id);
CREATE INDEX idx_delivery_out_item_code ON delivery_out(item_code);
CREATE INDEX idx_delivery_out_status ON delivery_out(status);
CREATE INDEX idx_delivery_out_customer ON delivery_out(customer_id);
CREATE INDEX idx_transfers_delivery ON transfers(delivery_in_id);
CREATE INDEX idx_transfers_type ON transfers(transfer_type);
CREATE INDEX idx_bins_aisle ON bins(aisle);

-- ============================================================
-- SEED DATA: Default Admin User (password: admin123)
-- ============================================================
INSERT INTO users (username, password, full_name, role, is_active) VALUES
('admin', 'scrypt:32768:8:1$rW7KWYklPZzTQ0mt$eccf1fec7cf1b4c3442f1c0efb595d07d2338f08dbfb96f1de09e9f7525f8385a4991d9282f43863033ab31e09aef8df55e35025edd26ebc5c292cf5382b37cc', 'System Admin', 'admin', 1);

-- ============================================================
-- SEED DATA: Item Categories
-- ============================================================
INSERT INTO item_categories (name, description) VALUES
('Electronics', 'Electronic components and devices'),
('Clothing', 'Apparel and garments'),
('Food', 'Food and beverage items'),
('Furniture', 'Office and warehouse furniture'),
('Raw Materials', 'Raw materials for manufacturing'),
('Packaging', 'Packaging materials and supplies');

-- ============================================================
-- SEED DATA: Staging Areas (1-10)
-- ============================================================
INSERT INTO staging_areas (name, area_number, capacity) VALUES
('Staging Area 1', 1, 100),
('Staging Area 2', 2, 100),
('Staging Area 3', 3, 100),
('Staging Area 4', 4, 100),
('Staging Area 5', 5, 100),
('Staging Area 6', 6, 100),
('Staging Area 7', 7, 100),
('Staging Area 8', 8, 100),
('Staging Area 9', 9, 100),
('Staging Area 10', 10, 100);

-- ============================================================
-- SEED DATA: Sample Bins
-- ============================================================
INSERT INTO bins (bin_number, aisle, capacity) VALUES
('BIN-A001', 'Aisle A', 500),
('BIN-A002', 'Aisle A', 500),
('BIN-A003', 'Aisle A', 500),
('BIN-B001', 'Aisle B', 500),
('BIN-B002', 'Aisle B', 500),
('BIN-B003', 'Aisle B', 500),
('BIN-C001', 'Aisle C', 500),
('BIN-C002', 'Aisle C', 500),
('BIN-C003', 'Aisle C', 500),
('BIN-D001', 'Aisle D', 500),
('BIN-D002', 'Aisle D', 500),
('BIN-D003', 'Aisle D', 500);

-- ============================================================
-- SEED DATA: Sample Suppliers
-- ============================================================
INSERT INTO suppliers (name, contact_person, contact_number, email, address) VALUES
('ABC Supply Co.', 'John Doe', '+63 917 123 4567', 'john@abcsupply.com', '123 Industrial St, Muntinlupa City'),
('XYZ Trading', 'Jane Smith', '+63 918 234 5678', 'jane@xyztrading.com', '456 Commerce Ave, Makati City'),
('Global Parts Inc.', 'Mike Johnson', '+63 919 345 6789', 'mike@globalparts.com', '789 Manufacturing Rd, Cavite');

-- ============================================================
-- SEED DATA: Sample Customers
-- ============================================================
INSERT INTO customers (name, contact_person, contact_number, email, address) VALUES
('Metro Retail Corp.', 'Ana Cruz', '+63 920 456 7890', 'ana@metroretail.com', '321 Retail Blvd, Quezon City'),
('Prime Distributors', 'Carlos Reyes', '+63 921 567 8901', 'carlos@primedist.com', '654 Distribution Way, Pasig City'),
('Island Logistics', 'Maria Santos', '+63 922 678 9012', 'maria@islandlog.com', '987 Logistics Park, Parañaque City');
