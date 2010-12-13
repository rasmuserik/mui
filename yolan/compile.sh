cp $1js _backup_$1js.`date +%Y%m%d-%H%M%S`
js compile.js < $1yl > compile_temp.js
mv compile_temp.js $1js
