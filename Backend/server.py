from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error
import os
from datetime import datetime
from flask import jsonify
from datetime import timedelta
from flask_cors import CORS
import random
import hashlib
import jwt
from functools import wraps
import bcrypt

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['SECRET_KEY'] = 'x7k9p2m4q8v5n3j6h1t0r2y5u8w3z6b9'

# Allow specific origins
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:8081", "http://127.0.0.1:8081", "http://localhost:8080",  "http://127.0.0.1:8080","http://localhost:8082",  "http://127.0.0.1:8082", "http://localhost:8083",  "http://127.0.0.1:8083"],
        "methods": ["GET", "POST", "OPTIONS", "PUT"],  # Explicitly allow OPTIONS
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# MySQL database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'park_conservation',
    'port': 3306
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except Error as f:
        return(f"The error '{f}' occurred")


@app.route('/api/donate', methods=['POST'])
def donate():
    """Handles donation submissions."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.json
        required_fields = ['donationType', 'amount', 'parkName', 'firstName', 'lastName', 'email']
        
        # Validate all required fields
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        # Validate amount
        try:
            donation_amount = float(data['amount'])
            if donation_amount <= 0:
                return jsonify({"error": "Donation amount must be positive"}), 400
        except ValueError:
            return jsonify({"error": "Invalid donation amount"}), 400

        cursor = connection.cursor()
        cursor.execute('''
            INSERT INTO donations (
                donation_type, amount, park_name, 
                first_name, last_name, email, 
                message, is_anonymous
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ''', (
            data['donationType'],
            donation_amount,
            data['parkName'],
            data['firstName'],
            data['lastName'],
            data['email'],
            data.get('message', ''),
            False  # Adding the missing value for is_anonymous
        ))
        connection.commit()
        return jsonify({"message": "Donation recorded successfully"}), 201

    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Database operation failed"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        try:
            data = jwt.decode(token.split()[1], app.config['SECRET_KEY'], algorithms=["HS256"])
            kwargs['current_user_id'] = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except Exception as e:
            return jsonify({'error': f'Invalid token: {str(e)}'}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/api/login', methods=['POST'])
def login():
    connection = get_db_connection()
    if isinstance(connection, tuple):  # Check if connection failed
        return connection
    
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        cursor = connection.cursor(dictionary=True)
        
        # Check all user tables
        user_tables = [
            ('admintable', 'admin'),
            ('parkstaff', 'park-staff'),
            ('finance_officers', 'finance'),
            ('auditors', 'auditor'),
            ('government_officers', 'government')
        ]
        
        user = None
        user_role = None
        user_table = None
        
        for table, role in user_tables:
            cursor.execute(f"SELECT * FROM {table} WHERE email = %s", (email,))
            result = cursor.fetchone()
            if result:
                user = result
                user_role = role
                user_table = table
                break
        
        if not user or hashlib.sha256(password.encode()).hexdigest() != user['password_hash']:
            return jsonify({"error": "Invalid credentials"}), 401

        # Update last login
        cursor.execute(f"UPDATE {user_table} SET last_login = CURRENT_TIMESTAMP WHERE id = %s", (user['id'],))
        connection.commit()

        # Create JWT token
        token = jwt.encode({
            'user_id': str(user['id']),
            'email': user['email'],
            'role': user_role,
            'exp': int(datetime.utcnow().timestamp() + 86400)
        }, app.config['SECRET_KEY'], algorithm='HS256')

        # Prepare user response
        user_data = {
            "id": str(user['id']),
            "firstName": user['first_name'],
            "lastName": user['last_name'],
            "email": user['email'],
            "phone": user.get('phone', ''),
            "role": user_role,
            "park": user.get('park_name', ''),
            "avatarUrl": user.get('avatar_url', '')
        }

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": user_data,
            "dashboard": f"/{user_role.replace('-', '')}/dashboard"
        }), 200

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()



@app.route('/api/book-tour', methods=['POST'])
def book_tour():
    connection = get_db_connection()
    cursor = None
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        data = request.json
        required_fields = ['parkName', 'tourName', 'date', 'time', 'guests', 'amount', 'firstName', 'lastName', 'email']

        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        try:
            guests = int(data['guests'])
            amount = int(data['amount'])
        except (ValueError, TypeError):
            return jsonify({"error": "Guests and amount must be valid integers"}), 400

        if guests < 1 or guests > 20:
            return jsonify({"error": "Guests must be between 1 and 20"}), 400

        if amount != guests * 75:
            return jsonify({"error": "Invalid amount: must be $75 per guest"}), 400

        # Validate date and time formats
        try:
            datetime.strptime(data['date'], '%Y-%m-%d')
            datetime.strptime(data['time'], '%H:%M')
        except ValueError:
            return jsonify({"error": "Invalid date or time format"}), 400

        cursor = connection.cursor()
        cursor.execute('''
            INSERT INTO tours (
                park_name, tour_name, date, time, guests, amount,
                first_name, last_name, email, phone, special_requests
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ''', (
            data['parkName'],
            data['tourName'],
            data['date'],
            data['time'],
            guests,
            amount,
            data['firstName'],
            data['lastName'],
            data['email'],
            data.get('phone', ''),
            data.get('specialRequests', '')
        ))
        connection.commit()
        return jsonify({"message": "Tour booked successfully"}), 201

    except Error as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Database operation failed: {str(e)}"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection.is_connected():
            connection.close()


@app.route('/api/services', methods=['POST'])
def services():
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.form
        files = request.files

        required_fields = ['firstName', 'lastName', 'email', 'companyType', 'companyName', 'taxId']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        if 'companyRegistration' not in files:
            return jsonify({"error": "Company registration file is required"}), 400

        company_registration = files['companyRegistration'].read()
        application_letter = files['applicationLetter'].read() if 'applicationLetter' in files else None

        cursor = connection.cursor()
        cursor.execute('''
            INSERT INTO services (
                first_name, last_name, email, phone, company_type, 
                provided_service, company_name, tax_id, 
                company_registration, application_letter
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ''', (
            data['firstName'],
            data['lastName'],
            data['email'],
            data.get('phone', ''),
            data['companyType'],
            data.get('providedService', ''),
            data['companyName'],
            data['taxId'],
            company_registration,
            application_letter)
        )

        connection.commit()
        return jsonify({"message": "Service application submitted successfully"}), 201

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()



@app.route('/api/process_payment', methods=['POST'])
def process_payment():
    """Handle payment processing for donations and tour bookings."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.json
        required_fields = ['paymentType', 'amount', 'cardName', 'cardNumber', 
                         'expiryDate', 'cvv', 'parkName', 'customerEmail']
        
        # Validate all required fields
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required payment fields"}), 400

        # Validate amount
        try:
            payment_amount = float(data['amount'])
            if payment_amount <= 0:
                return jsonify({"error": "Payment amount must be positive"}), 400
        except ValueError:
            return jsonify({"error": "Invalid payment amount"}), 400

        # Generate a unique transaction ID
        timestamp = datetime.now().strftime('%y%m%d%H%M%S')
        random_num = str(random.randint(100, 999))
        transaction_id = f"TR-{timestamp}-{random_num}"
        
        # Process card details securely
        card_number = data['cardNumber'].replace(' ', '')
        last_four_digits = card_number[-4:] if len(card_number) >= 4 else "0000"
        status = "completed"
        
        # Format expiry date as MM/YYYY
        expiry_date = data['expiryDate']
        if '/' in expiry_date:
            month, year = expiry_date.split('/')
            if len(year) == 2:
                year = f"20{year}"
            expiry_date = f"{month}/{year}"
        
        cursor = connection.cursor()
        cursor.execute('''
            INSERT INTO payments (
                transaction_id, payment_type, amount, 
                card_name, card_number_last4, expiry_date, status,
                park_name, customer_email
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ''', (
            transaction_id,
            data['paymentType'],
            payment_amount,
            data['cardName'],
            last_four_digits,
            expiry_date,
            status,
            data['parkName'],
            data['customerEmail']
        ))
        connection.commit()
        
        return jsonify({
            "message": "Payment processed successfully",
            "transactionId": transaction_id,
            "status": "completed",
            "date": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }), 201

    except Exception as e:
        print(f"Payment processing error: {e}")
        return jsonify({"error": "Payment processing failed"}), 500



