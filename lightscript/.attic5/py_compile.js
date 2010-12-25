/* Code compiled from yolan */
load("stdlib.js");
load("yolan.js");
print('# Code compiled from yolan');
print('from stdlib import *');
expr = getnext();
while(!((expr === false))) {
    print(py_compile(expr));
    expr = getnext()
};
