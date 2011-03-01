cp $1js _backup_$1js.`date +%Y%m%d-%H%M%S`
python compile.py < $1yl > compile_temp.js
mv compile_temp.js $1js