@app.route('/api/park-staff', methods=['GET'])
def get_park_staff():
    """Retrieve all park staff members."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                id, 
                first_name, 
                last_name, 
                CONCAT(first_name, ' ', last_name) as name,
                email, 
                park_name as park,
                role,
                last_login
            FROM parkstaff
        """)
        staff = cursor.fetchall()
        
        # Format dates for frontend
        for member in staff:
            if member['last_login']:
                member['last_login'] = member['last_login'].strftime('%Y-%m-%d')
            else:
                member['last_login'] = 'Never'
        
        return jsonify(staff), 200

    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve park staff"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


# In server.py, update the add_park_staff endpoint
@app.route('/api/park-staff', methods=['POST'])
def add_park_staff():
    """Add a new park staff member."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.json
        required_fields = ['firstName', 'lastName', 'email', 'park', 'password']  # Added password
        
        # Validate all required fields
        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            return jsonify({
                "error": "Missing required fields", 
                "missing": missing_fields
            }), 400

        # Check if email already exists
        cursor = connection.cursor()
        cursor.execute("SELECT id FROM parkstaff WHERE email = %s", (data['email'],))
        existing_user = cursor.fetchone()
        
        if existing_user:
            return jsonify({"error": "Email already exists"}), 409

        # Hash the password
        password_hash = hashlib.sha256(data['password'].encode()).hexdigest()

        # Insert new staff member with password
        cursor.execute('''
            INSERT INTO parkstaff (
                first_name, last_name, email, password_hash, park_name, role
            ) VALUES (%s, %s, %s, %s, %s, %s)
        ''', (
            data['firstName'],
            data['lastName'],
            data['email'],
            password_hash,
            data['park'],
            'park-staff'  # Default role
        ))
        connection.commit()
        
        new_staff_id = cursor.lastrowid
        
        return jsonify({
            "message": "Park staff added successfully",
            "id": new_staff_id
        }), 201

    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Failed to add park staff: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()





# Optional: Add endpoint to update password separately
@app.route('/api/park-staff/password/<int:staff_id>', methods=['PUT'])
@token_required
def update_park_staff_password(staff_id, current_user_id):
    """Update park staff password."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.json
        if 'password' not in data:
            return jsonify({"error": "Password is required"}), 400

        cursor = connection.cursor()
        
        # Check if staff exists
        cursor.execute("SELECT id FROM parkstaff WHERE id = %s", (staff_id,))
        existing_staff = cursor.fetchone()
        
        if not existing_staff:
            return jsonify({"error": "Staff member not found"}), 404
        
        # Hash the new password
        password_hash = hashlib.sha256(data['password'].encode()).hexdigest()
        
        # Update password
        cursor.execute(
            "UPDATE parkstaff SET password_hash = %s WHERE id = %s",
            (password_hash, staff_id)
        )
        connection.commit()
        
        return jsonify({
            "message": "Password updated successfully"
        }), 200

    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Failed to update password: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


