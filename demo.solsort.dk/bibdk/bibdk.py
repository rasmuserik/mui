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

searchform = """
        <form action="/bib" method="get"> 
            <div data-role="fieldcontain">
            <div>
                <label for="dc.creator">Forfatter:</label>
                <input type="text" inputmode="latin predictOff" name="dc.creator" id="dc.creator" value="%s" /> 
            </div><div>
                <label for="dc.title">Titel:</label>
                <input type="text" inputmode="latin predictOff" name="dc.title" id="dc.title" value="%s" /> 
            </div><div>
                <label for="dc.subject">Emne:</label>
                <input type="text" inputmode="latin predictOff" name="dc.subject" id="dc.subject" value="%s" /> 
            </div><div>
                <label for="cql.serverChoice">Fritekst:</label>
                <input type="text" inputmode="latin predictOff" name="cql.serverChoice" id="cql.serverChoice" value="%s" /> 
            </div> 
            </div>
            <div>
                <input type="submit" value="S&oslash;g" name="field" />
            </div>
        </form> """ % ('', '', '', '');
header = """Content-Type: text/html; charset=UTF-8

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
        <div data-role="header">
            <h1>bibliotek...</h1>
            <a href="about" class="ui-btn-right">About</a>
        </div>
        <div data-role="content">"""
footer = """
        </div>
</div>
</body>
</html>"""

def printrecords(result):
    hits = int(result["hits"]) 
    startRecord = int(result['startRecord'])
    endRecord = startRecord + len(result['records']) - 1

    print '<ul data-role="listview" data-dividertheme="a">'
    print '<li data-role="list-divider">'
    print 'Viser post %d-%d ud af %d' % (startRecord, endRecord, hits)
    print '</li>'
    for record in result['records']:
        print (u'<li><h3><a href="%s">%s</a> <small>(%s)</small></h3> <p>%s</p></li>' % ( 
                record['dc:identifier'][0],
                u"<br/>".join(record.get('dc:title', ['Uden titel'])), 
                u",".join(record.get('dc:date', [''])), 
                u" & ".join(record.get('dc:creator', ['N.N.'])) )).encode('ascii', 'xmlcharrefreplace')
        # print record

    print '</ul>'



def main():
    print header
    params = cgi.FieldStorage()
    search = []
    for param in params:
        if param in fields:
            search.append("%s = (%s)" % (param, params.getvalue(param)))
    search = " and ".join(search)
    if not len(search) is 0:
        result = bibdkRequest(search)
    if len(search) is 0 or int(result["hits"]) is 0:
        print searchform
    else:
        printrecords(result)

    print footer
    import mylogger
    mylogger.log("")
