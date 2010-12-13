cp $1yl _backup_$1yl.`date +%Y%m%d-%H%M%S`
./compile.sh prettyprint.
js prettyprint.js < $1yl > prettyprint_temp.yl &&
diff $1yl prettyprint_temp.yl &&
mv prettyprint_temp.yl $1yl