@app.route('/api/park-staff/<int:staff_id>', methods=['PUT'])
def update_park_staff(staff_id):
    """Update an existing park staff member."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.json
        required_fields = ['firstName', 'lastName', 'email', 'park']
        
        # Validate all required fields
        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            return jsonify({
                "error": "Missing required fields", 
                "missing": missing_fields
            }), 400

        # Check if staff exists
        cursor = connection.cursor()
        cursor.execute("SELECT id FROM parkstaff WHERE id = %s", (staff_id,))
        existing_staff = cursor.fetchone()
        
        if not existing_staff:
            return jsonify({"error": "Staff member not found"}), 404
        
        # Check if email exists for another user
        cursor.execute("SELECT id FROM parkstaff WHERE email = %s AND id != %s", 
                      (data['email'], staff_id))
        email_exists = cursor.fetchone()
        
        if email_exists:
            return jsonify({"error": "Email already in use by another staff member"}), 409

        # Update staff member
        cursor.execute('''
            UPDATE parkstaff SET
                first_name = %s,
                last_name = %s,
                email = %s,
                park_name = %s
            WHERE id = %s
        ''', (
            data['firstName'],
            data['lastName'],
            data['email'],
            data['park'],
            staff_id
        ))
        connection.commit()
        
        return jsonify({
            "message": "Park staff updated successfully",
            "id": staff_id
        }), 200

    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Failed to update park staff: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


@app.route('/api/park-staff/<int:staff_id>', methods=['DELETE'])
def delete_parkstaff(staff_id):
    """Delete a park staff member."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor()
        
        # Check if staff exists
        cursor.execute("SELECT id FROM parkstaff WHERE id = %s", (staff_id,))
        existing_staff = cursor.fetchone()
        
        if not existing_staff:
            return jsonify({"error": "Staff member not found"}), 404
        
        # Delete staff member
        cursor.execute("DELETE FROM parkstaff WHERE id = %s", (staff_id,))
        connection.commit()
        
        return jsonify({
            "message": "Park staff deleted successfully"
        }), 200

    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Failed to delete park staff: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


