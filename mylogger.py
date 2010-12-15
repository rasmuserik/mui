from google.appengine.ext import db
import os

class RequestLog(db.Model):
    created = db.DateTimeProperty(auto_now_add=True)
    environ = db.TextProperty(required=True)
    extra = db.TextProperty()

def log(extra):
    req = RequestLog(environ=str(os.environ), extra=extra);
    db.put(req)
