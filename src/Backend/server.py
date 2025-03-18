# server.py
from flask import Flask, request, jsonify
import mysql.connector
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'

# MySQL database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'park_conservation',
    'port': 3306
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

# Endpoint for donations
@app.route('/api/donate', methods=['POST'])
def donate():
    data = request.json
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute('''
        INSERT INTO donations (donation_type, amount, park_name, first_name, last_name, email, message, is_anonymous)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    ''', (
        data['donationType'],
        data['amount'],
        data['parkName'],
        data['firstName'],
        data['lastName'],
        data['email'],
        data['message'],
        data['isAnonymous']
    ))
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({"message": "Donation recorded successfully"}), 201

# Endpoint for booking tours
@app.route('/api/book-tour', methods=['POST'])
def book_tour():
    data = request.json
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute('''
        INSERT INTO tours (park_name, tour_name, date, time, guests, first_name, last_name, email, phone, special_requests)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    ''', (
        data['parkName'],
        data['tourName'],
        data['date'],
        data['time'],
        data['guests'],
        data['firstName'],
        data['lastName'],
        data['email'],
        data['phone'],
        data['specialRequests']
    ))
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({"message": "Tour booked successfully"}), 201

# Endpoint for services
@app.route('/api/services', methods=['POST'])
def services():
    data = request.form
    files = request.files
    connection = get_db_connection()
    cursor = connection.cursor()

    company_registration = files['companyRegistration'].read()
    application_letter = files['applicationLetter'].read()

    cursor.execute('''
        INSERT INTO services (first_name, last_name, email, phone, company_type, provided_service, company_name, tax_id, company_registration, application_letter)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    ''', (
        data['firstName'],
        data['lastName'],
        data['email'],
        data['phone'],
        data['companyType'],
        data['providedService'],
        data['companyName'],
        data['taxID'],
        company_registration,
        application_letter
    ))
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({"message": "Service application submitted successfully"}), 201

if __name__ == '__main__':
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    app.run(debug=True,port=5000,auto_reload=True)