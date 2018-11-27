from api.db import db


class Event(db.Document):
    key = db.StringField()
    chain = db.StringField()
    type = db.StringField()
    content = db.StringField()

    def as_dict(self):
        return {c: str(getattr(self, c)) for c in ['key', 'chain', 'type', 'content']}
