rm -f *.pyc
python ../lightscript/lightscript2/lightscript.py python-appengine < site.ls > site.py && cat site.py
