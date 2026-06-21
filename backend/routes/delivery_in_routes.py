from flask import Blueprint, request, jsonify
from models.models import db, DeliveryIn, ItemCategory, Supplier
from config.auth import token_required
from datetime import datetime

delivery_in_bp = Blueprint('delivery_in', __name__)

@delivery_in_bp.route('/', methods=['GET'])
@token_required
def get_deliveries_in():
    deliveries = DeliveryIn.query.order_by(DeliveryIn.created_at.desc()).all()
    return jsonify([d.to_dict() for d in deliveries]), 200

@delivery_in_bp.route('/<int:delivery_id>', methods=['GET'])
@token_required
def get_delivery_in(delivery_id):
    delivery = DeliveryIn.query.get(delivery_id)
    if not delivery:
        return jsonify({'message': 'Delivery not found'}), 404
    return jsonify(delivery.to_dict()), 200

@delivery_in_bp.route('/', methods=['POST'])
@token_required
def create_delivery_in():
    data = request.get_json()
    required = ['item_code', 'description', 'qty', 'item_category_id']
    if not all(data.get(f) for f in required):
        return jsonify({'message': 'Item code, description, qty, and item category are required'}), 400

    delivery = DeliveryIn(
        item_code=data['item_code'],
        description=data['description'],
        qty=data['qty'],
        item_category_id=data['item_category_id'],
        po_number=data.get('po_number'),
        supplier_id=data.get('supplier_id'),
        dr_number=data.get('dr_number'),
        delivery_date=datetime.fromisoformat(data['delivery_date']) if data.get('delivery_date') else datetime.utcnow(),
        received_by=request.current_user['user_id']
    )
    db.session.add(delivery)
    db.session.commit()
    return jsonify(delivery.to_dict()), 201

@delivery_in_bp.route('/<int:delivery_id>', methods=['PUT'])
@token_required
def update_delivery_in(delivery_id):
    delivery = DeliveryIn.query.get(delivery_id)
    if not delivery:
        return jsonify({'message': 'Delivery not found'}), 404

    data = request.get_json()
    for field in ['item_code', 'description', 'qty', 'po_number', 'dr_number', 'status']:
        if data.get(field) is not None:
            setattr(delivery, field, data[field])
    if data.get('item_category_id'):
        delivery.item_category_id = data['item_category_id']
    if data.get('supplier_id'):
        delivery.supplier_id = data['supplier_id']
    if data.get('delivery_date'):
        delivery.delivery_date = datetime.fromisoformat(data['delivery_date'])

    db.session.commit()
    return jsonify(delivery.to_dict()), 200

@delivery_in_bp.route('/<int:delivery_id>', methods=['DELETE'])
@token_required
def delete_delivery_in(delivery_id):
    delivery = DeliveryIn.query.get(delivery_id)
    if not delivery:
        return jsonify({'message': 'Delivery not found'}), 404
    db.session.delete(delivery)
    db.session.commit()
    return jsonify({'message': 'Delivery deleted'}), 200
