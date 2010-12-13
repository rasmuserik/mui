import sys

def getch():
    c = sys.stdin.read(1)
    if c == '':
        return ']'
    else:
        return c
def array(*args):
    return [x for x in args]
def string_contains(str, elem):
    return elem in str
def array_push(arr, elem):
    arr.append(elem)
def array_join(arr, str):
    return str.join(arr)
false = False
true = True
def get_type(obj):
    return type(obj)
STRING_TYPE = get_type("")
def strjoin(*args):
    return "".join(args)
def tail(arr, n = 1):
    return arr[n:]
