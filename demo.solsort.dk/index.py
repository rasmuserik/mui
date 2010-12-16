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
   <div data-role="page" data-theme="c">
        <div data-role="header"> 
            <h1>demo.solsort.dk</h1> 
            <a href="about" class="ui-btn-right">About</a> 
        </div> 
   <div data-role="content">
         <h2>Development sandbox</h2>

         <ul data-role="listview" data-inset="true" data-dividertheme="a">
            <li data-role="list-divider">Demos</li> 

            <li><h3><a href="thesaurus">Thesaurus</a></h3></li>
            <li><h3><a href="bib">Mobilt bibliotek...</a> </h3>
                <p>(very preliminary/draft/no-relation-to-reality etc.)</p></li>
         </ul>
         <div><strong>Warning: smartphone optimised with some graceful degradation.</strong> These pages uses mobile web development libraries which are still in prerelease and buggy... this means that the pages may render suboptimally (Firefox), or not work (some versions of Internet Explorer). Should in theory work fine on Meego, iPhone, Android, as well as low-end phones with html, but not javascript support. </div>
       </div>
   </div>
   </body>
</html>"""
import mylogger
mylogger.log("")
