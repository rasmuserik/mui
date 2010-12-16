import xml.parsers.expat
import urllib2
import cgi
params = cgi.FieldStorage()

forfatter = params.getfirst("forfatter") or ""
titel = params.getfirst("titel") or ""
emne = params.getfirst("emne") or ""
fritekst = params.getfirst("fritekst") or ""



countdown = 0
searchresult = ""
if forfatter == "" and titel == ""  and emne == "" and fritekst == "":
    pass
else:
    searchurl = 'http://bibliotek.dk/vis.php?origin=sogning&field4=forfatter&term4=%s&term2=%s&field2=titel&term3=%s&field3=emne&field1=fritekst&term1=%s&mat_text=""&mat_ccl=&term_mat[]=&field_sprog=&term_sprog[]=&field_aar=year_eq&term_aar[]=' % (forfatter, titel, emne, fritekst)
    lines = urllib2.urlopen(searchurl).readlines()

    for i in range(0, len(lines)):
        if lines[i][0:23] == '         title="Bestil ':
                searchresult += '<li>' + lines[i][23:-5] + '</li>'
                #searchresult += lines[i-3]
    searchresult = '<ul data-role="listview" data-inset="true">' + searchresult + '</ul>'

searchform = """
        <form action="/bib" method="get"> 
            <div data-role="fieldcontain">
            <div>
                <label for="forfatter">Forfatter:</label>
                <input type="text" inputmode="latin predictOff" name="forfatter" id="forfatter" value="%s" /> 
            </div><div>
                <label for="titel">Titel:</label>
                <input type="text" inputmode="latin predictOff" name="titel" id="titel" value="%s" /> 
            </div><div>
                <label for="emne">Emne:</label>
                <input type="text" inputmode="latin predictOff" name="emne" id="emne" value="%s" /> 
            </div><div>
                <label for="fritekst">Fritekst:</label>
                <input type="text" inputmode="latin predictOff" name="fritekst" id="fritekst" value="%s" /> 
            </div> 
            </div>
            <div>
                <input type="submit" value="Søg" name="field" />
            </div>
        </form> """ % (forfatter, titel, emne, fritekst);
print """Content-Type: text/html; charset=UTF-8

<!DOCTYPE html PUBLIC "-//OMA//DTD XHTML Mobile 1.2//EN"
   "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd"> 
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"> 
<head> 
        <title>solsort.dk/bibliotek.dk</title> 
        <link rel="stylesheet" href="/static/jquery.mobile.min.css" /> 
        <script src="http://code.jquery.com/jquery-1.4.4.min.js" type="text/ecmascript"></script> 
        <script src="/static/jquery.mobile.min.js" type="text/ecmascript"></script> 
</head> 
<body>
<div data-role="page" data-theme="b">
        <div data-role="header">
            <h1>bibliotek.dk</h1>
            <a href="login" class="ui-btn-right">login</a>
        </div>
        <div data-role="content">"""
print searchresult
print searchform
print """
        </div>
</div>
</body>
</html>"""

import mylogger
mylogger.log("")
