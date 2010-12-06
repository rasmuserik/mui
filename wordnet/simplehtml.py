from google.appengine.ext import db
from django.utils import simplejson as json
from wordnet import WordNet
import cgi
import cgitb
cgitb.enable()

import os
contentTypes = os.environ["HTTP_ACCEPT"]
if contentTypes.find("text/html") != -1:
        print 'Content-Type: text/html'
elif contentTypes.find("application/xhtml+xml") != -1:
        print 'Content-Type: application/xhtml+xml'
else: 
        print 'Content-Type: application/vnd.wap.xhtml+xml'


print """
<!DOCTYPE html >
<html>
<head> 
        <title>WordNet</title> 
        <link rel="stylesheet" href="http://code.jquery.com/mobile/1.0a1/jquery.mobile-1.0a1.min.css" />
        <script src="http://code.jquery.com/jquery-1.4.3.min.js"></script>
        <script src="http://code.jquery.com/mobile/1.0a1/jquery.mobile-1.0a1.min.js"></script>
</head> 
<body> 
<div data-role="page"><div data-role="content">
"""


def toLink(word):
        return '<a href="/wn/simplehtml?word=%s">%s</a>' % (word, word.replace("_", " "))

def printEntry(entry):
    print "<h1>%s</h1><ul>" % (entry.word.replace("_", " "),)

    #print entry.json

    meanings = json.loads(entry.json)
    for meaning in meanings:
        print "<li>"
        print "<em>"
        print meaning["desc"]
        print "</em>"
        print "<br />"
        for word in meaning["words"]:
            print " " + toLink(word),
        print "<small>(%s)</small>" % (meaning["type"],)
        print "<ul>"
        for relation in meaning["rel"]:
            print "<li><small>%s:" % (relation,)
            for word in meaning["rel"][relation]:
                print toLink(word)
            print "</small></li>"
        print "</ul>"
        print "</li>"
    print "</ul>"
    print '<a href="/wn/simplehtml?word=%s+" data-role="button" data-inline="true">index</a>' % (entry.word,)

def body():
    params = cgi.FieldStorage()
    word = params.getfirst("word")
    print """
        <form action="/wn/simplehtml" method="GET">
                <input type="text" size="20" name="word" />
                <input type="submit" value="Search" data-inline="true" />
        </form>
        """
    if word == None:
        return
    entry = db.GqlQuery("SELECT * FROM WordNet WHERE word=:1", word).get()

    if entry != None:
        printEntry(entry)
        return

    entries = db.GqlQuery("SELECT * FROM WordNet WHERE word>:1 ORDER BY word ASC", word).fetch(5)
    entries.extend(db.GqlQuery("SELECT * FROM WordNet WHERE word<:1 ORDER BY word DESC", word).fetch(5))
    entries = [str(x.word) for x in entries]
    entries.sort()
    print '<div><ul data-role="listview" data-inset="true">'
    for entry in entries:
        print '<li>%s</li>' % (toLink(entry),)
    print "</ul></div>"
    print '<div data-role="controlgroup" data-type="horizontal">'
    print '<a data-icon="arrow-l" data-role="button" href="simplehtml?word=%s+">prev</a>' % (entries[0],)
    print '<a data-icon="arrow-r" data-role="button" href="simplehtml?word=%s+">next</a>' % (entries[-1],)
    print '</div>'

body()
print """
<div style="text-align:right;font-size:50%"><a href="http://demo.solsort.dk/wn/LICENSE_FOR_DATABASE">database license</a></div>
</div></div>
</body></html>
"""
