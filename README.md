# WMS - Warehouse Management System

**CHERENZ GLOBAL MFG. INC.**

A Warehouse Management System built with React.js frontend and Python Flask backend with MySQL database.

## Features

- **Authentication**: Login with JWT-based authentication
- **User Management**: Create and manage Admin and Staff users
- **Delivery In**: Record incoming deliveries with scanner support, item details, PO#, supplier selection
- **Transfer**: Transfer items between bins and aisles
- **Delivery Out**: Process outgoing deliveries with staging area management and release workflow
- **Dashboard**: Overview of warehouse activity

## Prerequisites

- Python 3.8+
- Node.js 16+
- MySQL 5.7+
- npm or yarn

## Setup

### 1. Create MySQL Database

```sql
CREATE DATABASE wms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or run the setup script:

```bash
mysql -u root -p < backend/init_db.sql
```

### 2. Configure Database Connection

Edit `backend/.env` with your MySQL credentials:

```
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wms_db
```

### 3. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Running the Application

### Start Backend (Port 5000)

```bash
cd backend
python app.py
```

On first run, the application will:
- Create all database tables
- Seed default admin user (admin / admin123)
- Create 10 staging areas
- Create default item categories

### Start Frontend (Port 3000)

```bash
cd frontend
npm start
```

## Default Login

- **Username**: admin
- **Password**: admin123

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Login |
| `/api/auth/me` | GET | Get current user |
| `/api/users/` | GET/POST | List/Create users |
| `/api/users/<id>` | GET/PUT/DELETE | User CRUD |
| `/api/delivery-in/` | GET/POST | List/Create deliveries in |
| `/api/delivery-in/<id>` | GET/PUT/DELETE | Delivery in CRUD |
| `/api/transfers/` | GET/POST | List/Create transfers |
| `/api/transfers/aisle-to-bin` | POST | Aisle to bin transfer |
| `/api/delivery-out/` | GET/POST | List/Create deliveries out |
| `/api/delivery-out/<id>/move-to-staging` | PUT | Move to staging area |
| `/api/delivery-out/<id>/release` | PUT | Release delivery |
| `/api/master/categories` | GET/POST | Item categories |
| `/api/master/suppliers` | GET/POST | Suppliers |
| `/api/master/customers` | GET/POST | Customers |
| `/api/master/bins` | GET/POST | Bins |
| `/api/master/staging-areas` | GET/POST | Staging areas |
