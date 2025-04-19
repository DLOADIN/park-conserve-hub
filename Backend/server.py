from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error
import os
from datetime import datetime, timedelta, date, time
from flask import jsonify
from flask_cors import CORS
import random
import hashlib
import jwt
from functools import wraps
import bcrypt
import os
import re
from dotenv import load_dotenv


app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'

load_dotenv()
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'x7k9p2m4q8v5n3j6h1t0r2y5u8w3z6b9')


# Allow specific origins
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:8081", "http://127.0.0.1:8081", "http://localhost:8080",  "http://127.0.0.1:8080","http://localhost:8082",  "http://127.0.0.1:8082", "http://localhost:8083",  "http://127.0.0.1:8083", "http://localhost:5000", "http://127.0.0.1:5000"],
        "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],  # Added DELETE to allowed methods
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


def generate_salt():
    return os.urandom(16).hex()

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
            print("Token missing")
            return jsonify({'error': 'Token is missing'}), 401
        try:
            data = jwt.decode(token.split()[1], app.config['SECRET_KEY'], algorithms=["HS256"])
            print(f"Token valid for user_id: {data['user_id']}")
            kwargs['current_user_id'] = data['user_id']
        except jwt.ExpiredSignatureError:
            print("Token expired")
            return jsonify({'error': 'Token has expired'}), 401
        except Exception as e:
            print(f"Token error: {str(e)}")
            return jsonify({'error': f'Invalid token: {str(e)}'}), 401
        return f(*args, **kwargs)
    return decorated






def hash_password(password, salt):
    return hashlib.sha256((password + salt).encode()).hexdigest()



