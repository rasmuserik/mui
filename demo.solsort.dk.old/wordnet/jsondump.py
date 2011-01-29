from google.appengine.ext import db
import cgi
from wordnet.wordnet import WordNet
#import cgitb
#cgitb.enable()


print 'Content-Type: text/javascript\n'
def main():
    params = cgi.FieldStorage()
    word= params.getfirst("word")
    entry = db.GqlQuery("SELECT * FROM WordNet WHERE word=:1", word).get()

    if entry != None:
        print entry.json
        return
    entries = db.GqlQuery("SELECT * FROM WordNet WHERE word>:1 ORDER BY word ASC", word).fetch(10)
    entries.extend(db.GqlQuery("SELECT * FROM WordNet WHERE word<:1 ORDER BY word DESC", word).fetch(10))
    entries = [str(x.word) for x in entries]
    entries.sort()
    print entries

main()
