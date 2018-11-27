import asyncio
import json
from hashlib import sha256

from api.models import Event
from .contracts import TokenMain, TokenSide
from .providers import w3_main, w3_side

filter_main = w3_main.eth.filter({'address': TokenMain.address})
filter_side = w3_side.eth.filter({'address': TokenSide.address})


def to_str(bytes_hex):
    if isinstance(bytes_hex, str):
        return bytes_hex
    return bytes_hex.hex()


def get_event_key(event):
    raw_key = {
        'blockHash': to_str(event['blockHash']),
        'transactionHash': to_str(event['transactionHash']),
        'logIndex': event['logIndex'],
        'type': event['event'],
    }

    return sha256(json.dumps(raw_key).encode('utf-8')).hexdigest()


# Check duplicate event and forward to chain events processor
def handle_event_proxy(event, chain):
    event_key = get_event_key(event)
    existed_event = Event.query.filter(Event.key == event_key).first()
    if existed_event:
        return

    serialized_event = dict(
        event.__dict__,
        **{
            'args': event['args'].__dict__,
            'transactionHash': event['transactionHash'].hex(),
            'blockHash': event['blockHash'].hex(),
        },
    )

    # TODO: event handler
    print(chain, event['event'])
    new_event = Event(key=event_key, chain=chain, type=event['event'], content=json.dumps(serialized_event))
    new_event.save()


def handle_past_events(event_filter, chain='main'):
    events = event_filter.get_all_entries()
    for event in events:
        handle_event_proxy(event, chain)


async def log_loop(event_filter, poll_interval, chain='main'):
    while True:
        for event in event_filter.get_new_entries():
            handle_event_proxy(event, chain)
        await asyncio.sleep(poll_interval)


def get_token_event_workers(chain='main'):
    if chain == 'main':
        w3 = w3_main
        token_instance = TokenMain
    else:
        w3 = w3_side
        token_instance = TokenSide

    transfer_filter = token_instance.events.Transfer().createFilter(fromBlock=0, toBlock='latest')
    buy_filter = token_instance.events.Buy().createFilter(fromBlock=0, toBlock='latest')
    confirm_buy_filter = token_instance.events.ConfirmBuy().createFilter(fromBlock=0, toBlock='latest')

    handle_past_events(transfer_filter, chain)
    handle_past_events(buy_filter, chain)
    handle_past_events(confirm_buy_filter, chain)

    return [
        log_loop(transfer_filter, 1, chain),
        log_loop(buy_filter, 1, chain),
        log_loop(confirm_buy_filter, 1, chain),
    ]


def execute_handler():
    main_workers = get_token_event_workers('main')
    side_workers = get_token_event_workers('side')

    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(asyncio.gather(*main_workers, *side_workers))
    finally:
        loop.close()


def get_unconfirmed_requests(address, chain):
    buy_events = Event.query.filter(Event.chain == chain, Event.type == 'Buy').all()
    opposite_chain = 'side' if chain == 'main' else 'main'
    confirmed_events = Event.query.filter(Event.chain == opposite_chain, Event.type == 'ConfirmBuy').all()

    if len(confirmed_events) == 0:
        return buy_events

    def is_completed(buy_event):
        buy_content = json.loads(buy_event.content)
        for confirmed_event in confirmed_events:
            confirmed_content = json.loads(confirmed_event.content)
            if confirmed_content['args']['id'] == buy_content['args']['id']:
                return False
        return True

    return list(filter(is_completed, buy_events))
