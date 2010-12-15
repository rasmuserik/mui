import os
import httplib, urllib
import json

print "Retrieving database if not exists..."
os.system("test -f database.wordnet || " +
    "((wget http://wordnetcode.princeton.edu/3.0/WNdb-3.0.tar.gz -O - | tar xvz) && " +
    "(tail -q -n +30 dict/data.* > database.wordnet) && " +
    "rm -rf dict)")

print "Creating mapping from wordnet references to ids..."
ids = {}
nextid = 0
for line in open("database.wordnet"):
    line = line.split()
    if line[2] == "s":
        line[2] = "a"
    id = line[0] + line[2]
    ids[id] = nextid
    nextid = nextid + 1

print "Extracting synsets..."
types = {
    "00": "adj.all",
    "01": "adj.pert",
    "02": "adv.all",
    "03": "noun.Tops",
    "04": "noun.act",
    "05": "noun.animal",
    "06": "noun.artifact",
    "07": "noun.attribute",
    "08": "noun.body",
    "09": "noun.cognition",
    "10": "noun.communication",
    "11": "noun.event",
    "12": "noun.feeling",
    "13": "noun.food",
    "14": "noun.group",
    "15": "noun.location",
    "16": "noun.motive",
    "17": "noun.object",
    "18": "noun.person",
    "19": "noun.phenomenon",
    "20": "noun.plant",
    "21": "noun.possession",
    "22": "noun.process",
    "23": "noun.quantity",
    "24": "noun.relation",
    "25": "noun.shape",
    "26": "noun.state",
    "27": "noun.substance",
    "28": "noun.time",
    "29": "verb.body",
    "30": "verb.change",
    "31": "verb.cognition",
    "32": "verb.communication",
    "33": "verb.competition",
    "34": "verb.consumption",
    "35": "verb.contact",
    "36": "verb.creation",
    "37": "verb.emotion",
    "38": "verb.motion",
    "39": "verb.perception",
    "40": "verb.possession",
    "41": "verb.social",
    "42": "verb.stative",
    "43": "verb.weather",
    "44": "adj.ppl"}
relations = {
    "^": "Also see",
    "!": "Antonym",
    "=": "Attribute",
    ">": "Cause",
    ";c": "Domain of synset - TOPIC",
    "-c": "Member of this domain - TOPIC",
    "+": "Derivationally related form",
    "\\": "Derived from adjective / Pertainym (pertains to noun)",
    "*": "Entailment",
    "@": "Hypernym",
    "~": "Hyponym",
    "@i": "Instance Hypernym",
    "~i": "Instance Hyponym",
    "#m": "Member holonym",
    "%m": "Member meronym",
    "<": "Participle of verb",
    "#p": "Part holonym",
    "%p": "Part meronym",
    ";r": "Domain of synset - REGION",
    "-r": "Member of this domain - REGION",
    "&": "Similar to",
    "#s": "Substance holonym",
    "%s": "Substance meronym",
    ";u": "Domain of synset - USAGE ",
    "-u": "Member of this domain - USAGE",
    "$": "Verb Group"}

nextid = 0
synsets = []
for line in open("database.wordnet"):
    fields = line.split()
    result = {}
    result["type"] = types[fields[1]]
    result["id"] = nextid
    result["desc"] = line.split("|")[1].strip()

    # fetch words
    result["words"] = []
    pos = 4
    count = int(fields[3],16)
    while count > 0 :
        word = fields[pos]
        result["words"].append(word)
        pos += 2
        count = count - 1


    # fetch syngroups
    count = int(fields[pos], 10)
    pos += 1
    result["relations"] = []
    while count > 0 :
        result["relations"].append({"rel": relations[fields[pos]], "id": ids[fields[pos+1] + fields[pos+2]]});
        pos = pos + 4
        count = count - 1
    synsets.append(result)
    #print "synset(", nextid, ", ", result, ");"
    nextid = nextid + 1


print "Transforming synsets into word entries..."
def uniq(a):
    t = {}
    for x in a:
        t[x] = True
    t2 = t.keys()
    t2.sort()
    return t2

words = {}
for synset in synsets:
    meaning = {}
    meaning["desc"] = synset["desc"]
    meaning["words"] = synset["words"]
    meaning["type"] = synset["type"]
    meaning["rel"] = {}
    for elem in synset["relations"]:
        terms = meaning["rel"].get(elem["rel"], [])
        terms.extend(synsets[elem["id"]]["words"])
        meaning["rel"][elem["rel"]] = uniq(terms)
    for word in meaning["words"]:
        entry = words.get(word, [])
        entry.append(meaning)
        words[word] = entry


print "Saving result..."
wordlist = words.keys()
#wordlist.sort()
outfile = open("database.json", "w")

for word in wordlist:
    outfile.write(word)
    outfile.write(" ")
    outfile.write(str(words[word]))
    outfile.write("\n")
    params = urllib.urlencode({'key': word.lower(), 'value': json.dumps(words[word])})
    headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/plain"}
    if True: #len(params) > 1000:
        print word
        #con = httplib.HTTPConnection("rasmuserik.appspot.com")
        con = httplib.HTTPConnection("localhost:8080")
        con.request("POST", "/wn/upload", params, headers);
        con.close()
