from flask import Blueprint, request, jsonify
from models.models import db, Transfer, DeliveryIn, Bin
from config.auth import token_required
from datetime import datetime

transfer_bp = Blueprint('transfers', __name__)

@transfer_bp.route('/', methods=['GET'])
@token_required
def get_transfers():
    transfers = Transfer.query.order_by(Transfer.created_at.desc()).all()
    return jsonify([t.to_dict() for t in transfers]), 200

@transfer_bp.route('/<int:transfer_id>', methods=['GET'])
@token_required
def get_transfer(transfer_id):
    transfer = Transfer.query.get(transfer_id)
    if not transfer:
        return jsonify({'message': 'Transfer not found'}), 404
    return jsonify(transfer.to_dict()), 200

@transfer_bp.route('/', methods=['POST'])
@token_required
def create_transfer():
    data = request.get_json()
    if not data.get('delivery_in_id') or not data.get('to_bin_id') or not data.get('transfer_type') or not data.get('qty'):
        return jsonify({'message': 'Delivery ID, destination bin, transfer type, and qty are required'}), 400

    delivery = DeliveryIn.query.get(data['delivery_in_id'])
    if not delivery:
        return jsonify({'message': 'Delivery not found'}), 404

    to_bin = Bin.query.get(data['to_bin_id'])
    if not to_bin:
        return jsonify({'message': 'Destination bin not found'}), 404

    transfer = Transfer(
        delivery_in_id=data['delivery_in_id'],
        transfer_type=data['transfer_type'],
        from_bin_id=data.get('from_bin_id'),
        to_bin_id=data['to_bin_id'],
        from_aisle=data.get('from_aisle'),
        to_aisle=data.get('to_aisle'),
        qty=data['qty'],
        transferred_by=request.current_user['user_id']
    )

    to_bin.current_qty += data['qty']
    delivery.status = 'transferred'

    db.session.add(transfer)
    db.session.commit()
    return jsonify(transfer.to_dict()), 201

@transfer_bp.route('/aisle-to-bin', methods=['POST'])
@token_required
def aisle_to_bin():
    data = request.get_json()
    if not data.get('delivery_in_id') or not data.get('to_bin_id') or not data.get('qty'):
        return jsonify({'message': 'Delivery ID, destination bin, and qty are required'}), 400

    delivery = DeliveryIn.query.get(data['delivery_in_id'])
    if not delivery:
        return jsonify({'message': 'Delivery not found'}), 404

    to_bin = Bin.query.get(data['to_bin_id'])
    if not to_bin:
        return jsonify({'message': 'Destination bin not found'}), 404

    transfer = Transfer(
        delivery_in_id=data['delivery_in_id'],
        transfer_type='aisle',
        from_aisle=data.get('from_aisle'),
        to_aisle=to_bin.aisle,
        to_bin_id=data['to_bin_id'],
        qty=data['qty'],
        transferred_by=request.current_user['user_id']
    )

    to_bin.current_qty += data['qty']
    delivery.status = 'stored'

    db.session.add(transfer)
    db.session.commit()
    return jsonify(transfer.to_dict()), 201
