#!/bin/sh
#js parser2.js javascript < parser2.js > t.js 
#js parser2.js yolan < parser2.js > t.yl 
js parser2.js javascript < parser2.ls > parser2.js.new &&
    js parser2.js.new lightscript < parser2.ls  > parser2.ls.new && 
    diff -u parser2.ls parser2.ls.new && 
    mv parser2.js.new parser2.js && 
    rm parser2.ls.new
#js parser.js < parser.js

