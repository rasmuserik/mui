from google.appengine.ext import db
from django.utils import simplejson as json
from wordnet import WordNet
import cgi
import cgitb
cgitb.enable()

import os
contentTypes = os.environ["HTTP_ACCEPT"]
if contentTypes.find('application/vnd.wap.xhtml+xml') != -1:
        print 'Content-Type: application/vnd.wap.xhtml+xml; charset=UTF-8'
elif contentTypes.find("application/xhtml+xml") != -1:
        print 'Content-Type: application/xhtml+xml; charset=UTF-8'
else:
        print 'Content-Type: text/html; charset=UTF-8'

params = cgi.FieldStorage()
word = params.getfirst("word")
if word == None:
    import random
    #word = random.choice( ["justice", "hermit", "magician", "devil", "fortune", "world", "death", "hanging", "empress", "tower", "star", "temperance", "chariot", "judgement", "high_priest", "strength", "priestess", "lover", "sun", "emperor", "moon"])
    word = random.choice(["razor_edge", "morning_glory", "Niger", "tabular_array", "musculus_adductor_hallucis", "Nyctaginiablue_elderberry", "predictor_variable", "lagerphone", "fluorouracil", "jurist", "retroactive", "repossess", "homoiothermic", "lyre-flower", "Monarda_fistulosa", "cnidarian", "hedge_fund", "incertain", "roiled", "genus_Rhizobium", "refreshinglylaminator", "hay_conditioner", "horseback", "uninquiring", "jujitsu", "stub_out", "whistling", "Magnificatmagnetic_resonance", "toiling", "opsonisation", "dosimeter", "maddened", "love", "beauty", "sublimation", "fairy", "magic", "Loki", "cloud", "osculation", "timid", "book", "thesaurus", "justice", "hermit", "magician", "devil", "fortune", "world", "death", "hanging", "empress", "tower", "star", "temperance", "chariot", "judgement", "high_priest", "strength", "priestess", "lover", "sun", "emperor", "moon"])

print """
<!DOCTYPE html PUBLIC "-//OMA//DTD XHTML Mobile 1.2//EN"
   "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head> 
        <title>solsort.dk thesaurus %s</title> 
        <link type="text/css" rel="stylesheet" href="/static/style.css" />
</head> 
<body> 
""" %(word,)


def toLink(word):
        return '<a href="/thesaurus?word=%s">%s</a>' % (word, word.replace("_", " "))

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
    print '<div><a href="/thesaurus?word=%s+">index</a></div>' % (entry.word,)

def body():
    print """
        <form action="/thesaurus" method="get">
            <div>
                <input type="text" inputmode="latin predictOff" name="word" />
                <input type="submit" value="search" name="action" />
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
    print '<ul>'
    for entry in entries:
        print '<li>%s</li>' % (toLink(entry),)
    print "</ul><div>"
    print '<a href="thesaurus?word=%s+">prev</a>' % (entries[0],)
    print '<a href="thesaurus?word=%s+">next</a>' % (entries[-1],)
    print "</div>"

body()
print """
<div class="licenselink"><a href="/about">about</a></div>
</body></html>
"""

import mylogger
mylogger.log(os.environ["REMOTE_ADDR"]+str(word))
