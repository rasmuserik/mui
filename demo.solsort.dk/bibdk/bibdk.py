import xml.dom.minidom
import urllib
import urllib2
import cgi

def bibdkRequest(request, startRecord = "1", maximumRecords = "10"):
    query = {}
    query['version'] = "1.1"
    query['operation'] = "searchRetrieve"
    query['query'] = request
    query['maximumRecords'] = maximumRecords
    query['startRecord'] = startRecord
    query['recordSchema'] = "dc"
    
    params = urllib.urlencode(query)
    url = "http://webservice.bibliotek.dk/soeg?" + params
    
    dom = xml.dom.minidom.parse(urllib.urlopen(url))
    
    hits = dom.getElementsByTagName("numberOfRecords")[0].firstChild.data
    records = []
    recno = int(startRecord)
    for domrecord in dom.getElementsByTagName("recordData"):
        record = {"recno": str(recno)}
        for node in domrecord.firstChild.childNodes:
            nodename = node.nodeName
            if nodename is not '#text' and node.firstChild is not None:
                arr = record.get(nodename, [])
                arr.append(node.firstChild.data)
                record[nodename] = arr
        records.append(record)
        recno = recno + 1
    return {"hits": hits, "records": records, "query": request, "startRecord": startRecord}

fields = ["dc.creator", "dc.title", "dc.subject", "dc.identifier", "cql.serverChoice", "dc.identifier", "dc.date", "dc.type", "dc.language", "bath.personalName", "bath.possessingInstitution", "rec.id", "bath.notes"]

button = lambda title, action : (["button", title, action])

def title(txt): return ["title", txt]
def textinput(title, id): return ["textinput", title, id]
def button(title): return ["button", title]
def form(url, content): 
    result = ["form", url]
    result.extend(content)
    return result

def toHTML(ui):
    if type(ui) == str:
        return ui
    elif type(ui) == unicode:
        return ui
    elif ui[0] is "form":
        return u'<form action="%s" method="get"><div data-role="fieldcontain">%s</div></form>' % (ui[1], u''.join(map(toHTML, ui[2:])))
    elif ui[0] is "textinput":
        return u'<div><label for="%s">%s</label> <input type="text" inputmode="latin predictOff" name="%s" id="%s" value="" /></div>' % (ui[2], toHTML(ui[1]), ui[2], ui[2])
    elif ui[0] is "button":
        return u'<div><input type="submit" value="%s" name="submit" /></div>' % (ui[1],)
    elif ui[0] is "links":
        return u'<ul data-role="listview" data-inset="true" data-dividertheme="a"><li data-role="list-divider">%s</li>%s</ul>' % (ui[1], u"".join([
            u'<li><h3><a href="%s">%s</a></h3><p>%s</p></li>' % (e[0], toHTML(e[1]), toHTML(e[2])) for e in ui[2:]]))
    elif ui[0] is "text":
        return u"".join(map(toHTML, ui[1:]))
    elif ui[0] is "small":
        return "<small>" + u"".join(map(toHTML, ui[1:])) + "</small>"
    elif ui[0] is "menu":
        return '<div data-role="controlgroup" data-type="horizontal">' + " ".join(['<a data-role="button" href="%s">%s</a>' % (e[0], toHTML(e[1])) for e in ui[1:]]) + '</div>'
    else:
        return u"unknown ui: " + ui[0]

searchform = form("/bib", [
    textinput("Forfatter:", "dc.creator"), 
    textinput("Titel:", "dc.title"), 
    textinput("Emne:", "dc.subject"), 
    textinput("Fritekst:", "cql.serverChoice"), 
    button("S&oslash;g")])

htmlheader = """Content-Type: text/html; charset=UTF-8

<!DOCTYPE html PUBLIC "-//OMA//DTD XHTML Mobile 1.2//EN"
   "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd"> 
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"> 
<head> 
        <title>solsort.dk/bibliotek...</title> 
        <link rel="stylesheet" href="/static/jquery.mobile.min.css" /> 
        <script src="http://code.jquery.com/jquery-1.4.4.min.js" type="text/ecmascript"></script> 
        <script src="/static/jquery.mobile.min.js" type="text/ecmascript"></script> 
</head> 
<body>
<div data-role="page" data-theme="b">
        <div data-role="content">"""
htmlfooter = """
        </div>
</div>
</body>
</html>"""

def cons(a, b):
    result = [a]
    result.extend(b)
    return result

def push(list, val):
    list.append(val)
    return list

def printrecords(result):
    hits = int(result["hits"]) 
    startRecord = int(result['startRecord'])
    endRecord = startRecord + len(result['records']) - 1

    return push(["text", 'S&oslash;gning: "', result["query"], '"', cons("links", cons('Viser post %d-%d ud af %d' % (startRecord, endRecord, hits), [[
        record['dc:identifier'][0], 
        push(cons("text", record.get('dc:title', ['Uden titel'])), cons("small", " (" + ", ".join(record.get('dc:date', [''])) + ") ")),
        u" & ".join(record.get('dc:creator', ['N.N.']))]
            for record in result["records"]]))],
            ["menu", ["prev", "Forrige"], ["next", "N&aelig;ste"], ["/bib", "Ny s&oslash;gning"]])

def printheader():
    print htmlheader

def printbody(body):
    print toHTML(body).encode('ascii', 'xmlcharrefreplace')

def printfooter():
    print htmlfooter

def main():
    printheader()
    params = cgi.FieldStorage()
    search = []
    for param in params:
        if param in fields:
            search.append("%s = (%s)" % (param, params.getvalue(param)))
    search = " and ".join(search)
    if not len(search) is 0:
        result = bibdkRequest(search)
    if len(search) is 0 or int(result["hits"]) is 0:
        printbody(searchform)
    else:
        printbody(printrecords(result))

    printfooter()
    import mylogger
    mylogger.log("")
