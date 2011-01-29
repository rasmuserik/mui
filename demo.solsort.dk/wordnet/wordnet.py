from google.appengine.ext import db


class WordNet(db.Model):
    word = db.StringProperty(required=True)
    json = db.TextProperty(required=True)
