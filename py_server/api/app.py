import json

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from web3 import Web3

from api.models import Event
from api.utils import sign
from api.utils.contracts import TokenMain, TokenSide
from api.utils.events_handler import get_unconfirmed_requests, get_event_key
from .db import db

# Create and configure app
app = Flask(__name__)
app.config['MONGOALCHEMY_DATABASE'] = 'knp'

# CORS
CORS(app)

# Connect to db
db.init_app(app)

@app.route('/')
def hello():
    return 'Hello, boys'


@app.route('/api/balance')
def get_balance():
    account = request.args.get('account')
    main_balance = TokenMain.functions.balanceOf(Web3.toChecksumAddress(account)).call()
    side_balance = TokenSide.functions.balanceOf(Web3.toChecksumAddress(account)).call()

    return jsonify({
        'account': account,
        'mainBalance': main_balance,
        'sideBalance': side_balance,
    })


@app.route('/api/unconfirmed-requests')
def unconfirmed_requests():
    address = request.args.get('address')
    main_requests = get_unconfirmed_requests(address, 'main')
    side_requests = get_unconfirmed_requests(address, 'side')
    return jsonify({
        'mainRequests': list(map(lambda x: x.as_dict(), main_requests)),
        'sideRequests': list(map(lambda x: x.as_dict(), side_requests)),
    })


@app.route('/api/retrieve-msg', methods=['POST'])
def sign_event():
    body = request.get_json()['event']
    event_key = get_event_key(body)
    event = Event.query.filter(Event.key == event_key).first()

    if event is None:
        return make_response(jsonify({'error': 'Event not found'}), 404)

    event_content = json.loads(event.content)
    args = event_content['args']
    msg = Web3.soliditySha3(['uint256', 'address', 'uint256'], [args['id'], args['to'], args['value']]).hex()
    signed_msg = sign(msg)

    return jsonify({
        'signedMsg': signed_msg['signature'].hex(),
    })
