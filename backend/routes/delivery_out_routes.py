from flask import Blueprint, request, jsonify
from models.models import db, DeliveryOut, ItemCategory, Customer, StagingArea
from config.auth import token_required
from datetime import datetime

delivery_out_bp = Blueprint('delivery_out', __name__)

@delivery_out_bp.route('/', methods=['GET'])
@token_required
def get_deliveries_out():
    deliveries = DeliveryOut.query.order_by(DeliveryOut.created_at.desc()).all()
    return jsonify([d.to_dict() for d in deliveries]), 200

@delivery_out_bp.route('/<int:delivery_id>', methods=['GET'])
@token_required
def get_delivery_out(delivery_id):
    delivery = DeliveryOut.query.get(delivery_id)
    if not delivery:
        return jsonify({'message': 'Delivery not found'}), 404
    return jsonify(delivery.to_dict()), 200

@delivery_out_bp.route('/', methods=['POST'])
@token_required
def create_delivery_out():
    data = request.get_json()
    required = ['item_code', 'description', 'qty', 'item_category_id']
    if not all(data.get(f) for f in required):
        return jsonify({'message': 'Item code, description, qty, and item category are required'}), 400

    delivery = DeliveryOut(
        item_code=data['item_code'],
        description=data['description'],
        qty=data['qty'],
        item_category_id=data['item_category_id'],
        so_number=data.get('so_number'),
        customer_id=data.get('customer_id'),
        delivery_out_date=datetime.fromisoformat(data['delivery_out_date']) if data.get('delivery_out_date') else datetime.utcnow(),
        status='pending'
    )
    db.session.add(delivery)
    db.session.commit()
    return jsonify(delivery.to_dict()), 201

@delivery_out_bp.route('/<int:delivery_id>/move-to-staging', methods=['PUT'])
@token_required
def move_to_staging(delivery_id):
    delivery = DeliveryOut.query.get(delivery_id)
    if not delivery:
        return jsonify({'message': 'Delivery not found'}), 404

    data = request.get_json()
    if not data.get('staging_area_id'):
        return jsonify({'message': 'Staging area is required'}), 400

    staging_area = StagingArea.query.get(data['staging_area_id'])
    if not staging_area:
        return jsonify({'message': 'Staging area not found'}), 404

    delivery.staging_area_id = data['staging_area_id']
    delivery.moved_to_staging = True
    delivery.moved_to_staging_at = datetime.fromisoformat(data['moved_at']) if data.get('moved_at') else datetime.utcnow()
    delivery.status = 'staging'
    staging_area.current_qty += delivery.qty

    db.session.commit()
    return jsonify(delivery.to_dict()), 200

@delivery_out_bp.route('/<int:delivery_id>/release', methods=['PUT'])
@token_required
def release_delivery(delivery_id):
    delivery = DeliveryOut.query.get(delivery_id)
    if not delivery:
        return jsonify({'message': 'Delivery not found'}), 404

    if not delivery.moved_to_staging:
        return jsonify({'message': 'Item must be moved to staging area first'}), 400

    data = request.get_json()

    delivery.released = True
    delivery.released_by = request.current_user['user_id']
    delivery.release_date = datetime.fromisoformat(data['release_date']) if data.get('release_date') else datetime.utcnow()
    delivery.departure_time = datetime.fromisoformat(data['departure_time']) if data.get('departure_time') else datetime.utcnow()
    delivery.status = 'released'

    if delivery.staging_area:
        delivery.staging_area.current_qty -= delivery.qty

    db.session.commit()
    return jsonify(delivery.to_dict()), 200

@delivery_out_bp.route('/<int:delivery_id>', methods=['PUT'])
@token_required
def update_delivery_out(delivery_id):
    delivery = DeliveryOut.query.get(delivery_id)
    if not delivery:
        return jsonify({'message': 'Delivery not found'}), 404

    data = request.get_json()
    for field in ['item_code', 'description', 'qty', 'so_number', 'status']:
        if data.get(field) is not None:
            setattr(delivery, field, data[field])
    if data.get('item_category_id'):
        delivery.item_category_id = data['item_category_id']
    if data.get('customer_id'):
        delivery.customer_id = data['customer_id']

    db.session.commit()
    return jsonify(delivery.to_dict()), 200

@delivery_out_bp.route('/<int:delivery_id>', methods=['DELETE'])
@token_required
def delete_delivery_out(delivery_id):
    delivery = DeliveryOut.query.get(delivery_id)
    if not delivery:
        return jsonify({'message': 'Delivery not found'}), 404
    db.session.delete(delivery)
    db.session.commit()
    return jsonify({'message': 'Delivery deleted'}), 200
