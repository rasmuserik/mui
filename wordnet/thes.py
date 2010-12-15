from google.appengine.ext import db
from django.utils import simplejson as json
from wordnet import WordNet
import cgi
import cgitb
cgitb.enable()

import os
contentTypes = os.environ["HTTP_ACCEPT"]
#if contentTypes.find('application/vnd.wap.xhtml+xml') != -1:
#        print 'Content-Type: application/vnd.wap.xhtml+xml; charset=UTF-8'
#elif contentTypes.find("application/xhtml+xml") != -1:
#        print 'Content-Type: application/xhtml+xml; charset=UTF-8'
#else:
#        print 'Content-Type: text/html; charset=UTF-8'

#print 'Content-Type: application/xhtml+xml; charset=UTF-8'
print 'Content-Type: text/html; charset=UTF-8'

params = cgi.FieldStorage()
word = params.getfirst("word")
if word == None:
    import random
    alphabet = 'qwertyuiopasdfghjklzxcvbnm'
    word = random.choice(alphabet) + random.choice(alphabet) + random.choice(alphabet) + " "

print """
<!DOCTYPE html PUBLIC "-//OMA//DTD XHTML Mobile 1.2//EN"
   "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head> 
        <title>solsort.dk thesaurus %s</title> 
        <link rel="stylesheet" href="/static/jquery.mobile.min.css" />
        <script src="http://code.jquery.com/jquery-1.4.4.min.js"></script>
        <script src="/static/jquery.mobile.min.js"></script>
        <link type="text/css" rel="stylesheet" href="/static/style.css" />
</head> 
<body><div data-role="page" data-theme="c"><div data-role="content">
""" %(word,)


def toLink(word):
        return '<a href="/thes?word=%s">%s</a>' % (word, word.replace("_", " "))

def printEntry(entry):
    print "<h1>%s</h1>" % (entry.word.replace("_", " "),)

    #print entry.json

    meanings = json.loads(entry.json)
    for meaning in meanings:
        print '<div class="meaningentry"><span class="worddesc">'
        print meaning["desc"]
        print "</span>"
        print "<br />"
        for word in meaning["words"]:
            # extra span, to make sure certain mobile browsers detect whitespace between links
            print " %s <span> </span> " % ( toLink(word), )
        print '<span class="wordtype">(%s)</span>' % (meaning["type"],)
        print "<ul>"
        for relation in meaning["rel"]:
            print '<li class="wordrelation">%s:' % (relation,)
            for word in meaning["rel"][relation]:
                # extra span, to make sure certain mobile browsers detect whitespace between links
                print " <span> </span> %s" % ( toLink(word), )
            print "</li>"
        print "</ul></div>"
    print '<div><a href="/thes?word=%s+" data-role="button" data-inline="true">index</a></div>' % (entry.word,)

def body():
    print """
        <form action="/thes" method="get">
            <div>
                <input type="text" inputmode="latin predictOff" name="word" />
                <input type="submit" value="search" name="action" data-inline="true" />
            </div>
        </form>
        """
    entry = db.GqlQuery("SELECT * FROM WordNet WHERE word=:1", word).get()

    if entry != None:
        printEntry(entry)
        return

    entries = db.GqlQuery("SELECT * FROM WordNet WHERE word>:1 ORDER BY word ASC", word).fetch(5)
    entries.extend(db.GqlQuery("SELECT * FROM WordNet WHERE word<:1 ORDER BY word DESC", word).fetch(5))
    entries = [str(x.word) for x in entries]
    entries.sort()
    print '<ul data-role="listview" data-inset="true">'
    for entry in entries:
        print '<li>%s</li>' % (toLink(entry),)
    print '</ul><div data-role="controlgroup" data-type="horizontal">'
    print '<a href="/thes?word=%s+" data-role="button">prev</a>' % (entries[0],)
    print '<a href="/thes?word=%s+" data-role="button">next</a>' % (entries[-1],)
    print "</div>"

body()
print """
<div class="licenselink"><a href="/about">about</a></div>
</div></div>
</body></html>
"""

import mylogger
mylogger.log(os.environ["REMOTE_ADDR"]+str(word))
