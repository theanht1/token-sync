from flask import Flask, request, jsonify

from .db import db

# Create and configure app
app = Flask(__name__)
app.config['MONGOALCHEMY_DATABASE'] = 'knp'

# Connect to db
db.init_app(app)

@app.route('/')
def hello():
    return 'Hello, boys'


@app.route('/api/retrieve-msg', methods=['POST'])
def sign_event():
    body = request.json()
    return jsonify(body)
