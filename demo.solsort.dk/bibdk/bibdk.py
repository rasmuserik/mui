print """Content-Type: text/html; charset=UTF-8

<!DOCTYPE html PUBLIC "-//OMA//DTD XHTML Mobile 1.2//EN"
   "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd"> 
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"> 
<head> 
        <title>solsort.dk bibdemo</title> 
        <link rel="stylesheet" href="/static/jquery.mobile.min.css" /> 
        <script src="http://code.jquery.com/jquery-1.4.4.min.js"></script> 
        <script src="/static/jquery.mobile.min.js"></script> 
        <link type="text/css" rel="stylesheet" href="/static/style.css" /> 
</head> 
<body><div data-role="page" data-theme="c"><div data-role="content"> 
 
        <form action="/bib" method="get"> 
            <div> 
                <input type="text" inputmode="latin predictOff" name="term" /> 
                <input type="submit" value="search" name="action" /> 
            </div> 
        </form> 
        
</div></div> 
</body>
</html>"""
import mylogger
mylogger.log("")
