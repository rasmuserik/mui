#!/bin/sh
#js parser2.js javascript < parser2.js > t.js 
#js parser2.js yolan < parser2.js > t.yl 
js parser2.js lightscript < parser2.js > t.ls && diff -u parser2.js t.ls
#js parser.js < parser.js

