cp $1yl _backup_$1yl.`date +%Y%m%d-%H%M%S`
./compile.sh prettyprint.
js prettyprint.js < $1yl > _backup_prettyprint_temp.yl &&
cp _backup_prettyprint_temp.yl $1yl
diff $1yl _backup_prettyprint_temp.yl
