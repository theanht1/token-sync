import json

from api.utils.providers import w3_main

with open('../secrets.json') as f:
    private_keys = json.load(f)['privateKeys']


def sign(msg):
    return w3_main.eth.account.signHash(msg, private_key=private_keys[0])
