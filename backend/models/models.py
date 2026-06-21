from config.database import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(200), nullable=False)
    role = db.Column(db.Enum('admin', 'staff'), nullable=False, default='staff')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'full_name': self.full_name,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class ItemCategory(db.Model):
    __tablename__ = 'item_categories'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Supplier(db.Model):
    __tablename__ = 'suppliers'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(200), nullable=False)
    contact_person = db.Column(db.String(200))
    contact_number = db.Column(db.String(50))
    email = db.Column(db.String(200))
    address = db.Column(db.String(500))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'contact_person': self.contact_person,
            'contact_number': self.contact_number,
            'email': self.email,
            'address': self.address,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class DeliveryIn(db.Model):
    __tablename__ = 'delivery_in'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    item_code = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=False)
    qty = db.Column(db.Integer, nullable=False)
    item_category_id = db.Column(db.Integer, db.ForeignKey('item_categories.id'), nullable=False)
    po_number = db.Column(db.String(100))
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'))
    dr_number = db.Column(db.String(100))
    delivery_date = db.Column(db.DateTime, default=datetime.utcnow)
    received_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    status = db.Column(db.Enum('received', 'transferred', 'stored'), default='received')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    item_category = db.relationship('ItemCategory', backref='deliveries_in')
    supplier = db.relationship('Supplier', backref='deliveries_in')
    receiver = db.relationship('User', backref='deliveries_in_received')

    def to_dict(self):
        return {
            'id': self.id,
            'item_code': self.item_code,
            'description': self.description,
            'qty': self.qty,
            'item_category_id': self.item_category_id,
            'item_category': self.item_category.to_dict() if self.item_category else None,
            'po_number': self.po_number,
            'supplier_id': self.supplier_id,
            'supplier': self.supplier.to_dict() if self.supplier else None,
            'dr_number': self.dr_number,
            'delivery_date': self.delivery_date.isoformat() if self.delivery_date else None,
            'received_by': self.received_by,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Bin(db.Model):
    __tablename__ = 'bins'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    bin_number = db.Column(db.String(50), unique=True, nullable=False)
    aisle = db.Column(db.String(50), nullable=False)
    capacity = db.Column(db.Integer, default=0)
    current_qty = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'bin_number': self.bin_number,
            'aisle': self.aisle,
            'capacity': self.capacity,
            'current_qty': self.current_qty,
            'is_active': self.is_active
        }

class Transfer(db.Model):
    __tablename__ = 'transfers'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    delivery_in_id = db.Column(db.Integer, db.ForeignKey('delivery_in.id'), nullable=False)
    transfer_type = db.Column(db.Enum('bin', 'aisle'), nullable=False)
    from_bin_id = db.Column(db.Integer, db.ForeignKey('bins.id'))
    to_bin_id = db.Column(db.Integer, db.ForeignKey('bins.id'), nullable=False)
    from_aisle = db.Column(db.String(50))
    to_aisle = db.Column(db.String(50))
    qty = db.Column(db.Integer, nullable=False)
    transferred_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    transfer_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    delivery_in = db.relationship('DeliveryIn', backref='transfers')
    from_bin = db.relationship('Bin', foreign_keys=[from_bin_id], backref='transfers_from')
    to_bin = db.relationship('Bin', foreign_keys=[to_bin_id], backref='transfers_to')
    transfer_user = db.relationship('User', backref='transfers_made')

    def to_dict(self):
        return {
            'id': self.id,
            'delivery_in_id': self.delivery_in_id,
            'transfer_type': self.transfer_type,
            'from_bin_id': self.from_bin_id,
            'to_bin_id': self.to_bin_id,
            'from_bin': self.from_bin.to_dict() if self.from_bin else None,
            'to_bin': self.to_bin.to_dict() if self.to_bin else None,
            'from_aisle': self.from_aisle,
            'to_aisle': self.to_aisle,
            'qty': self.qty,
            'transferred_by': self.transferred_by,
            'transfer_date': self.transfer_date.isoformat() if self.transfer_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Customer(db.Model):
    __tablename__ = 'customers'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(200), nullable=False)
    contact_person = db.Column(db.String(200))
    contact_number = db.Column(db.String(50))
    email = db.Column(db.String(200))
    address = db.Column(db.String(500))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'contact_person': self.contact_person,
            'contact_number': self.contact_number,
            'email': self.email,
            'address': self.address,
            'is_active': self.is_active
        }

class StagingArea(db.Model):
    __tablename__ = 'staging_areas'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False)
    area_number = db.Column(db.Integer, nullable=False)
    capacity = db.Column(db.Integer, default=0)
    current_qty = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'area_number': self.area_number,
            'capacity': self.capacity,
            'current_qty': self.current_qty,
            'is_active': self.is_active
        }

class DeliveryOut(db.Model):
    __tablename__ = 'delivery_out'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    item_code = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=False)
    qty = db.Column(db.Integer, nullable=False)
    item_category_id = db.Column(db.Integer, db.ForeignKey('item_categories.id'), nullable=False)
    so_number = db.Column(db.String(100))
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'))
    staging_area_id = db.Column(db.Integer, db.ForeignKey('staging_areas.id'))
    moved_to_staging = db.Column(db.Boolean, default=False)
    moved_to_staging_at = db.Column(db.DateTime)
    released = db.Column(db.Boolean, default=False)
    release_date = db.Column(db.DateTime)
    departure_time = db.Column(db.DateTime)
    released_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    delivery_out_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.Enum('pending', 'staging', 'released', 'departed'), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    item_category = db.relationship('ItemCategory', backref='deliveries_out')
    customer = db.relationship('Customer', backref='deliveries_out')
    staging_area = db.relationship('StagingArea', backref='deliveries_out')
    release_user = db.relationship('User', backref='deliveries_out_released')

    def to_dict(self):
        return {
            'id': self.id,
            'item_code': self.item_code,
            'description': self.description,
            'qty': self.qty,
            'item_category_id': self.item_category_id,
            'item_category': self.item_category.to_dict() if self.item_category else None,
            'so_number': self.so_number,
            'customer_id': self.customer_id,
            'customer': self.customer.to_dict() if self.customer else None,
            'staging_area_id': self.staging_area_id,
            'staging_area': self.staging_area.to_dict() if self.staging_area else None,
            'moved_to_staging': self.moved_to_staging,
            'moved_to_staging_at': self.moved_to_staging_at.isoformat() if self.moved_to_staging_at else None,
            'released': self.released,
            'release_date': self.release_date.isoformat() if self.release_date else None,
            'departure_time': self.departure_time.isoformat() if self.departure_time else None,
            'released_by': self.released_by,
            'status': self.status,
            'delivery_out_date': self.delivery_out_date.isoformat() if self.delivery_out_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
