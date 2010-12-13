cp $1py _backup_$1py.`date +%Y%m%d-%H%M%S`
python py_compile.py < $1yl > compile_temp.py
mv compile_temp.py $1py
