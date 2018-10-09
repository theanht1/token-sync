from web3 import Web3, HTTPProvider
from .config import config


main_provider = HTTPProvider(config['MAIN_CHAIN_URL'])
w3_main = Web3(main_provider)

side_provider = HTTPProvider(config['SIDE_CHAIN_URL'])
w3_side = Web3(side_provider)

