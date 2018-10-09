from mongoalchemy import session

from api.db import db
from api.utils.events_handler import execute_handler

db.session = session.Session.connect('knp')
db.Document._session = db.session

if __name__ == '__main__':
    # Start events handler
    execute_handler()
