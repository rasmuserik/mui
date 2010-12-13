/* Code compiled from yolan */
load("lisplib.js");
load("yolan")
print("/* Code compiled from yolan */")
print("load(\"lisplib.js\");")
(expr=getnext())
while(!((expr===false))){print(compile(expr));(expr=getnext())}