@app.route('/api/park-staff/update-login/<int:staff_id>', methods=['PUT'])
def update_login_time(staff_id):
    """Update the last login time for a park staff member."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor()
        
        # Check if staff exists
        cursor.execute("SELECT id FROM parkstaff WHERE id = %s", (staff_id,))
        existing_staff = cursor.fetchone()
        
        if not existing_staff:
            return jsonify({"error": "Staff member not found"}), 404
        
        # Update last login time
        cursor.execute(
            "UPDATE parkstaff SET last_login = CURRENT_TIMESTAMP WHERE id = %s", 
            (staff_id,)
        )
        connection.commit()
        
        return jsonify({
            "message": "Last login time updated successfully"
        }), 200

    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Failed to update login time: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()



@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    connection = get_db_connection()
    if isinstance(connection, tuple):  # Check if connection failed
        return connection
    
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM admintable WHERE email = %s", (email,))
        admin = cursor.fetchone()
        print(f"Found admin: {admin}")
        
        if not admin or hashlib.sha256(password.encode()).hexdigest() != admin['password_hash']:
            print(f"Password hash attempted: {hashlib.sha256(password.encode()).hexdigest()}")
            print(f"Stored hash: {admin['password_hash'] if admin else 'No user'}")
            return jsonify({"error": "Invalid credentials"}), 401

        # Update last login
        cursor.execute("UPDATE admintable SET last_login = CURRENT_TIMESTAMP WHERE id = %s", (admin['id'],))
        connection.commit()

        # Create JWT token with explicit types
        token = jwt.encode({
            'user_id': str(admin['id']),
            'email': admin['email'],
            'role': admin['role'],
            'exp': int(datetime.utcnow().timestamp() + 86400)  # 24 hours (86400 seconds)
        }, app.config['SECRET_KEY'], algorithm='HS256')  # Explicitly specify algorithm

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {
                "id": str(admin['id']),
                "firstName": admin['first_name'],
                "lastName": admin['last_name'],
                "email": admin['email'],
                "phone": admin['phone'],
                "role": admin['role'],
                "park": admin['park_name'],
                "avatarUrl": admin['avatar_url']
            }
        }), 200

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/admin/profile', methods=['PUT'])
@token_required
def update_admin_profile(current_user_id):
    connection = get_db_connection()
    if isinstance(connection, tuple):
        return connection
    
    try:
        data = request.json
        required_fields = ['firstName', 'lastName', 'email', 'phone']
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        cursor = connection.cursor()
        cursor.execute('''
            UPDATE admintable SET
                first_name = %s,
                last_name = %s,
                email = %s,
                phone = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', (
            data['firstName'],
            data['lastName'],
            data['email'],
            data['phone'],
            current_user_id
        ))
        connection.commit()

        return jsonify({"message": "Profile updated successfully"}), 200

    except Exception as e:
        print(f"Profile update error: {e}")
        return jsonify({"error": "Failed to update profile"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/admin/avatar', methods=['POST'])
@token_required
def update_admin_avatar(current_user_id):
    connection = get_db_connection()
    if isinstance(connection, tuple):
        return connection
    
    try:
        if 'avatar' not in request.files:
            return jsonify({"error": "No avatar file provided"}), 400

        avatar = request.files['avatar']
        if avatar.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Save the file
        filename = f"avatar_{current_user_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.jpg"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        avatar.save(filepath)

        cursor = connection.cursor()
        cursor.execute(
            "UPDATE admintable SET avatar_url = %s WHERE id = %s",
            (f"/uploads/{filename}", current_user_id)
        )
        connection.commit()

        return jsonify({
            "message": "Avatar updated successfully",
            "avatarUrl": f"/uploads/{filename}"
        }), 200

    except Exception as e:
        print(f"Avatar update error: {e}")
        return jsonify({"error": "Failed to update avatar"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/admin/account', methods=['DELETE'])
@token_required
def delete_admin_account(current_user_id):
    connection = get_db_connection()
    if isinstance(connection, dict):
        return connection, 500
    
    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM admintable WHERE id = %s", (current_user_id,))
        connection.commit()
        return jsonify({"message": "Account deleted successfully"}), 200
    except Exception as e:
        print(f"Account deletion error: {e}")
        return jsonify({"error": "Failed to delete account"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


@app.route('/api/admin/password', methods=['PUT'])
@token_required
def update_admin_password(current_user_id):
    connection = get_db_connection()
    if isinstance(connection, tuple):
        return connection
    
    try:
        data = request.json
        current_password = data.get('currentPassword')
        new_password = data.get('newPassword')
        confirm_password = data.get('confirmPassword')

        if not all([current_password, new_password, confirm_password]):
            return jsonify({"error": "All password fields are required"}), 400

        if new_password != confirm_password:
            return jsonify({"error": "New passwords don't match"}), 400

        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT password_hash FROM admintable WHERE id = %s", (current_user_id,))
        admin = cursor.fetchone()

        if hashlib.sha256(current_password.encode()).hexdigest() != admin['password_hash']:
            return jsonify({"error": "Current password is incorrect"}), 401

        new_password_hash = hashlib.sha256(new_password.encode()).hexdigest()
        cursor.execute(
            "UPDATE admintable SET password_hash = %s WHERE id = %s",
            (new_password_hash, current_user_id)
        )
        connection.commit()

        return jsonify({"message": "Password updated successfully"}), 200

    except Exception as e:
        print(f"Password update error: {e}")
        return jsonify({"error": "Failed to update password"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


@app.route('/api/admin/tour-bookings', methods=['GET'])
@token_required
def get_tour_bookings(current_user_id):
    connection = get_db_connection()
    if isinstance(connection, dict):
        return connection, 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT DATE_FORMAT(created_at, '%b') as month, SUM(id) as bookings "
            "FROM tours GROUP BY YEAR(created_at), MONTH(date) "
            "ORDER BY id"
        )
        bookings = cursor.fetchall()
        return jsonify({"tour_bookings": bookings}), 200
    except Exception as e:
        print(f"Error fetching tour bookings: {e}")
        return jsonify({"error": "Failed to fetch tour bookings"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/admin/donations', methods=['GET'])
@token_required
def get_donations(current_user_id):
    connection = get_db_connection()
    if isinstance(connection, dict):
        return connection, 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT DATE_FORMAT(created_at, '%b') as month, SUM(amount) as amount "
            "FROM donations GROUP BY YEAR(created_at), MONTH(created_at) "
            "ORDER BY id"
        )
        donations = cursor.fetchall()
        return jsonify({"donations": donations}), 200
    except Exception as e:
        print(f"Error fetching donations: {e}")
        return jsonify({"error": "Failed to fetch donations"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/admin/recent-logins', methods=['GET'])
@token_required
def get_recent_logins(current_user_id):
    connection = get_db_connection()
    if isinstance(connection, dict):
        return connection, 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT email, role, login_time as last_login "
            "FROM login_logs ORDER BY login_time DESC LIMIT 5"
        )
        logins = cursor.fetchall()
        return jsonify({"recent_logins": logins}), 200
    except Exception as e:
        print(f"Error fetching logins: {e}")
        return jsonify({"error": "Failed to fetch recent logins"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/admin/login-metrics', methods=['GET'])
@token_required
def get_login_metrics(current_user_id):
    connection = get_db_connection()
    if isinstance(connection, dict):
        return connection, 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT DATE_FORMAT(login_time, '%b') as month, COUNT(*) as logins "
            "FROM login_logs GROUP BY YEAR(login_time), MONTH(login_time) "
            "ORDER BY login_time"
        )
        metrics = cursor.fetchall()
        return jsonify({"login_metrics": metrics}), 200
    except Exception as e:
        print(f"Error fetching login metrics: {e}")
        return jsonify({"error": "Failed to fetch login metrics"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/admin/stats', methods=['GET'])
@token_required
def get_dashboard_stats(current_user_id):
    connection = get_db_connection()
    if isinstance(connection, dict):
        return connection, 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("SELECT COUNT(*) as total_bookings FROM tours")
        total_bookings = cursor.fetchone()['total_bookings']
        
        cursor.execute("SELECT SUM(amount) as total_donations FROM donations")
        total_donations = cursor.fetchone()['total_donations'] or 0
        
        cursor.execute("SELECT COUNT(*) as total_logins FROM admintable")
        total_logins = cursor.fetchone()['total_logins']
        
        cursor.execute("SELECT COUNT(*) as active_admins FROM parkstaff")
        active_admins = cursor.fetchone()['active_admins']

        stats = [
            {"title": "Total Tours Booked", "value": total_bookings, "icon": "Calendar", "trend": "up"},
            {"title": "Total Donations", "value": total_donations, "icon": "Cash", "trend": "up"},
            {"title": "Total Admins", "value": total_logins, "icon": "LogIn", "trend": "up"},
            {"title": "Recorded Park stuffs", "value": active_admins, "icon": "Users", "trend": "up"},
        ]
        return jsonify({"stats": stats}), 200
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return jsonify({"error": "Failed to fetch stats"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()    


@app.route('/api/fund-requests', methods=['POST'])
@token_required
def create_fund_request(current_user_id):
    """Create a new fund request."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.json
        required_fields = ['title', 'description', 'amount', 'category', 'urgency', 'parkname']  # Adjusted parkName to parkname
        
        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            return jsonify({"error": "Missing required fields", "missing": missing_fields}), 400

        # Validate amount
        try:
            amount = float(data['amount'])
            if amount <= 0:
                return jsonify({"error": "Amount must be positive"}), 400
        except ValueError:
            return jsonify({"error": "Invalid amount"}), 400

        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO fund_requests (
                title, description, amount, category, parkname, urgency, status, created_by
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data['title'],
            data['description'],
            amount,
            data['category'],
            data['parkname'],  # Use parkname consistently
            data['urgency'],
            'pending',
            current_user_id
        ))
        connection.commit()
        
        new_request_id = cursor.lastrowid
        
        return jsonify({
            "message": "Fund request created successfully",
            "id": new_request_id
        }), 201

    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Failed to create fund request: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()




