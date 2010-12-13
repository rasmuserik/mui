mkdir stdlib_tmp
cp stdlib.* stdlib_tmp/
rm *.js
./compile.sh yolan.
./compile.sh py_compile.
rm *.py
cp stdlib_tmp/* .
./py_compile.sh yolan.
./py_compile.sh compile.
rm _backup_* *.pyc
rm -rf stdlib_tmp
