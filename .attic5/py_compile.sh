cp $1py _backup_$1py.`date +%Y%m%d-%H%M%S`
js py_compile.js < $1yl > compile_temp.py
mv compile_temp.py $1py