@app.route('/api/fund-requests', methods=['GET'])
@token_required
def get_fund_requests(current_user_id):
    """Retrieve all fund requests for the user's park."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                id, title, description, amount, category, parkname, urgency, status,
                created_at
            FROM fund_requests
            WHERE created_by = %s
        """, (current_user_id,))
        requests = cursor.fetchall()
        
        # Format dates for frontend
        for req in requests:
            req['createdAt'] = req['created_at'].strftime('%Y-%m-%d')
            del req['created_at']  # Remove raw timestamp
        
        return jsonify(requests), 200

    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve fund requests"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()





@app.route('/api/fund-requests/<int:request_id>', methods=['PUT'])
@token_required
def update_fund_request(request_id, current_user_id):
    """Update an existing fund request."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.json
        required_fields = ['title', 'description', 'amount', 'category', 'urgency', 'parkname']  # Adjusted parkName to parkname
        
        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            return jsonify({"error": "Missing required fields", "missing": missing_fields}), 400

        cursor = connection.cursor()
        cursor.execute("SELECT id FROM fund_requests WHERE id = %s AND created_by = %s", 
                       (request_id, current_user_id))
        if not cursor.fetchone():
            return jsonify({"error": "Fund request not found or unauthorized"}), 404

        cursor.execute("""
            UPDATE fund_requests SET
                title = %s, description = %s, amount = %s, category = %s, parkname = %s,
                urgency = %s
            WHERE id = %s
        """, (
            data['title'], data['description'], float(data['amount']),
            data['category'], data['parkname'], data['urgency'], request_id
        ))
        connection.commit()
        
        return jsonify({"message": "Fund request updated successfully"}), 200

    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Failed to update fund request: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()




@app.route('/api/fund-requests/<int:request_id>', methods=['DELETE'])
@token_required
def delete_fund_request(request_id, current_user_id):
    """Delete a fund request."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT id FROM fund_requests WHERE id = %s AND created_by = %s", 
                       (request_id, current_user_id))
        if not cursor.fetchone():
            return jsonify({"error": "Fund request not found or unauthorized"}), 404

        cursor.execute("DELETE FROM fund_requests WHERE id = %s", (request_id,))
        connection.commit()
        
        return jsonify({"message": "Fund request deleted successfully"}), 200

    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Failed to delete fund request: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


