#!/bin/sh
echo "ls -> py"
python lightscript.py javascript < lightscript.ls > lightscript.js.new &&
    echo "ls -> js" &&
    js lightscript.js.new python < lightscript.ls  > lightscript.py.new && 
    echo "py ls -> ls" &&
    python lightscript.py.new lightscript < lightscript.ls  > lightscript.ls.from_py && 
    echo "py ls -> js" &&
    python lightscript.py.new javascript < lightscript.ls  > lightscript.js.from_py && 
    echo "py ls -> py" &&
    python lightscript.py.new python < lightscript.ls  > lightscript.py.from_py && 
    echo "py ls -> yl" &&
    python lightscript.py.new yolan < lightscript.ls  > lightscript.yl.from_py && 
    cp lightscript.js.from_py lightscript.js.new &&
    echo "js ls -> ls" &&
    js lightscript.js.new lightscript < lightscript.ls  > lightscript.ls.from_js && 
    echo "js ls -> js" &&
    js lightscript.js.new javascript < lightscript.ls  > lightscript.js.from_js && 
    echo "js ls -> py" &&
    js lightscript.js.new python < lightscript.ls  > lightscript.py.from_js && 
    echo "js ls -> yl" &&
    js lightscript.js.new yolan < lightscript.ls  > lightscript.yl.from_js && 
    cp lightscript.ls.from_js lightscript.ls.new &&
    echo Comparing results &&
    diff -u lightscript.ls.from_py lightscript.ls.from_js &&
    diff -u lightscript.js.from_py lightscript.js.from_js &&
    diff -u lightscript.py.from_py lightscript.py.from_js &&
    diff -u lightscript.yl.from_py lightscript.yl.from_js &&
    diff -u lightscript.ls lightscript.ls.new && 
    mv lightscript.py.new lightscript.py && 
    mv lightscript.js.new lightscript.js && 
    rm lightscript.ls.new lightscript.*.from_* &&
    echo Test done


