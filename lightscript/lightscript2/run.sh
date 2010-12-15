#!/bin/sh
js parser2.js < parser2.js > t && diff -u parser2.js t
#js parser.js < parser.js

