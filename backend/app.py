from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

from config.database import init_db
db = init_db(app)

from routes.auth_routes import auth_bp
from routes.user_routes import users_bp
from routes.delivery_in_routes import delivery_in_bp
from routes.transfer_routes import transfer_bp
from routes.delivery_out_routes import delivery_out_bp
from routes.master_routes import master_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(delivery_in_bp, url_prefix='/api/delivery-in')
app.register_blueprint(transfer_bp, url_prefix='/api/transfers')
app.register_blueprint(delivery_out_bp, url_prefix='/api/delivery-out')
app.register_blueprint(master_bp, url_prefix='/api/master')

@app.route('/api/health', methods=['GET'])
def health_check():
    return {'status': 'healthy'}, 200

if __name__ == '__main__':
    with app.app_context():
        from models.models import User, ItemCategory, Supplier, Customer, Bin, StagingArea, DeliveryIn, DeliveryOut, Transfer
        db.create_all()

        if User.query.filter_by(username='admin').first() is None:
            from werkzeug.security import generate_password_hash
            admin = User(
                username='admin',
                password=generate_password_hash('admin123'),
                full_name='System Admin',
                role='admin'
            )
            db.session.add(admin)

            for i in range(1, 11):
                area = StagingArea(name=f'Staging Area {i}', area_number=i, capacity=100)
                db.session.add(area)

            default_categories = ['Electronics', 'Clothing', 'Food', 'Furniture', 'Raw Materials', 'Packaging']
            for cat_name in default_categories:
                cat = ItemCategory(name=cat_name)
                db.session.add(cat)

            db.session.commit()
            print('Default admin user and seed data created.')
        else:
            print('Database already seeded.')

    app.run(debug=True, port=5000)