@app.route('/api/park-staff/fund-request-stats', methods=['GET'])
@token_required
def get_fund_request_stats(current_user_id):
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    parkname = request.args.get('parkname')
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                COUNT(*) as total
            FROM fund_requests
            WHERE created_by = %s AND parkname = %s
        """, (current_user_id, parkname))
        stats = cursor.fetchone()
        return jsonify({
            "stats": [
                {"title": "All Park Staff Requests", "value": stats['total'] or 0, "icon": "FileText"},
                {"title": "Pending Requests", "value": stats['pending'] or 0, "icon": "Clock"},
                {"title": "Approved Requests", "value": stats['approved'] or 0, "icon": "CheckCircle"},
                {"title": "Rejected Requests", "value": stats['rejected'] or 0, "icon": "XCircle"}
            ]
        }), 200
    except Exception as e:
        print(f"Error fetching fund request stats: {e}")
        return jsonify({"error": "Failed to fetch fund request stats"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Add these new endpoints after the existing ones in server.py

@app.route('/api/finance/tours', methods=['GET'])
@token_required
def get_all_tours(current_user_id):
    """Retrieve all booked tours for finance officer"""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                id, park_name, tour_name, date, time, guests, amount,
                first_name, last_name, email, phone, special_requests,
                created_at
            FROM tours
            ORDER BY created_at DESC
        """)
        tours = cursor.fetchall()
        
        for tour in tours:
            # Format dates and times
            tour['created_at'] = tour['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            tour['date'] = tour['date'].strftime('%Y-%m-%d')
            tour['time'] = str(tour['time'])  # TIME field is already in HH:MM:SS format
            tour['amount'] = float(tour['amount'])  # Ensure amount is numeric for frontend
            
        return jsonify(tours), 200
        
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Failed to retrieve tours: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()




@app.route('/api/finance/donations', methods=['GET'])
@token_required
def get_all_donations(current_user_id):
    """Retrieve all donations for finance officer"""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                id, donation_type, amount, park_name,
                first_name, last_name, email, message,
                is_anonymous, created_at
            FROM donations
            ORDER BY created_at DESC
        """)
        donations = cursor.fetchall()
        
        for donation in donations:
            donation['created_at'] = donation['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            
        return jsonify(donations), 200
        
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve donations"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/finance/services', methods=['GET'])
@token_required
def get_all_services(current_user_id):
    """Retrieve all service applications"""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                id, first_name, last_name, email, phone,
                company_type, provided_service, company_name,
                tax_id, created_at,
                status IS NULL as 'pending',
                status
            FROM services
            ORDER BY created_at DESC
        """)
        services = cursor.fetchall()
        
        for service in services:
            service['created_at'] = service['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            
        return jsonify(services), 200
        
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve services"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/finance/services/<int:service_id>/status', methods=['PUT'])
@token_required
def update_service_status(current_user_id, service_id):
    """Approve or deny service application"""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.json
        status = data.get('status')  # 'approved' or 'denied'
        
        if status not in ['approved', 'denied']:
            return jsonify({"error": "Invalid status"}), 400
            
        cursor = connection.cursor()
        cursor.execute("""
            ALTER TABLE services ADD COLUMN IF NOT EXISTS status ENUM('approved', 'denied') DEFAULT NULL
        """)
        cursor.execute("""
            UPDATE services 
            SET status = %s
            WHERE id = %s
        """, (status, service_id))
        connection.commit()
        
        return jsonify({"message": f"Service {status} successfully"}), 200
        
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Failed to update service status: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/finance/fund-requests', methods=['GET'])
@token_required
def get_all_fund_requests(current_user_id):
    """Retrieve all fund requests with park staff details"""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                fr.id, fr.title, fr.description, fr.amount,
                fr.category, fr.parkname, fr.urgency, fr.status,
                fr.created_at, fr.created_by,
                ps.first_name, ps.last_name, ps.email as staff_email,
                ps.park_name as staff_park
            FROM fund_requests fr
            JOIN parkstaff ps ON fr.created_by = ps.id
            ORDER BY fr.created_at DESC
        """)
        requests = cursor.fetchall()
        
        for req in requests:
            req['created_at'] = req['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            
        return jsonify(requests), 200
        
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve fund requests"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


@app.route('/api/finance/fund-requests/<int:request_id>/status', methods=['PUT'])
@token_required
def update_fund_request_status(current_user_id, request_id):
    """Approve or deny fund request"""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.json
        status = data.get('status')  # 'approved' or 'rejected'
        
        if status not in ['approved', 'rejected']:
            return jsonify({"error": "Invalid status"}), 400
            
        cursor = connection.cursor()
        cursor.execute("""
            UPDATE fund_requests 
            SET status = %s
            WHERE id = %s
        """, (status, request_id))
        connection.commit()
        
        return jsonify({"message": f"Fund request {status} successfully"}), 200
        
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Failed to update fund request status: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()





@app.route('/api/government/emergency-requests', methods=['GET'])
@token_required
def get_all_emergency_requests(current_user_id):
    """Retrieve all emergency fund requests for government officers."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                er.id, er.title, er.description, er.amount, er.park_name AS parkName,
                er.emergency_type AS emergencyType, er.justification, er.timeframe,
                er.status, er.created_at, er.created_by,
                fo.first_name, fo.last_name, fo.email AS finance_email
            FROM emergency_requests er
            JOIN finance_officers fo ON er.created_by = fo.id
            ORDER BY er.created_at DESC
        """)
        requests = cursor.fetchall()
        
        for req in requests:
            req['amount'] = float(req['amount'])  # Convert Decimal to float
            req['submittedDate'] = req['created_at'].strftime('%Y-%m-%d') if req['created_at'] else None
            req['id'] = str(req['id'])
            req['requestedBy'] = f"{req['first_name']} {req['last_name']}"
            del req['created_at']
            del req['first_name']
            del req['last_name']
            del req['finance_email']
        
        return jsonify(requests), 200

    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve emergency requests"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/government/extra-funds', methods=['GET'])
@token_required
def get_all_extra_funds_requests(current_user_id):
    """Retrieve all extra funds requests for government officers."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                efr.id, efr.title, efr.description, efr.amount, efr.park_name AS parkName,
                efr.category, efr.justification, efr.expected_duration AS expectedDuration,
                efr.status, efr.created_at, efr.created_by,
                fo.first_name, fo.last_name, fo.email AS finance_email
            FROM extra_funds_requests efr
            JOIN finance_officers fo ON efr.created_by = fo.id
            ORDER BY efr.created_at DESC
        """)
        requests = cursor.fetchall()
        
        for req in requests:
            req['amount'] = float(req['amount'])
            req['dateSubmitted'] = req['created_at'].strftime('%Y-%m-%d') if req['created_at'] else None
            req['id'] = str(req['id'])
            req['requestedBy'] = f"{req['first_name']} {req['last_name']}"
            del req['created_at']
            del req['first_name']
            del req['last_name']
            del req['finance_email']
        
        return jsonify(requests), 200

    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve extra funds requests"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/government/emergency-requests/<int:request_id>/status', methods=['PUT'])
@token_required
def update_emergency_request_status(current_user_id, request_id):
    """Approve or reject an emergency fund request."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.json
        status = data.get('status')
        reason = data.get('reason')
        
        if status not in ['approved', 'rejected']:
            return jsonify({"error": "Invalid status"}), 400
        if not reason or len(reason) < 10:
            return jsonify({"error": "Reason must be at least 10 characters"}), 400
            
        cursor = connection.cursor()
        cursor.execute("""
            UPDATE emergency_requests 
            SET status = %s, reviewed_by = %s, reviewed_date = CURRENT_TIMESTAMP, reason = %s
            WHERE id = %s
        """, (status, current_user_id, reason, request_id))
        
        if cursor.rowcount == 0:
            return jsonify({"error": "Request not found"}), 404
            
        connection.commit()
        
        return jsonify({"message": f"Emergency request {status} successfully"}), 200
        
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Failed to update emergency request status: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/government/extra-funds/<int:request_id>/status', methods=['PUT'])
@token_required
def update_extra_funds_request_status(current_user_id, request_id):
    """Approve or reject an extra funds request."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.json
        status = data.get('status')
        reason = data.get('reason')
        
        if status not in ['approved', 'rejected']:
            return jsonify({"error": "Invalid status"}), 400
        if not reason or len(reason) < 10:
            return jsonify({"error": "Reason must be at least 10 characters"}), 400
            
        cursor = connection.cursor()
        cursor.execute("""
            UPDATE extra_funds_requests 
            SET status = %s, reviewed_by = %s, reviewed_date = CURRENT_TIMESTAMP, reason = %s
            WHERE id = %s
        """, (status, current_user_id, reason, request_id))
        
        if cursor.rowcount == 0:
            return jsonify({"error": "Request not found"}), 404
            
        connection.commit()
        
        return jsonify({"message": f"Extra funds request {status} successfully"}), 200
        
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Failed to update extra funds request status: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()



# if __name__ == '__main__':
#     if not os.path.exists(app.config['UPLOAD_FOLDER']):
#         os.makedirs(app.config['UPLOAD_FOLDER'])
#     app.run(debug=True, port=5000)

if __name__ == '__main__':
    if os.getenv('FLASK_ENV') == 'production':
    # Use Gunicorn or similar in production
        pass
    else:
        app.run(debug=True, port=5000)