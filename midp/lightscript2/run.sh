#!/bin/sh
#js lightscript.js javascript < lightscript.js > t.js 
#js lightscript.js yolan < lightscript.js > t.yl 
python lightscript.py python < lightscript.ls > lightscript.py.new &&
    python lightscript.py.new lightscript < lightscript.ls  > lightscript.ls.new && 
    diff -u lightscript.ls lightscript.ls.new && 
    mv lightscript.py.new lightscript.py && 
    rm lightscript.ls.new
#js parser.js < parser.js

