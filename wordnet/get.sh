wget http://wordnetcode.princeton.edu/3.0/WNdb-3.0.tar.gz -O - | tar xvz
tail -q -n +30 dict/data.* > data
rm -rf dict
