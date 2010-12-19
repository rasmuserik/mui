#!/bin/sh
#js lightscript.js javascript < lightscript.js > t.js 
#js lightscript.js yolan < lightscript.js > t.yl 
js lightscript.js javascript < lightscript.ls > lightscript.js.new &&
    js lightscript.js.new lightscript < lightscript.ls  > lightscript.ls.new && 
    diff -u lightscript.ls lightscript.ls.new && 
    mv lightscript.js.new lightscript.js && 
    rm lightscript.ls.new
#js parser.js < parser.js

