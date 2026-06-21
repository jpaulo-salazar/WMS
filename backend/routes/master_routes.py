from flask import Blueprint, request, jsonify
from models.models import db, ItemCategory, Supplier, Customer, Bin, StagingArea
from config.auth import token_required, admin_required

master_bp = Blueprint('master', __name__)

# Item Categories
@master_bp.route('/categories', methods=['GET'])
@token_required
def get_categories():
    categories = ItemCategory.query.all()
    return jsonify([c.to_dict() for c in categories]), 200

@master_bp.route('/categories', methods=['POST'])
@admin_required
def create_category():
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'message': 'Category name is required'}), 400
    category = ItemCategory(name=data['name'], description=data.get('description'))
    db.session.add(category)
    db.session.commit()
    return jsonify(category.to_dict()), 201

@master_bp.route('/categories/<int:cat_id>', methods=['PUT'])
@admin_required
def update_category(cat_id):
    category = ItemCategory.query.get(cat_id)
    if not category:
        return jsonify({'message': 'Category not found'}), 404
    data = request.get_json()
    if data.get('name'):
        category.name = data['name']
    if data.get('description') is not None:
        category.description = data['description']
    db.session.commit()
    return jsonify(category.to_dict()), 200

@master_bp.route('/categories/<int:cat_id>', methods=['DELETE'])
@admin_required
def delete_category(cat_id):
    category = ItemCategory.query.get(cat_id)
    if not category:
        return jsonify({'message': 'Category not found'}), 404
    db.session.delete(category)
    db.session.commit()
    return jsonify({'message': 'Category deleted'}), 200

# Suppliers
@master_bp.route('/suppliers', methods=['GET'])
@token_required
def get_suppliers():
    suppliers = Supplier.query.filter_by(is_active=True).all()
    return jsonify([s.to_dict() for s in suppliers]), 200

@master_bp.route('/suppliers', methods=['POST'])
@admin_required
def create_supplier():
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'message': 'Supplier name is required'}), 400
    supplier = Supplier(
        name=data['name'],
        contact_person=data.get('contact_person'),
        contact_number=data.get('contact_number'),
        email=data.get('email'),
        address=data.get('address')
    )
    db.session.add(supplier)
    db.session.commit()
    return jsonify(supplier.to_dict()), 201

@master_bp.route('/suppliers/<int:sup_id>', methods=['PUT'])
@admin_required
def update_supplier(sup_id):
    supplier = Supplier.query.get(sup_id)
    if not supplier:
        return jsonify({'message': 'Supplier not found'}), 404
    data = request.get_json()
    for field in ['name', 'contact_person', 'contact_number', 'email', 'address']:
        if data.get(field) is not None:
            setattr(supplier, field, data[field])
    db.session.commit()
    return jsonify(supplier.to_dict()), 200

# Customers
@master_bp.route('/customers', methods=['GET'])
@token_required
def get_customers():
    customers = Customer.query.filter_by(is_active=True).all()
    return jsonify([c.to_dict() for c in customers]), 200

@master_bp.route('/customers', methods=['POST'])
@admin_required
def create_customer():
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'message': 'Customer name is required'}), 400
    customer = Customer(
        name=data['name'],
        contact_person=data.get('contact_person'),
        contact_number=data.get('contact_number'),
        email=data.get('email'),
        address=data.get('address')
    )
    db.session.add(customer)
    db.session.commit()
    return jsonify(customer.to_dict()), 201

@master_bp.route('/customers/<int:cust_id>', methods=['PUT'])
@admin_required
def update_customer(cust_id):
    customer = Customer.query.get(cust_id)
    if not customer:
        return jsonify({'message': 'Customer not found'}), 404
    data = request.get_json()
    for field in ['name', 'contact_person', 'contact_number', 'email', 'address']:
        if data.get(field) is not None:
            setattr(customer, field, data[field])
    db.session.commit()
    return jsonify(customer.to_dict()), 200

# Bins
@master_bp.route('/bins', methods=['GET'])
@token_required
def get_bins():
    bins = Bin.query.filter_by(is_active=True).all()
    return jsonify([b.to_dict() for b in bins]), 200

@master_bp.route('/bins', methods=['POST'])
@admin_required
def create_bin():
    data = request.get_json()
    if not data or not data.get('bin_number') or not data.get('aisle'):
        return jsonify({'message': 'Bin number and aisle are required'}), 400
    bin_item = Bin(
        bin_number=data['bin_number'],
        aisle=data['aisle'],
        capacity=data.get('capacity', 0)
    )
    db.session.add(bin_item)
    db.session.commit()
    return jsonify(bin_item.to_dict()), 201

@master_bp.route('/bins/<int:bin_id>', methods=['PUT'])
@admin_required
def update_bin(bin_id):
    bin_item = Bin.query.get(bin_id)
    if not bin_item:
        return jsonify({'message': 'Bin not found'}), 404
    data = request.get_json()
    for field in ['bin_number', 'aisle', 'capacity', 'is_active']:
        if data.get(field) is not None:
            setattr(bin_item, field, data[field])
    db.session.commit()
    return jsonify(bin_item.to_dict()), 200

# Staging Areas
@master_bp.route('/staging-areas', methods=['GET'])
@token_required
def get_staging_areas():
    areas = StagingArea.query.filter_by(is_active=True).all()
    return jsonify([a.to_dict() for a in areas]), 200

@master_bp.route('/staging-areas', methods=['POST'])
@admin_required
def create_staging_area():
    data = request.get_json()
    if not data or not data.get('name') or not data.get('area_number'):
        return jsonify({'message': 'Name and area number are required'}), 400
    area = StagingArea(
        name=data['name'],
        area_number=data['area_number'],
        capacity=data.get('capacity', 0)
    )
    db.session.add(area)
    db.session.commit()
    return jsonify(area.to_dict()), 201

@master_bp.route('/staging-areas/<int:area_id>', methods=['PUT'])
@admin_required
def update_staging_area(area_id):
    area = StagingArea.query.get(area_id)
    if not area:
        return jsonify({'message': 'Staging area not found'}), 404
    data = request.get_json()
    for field in ['name', 'area_number', 'capacity', 'is_active']:
        if data.get(field) is not None:
            setattr(area, field, data[field])
    db.session.commit()
    return jsonify(area.to_dict()), 200
