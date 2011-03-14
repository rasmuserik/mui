from google.appengine.ext import db
import cgi
from wordnet.wordnet import WordNet


print "Conent-Type: text/plain\n\n"
def main():
    #    if os.environ.get("HTTP_HOST") != "localhost:8080":
    #    print 'update disabled as the database has already been uploaded'
    #    return
    params = cgi.FieldStorage()
    key = params.getfirst("key")
    value = params.getfirst("value")
    if key == None or value == None:
        print 'ERROR: key and value needed!'
        return
    entry = db.GqlQuery("SELECT * FROM WordNet WHERE word=:1", key).get()

    # Avoid duplicates
    if entry != None:
        print "Entry already there"
        return
    e = WordNet(word = key, json = value)
    e.put()
    print "Entry added"

main()
