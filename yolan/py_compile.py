# Code compiled from yolan
from stdlib import *
from yolan import *
print('# Code compiled from yolan')
print('from stdlib import *')
expr = getnext()
while not ((expr == false)):
    print(py_compile(expr))
    expr = getnext()

