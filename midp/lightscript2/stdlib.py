import sys
undefined = None
true = True
false = False
def keys(obj):
    return obj.keys()

def contains(str, c):
    return c in str

def getch():
    c = sys.stdin.read(1)
    if len(c) == 0:
        return undefined
    return c

def tail(list, n = None):
    if n == None:
        n = 1
    return list[n:]

def fold(fn, list, acc):
    for i in range(len(list)):
        acc = fn(list[i], acc)
    return acc;

def array_join(list, sep):
    return sep.join(list)

def array_push(list, elem):
    list.append(elem)

def push(list, elem):
    list.append(elem)
    return list

def string_contains(str, c):
    return c in str

def strjoin(*args):
    return "".join(args)

def get_type(obj):
    return type(obj)

def is_array(obj):
    return type(obj) == type([])

def is_string(obj):
    return type(obj) == type("")

def get(obj, id, default_value):
    return obj.get(id, default_value)

def cons(obj, arr):
    result = [obj]
    result.extend(arr)
    return result

arguments = sys.argv[1:]
