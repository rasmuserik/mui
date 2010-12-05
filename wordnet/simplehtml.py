from google.appengine.ext import db
import cgi
import json
import cgitb
cgitb.enable()

class WordNetDict(db.Model):
    word = db.StringProperty(required=True)
    json = db.TextProperty(required=True)

print 'Content-Type: text/html\n'
print '<html> <head></head><body>'

def toLink(word):
        return '<a href="simplehtml?word=%s">%s</a>' % (word, word)

def printEntry(entry):
    print entry.word, ":<ul>"

    entry = json.loads(entry.json)
    for meaning in entry:
        print "<li>"
        print "</li>"
    print "</ul>"

def main():
    params = cgi.FieldStorage()
    word = params.getfirst("word")
    print """
        <form action="simplehtml" method="GET">
            <input type="text" name="word" />
            <input type="submit" value="Search wordnet"/>
        </form>
        """
    if word == None:
        return
    entry = db.GqlQuery("SELECT * FROM WordNetDict WHERE word=:1", word).get()

    if entry != None:
        printEntry(entry)
        return

    entries = db.GqlQuery("SELECT * FROM WordNetDict WHERE word>:1 ORDER BY word ASC", word).fetch(10)
    entries.extend(db.GqlQuery("SELECT * FROM WordNetDict WHERE word<:1 ORDER BY word DESC", word).fetch(10))
    entries = [str(x.word) for x in entries]
    entries.sort()
    entries = map(toLink, entries)
    print '"%s" not found, did you mean: <ul>' % (word ,)
    for entry in entries:
        print '<li>%s</li>' % (entry,)
    print '</ul>'

main()
print "</body></html>"