@app.route('/api/login', methods=['POST'])
def login():
    connection = get_db_connection()
    if isinstance(connection, tuple):  # Check if connection failed
        return jsonify({"error": "Database connection failed"}), 500
    
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
        
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401

        # Check password: try SHA-256 first, then bcrypt as fallback
        sha256_hash = hashlib.sha256(password.encode()).hexdigest()
        password_match = sha256_hash == user['password_hash']
        
        if not password_match:
            try:
                # Attempt bcrypt check for legacy passwords
                password_match = bcrypt.checkpw(password.encode(), user['password_hash'].encode())
                if password_match:
                    # Rehash to SHA-256 and update database
                    cursor.execute(
                        f"UPDATE {user_table} SET password_hash = %s WHERE id = %s",
                        (sha256_hash, user['id'])
                    )
                    connection.commit()
            except ValueError:
                # Invalid bcrypt hash (e.g., not bcrypt format)
                return jsonify({"error": "Invalid credentials"}), 401

        if not password_match:
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
        required_fields = ['parkName', 'tourName', 'date', 'time', 'guests', 'amount']

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
                first_name, last_name, email, special_requests
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
            application_letter
        ))

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
                         'expiryDate', 'cvv', 'customerEmail']
        
        # Validate all required fields
        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            return jsonify({
                "error": "Missing required payment fields",
                "missing": missing_fields
            }), 400

        # Validate amount
        try:
            payment_amount = float(data['amount'])
            if payment_amount <= 0:
                return jsonify({"error": "Payment amount must be positive"}), 400
        except ValueError:
            return jsonify({"error": "Invalid payment amount"}), 400

        cursor = connection.cursor()

        # First, ensure the necessary columns exist
        try:
            # Add status column to donations if it doesn't exist
            cursor.execute("""
                ALTER TABLE donations 
                ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
                ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(50)
            """)
            
            # Add status column to tours if it doesn't exist
            cursor.execute("""
                ALTER TABLE tours 
                ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
                ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(50)
            """)
            
            connection.commit()
        except Exception as e:
            print(f"Table alteration error: {e}")
            # Continue even if alteration fails (columns might already exist)
            pass

        # Generate a unique transaction ID
        timestamp = datetime.now().strftime('%y%m%d%H%M%S')
        random_num = str(random.randint(100, 999))
        transaction_id = f"TR-{timestamp}-{random_num}"
        
        # Process card details securely
        card_number = data['cardNumber'].replace(' ', '')
        last_four_digits = card_number[-4:] if len(card_number) >= 4 else "0000"
        
        # Insert payment record
        cursor.execute('''
            INSERT INTO payments (
                transaction_id, payment_type, amount, 
                card_name, card_number_last4, expiry_date, 
                status, park_name, customer_email
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ''', (
            transaction_id,
            data['paymentType'],
            payment_amount,
            data['cardName'],
            last_four_digits,
            data['expiryDate'],
            'completed',
            data.get('parkName', ''),
            data['customerEmail']
        ))
        
        # Update the corresponding record based on payment type
        if data['paymentType'] == 'donation':
            cursor.execute('''
                UPDATE donations 
                SET status = %s, 
                    transaction_id = %s 
                WHERE email = %s 
                AND amount = %s 
                AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
                ORDER BY created_at DESC 
                LIMIT 1
            ''', ('completed', transaction_id, data['customerEmail'], payment_amount))
            
            if cursor.rowcount == 0:
                raise Exception("No matching donation record found")
                
        elif data['paymentType'] == 'tour':
            cursor.execute('''
                UPDATE tours 
                SET status = %s, 
                    transaction_id = %s 
                WHERE email = %s 
                AND amount = %s 
                AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
                ORDER BY created_at DESC 
                LIMIT 1
            ''', ('completed', transaction_id, data['customerEmail'], payment_amount))
            
            if cursor.rowcount == 0:
                raise Exception("No matching tour record found")
        
        connection.commit()
        
        return jsonify({
            "message": "Payment processed successfully",
            "transactionId": transaction_id,
            "status": "completed",
            "date": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }), 201

    except Exception as e:
        print(f"Payment processing error: {e}")
        connection.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()









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
        required_fields = ['firstName', 'lastName', 'email']
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        cursor = connection.cursor()
        cursor.execute('''
            UPDATE admintable SET
                first_name = %s,
                last_name = %s,
                email = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', (
            data['firstName'],
            data['lastName'],
            data['email'],
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
def get_admin_donations(current_user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
        SELECT d.*, p.transaction_id, p.status as payment_status
        FROM donations d
        LEFT JOIN payments p ON p.customer_email = d.email 
            AND p.park_name = d.park_name 
            AND p.payment_type = 'donation'
        ORDER BY d.created_at DESC
        """
        
        cursor.execute(query)
        donations = cursor.fetchall()
        
        # Format dates
        for donation in donations:
            donation['created_at'] = donation['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            donation['amount'] = float(donation['amount'])
        
        cursor.close()
        conn.close()
        
        return jsonify(donations)
    except Exception as e:
        print(f"Database error: {str(e)}")
        return jsonify({"error": "Failed to fetch donations"}), 500

@app.route('/api/admin/services', methods=['GET'])
@token_required
def get_admin_services(current_user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
        SELECT id, first_name, last_name, email, phone, 
               company_type, provided_service, company_name,
               created_at, status, tax_id
        FROM services
        ORDER BY created_at DESC
        """
        
        cursor.execute(query)
        services = cursor.fetchall()
        
        # Format dates
        for service in services:
            service['created_at'] = service['created_at'].strftime('%Y-%m-%d %H:%M:%S')
        
        cursor.close()
        conn.close()
        
        return jsonify(services)
    except Exception as e:
        print(f"Database error: {str(e)}")
        return jsonify({"error": "Failed to fetch services"}), 500

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
        required_fields = ['title', 'description', 'amount', 'category', 'urgency']
        
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

        # Get user's park_name
        cursor = connection.cursor()
        cursor.execute("SELECT park_name FROM parkstaff WHERE id = %s", (current_user_id,))
        user = cursor.fetchone()
        if not user or not user[0]:
            return jsonify({"error": "User or park not found"}), 404
        
        park_name = user[0]
        
        cursor.execute("""
            INSERT INTO fund_requests (
                title, description, amount, category, parkname, urgency, status, created_by
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data['title'],
            data['description'],
            amount,
            data['category'],
            park_name,  # Use park_name from user
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
    """Retrieve fund requests for the staff member's park."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # First get the staff member's park
        cursor.execute("""
            SELECT park_name 
            FROM parkstaff 
            WHERE id = %s
        """, (current_user_id,))
        staff_result = cursor.fetchone()
        
        if not staff_result:
            return jsonify({"error": "Staff member not found"}), 404
            
        staff_park = staff_result['park_name']
        
        # Get fund requests for the staff's park
        cursor.execute("""
            SELECT 
                fr.*, 
                ps.first_name,
                ps.last_name,
                ps.email as staff_email,
                ps.park_name as staff_park
            FROM fund_requests fr
            LEFT JOIN parkstaff ps ON fr.created_by = ps.id
            WHERE fr.parkname = %s
            ORDER BY fr.created_at DESC
        """, (staff_park,))
        
        requests = cursor.fetchall()
        
        # Format dates and amounts
        for request in requests:
            if request['created_at']:
                request['created_at'] = request['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            if request['amount']:
                request['amount'] = float(request['amount'])
        
        return jsonify(requests), 200
        
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve fund requests"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/finance/fund-requests', methods=['GET'])
@token_required
def get_all_fund_requests(current_user_id):
    """Retrieve all fund requests for finance officer, filtered by their park."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT park_name FROM finance_officers WHERE id = %s", (current_user_id,))
        officer = cursor.fetchone()
        if not officer or not officer['park_name']:
            return jsonify({"error": "Finance officer or park not found"}), 404
        
        park_name = officer['park_name']
        
        cursor.execute("""
            SELECT 
                fr.id, fr.title, fr.description, fr.amount, fr.category,
                fr.parkname, fr.urgency, fr.status, fr.created_at,
                fr.created_by, ps.first_name, ps.last_name, ps.email AS staff_email,
                ps.park_name AS staff_park
            FROM fund_requests fr
            JOIN parkstaff ps ON fr.created_by = ps.id
            WHERE fr.parkname = %s
            ORDER BY fr.created_at DESC
        """, (park_name,))
        requests = cursor.fetchall()
        
        for req in requests:
            req['created_at'] = req['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            req['amount'] = float(req['amount'])
            
        return jsonify(requests), 200
        
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Failed to retrieve fund requests: {str(e)}"}), 500
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
        required_fields = ['title', 'description', 'amount', 'category', 'urgency']
        
        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            return jsonify({"error": "Missing required fields", "missing": missing_fields}), 400

        # Get user's park_name
        cursor = connection.cursor()
        cursor.execute("SELECT park_name FROM parkstaff WHERE id = %s", (current_user_id,))
        user = cursor.fetchone()
        if not user or not user[0]:
            return jsonify({"error": "User or park not found"}), 404
        
        park_name = user[0]
        
        # Verify the request exists and belongs to the user's park
        cursor.execute("SELECT id FROM fund_requests WHERE id = %s AND parkname = %s", 
                       (request_id, park_name))
        if not cursor.fetchone():
            return jsonify({"error": "Fund request not found or unauthorized"}), 404

        cursor.execute("""
            UPDATE fund_requests SET
                title = %s, description = %s, amount = %s, category = %s, parkname = %s,
                urgency = %s
            WHERE id = %s
        """, (
            data['title'], data['description'], float(data['amount']),
            data['category'], park_name, data['urgency'], request_id
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
        # Get user's park_name
        cursor.execute("SELECT park_name FROM parkstaff WHERE id = %s", (current_user_id,))
        user = cursor.fetchone()
        if not user or not user[0]:
            return jsonify({"error": "User or park not found"}), 404
        
        park_name = user[0]
        
        # Verify the request exists and belongs to the user's park
        cursor.execute("SELECT id FROM fund_requests WHERE id = %s AND parkname = %s", 
                       (request_id, park_name))
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
    """Retrieve all booked tours for finance officer, filtered by their park."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT park_name FROM finance_officers WHERE id = %s", (current_user_id,))
        officer = cursor.fetchone()
        if not officer or not officer['park_name']:
            return jsonify({"error": "Finance officer or park not found"}), 404
        
        park_name = officer['park_name']
        
        cursor.execute("""
            SELECT 
                id, park_name, tour_name, date, time, guests, amount,
                first_name, last_name, email, phone, special_requests,
                created_at
            FROM tours
            WHERE park_name = %s
            ORDER BY created_at DESC
        """, (park_name,))
        tours = cursor.fetchall()
        
        for tour in tours:
            tour['created_at'] = tour['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            tour['date'] = tour['date'].strftime('%Y-%m-%d')
            tour['time'] = str(tour['time'])
            tour['amount'] = float(tour['amount'])
            
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
    """Retrieve all donations for finance officer, filtered by their park."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT park_name FROM finance_officers WHERE id = %s", (current_user_id,))
        officer = cursor.fetchone()
        if not officer or not officer['park_name']:
            return jsonify({"error": "Finance officer or park not found"}), 404
        
        park_name = officer['park_name']
        
        cursor.execute("""
            SELECT 
                id, donation_type, amount, park_name,
                first_name, last_name, email, message,
                is_anonymous, created_at
            FROM donations
            WHERE park_name = %s
            ORDER BY created_at DESC
        """, (park_name,))
        donations = cursor.fetchall()
        
        for donation in donations:
            donation['created_at'] = donation['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            donation['amount'] = float(donation['amount'])
            
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

@app.route('/api/finance/fund-requests', methods=['GET'], endpoint='get_all_fund_requests_1')
@token_required
def get_all_fund_requests(current_user_id):
    """Retrieve all fund requests with park staff details, optionally filtered by status"""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        status = request.args.get('status')  # Optional status filter (e.g., 'approved')
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT 
                fr.id, fr.title, fr.description, fr.amount,
                fr.category, fr.parkname, fr.urgency, fr.status,
                fr.created_at, fr.created_by,
                ps.first_name, ps.last_name, ps.email as staff_email,
                ps.park_name as staff_park
            FROM fund_requests fr
            JOIN parkstaff ps ON fr.created_by = ps.id
        """
        params = []
        
        if status:
            query += " WHERE fr.status = %s"
            params.append(status)
        
        query += " ORDER BY fr.created_at DESC"
        
        cursor.execute(query, params)
        requests = cursor.fetchall()
        
        for req in requests:
            req['amount'] = float(req['amount'])
            req['created_at'] = req['created_at'].strftime('%Y-%m-%d %H:%M:%S')
        
        return jsonify(requests), 200
        
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve fund requests"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()




@app.route('/api/finance/fund-requests/<id>/status', methods=['PUT'])
@token_required
def update_fund_request_status(current_user_id, id):
    """Update the status of a fund request."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT park_name FROM finance_officers WHERE id = %s", (current_user_id,))
        officer = cursor.fetchone()
        if not officer or not officer['park_name']:
            return jsonify({"error": "Finance officer or park not found"}), 404
        
        park_name = officer['park_name']
        
        cursor.execute("""
            SELECT id FROM fund_requests 
            WHERE id = %s AND parkname = %s
        """, (id, park_name))
        fund_request = cursor.fetchone()
        if not fund_request:
            return jsonify({"error": "Fund request not found or not associated with your park"}), 404
        
        data = request.json
        status = data.get('status')
        if status not in ['approved', 'rejected']:
            return jsonify({"error": "Invalid status. Must be 'approved' or 'rejected'"}), 400
        
        cursor.execute("""
            UPDATE fund_requests 
            SET status = %s 
            WHERE id = %s
        """, (status, id))
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




@app.route('/api/admin/officer-counts', methods=['GET'])
@token_required
def get_officer_counts(current_user_id):
    """Retrieve the total count of each officer type."""
    print(f"Handling GET request for /api/admin/officer-counts by user {current_user_id}")
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Count finance officers
        cursor.execute("SELECT COUNT(*) as finance_count FROM finance_officers")
        finance_count = cursor.fetchone()['finance_count']
        
        # Count government officers
        cursor.execute("SELECT COUNT(*) as government_count FROM government_officers")
        government_count = cursor.fetchone()['government_count']
        
        # Count auditors
        cursor.execute("SELECT COUNT(*) as auditor_count FROM auditors")
        auditor_count = cursor.fetchone()['auditor_count']
        
        # Count park staff
        cursor.execute("SELECT COUNT(*) as park_staff_count FROM parkstaff")
        park_staff_count = cursor.fetchone()['park_staff_count']

        officer_counts = [
            {"title": "Finance Officers", "value": finance_count, "icon": "Users", "trend": "neutral"},
            {"title": "Government Officers", "value": government_count, "icon": "Users", "trend": "neutral"},
            {"title": "Auditors", "value": auditor_count, "icon": "Users", "trend": "neutral"},
            {"title": "Park Staff", "value": park_staff_count, "icon": "Users", "trend": "neutral"},
        ]
        
        return jsonify({"officer_counts": officer_counts}), 200
    except Exception as e:
        print(f"Error fetching officer counts: {e}")
        return jsonify({"error": "Failed to fetch officer counts"}), 500
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






@app.route('/api/finance/budgets', methods=['GET'])
@token_required
def get_budgets(current_user_id):
    """Retrieve all budgets for finance officer with item types."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                b.id, b.title, b.fiscal_year, b.total_amount, b.park_name,
                b.description, b.status, b.created_at, b.created_by,
                b.approved_by, b.approved_at,
                fo.first_name as created_by_name,
                go.first_name as approved_by_name
            FROM budgets b
            LEFT JOIN finance_officers fo ON b.created_by = fo.id
            LEFT JOIN government_officers go ON b.approved_by = go.id
            WHERE b.created_by = %s
            ORDER BY b.created_at DESC
        """, (current_user_id,))
        budgets = cursor.fetchall()
        
        for budget in budgets:
            budget['created_at'] = budget['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            if budget['approved_at']:
                budget['approved_at'] = budget['approved_at'].strftime('%Y-%m-%d %H:%M:%S')
            # Fetch budget items with type
            cursor.execute("""
                SELECT id, category, description, amount, type
                FROM budget_items
                WHERE budget_id = %s
            """, (budget['id'],))
            items = cursor.fetchall()
            for item in items:
                item['amount'] = float(item['amount'])
            budget['items'] = items
            
        return jsonify(budgets), 200
        
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve budgets"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()



@app.route('/api/finance/budgets', methods=['POST'])
@token_required
def create_budget(current_user_id):
    """Create a new budget with items, specifying expense or income."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.json
        required_fields = ['title', 'fiscal_year', 'total_amount', 'park_name', 'items']
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        # Validate items
        for item in data['items']:
            if 'type' not in item or item['type'] not in ['expense', 'income']:
                return jsonify({"error": "Each item must specify type as 'expense' or 'income'"}), 400
            if not all(key in item for key in ['category', 'description', 'amount', 'type']):
                return jsonify({"error": "Invalid budget item format"}), 400
            if not isinstance(item['amount'], (int, float)) or item['amount'] <= 0:
                return jsonify({"error": "Item amount must be positive"}), 400

        cursor = connection.cursor()
        # Insert budget
        cursor.execute("""
            INSERT INTO budgets (
                title, fiscal_year, total_amount, park_name,
                description, status, created_by
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            data['title'],
            data['fiscal_year'],
            float(data['total_amount']),
            data['park_name'],
            data.get('description', ''),
            data.get('status', 'draft'),
            current_user_id
        ))
        
        budget_id = cursor.lastrowid
        
        # Insert budget items with type
        for item in data['items']:
            cursor.execute("""
                INSERT INTO budget_items (
                    budget_id, category, description, amount, type
                ) VALUES (%s, %s, %s, %s, %s)
            """, (
                budget_id,
                item['category'],
                item['description'],
                float(item['amount']),
                item['type']
            ))
        
        connection.commit()
        
        return jsonify({
            "message": "Budget created successfully",
            "id": budget_id
        }), 201

    except Exception as e:
        print(f"Database error: {e}")
        connection.rollback()
        return jsonify({"error": f"Failed to create budget: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()






@app.route('/api/government/budgets', methods=['GET'])
@token_required
def get_government_budgets(current_user_id):
    """Retrieve all submitted budgets for government officer review with item types."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                b.id, b.title, b.fiscal_year, b.total_amount, b.park_name,
                b.description, b.status, b.created_at, b.created_by,
                b.approved_by, b.approved_at,
                fo.first_name as created_by_name,
                go.first_name as approved_by_name
            FROM budgets b
            LEFT JOIN finance_officers fo ON b.created_by = fo.id
            LEFT JOIN government_officers go ON b.approved_by = go.id
            WHERE b.status = 'submitted'
            ORDER BY b.created_at DESC
        """)
        budgets = cursor.fetchall()
        
        # Fetch items for each budget
        for budget in budgets:
            cursor.execute("""
                SELECT id, category, description, amount, type
                FROM budget_items
                WHERE budget_id = %s
            """, (budget['id'],))
            items = cursor.fetchall()
            for item in items:
                item['amount'] = float(item['amount'])
                item['id'] = str(item['id'])
            budget['items'] = items
            budget['id'] = str(budget['id'])
            budget['total_amount'] = float(budget['total_amount'])
            budget['created_at'] = budget['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            if budget['approved_at']:
                budget['approved_at'] = budget['approved_at'].strftime('%Y-%m-%d %H:%M:%S')
            
        return jsonify(budgets), 200
        
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve budgets"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()









@app.route('/api/finance/budgets/approved', methods=['GET'])
@token_required
def get_approved_budgets(current_user_id):
    """Retrieve the total sum of approved budgets for finance officer"""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT SUM(total_amount) AS total_approved_amount
            FROM budgets
            WHERE status = 'approved' AND created_by = %s
        """, (current_user_id,))
        result = cursor.fetchone()
        total_approved_amount = float(result['total_approved_amount'] or 0)
        return jsonify({"total_approved_amount": total_approved_amount}), 200
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve approved budgets total"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()  


# # Get pending budgets
# @app.route('/api/finance/budgets/pending', methods=['GET'])
# @token_required
# def get_pending_budgets(current_user_id):
#     """Retrieve pending (submitted) budgets."""
#     connection = get_db_connection()
#     if not connection:
#         return jsonify({"error": "Database connection failed"}), 500
    
#     try:
#         cursor = connection.cursor(dictionary=True)
#         cursor.execute("""
#             SELECT 
#                 id, title, fiscal_year AS fiscalYear, total_amount AS totalAmount,
#                 status, created_at AS createdAt
#             FROM budgets
#             WHERE created_by = %s AND status = 'submitted'
#             ORDER BY created_at DESC
#         """, (current_user_id,))
#         budgets = cursor.fetchall()
        
#         for budget in budgets:
#             cursor.execute("""
#                 SELECT 
#                     id, category, description, amount
#                 FROM budget_items
#                 WHERE budget_id = %s
#             """, (budget['id'],))
#             items = cursor.fetchall()
#             for item in items:
#                 item['amount'] = float(item['amount'])
#                 item['id'] = str(item['id'])
#             budget['items'] = items
#             budget['id'] = str(budget['id'])
#             budget['totalAmount'] = float(budget['totalAmount'])
#             budget['createdAt'] = budget['createdAt'].isoformat()
        
#         return jsonify(budgets), 200
    
#     except Exception as e:
#         print(f"Database error: {e}")
#         return jsonify({"error": "Failed to retrieve pending budgets"}), 500
#     finally:
#         if connection.is_connected():
#             cursor.close()
#             connection.close()




@app.route('/api/finance/budgets/pending', methods=['GET'])
@token_required
def get_pending_budgets(current_user_id):
    """Retrieve pending (submitted) budgets for the finance officer's park."""
    connection = get_db_connection()
    if isinstance(connection, tuple):
        return connection
    
    try:
        cursor = connection.cursor(dictionary=True)
        # Get the finance officer's park name
        cursor.execute("SELECT park_name FROM finance_officers WHERE id = %s", (current_user_id,))
        officer = cursor.fetchone()
        if not officer or not officer['park_name']:
            return jsonify({"error": "Finance officer or park not found"}), 404
        
        park_name = officer['park_name']
        
        # Retrieve pending budgets filtered by park_name
        cursor.execute("""
            SELECT 
                id, title, fiscal_year AS fiscalYear, total_amount AS totalAmount,
                park_name AS parkName, status, created_at AS createdAt,
                created_by, description
            FROM budgets
            WHERE park_name = %s AND status = 'submitted'
            ORDER BY created_at DESC
        """, (park_name,))
        budgets = cursor.fetchall()
        
        for budget in budgets:
            # Fetch budget items with type
            cursor.execute("""
                SELECT id, category, description, amount, type
                FROM budget_items
                WHERE budget_id = %s
            """, (budget['id'],))
            items = cursor.fetchall()
            for item in items:
                item['amount'] = float(item['amount'])
                item['id'] = str(item['id'])
                # Ensure type is included (expense/income)
                item['type'] = item['type'] if item['type'] in ['expense', 'income'] else 'expense'
            budget['items'] = items
            budget['id'] = str(budget['id'])
            budget['totalAmount'] = float(budget['totalAmount'])
            budget['createdAt'] = budget['createdAt'].isoformat()
            # Include creator details
            cursor.execute("""
                SELECT CONCAT(first_name, ' ', last_name) AS created_by_name
                FROM finance_officers
                WHERE id = %s
            """, (budget['created_by'],))
            creator = cursor.fetchone()
            budget['createdByName'] = creator['created_by_name'] if creator else 'Unknown'
        
        return jsonify(budgets), 200
    
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve pending budgets"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()









@app.route('/api/finance/budgets/newlyapproved', methods=['GET'])
@token_required
def get_approved_newlybudgets(current_user_id):
    """Retrieve approved budgets for finance officer"""
    connection = get_db_connection()
    if isinstance(connection, tuple):
        return connection
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                id, title, fiscal_year AS fiscalYear, total_amount AS totalAmount,
                park_name AS parkName, status, created_at AS createdAt
            FROM budgets
            WHERE created_by = %s AND status = 'approved'
            ORDER BY created_at DESC
        """, (current_user_id,))
        budgets = cursor.fetchall()
        
        for budget in budgets:
            cursor.execute("""
                SELECT id, category, description, amount
                FROM budget_items
                WHERE budget_id = %s
            """, (budget['id'],))
            items = cursor.fetchall()
            for item in items:
                item['amount'] = float(item['amount'])
                item['id'] = str(item['id'])
            budget['items'] = items
            budget['id'] = str(budget['id'])
            budget['totalAmount'] = float(budget['totalAmount'])
            budget['createdAt'] = budget['createdAt'].isoformat()
        
        return jsonify(budgets), 200
    
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve approved budgets"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()








@app.route('/api/staff', methods=['POST'])
def add_staff():
    """Add a new staff member."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.json
        required_fields = ['firstName', 'lastName', 'email', 'role', 'password']
        
        # Validate required fields
        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            return jsonify({"error": "Missing required fields", "missing": missing_fields}), 400
        
        # Validate role
        valid_roles = ['park-staff', 'auditor', 'government', 'finance']
        if data['role'] not in valid_roles:
            return jsonify({"error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"}), 400

        # Validate park_name for roles requiring it
        roles_requiring_park = ['park-staff', 'auditor', 'government']
        if data['role'] in roles_requiring_park and not data.get('park_name'):
            return jsonify({"error": f"park_name is required for {data['role']} role"}), 400

        cursor = connection.cursor()
        
        # Check if email already exists across all staff tables
        tables = ['parkstaff', 'auditors', 'government_officers', 'finance_officers']
        for table in tables:
            cursor.execute(f"SELECT id FROM {table} WHERE email = %s", (data['email'],))
            if cursor.fetchone():
                return jsonify({"error": "Email already exists"}), 409

        # Hash password
        password_hash = hashlib.sha256(data['password'].encode()).hexdigest()

        # Map role to table
        table_map = {
            'park-staff': 'parkstaff',
            'auditor': 'auditors',
            'government': 'government_officers',
            'finance': 'finance_officers'
        }
        table = table_map[data['role']]

        # Log query details for debugging
        print(f"Inserting into table: {table}")
        print(f"Data: {data}")

        # Insert into appropriate table
        if data['role'] == 'park-staff':
            query = """
                INSERT INTO parkstaff (
                    first_name, last_name, email, password_hash, park_name
                ) VALUES (%s, %s, %s, %s, %s)
            """
            params = (
                data['firstName'],
                data['lastName'],
                data['email'],
                password_hash,
                data['park_name']
            )
        elif data['role'] == 'auditor':
            query = """
                INSERT INTO auditors (
                    first_name, last_name, email, password_hash, park_name
                ) VALUES (%s, %s, %s, %s, %s)
            """
            params = (
                data['firstName'],
                data['lastName'],
                data['email'],
                password_hash,
                data['park_name']
            )
        elif data['role'] == 'government':
            query = """
                INSERT INTO government_officers (
                    first_name, last_name, email, password_hash, park_name
                ) VALUES (%s, %s, %s, %s, %s)
            """
            params = (
                data['firstName'],
                data['lastName'],
                data['email'],
                password_hash,
                data['park_name']
            )
        elif data['role'] == 'finance':
            query = """
                INSERT INTO finance_officers (
                    first_name, last_name, email, password_hash, park_name
                ) VALUES (%s, %s, %s, %s, %s)
            """
            params = (
                data['firstName'],
                data['lastName'],
                data['email'],
                password_hash,
                data.get('park_name')  # Fixed: Changed data('park_name') to data.get('park_name')
            )

        print(f"Executing query: {query}")
        print(f"Parameters: {params}")
        cursor.execute(query, params)

        connection.commit()
        new_staff_id = cursor.lastrowid
        
        return jsonify({
            "message": "Staff member added successfully",
            "id": new_staff_id
        }), 201

    except Exception as e:
        print(f"Database error: {str(e)}")
        return jsonify({"error": f"Failed to add staff: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()










@app.route('/api/finance/budgets/rejected', methods=['GET'])
@token_required
def get_rejected_budgets(current_user_id):
    """Retrieve rejected budgets"""
    connection = get_db_connection()
    if isinstance(connection, tuple):
        return connection
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                id, title, fiscal_year AS fiscalYear, total_amount AS totalAmount,
                park_name AS parkName, status, created_at AS createdAt
            FROM budgets
            WHERE created_by = %s AND status = 'rejected'
            ORDER BY created_at DESC
        """, (current_user_id,))
        budgets = cursor.fetchall()
        
        for budget in budgets:
            cursor.execute("""
                SELECT id, category, description, amount
                FROM budget_items
                WHERE budget_id = %s
            """, (budget['id'],))
            items = cursor.fetchall()
            for item in items:
                item['amount'] = float(item['amount'])
                item['id'] = str(item['id'])
            budget['items'] = items
            budget['id'] = str(budget['id'])
            budget['totalAmount'] = float(budget['totalAmount'])
            budget['createdAt'] = budget['createdAt'].isoformat()
        
        return jsonify(budgets), 200
    
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve rejected budgets"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()






@app.route('/api/government/budgets/<int:budget_id>', methods=['PUT'])
@token_required
def update_budget(current_user_id, budget_id):
    """Update an existing budget and its items with expense/income type."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.json
        required_fields = ['title', 'fiscal_year', 'total_amount', 'park_name', 'items']
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        # Validate items
        for item in data['items']:
            if 'type' not in item or item['type'] not in ['expense', 'income']:
                return jsonify({"error": "Each item must specify type as 'expense' or 'income'"}), 400
            if not all(key in item for key in ['category', 'description', 'amount', 'type']):
                return jsonify({"error": "Invalid budget item format"}), 400
            if not isinstance(item['amount'], (int, float)) or item['amount'] <= 0:
                return jsonify({"error": "Item amount must be positive"}), 400
            if not item['category'].strip() or not item['description'].strip():
                return jsonify({"error": "Item category and description cannot be empty"}), 400

        cursor = connection.cursor()
        # Verify budget exists and is in submitted status
        cursor.execute("SELECT id FROM budgets WHERE id = %s AND status = 'submitted'", (budget_id,))
        if not cursor.fetchone():
            return jsonify({"error": "Budget not found or not in submitted status"}), 404

        # Start transaction
        connection.start_transaction()

        # Update budget
        cursor.execute("""
            UPDATE budgets 
            SET title = %s, fiscal_year = %s, total_amount = %s, park_name = %s,
                description = %s
            WHERE id = %s
        """, (
            data['title'],
            data['fiscal_year'],
            float(data['total_amount']),
            data['park_name'],
            data.get('description', ''),
            budget_id
        ))

        # Delete existing items
        cursor.execute("DELETE FROM budget_items WHERE budget_id = %s", (budget_id,))

        # Insert updated items with type
        for item in data['items']:
            cursor.execute("""
                INSERT INTO budget_items (
                    budget_id, category, description, amount, type
                ) VALUES (%s, %s, %s, %s, %s)
            """, (
                budget_id,
                item['category'],
                item['description'],
                float(item['amount']),
                item['type']
            ))
        
        connection.commit()
        print(f"Budget {budget_id} updated by user {current_user_id}")
        return jsonify({"message": "Budget updated successfully"}), 200

    except Exception as e:
        connection.rollback()
        print(f"Database error: {e}")
        return jsonify({"error": f"Failed to update budget: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()






@app.route('/api/government/budgets/<int:budget_id>/status', methods=['PUT'])
@token_required
def update_budget_status(current_user_id, budget_id):
    """Approve or reject a budget"""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.json
        status = data.get('status')
        reason = data.get('reason')
        
        if status not in ['approved', 'rejected']:
            return jsonify({"error": "Invalid status, must be 'approved' or 'rejected'"}), 400
        if not reason or len(reason.strip()) < 10:
            return jsonify({"error": "Reason must be at least 10 characters long"}), 400
            
        cursor = connection.cursor()
        cursor.execute("SELECT id, status FROM budgets WHERE id = %s", (budget_id,))
        budget = cursor.fetchone()
        
        if not budget:
            return jsonify({"error": "Budget not found"}), 404
        if budget[1] != 'submitted':
            return jsonify({"error": "Budget is not in submitted status"}), 400

        cursor.execute("""
            UPDATE budgets 
            SET status = %s, approved_by = %s, approved_at = CURRENT_TIMESTAMP, reason = %s
            WHERE id = %s
        """, (status, current_user_id, reason, budget_id))
        
        connection.commit()
        print(f"Budget {budget_id} {status} by user {current_user_id}")
        return jsonify({"message": f"Budget {status} successfully"}), 200
        
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Failed to update budget status: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()





@app.route('/api/finance/emergency-requests', methods=['POST'])
@token_required
def create_emergency_request(current_user_id):
    """Create a new emergency fund request."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.json
        required_fields = ['title', 'description', 'amount', 'parkName', 'emergencyType', 'justification', 'timeframe']
        
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
            INSERT INTO emergency_requests (
                title, description, amount, park_name, emergency_type,
                justification, timeframe, status, created_by
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data['title'],
            data['description'],
            amount,
            data['parkName'],
            data['emergencyType'],
            data['justification'],
            data['timeframe'],
            'pending',
            current_user_id
        ))
        connection.commit()
        
        new_request_id = cursor.lastrowid
        
        return jsonify({
            "message": "Emergency fund request created successfully",
            "id": new_request_id
        }), 201

    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Failed to create emergency request: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()



@app.route('/api/finance/emergency-requests', methods=['GET'])
@token_required
def get_emergency_requests(current_user_id):
    """Retrieve all emergency fund requests for the finance officer, filtered by their park."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        # Get the finance officer's park name
        cursor.execute("SELECT park_name FROM finance_officers WHERE id = %s", (current_user_id,))
        officer = cursor.fetchone()
        if not officer or not officer['park_name']:
            return jsonify({"error": "Finance officer or park not found"}), 404
        
        park_name = officer['park_name']
        
        # Retrieve emergency requests for the officer's park
        cursor.execute("""
            SELECT 
                id, title, description, amount, park_name as parkName,
                emergency_type as emergencyType, justification, timeframe,
                status, created_at
            FROM emergency_requests
            WHERE created_by = %s AND park_name = %s
            ORDER BY created_at DESC
        """, (current_user_id, park_name))
        requests = cursor.fetchall()
        
        # Format dates for frontend
        for req in requests:
            req['amount'] = float(req['amount'])  # Convert Decimal to float
            req['submittedDate'] = req['created_at'].strftime('%Y-%m-%d') if req['created_at'] else None
            req['id'] = str(req['id'])  # Match frontend expectation
            del req['created_at']
        
        return jsonify(requests), 200

    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve emergency requests"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()





@app.route('/api/finance/extra-funds', methods=['POST'])
@token_required
def create_extra_funds_request(current_user_id):
    """Create a new extra funds request."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.json
        required_fields = ['title', 'description', 'amount', 'parkName', 'category', 'justification', 'expectedDuration']
        
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
            INSERT INTO extra_funds_requests (
                title, description, amount, park_name, category,
                justification, expected_duration, status, created_by
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data['title'],
            data['description'],
            amount,
            data['parkName'],
            data['category'],
            data['justification'],
            data['expectedDuration'],
            'pending',
            current_user_id
        ))
        connection.commit()
        
        new_request_id = cursor.lastrowid
        
        return jsonify({
            "message": "Extra funds request created successfully",
            "id": new_request_id
        }), 201

    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Failed to create extra funds request: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()



@app.route('/api/finance/extra-funds', methods=['GET'])
@token_required
def get_extra_funds_requests(current_user_id):
    """Retrieve all extra funds requests for the finance officer, filtered by their park."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        # Get the finance officer's park name
        cursor.execute("SELECT park_name FROM finance_officers WHERE id = %s", (current_user_id,))
        officer = cursor.fetchone()
        if not officer or not officer['park_name']:
            return jsonify({"error": "Finance officer or park not found"}), 404
        
        park_name = officer['park_name']
        
        # Retrieve extra funds requests for the officer's park
        cursor.execute("""
            SELECT 
                id, title, description, amount, park_name as parkName,
                category, justification, expected_duration as expectedDuration,
                status, created_at, created_by as submittedById
            FROM extra_funds_requests
            WHERE created_by = %s AND park_name = %s
            ORDER BY created_at DESC
        """, (current_user_id, park_name))
        requests = cursor.fetchall()
        
        # Get finance officer details for submittedBy
        cursor.execute("""
            SELECT id, CONCAT(first_name, ' ', last_name) as name
            FROM finance_officers
            WHERE id = %s
        """, (current_user_id,))
        officer = cursor.fetchone()
        officer_name = officer['name'] if officer else 'Unknown'
        
        # Format data for frontend
        for req in requests:
            req['amount'] = float(req['amount'])  # Convert Decimal to float
            req['dateSubmitted'] = req['created_at'].strftime('%Y-%m-%d') if req['created_at'] else None
            req_id = int(req['id'])  # Convert to int explicitly
            req['id'] = f"ef-{req_id:03d}"  # Format as ef-001
            req['parkId'] = f"park-{req_id:03d}"  # Format as park-001
            req['submittedBy'] = officer_name
            req['park'] = req['parkName']  # Add park field for frontend
            del req['created_at']
        
        return jsonify(requests), 200

    except ValueError as ve:
        print(f"ValueError: {ve}")
        return jsonify({"error": "Invalid data format in database"}), 500
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve extra funds requests"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()




@app.route('/api/finance/all-approved-data', methods=['GET'])
@token_required
def get_all_approved_data(current_user_id):
    """Retrieve all booked tours, donations, approved fund requests, approved extra funds requests, approved emergency requests, and approved budgets."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # 1. Booked Tours
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
            tour['created_at'] = tour['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            tour['date'] = tour['date'].strftime('%Y-%m-%d')
            tour['time'] = str(tour['time'])
            tour['amount'] = float(tour['amount'])
        
        # 2. Donations
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
            donation['amount'] = float(donation['amount'])
        
        # 3. Approved Fund Requests
        cursor.execute("""
            SELECT 
                fr.id, fr.title, fr.description, fr.amount,
                fr.category, fr.parkname, fr.urgency, fr.status,
                fr.created_at, fr.created_by,
                ps.first_name, ps.last_name, ps.email AS staff_email,
                ps.park_name AS staff_park
            FROM fund_requests fr
            JOIN parkstaff ps ON fr.created_by = ps.id
            WHERE fr.status = 'approved'
            ORDER BY fr.created_at DESC
        """)
        fund_requests = cursor.fetchall()
        for req in fund_requests:
            req['created_at'] = req['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            req['amount'] = float(req['amount'])
        
        # 4. Approved Extra Funds Requests
        cursor.execute("""
            SELECT 
                efr.id, efr.title, efr.description, efr.amount,
                efr.park_name AS parkName, efr.category,
                efr.justification, efr.expected_duration,
                efr.status, efr.created_at, efr.created_by,
                fo.first_name, fo.last_name, fo.email AS finance_email
            FROM extra_funds_requests efr
            JOIN finance_officers fo ON efr.created_by = fo.id
            WHERE efr.status = 'approved'
            ORDER BY efr.created_at DESC
        """)
        extra_funds_requests = cursor.fetchall()
        for req in extra_funds_requests:
            req['created_at'] = req['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            req['amount'] = float(req['amount'])
        
        # 5. Approved Emergency Requests
        cursor.execute("""
            SELECT 
                er.id, er.title, er.description, er.amount,
                er.park_name AS parkName, er.emergency_type,
                er.justification, er.timeframe, er.status,
                er.created_at, er.created_by,
                fo.first_name, fo.last_name, fo.email AS finance_email
            FROM emergency_requests er
            JOIN finance_officers fo ON er.created_by = fo.id
            WHERE er.status = 'approved'
            ORDER BY er.created_at DESC
        """)
        emergency_requests = cursor.fetchall()
        for req in emergency_requests:
            req['created_at'] = req['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            req['amount'] = float(req['amount'])
        
        # 6. Approved Budgets
        cursor.execute("""
            SELECT 
                b.id, b.title, b.fiscal_year, b.total_amount,
                b.park_name, b.description, b.status,
                b.created_at, b.created_by, b.approved_by,
                b.approved_at,
                fo.first_name AS created_by_name,
                go.first_name AS approved_by_name
            FROM budgets b
            LEFT JOIN finance_officers fo ON b.created_by = fo.id
            LEFT JOIN government_officers go ON b.approved_by = go.id
            WHERE b.status = 'approved'
            ORDER BY b.created_at DESC
        """)
        budgets = cursor.fetchall()
        for budget in budgets:
            budget['created_at'] = budget['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            budget['total_amount'] = float(budget['total_amount'])
            if budget['approved_at']:
                budget['approved_at'] = budget['approved_at'].strftime('%Y-%m-%d %H:%M:%S')
            # Fetch budget items
            cursor.execute("""
                SELECT id, category, description, amount
                FROM budget_items
                WHERE budget_id = %s
            """, (budget['id'],))
            items = cursor.fetchall()
            for item in items:
                item['amount'] = float(item['amount'])
            budget['items'] = items
        
        return jsonify({
            "tours": tours,
            "donations": donations,
            "fund_requests": fund_requests,
            "extra_funds_requests": extra_funds_requests,
            "emergency_requests": emergency_requests,
            "budgets": budgets
        }), 200
        
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Failed to retrieve data: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()




@app.route('/api/staff', methods=['GET'])
@token_required
def get_staff(current_user_id):
    """Retrieve all staff members across all roles."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        # Verify the user is an admin
        cursor.execute("SELECT id FROM admintable WHERE id = %s", (current_user_id,))
        if not cursor.fetchone():
            return jsonify({"error": "Unauthorized: Admin access required"}), 403

        # Query all staff tables with UNION
        query = """
            SELECT id, first_name, last_name, email, park_name, role, last_login, created_at
            FROM parkstaff
            UNION
            SELECT id, first_name, last_name, email, park_name, role, last_login, created_at
            FROM auditors
            UNION
            SELECT id, first_name, last_name, email, park_name, role, last_login, created_at
            FROM government_officers
            UNION
            SELECT id, first_name, last_name, email, park_name, role, last_login, created_at
            FROM finance_officers
            ORDER BY created_at DESC
        """
        cursor.execute(query)
        staff = cursor.fetchall()

        # Format dates and clean up response
        for member in staff:
            member['id'] = str(member['id'])  # Convert to string for frontend
            if member['last_login']:
                member['last_login'] = member['last_login'].strftime('%Y-%m-%d %H:%M:%S')
            else:
                member['last_login'] = None
            member['created_at'] = member['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            # Ensure role is consistent
            if member['role'] == 'park-staff':
                member['role'] = 'park-staff'
            elif member['role'] == 'auditor':
                member['role'] = 'auditor'
            elif member['role'] == 'government':
                member['role'] = 'government'
            elif member['role'] == 'finance':
                member['role'] = 'finance'

        return jsonify(staff), 200

    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve staff"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/staff/<int:staff_id>', methods=['DELETE'])
@token_required
def delete_staff(current_user_id, staff_id):
    """Delete a staff member from any role."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        role = request.args.get('role')
        if not role:
            return jsonify({"error": "Role parameter is required"}), 400

        cursor = connection.cursor()
        
        # Map role to table name
        table_map = {
            'park-staff': 'parkstaff',
            'auditor': 'auditors',
            'government': 'government_officers',
            'finance': 'finance_officers'
        }
        
        table = table_map.get(role)
        if not table:
            return jsonify({"error": "Invalid role"}), 400
        
        # Check if staff exists
        cursor.execute(f"SELECT id FROM {table} WHERE id = %s", (staff_id,))
        existing_staff = cursor.fetchone()
        
        if not existing_staff:
            return jsonify({"error": "Staff member not found"}), 404
        
        # Delete staff member
        cursor.execute(f"DELETE FROM {table} WHERE id = %s", (staff_id,))
        connection.commit()
        
        return jsonify({
            "message": "Staff member deleted successfully"
        }), 200

    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Failed to delete staff: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


@app.route('/api/staff/<int:staff_id>', methods=['PUT'])
@token_required
def update_staff(current_user_id, staff_id):
    """Update an existing staff member."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.json
        role = request.args.get('role')
        required_fields = ['firstName', 'lastName', 'email', 'role']
        
        # Validate required fields
        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            return jsonify({"error": "Missing required fields", "missing": missing_fields}), 400
        
        if not role:
            return jsonify({"error": "Role parameter is required"}), 400
            
        if role not in ['park-staff', 'auditor', 'government', 'finance']:
            return jsonify({"error": "Invalid role"}), 400

        cursor = connection.cursor()
        
        # Map role to table name
        table_map = {
            'park-staff': 'parkstaff',
            'auditor': 'auditors',
            'government': 'government_officers',
            'finance': 'finance_officers'
        }
        
        table = table_map.get(role)
        if not table:
            return jsonify({"error": "Invalid role"}), 400
        
        # Check if staff exists
        cursor.execute(f"SELECT id FROM {table} WHERE id = %s", (staff_id,))
        existing_staff = cursor.fetchone()
        
        if not existing_staff:
            return jsonify({"error": "Staff member not found"}), 404
        
        # Check if email is already in use by another user
        for tbl in ['parkstaff', 'auditors', 'government_officers', 'finance_officers']:
            cursor.execute(f"SELECT id FROM {tbl} WHERE email = %s AND id != %s", (data['email'], staff_id))
            if cursor.fetchone():
                return jsonify({"error": "Email already in use by another staff member"}), 409
        
        # Update staff member
        if role == 'park-staff':
            if not data.get('park'):
                return jsonify({"error": "Park is required for park staff"}), 400
            cursor.execute(f"""
                UPDATE {table} SET
                    first_name = %s,
                    last_name = %s,
                    email = %s,
                    park_name = %s
                WHERE id = %s
            """, (
                data['firstName'],
                data['lastName'],
                data['email'],
                data['park'],
                staff_id
            ))
        elif role == 'finance':
            cursor.execute(f"""
                UPDATE {table} SET
                    first_name = %s,
                    last_name = %s,
                    email = %s,
                    park_name = %s
                WHERE id = %s
            """, (
                data['firstName'],
                data['lastName'],
                data['email'],
                data.get('park', None),
                staff_id
            ))
        else:  # auditor, government
            cursor.execute(f"""
                UPDATE {table} SET
                    first_name = %s,
                    last_name = %s,
                    email = %s
                WHERE id = %s
            """, (
                data['firstName'],
                data['lastName'],
                data['email'],
                staff_id
            ))
        
        # Update password if provided
        if data.get('password'):
            password_hash = hashlib.sha256(data['password'].encode()).hexdigest()
            cursor.execute(f"""
                UPDATE {table} SET password_hash = %s WHERE id = %s
            """, (password_hash, staff_id))
        
        connection.commit()
        
        return jsonify({
            "message": "Staff member updated successfully",
            "id": staff_id
        }), 200

    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Failed to update staff: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()





@app.route('/api/visitor/profile', methods=['GET'])
@token_required
def get_visitor_profile(current_user_id):
    """Retrieve the logged-in visitor's profile information."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, first_name, last_name, email
            FROM visitors
            WHERE id = %s
        """, (current_user_id,))
        visitor = cursor.fetchone()
        
        if not visitor:
            return jsonify({"error": "Visitor not found"}), 404
        
        return jsonify({
            "user": {
                "id": str(visitor['id']),
                "firstName": visitor['first_name'],
                "lastName": visitor['last_name'],
                "email": visitor['email']
            }
        }), 200
        
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve visitor profile"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/visitor/profile', methods=['PUT'])
@token_required
def update_visitor_profile(current_user_id):
    """Update the logged-in visitor's profile information."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.json
        required_fields = ['firstName', 'lastName', 'email']
        
        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            return jsonify({"error": "Missing required fields", "missing": missing_fields}), 400

        # Validate email format
        if not re.match(r"[^@]+@[^@]+\.[^@]+", data['email']):
            return jsonify({"error": "Invalid email format"}), 400

        cursor = connection.cursor()
        
        # Check if email is already in use by another visitor
        cursor.execute("SELECT id FROM visitors WHERE email = %s AND id != %s", 
                      (data['email'], current_user_id))
        if cursor.fetchone():
            return jsonify({"error": "Email already in use by another visitor"}), 409

        # If password update is requested
        if 'currentPassword' in data and 'newPassword' in data:
            # Verify current password
            cursor.execute("SELECT password_hash FROM visitors WHERE id = %s", (current_user_id,))
            visitor = cursor.fetchone()
            if not visitor:
                return jsonify({"error": "Visitor not found"}), 404

            stored_password = visitor[0]
            
            # Check if password is in salted format
            if ':' in stored_password:
                stored_salt, stored_hash = stored_password.split(':')
                if hash_password(data['currentPassword'], stored_salt) != stored_hash:
                    return jsonify({"error": "Current password is incorrect"}), 401
            else:
                if hashlib.sha256(data['currentPassword'].encode()).hexdigest() != stored_password:
                    return jsonify({"error": "Current password is incorrect"}), 401

            # Generate new salt and hash for the new password
            new_salt = generate_salt()
            new_hash = hash_password(data['newPassword'], new_salt)
            new_stored_password = f"{new_salt}:{new_hash}"

            # Update visitor with new password
            cursor.execute("""
                UPDATE visitors 
                SET first_name = %s, 
                    last_name = %s, 
                    email = %s,
                    password_hash = %s
                WHERE id = %s
            """, (
                data['firstName'],
                data['lastName'],
                data['email'],
                new_stored_password,
                current_user_id
            ))
        else:
            # Update visitor without password change
            cursor.execute("""
                UPDATE visitors 
                SET first_name = %s, 
                    last_name = %s, 
                    email = %s
                WHERE id = %s
            """, (
                data['firstName'],
                data['lastName'],
                data['email'],
                current_user_id
            ))

        connection.commit()
        
        return jsonify({
            "message": "Profile updated successfully",
            "passwordUpdated": 'currentPassword' in data
        }), 200
        
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Failed to update visitor profile: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()








@app.route('/api/visitor/data', methods=['GET'])
@token_required
def get_visitor_data(current_user_id):
    """Retrieve all donations, tours, and services for the logged-in visitor."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        # Get visitor's email
        cursor.execute("SELECT email FROM visitors WHERE id = %s", (current_user_id,))
        visitor = cursor.fetchone()
        if not visitor:
            return jsonify({"error": "Visitor not found"}), 404
        email = visitor['email']

        # Fetch donations
        cursor.execute("""
            SELECT 
                id, donation_type AS donationType, amount, park_name AS parkName,
                first_name AS firstName, last_name AS lastName, email,
                message, is_anonymous AS isAnonymous, created_at AS createdAt
            FROM donations
            WHERE email = %s
            ORDER BY created_at DESC
        """, (email,))
        donations = cursor.fetchall()
        for donation in donations:
            donation['createdAt'] = donation['createdAt'].strftime('%Y-%m-%d %H:%M:%S')
            donation['amount'] = float(donation['amount'])

        # Fetch tours
        cursor.execute("""
            SELECT 
                id, park_name AS parkName, tour_name AS tourName, date, time,
                guests, amount, first_name AS firstName, last_name AS lastName,
                email, special_requests AS specialRequests, created_at AS createdAt
            FROM tours
            WHERE email = %s
            ORDER BY created_at DESC
        """, (email,))
        tours = cursor.fetchall()
        for tour in tours:
            tour['createdAt'] = tour['createdAt'].strftime('%Y-%m-%d %H:%M:%S')
            tour['date'] = tour['date'].strftime('%Y-%m-%d')
            tour['time'] = str(tour['time'])
            tour['amount'] = float(tour['amount'])

        # Fetch services
        cursor.execute("""
            SELECT 
                id, first_name AS firstName, last_name AS lastName, email, phone,
                company_type AS companyType, provided_service AS providedService,
                company_name AS companyName, tax_id AS taxId, status,
                created_at AS createdAt
            FROM services
            WHERE email = %s
            ORDER BY created_at DESC
        """, (email,))
        services = cursor.fetchall()
        for service in services:
            service['createdAt'] = service['createdAt'].strftime('%Y-%m-%d %H:%M:%S')

        return jsonify({
            "donations": donations,
            "tours": tours,
            "services": services
        }), 200

    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve visitor data"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/visitor/register', methods=['POST'])
def visitor_register():
    """Register a new visitor."""
    connection = get_db_connection()
    if isinstance(connection, tuple):
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.json
        required_fields = ['firstName', 'lastName', 'email', 'password']
        
        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            return jsonify({"error": "Missing required fields", "missing": missing_fields}), 400

        # Validate email format
        if not re.match(r"[^@]+@[^@]+\.[^@]+", data['email']):
            return jsonify({"error": "Invalid email format"}), 400

        # Validate password strength
        if len(data['password']) < 8:
            return jsonify({"error": "Password must be at least 8 characters long"}), 400
        if not re.search(r"[A-Z]", data['password']) or not re.search(r"[0-9]", data['password']):
            return jsonify({"error": "Password must contain at least one uppercase letter and one number"}), 400

        cursor = connection.cursor()
        # Check if email already exists
        cursor.execute("SELECT id FROM visitors WHERE email = %s", (data['email'],))
        if cursor.fetchone():
            return jsonify({"error": "Email already exists"}), 409

        # Generate salt and hash password
        salt = generate_salt()
        password_hash = hash_password(data['password'], salt)

        # Store salt and hash together (e.g., "salt:hash")
        stored_password = f"{salt}:{password_hash}"

        # Insert new visitor
        cursor.execute("""
            INSERT INTO visitors (
                first_name, last_name, email, password_hash
            ) VALUES (%s, %s, %s, %s)
        """, (
            data['firstName'],
            data['lastName'],
            data['email'],
            stored_password
        ))
        connection.commit()
        
        new_visitor_id = cursor.lastrowid
        
        return jsonify({
            "message": "Visitor registered successfully",
            "id": new_visitor_id
        }), 201

    except Exception as e:
        print(f"Visitor registration error: {str(e)}")
        return jsonify({"error": f"Failed to register visitor: {str(e)}"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/visitor/login', methods=['POST'])
def visitor_login():
    """Authenticate a visitor using email and password."""
    connection = get_db_connection()
    if isinstance(connection, tuple):
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM visitors WHERE email = %s", (email,))
        visitor = cursor.fetchone()
        
        if not visitor:
            return jsonify({"error": "Invalid credentials"}), 401

        # Check if password is in salted format
        password_match = False
        if ':' in visitor['password_hash']:
            # New salted format
            stored_salt, stored_hash = visitor['password_hash'].split(':')
            password_hash = hash_password(password, stored_salt)
            password_match = password_hash == stored_hash
        else:
            # Legacy unsalted SHA-256
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            password_match = password_hash == visitor['password_hash']
            if password_match:
                # Upgrade to salted hash
                salt = generate_salt()
                new_hash = hash_password(password, salt)
                new_stored_password = f"{salt}:{new_hash}"
                cursor.execute("UPDATE  visitors SET password_hash = %s WHERE id = %s", 
                              (new_stored_password, visitor['id']))
                connection.commit()

        if not password_match:
            return jsonify({"error": "Invalid credentials"}), 401

        # Update last login
        cursor.execute("UPDATE visitors SET last_login = CURRENT_TIMESTAMP WHERE id = %s", (visitor['id'],))
        connection.commit()

        # Create JWT token
        token = jwt.encode({
            'user_id': str(visitor['id']),
            'email': visitor['email'],
            'role': 'visitor',
            'exp': int(datetime.utcnow().timestamp() + 86400)
        }, app.config['SECRET_KEY'], algorithm='HS256')

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {
                "id": str(visitor['id']),
                "firstName": visitor['first_name'],
                "lastName": visitor['last_name'],
                "email": visitor['email'],
                "role": "visitor"
            },
            "dashboard": "/visitors/Dashboard"
        }), 200

    except Exception as e:
        print(f"Visitor login error: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500
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