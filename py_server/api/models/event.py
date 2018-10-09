from api.db import db


class Event(db.Document):
    key = db.StringField()
    chain = db.StringField()
    type = db.StringField()
    content = db.StringField()

