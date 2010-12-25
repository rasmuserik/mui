# Code compiled from yolan
from stdlib import *
from yolan import *
print('/* Code compiled from yolan */')
print('load("stdlib.js");')
expr = getnext()
while not ((expr == false)):
    print(strjoin(compile(expr), ';'))
    expr = getnext()

