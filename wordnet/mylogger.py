from google.appengine.ext import db
import os

class RequestLog(db.Model):
    created = db.DateTimeProperty(auto_now_add=True)
    environ = db.TextProperty(required=True)

RequestLog(environ=str(os.environ)).put()
