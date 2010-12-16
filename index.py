print """Content-Type: text/html; charset=UTF-8

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
   <head><title>demo.solsort.dk</title>
         <link rel="stylesheet" href="/static/jquery.mobile.min.css" />
         <script src="http://code.jquery.com/jquery-1.4.4.min.js"></script>
         <script src="/static/jquery.mobile.min.js"></script>
         <link type="text/css" rel="stylesheet" href="/static/style.css" />
   </head>
   <body>
   <div data-role="page">
   <div data-role="header">
   <h1>demo.solsort.dk</h1>
   </div>
   <div data-role="content">
         Development sandbox.
         <ul>
            <li><a href="oldthesaurus">Thesaurus</a> (simple mobile html)</li>
            <li><a href="thesaurus">Thesaurus</a> (smartphone optimised with graceful degradation)</li>
            <li><a href="bib">Draft of mobile version of bibliotek.dk</a> (smartphone optimised with graceful degradation)</li>
         </ul>
       </div>
   </div>
   </body>
</html>"""
import mylogger
mylogger.log("")
