import asyncio
import json
from hashlib import sha256

from api.models import Event
from .contracts import TokenMain, TokenSide
from .providers import w3_main, w3_side

filter_main = w3_main.eth.filter({'address': TokenMain.address})
filter_side = w3_side.eth.filter({'address': TokenSide.address})


def get_event_key(event):
    return sha256(json.dumps({
        'blockHash': event['blockHash'].hex(),
        'transactionHash': event['transactionHash'].hex(),
        'logIndex': event['logIndex'],
        'type': event['event'],
    }).encode('utf-8')).hexdigest()


# Check duplicate event and forward to chain events processor
def handle_event_proxy(event, chain):
    event_key = get_event_key(event)
    print(event_key, Event.query.filter(Event.key == event_key))
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
    print(event, chain)
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


def handle_filter(event_filter, chain):
    handle_past_events(event_filter, chain)

    loop = asyncio.get_event_loop()
    print(chain, loop)
    try:
        loop.run_until_complete(
            asyncio.gather(
                log_loop(event_filter, 1, chain),
            )
        )
    finally:
        loop.close()


def handle_token_events(chain='main'):
    if chain == 'main':
        w3 = w3_main
        token_instance = TokenMain
    else:
        w3 = w3_side
        token_instance = TokenSide

    transfer_filter = token_instance.events.Transfer().createFilter(fromBlock=0, toBlock='latest')
    buy_filter = token_instance.events.Buy().createFilter(fromBlock=0, toBlock='latest')
    confirm_buy_filter = token_instance.events.ConfirmBuy().createFilter(fromBlock=0, toBlock='latest')

    handle_filter(transfer_filter, chain)
    handle_filter(buy_filter, chain)
    handle_filter(confirm_buy_filter, chain)


def execute_handler():
    print('here')
    handle_token_events('main')
    handle_token_events('side')
