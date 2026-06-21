from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from models.models import db, User
from config.auth import token_required, admin_required

users_bp = Blueprint('users', __name__)

@users_bp.route('/', methods=['GET'])
@admin_required
def get_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200

@users_bp.route('/<int:user_id>', methods=['GET'])
@token_required
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(user.to_dict()), 200

@users_bp.route('/', methods=['POST'])
@admin_required
def create_user():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password') or not data.get('full_name') or not data.get('role'):
        return jsonify({'message': 'All fields are required'}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 409

    user = User(
        username=data['username'],
        password=generate_password_hash(data['password']),
        full_name=data['full_name'],
        role=data['role']
    )
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201

@users_bp.route('/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    data = request.get_json()
    if data.get('full_name'):
        user.full_name = data['full_name']
    if data.get('role'):
        user.role = data['role']
    if data.get('is_active') is not None:
        user.is_active = data['is_active']
    if data.get('password'):
        user.password = generate_password_hash(data['password'])

    db.session.commit()
    return jsonify(user.to_dict()), 200

@users_bp.route('/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    user.is_active = False
    db.session.commit()
    return jsonify({'message': 'User deactivated'}), 200
