from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error
import os
from datetime import datetime
from flask_cors import CORS
import random


app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'

# Allow specific origins
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:8081", "http://127.0.0.1:8081", "http://localhost:8080",  "http://127.0.0.1:8080","http://localhost:8082",  "http://127.0.0.1:8082", "http://localhost:8083",  "http://127.0.0.1:8083"]
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




@app.route('/api/book-tour', methods=['POST'])
def book_tour():
    connection = get_db_connection()
    cursor = None
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        data = request.json
        required_fields = ['parkName', 'tourName', 'date', 'time', 'guests', 'firstName', 'lastName', 'email']

        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        cursor = connection.cursor()
        cursor.execute('''
            INSERT INTO tours (
                park_name, tour_name, date, time, 
                guests, first_name, last_name, 
                email, phone, special_requests
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ''', (
            data['parkName'],
            data['tourName'],
            data['date'],
            data['time'],
            int(data['guests']),
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
        return jsonify({"error": "Database operation failed"}), 500

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


if __name__ == '__main__':
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    app.run(debug=True, port=5000)