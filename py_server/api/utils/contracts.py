from .providers import w3_main, w3_side
from .config import config
import json


with open('../build/contracts/Token.json', 'r') as f:
    token_artifact = json.load(f)

TokenMain = w3_main.eth.contract(
    address=w3_main.toChecksumAddress(token_artifact['networks'][str(config['MAIN_CHAIN_ID'])]['address']),
    abi=token_artifact['abi']
)

TokenSide = w3_side.eth.contract(
    address=w3_side.toChecksumAddress(token_artifact['networks'][str(config['SIDE_CHAIN_ID'])]['address']),
    abi=token_artifact['abi']
)

