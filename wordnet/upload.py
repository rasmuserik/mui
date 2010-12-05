from google.appengine.ext import db
import cgi
import os

class WordNet(db.Model):
    word = db.StringProperty(required=True)
    json = db.TextProperty(required=True)

def header():
    #print 'Content-Type: application/xhtml+xml; charset=UTF-8\n\n'
    print 'Content-Type: text/html; charset=UTF-8\n\n'
    print '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
    print '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">',
    print '<head><title>foo</title></head><body>',

def body():

    #    if os.environ.get("HTTP_HOST") != "localhost:8080":
    #    print 'update disabled as the database has already been uploaded'
    #    return
    params = cgi.FieldStorage()
    key = params.getfirst("key")
    value = params.getfirst("value")
    if key == None or value == None:
        print '<h1>ERROR: key and value needed!</h1>'
        return
    e = WordNet(word = key, json = value)
    e.put()

def footer():
    print '</body></html>',

header()
body()
footer()
