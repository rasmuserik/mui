/* Code compiled from yolan */
load("stdlib.js");
load("yolan.js");
print("/* Code compiled from yolan */");
print("load(\"stdlib.js\");");
expr = getnext();
while(!((expr === false))) {
    print(py_compile(expr));
    expr = getnext()
};
