from stdlib import *
#
#  Defines
#
IDENTIFIER = " id "
STRING = " string "
NUMBER = " num "
COMMENT = " comment "
PAREN = " paren "
CURLY = "dict"
#
#  Tokeniser
#
c = " "
str_acc = ""
def char_is(str = None):
    return string_contains(str, c)

def skip_char():
    global c
    c = getch()

def push_char():
    global str_acc
    str_acc = str_acc + c
    skip_char()

def pop_string():
    global str_acc
    result = str_acc
    str_acc = ""
    return result

symb = "=!<>&|/*+-%"
num = "1234567890"
alphanum = num + "_qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM"
EOF = ["(eof)"]
def next_token():
    global c
    while c != undefined and char_is(" \n\r\t"):
        skip_char()
    if c == undefined:
        return EOF
    elif c == "'" or c == "\"":
        quote = c
        skip_char()
        while c != undefined and c != quote:
            if c == "\\":
                skip_char()
                if c == "n":
                    c = "\n"
                elif c == "t":
                    c = "\t"
                elif c == "r":
                    c = "\r"
            push_char()
        skip_char()
        return [STRING, pop_string()]
    elif char_is(num):
        while char_is(num):
            push_char()
        return [NUMBER, pop_string()]
        # varname
    elif char_is(alphanum):
        while char_is(alphanum):
            push_char()
        return [pop_string()]
        # read comment or multi character symbol
    elif char_is(symb):
        if c == "/":
            push_char()
            if c == "/":
                skip_char()
                pop_string()
                while c != undefined and c != "\n":
                    push_char()
                return [COMMENT, pop_string()]
        while char_is(symb):
            push_char()
        return [pop_string()]
    else:
        push_char()
        return [pop_string()]

#
#  General pretty printing utilities
#
def string_literal(str = None):
    escape = {
        "\n": "\\n",
        "\"": "\\\"",
        "\t": "\\t",
        "\\": "\\\\",
        "\r": "\\r"
    }
    return array_join(push(fold(lambda elem, acc : (push(acc, get(escape, elem, elem))), str, ["\""]), "\""), "")

def nspace(n = None):
    result = ""
    i = 0
    while i < n:
        result = result + "    "
        i = i + 1
    return result

# print node, with parenthesis if needed
# ie. if the head of the node has lower priority than prio
# then add parenthesis around it.
def pp_prio(prettyprinter = None, node = None, indent = None, prio = None):
    if get(bp, str(node[0]), 1000) < prio:
        return "(" + prettyprinter(node, indent) + ")"
    else:
        return prettyprinter(node, indent)

def pp_infix(prettyprinter = None, name = None):
    return lambda node, indent : (pp_prio(prettyprinter, node[1], indent, bp[name]) + " " + name + " " + pp_prio(prettyprinter, node[2], indent, bp[name] + 1))

def pp_infixr(prettyprinter = None, name = None):
    return lambda node, indent : (pp_prio(prettyprinter, node[1], indent, bp[name] + 1) + " " + name + " " + pp_prio(prettyprinter, node[2], indent, bp[name]))

def pp_block(prettyprinter = None, node = None, indent = None):
    def _(elem = None, acc = None):
        acc = acc + "\n" + nspace(indent + 1) + prettyprinter(elem, indent + 1)
        if elem[0] != COMMENT:
            acc = acc + ";"
        return acc

    return fold(_, tail(node), "{") + "\n" + nspace(indent) + "}"

def pp_default(pp = None, node = None, indent = None):
    if is_string(node):
        return node
    else:
        return pp(node[0], indent) + "(" + array_join(fold(lambda elem, acc : (push(acc, pp(elem, indent))), tail(node), []), ", ") + ")"

#
#  LightScript pretty printer
#
ls = {}
def ls_tail(node = None, indent = None, str = None):
    return array_join(map(lightscript_curried(indent), tail(node)), str)

def ls_infix(name = None):
    return pp_infix(lightscript, name)

def ls_infixr(name = None):
    return pp_infixr(lightscript, name)

def ls_block(node = None, indent = None):
    return pp_block(lightscript, node, indent)

def ls_default(node = None, indent = None):
    return pp_default(lightscript, node, indent)

def lightscript(node = None, indent = None):
    indent = indent or 0
    return get(ls, str(node[0]), ls_default)(node, indent)

def lightscript_curried(indent = None):
    return lambda node : (lightscript(node, indent))

#
# JavaScript pretty printer
#
#
js = {}
def js_tail(node = None, indent = None, str = None):
    return array_join(map(javascript_curried(indent), tail(node)), str)

def js_infix(name = None):
    return pp_infix(javascript, name)

def js_infixr(name = None):
    return pp_infixr(javascript, name)

def js_block(node = None, indent = None):
    return pp_block(javascript, node, indent)

def js_default(node = None, indent = None):
    return pp_default(javascript, node, indent)

def javascript(node = None, indent = None):
    indent = indent or 0
    return get(js, str(node[0]), js_default)(node, indent)

def javascript_curried(indent = None):
    return lambda node : (javascript(node, indent))

#
# Python pretty printer
#
#
py = {}
def py_tail(node = None, indent = None, str = None):
    return array_join(map(python_curried(indent), tail(node)), str)

def py_infix(name = None):
    return pp_infix(python, name)

def py_infixr(name = None):
    return pp_infixr(python, name)

def py_block(node = None, indent = None):
    return fold(lambda elem, acc : (acc + "\n" + nspace(indent + 1) + python(elem, indent + 1)), tail(node), "")

def py_default(node = None, indent = None):
    return pp_default(python, node, indent)

def python(node = None, indent = None):
    indent = indent or 0
    return get(py, str(node[0]), py_default)(node, indent)

def python_curried(indent = None):
    return lambda node : (python(node, indent))

#
#   Operator constructors
#
bp = {}
led = {}
nud = {}
#
# utility functions
#
def readlist(acc = None, endsymb = None):
    global token
    while token[0] != endsymb and token != EOF:
        t = parse()
        if not is_separator(t[0]):
            array_push(acc, t)
    token = next_token()
    return acc

#
# syntax constructors
#
def infix(id = None, prio = None, name = None):
    name = name or id
    bp[id] = prio
    bp[name] = prio
    led[id] = lambda left, token : ([name, left, parse(prio)])
    ls[name] = ls_infix(id)
    js[name] = js_infix(id)
    py[name] = py_infix(id)

def swapinfix(id = None, prio = None, name = None):
    bp[id] = prio
    led[id] = lambda left, token : ([name, parse(prio), left])

def infixr(id = None, prio = None, name = None):
    name = name or id
    bp[id] = prio
    bp[name] = prio
    led[id] = lambda left, token : ([name, left, parse(prio - 1)])
    ls[name] = ls_infixr(id)
    js[name] = js_infixr(id)
    py[name] = py_infixr(id)

def infixlist(id = None, endsymb = None, prio = None, name = None):
    bp[id] = prio
    led[id] = lambda left, token : (readlist([name, left], endsymb))
    ls[name] = lambda node, indent : (lightscript(node[1], indent) + id + ls_tail(tail(node), indent, ", ") + endsymb)
    js[name] = lambda node, indent : (javascript(node[1], indent) + id + js_tail(tail(node), indent, ", ") + endsymb)
    py[name] = lambda node, indent : (python(node[1], indent) + id + py_tail(tail(node), indent, ", ") + endsymb)

def list(id = None, endsymb = None, name = None):
    nud[id] = lambda token : (readlist([name], endsymb))
    ls[name] = lambda node, indent : (id + ls_tail(node, indent, ", ") + endsymb)
    js[name] = lambda node, indent : (id + js_tail(node, indent, ", ") + endsymb)
    py[name] = lambda node, indent : (id + py_tail(node, indent, ", ") + endsymb)

def passthrough(id = None):
    nud[id] = lambda token : (token)
    ls[id] = lambda node, indent : (node[len(node) - 1])
    js[id] = lambda node, indent : (node[len(node) - 1])
    py[id] = lambda node, indent : (node[len(node) - 1])

def prefix(id = None):
    nud[id] = lambda token : ([id, parse()])
    ls[id] = lambda node, indent : (node[0] + " " + lightscript(node[1], indent))
    js[id] = lambda node, indent : (node[0] + " " + javascript(node[1], indent))
    py[id] = lambda node, indent : (node[0] + " " + python(node[1], indent))

def prefix2(id = None):
    nud[id] = lambda token : ([id, parse(), parse()])
    ls[id] = lambda node, indent : (node[0] + " (" + lightscript(node[1], indent) + ") " + ls_block(node[2], indent))
    js[id] = lambda node, indent : (node[0] + " (" + javascript(node[1], indent) + ") " + js_block(node[2], indent))
    py[id] = lambda node, indent : (node[0] + " (" + python(node[1], indent) + ") " + py_block(node[2], indent))

#
#  Parser
#
def default_nud(o = None):
    return cons(IDENTIFIER, o)

macros = {}
def identity(o = None):
    return o

def apply_macros(obj = None):
    return get(macros, obj[0], identity)(obj)

def parse(rbp = None):
    global token
    rbp = rbp or 0
    t = token
    token = next_token()
    left = get(nud, t[0], default_nud)(t)
    left = apply_macros(left)
    while rbp < get(bp, token[0], 0) and not is_separator(t[0]):
        t = token
        token = next_token()
        left = led[t[0]](left, t)
        left = apply_macros(left)
    return left

#
#  Syntax definitions
#
#  Definition of operator precedence and type
#
def is_separator(c = None):
    return string_contains(";,:", c)

#
infixlist("(", ")", 600, "call")
def macros_call(node = None):
    return tail(node)

macros["call"] = macros_call
#
# 
infixlist("[", "]", 600, "get")
def pp_get(prettyprinter = None):
    def result(node = None, indent = None):
        if len(node) == 3:
            return prettyprinter(node[1], indent) + "[" + prettyprinter(node[2], indent) + "]"
        else:
            assert(len(node) == 4)
            return prettyprinter(cons("call", node), indent)

    return result

ls["get"] = pp_get(lightscript)
js["get"] = pp_get(javascript)
py["get"] = pp_get(python)
#
# Standard binary operators
#
infix("*", 500)
infix("%", 500)
infix("/", 500)
infix("+", 400)
#
# [- a ?b?]
#
infix("-", 400)
prefix("-")
def pp_sub(pp = None):
    def sub(node = None, indent = None):
        if len(node) == 2:
            return "-" + pp(node[1], indent)
        else:
            return pp(node[1], indent) + " - " + pp(node[2], indent)

    return sub

ls["-"] = pp_sub(lightscript)
js["-"] = pp_sub(javascript)
py["-"] = pp_sub(python)
#
infix("==", 300, "===")
infix("===", 300, "eq?")
py["eq?"] = pp_infix(python, "==")
infix("!=", 300, "!==")
infix("!==", 300, "neq?")
py["neq?"] = pp_infix(python, "!=")
infix("<=", 300)
infix("<", 300)
swapinfix(">=", 300, "<=")
swapinfix(">", 300, "<")
infixr("&&", 250, "and")
py["and"] = pp_infixr(python, "and")
infixr("||", 200, "or")
py["or"] = pp_infixr(python, "or")
#
# [cond [cond1 body1...] [cond2 body2...] ... [else bodyelse...]]
#
prefix2("if")
infixr("else", 200)
def untable(obj = None):
    if obj[0] == CURLY:
        return tail(obj)
    else:
        return [obj]

def macros_if(obj = None):
    if obj[2][0] == CURLY:
        result = ["cond", obj[2]]
        result[1][0] = obj[1]
    elif obj[2][0] == "else":
        if obj[2][2][0] == "cond":
            result = cons("cond", obj[2][2])
            result[1] = cons(obj[1], untable(obj[2][1]))
        else:
            result = ["cond", cons(obj[1], untable(obj[2][1])), cons("else", untable(obj[2][2]))]
    else:
        print("ERROR: " + str(obj))
        assert(false)
    return result

macros["if"] = macros_if
def pp_condcasecurried(prettyprinter = None, pp_block = None, indent = None):
    def result(node = None):
        if node[0] == "else":
            return pp_block(node, indent)
        else:
            return "if (" + prettyprinter(node[0], indent) + ") " + pp_block(node, indent)

    return result

ls["cond"] = lambda node, indent : (array_join(map(pp_condcasecurried(lightscript, ls_block, indent), tail(node)), " else "))
js["cond"] = lambda node, indent : (array_join(map(pp_condcasecurried(javascript, js_block, indent), tail(node)), " else "))
def py_condcasecurried(indent = None):
    def result(node = None):
        if node[0] == "else":
            return "se:" + py_block(node, indent)
        else:
            return "if " + python(node[0], indent) + ":" + py_block(node, indent)

    return result

py["cond"] = lambda node, indent : (array_join(map(py_condcasecurried(indent), tail(node)), "\n" + nspace(indent) + "el"))
#
#
list("(", ")", PAREN)
def macros_paren(obj = None):
    if len(obj) == 2:
        return obj[1]
    else:
        return obj

macros[PAREN] = macros_paren
#
# Assignment
infix("=", 100, "set")
def macros_set(obj = None):
    if is_string(obj[1]):
        return obj
    elif obj[1][0] == "get":
        # put
        return obj
    else:
        obj[0] = "function"
        return macros["function"](obj)

macros["set"] = macros_set
#
# table
list("{", "}", CURLY)
def pp_table(prettyprinter = None):
    def result(node = None, indent = None):
        acc = []
        i = 1
        ind = indent + 1
        while i < len(node):
            if is_string(node[i]):
                node[i] = [STRING, node[i][0]]
            array_push(acc, prettyprinter(node[i], ind) + ": " + prettyprinter(node[i + 1], ind))
            i = i + 2
        if len(acc) == 0:
            return "{}"
        else:
            return "{\n" + nspace(ind) + array_join(acc, ",\n" + nspace(ind)) + "\n" + nspace(indent) + "}"

    return result

ls[CURLY] = pp_table(lightscript)
js[CURLY] = pp_table(javascript)
py[CURLY] = pp_table(python)
# [array arrayelements...]
list("[", "]", "array")
# [return expr]
prefix("return")
prefix("!")
py["!"] = lambda elem, indent : ("not " + python(elem[1], indent))
# [while condition body...]
prefix2("while")
def macros_while(node = None):
    result = cons("while", node[2])
    assert(node[2][0] == CURLY)
    result[1] = node[1]
    return result

macros["while"] = macros_while
ls["while"] = lambda node, indent : ("while (" + lightscript(node[1], indent) + ") " + ls_block(tail(node), indent))
js["while"] = lambda node, indent : ("while (" + javascript(node[1], indent) + ") " + js_block(tail(node), indent))
py["while"] = lambda node, indent : ("while " + python(node[1], indent) + ":" + py_block(tail(node), indent))
#
# [var ...]
list("var", ";", "var")
ls["var"] = lambda node, indent : ("var " + array_join(map(lightscript_curried(indent), tail(node)), ", "))
js["var"] = lambda node, indent : ("var " + array_join(map(javascript_curried(indent), tail(node)), ", "))
py["var"] = lambda node, indent : (array_join(map(python_curried(indent), tail(node)), "\n" + nspace(indent)))
list("global", ";", "global")
ls["global"] = lambda node, indent : ("global " + array_join(map(lightscript_curried(indent), tail(node)), ", "))
js["global"] = lambda node, indent : ("//global " + array_join(map(javascript_curried(indent), tail(node)), ", "))
py["global"] = lambda node, indent : ("global " + array_join(map(python_curried(indent), tail(node)), ", "))
#
# [define [fnname args...] body...]
# [lambda [args...] expr]
prefix2("function")
def macros_function(node = None):
    result = cons("define", node[2])
    assert(node[2][0] == CURLY)
    result[1] = node[1]
    if is_string(result[1]):
        result[1] = [PAREN, result[1]]
    if result[1][0] == PAREN:
        assert(len(result) == 3)
        result[0] = "lambda"
        result[1] = tail(result[1])
        if result[2][0] == "return":
            result[2] = result[2][1]
    return result

macros["function"] = macros_function
ls["define"] = lambda node, indent : (node[1][0] + "(" + array_join(map(lightscript, tail(node[1])), ", ") + ") = " + ls_block(tail(node), indent))
ls["lambda"] = lambda node, indent : ("function(" + array_join(map(lightscript, node[1]), ", ") + ") { return " + lightscript(node[2], indent) + " }")
js["define"] = lambda node, indent : ("function " + node[1][0] + "(" + array_join(map(javascript, tail(node[1])), ", ") + ") " + js_block(tail(node), indent))
js["lambda"] = lambda node, indent : ("function(" + array_join(map(javascript, node[1]), ", ") + ") { return " + javascript(node[2], indent) + " }")
py["define"] = lambda node, indent : ("def " + node[1][0] + "(" + array_join(map(lambda s : (s + " = None"), map(python, tail(node[1]))), ", ") + "):" + py_block(tail(node), indent) + "\n")
py["lambda"] = lambda node, indent : ("lambda " + array_join(map(python, node[1]), ", ") + " : (" + python(node[2], indent) + ")")
#
# 
map(passthrough, [";", ":", ",", ")", "}", "(eof)", NUMBER])
#
# 
passthrough(IDENTIFIER)
macros[IDENTIFIER] = lambda obj : (obj[1])
#
# String literals
passthrough(STRING)
ls[STRING] = lambda node, indent : (string_literal(node[1]))
js[STRING] = ls[STRING]
py[STRING] = ls[STRING]
# 
#  Comments
passthrough(COMMENT)
ls[COMMENT] = lambda node, indent : ("//" + node[1])
js[COMMENT] = ls[COMMENT]
py[COMMENT] = lambda node, indent : ("#" + node[1])
#
#  List pretty printer
#
def yolan(list = None, acc = None, indent = None):
    if acc == undefined:
        acc = []
        yolan(list, acc, 1)
        return array_join(acc, "")
    elif is_string(list):
        array_push(acc, list)
        return len(list)
    elif list[0] == NUMBER:
        array_push(acc, list[1])
        return 1
    elif list[0] == STRING:
        return len(string_literal(list[1]))
    if list[0] == COMMENT:
        array_push(acc, ";" + list[1])
        return 1000
    array_push(acc, "(")
    length = 1
    seppos = []
    first = true
    i = 0
    while i < len(list):
        if not first:
            array_push(seppos, len(acc))
            array_push(acc, " ")
        length = length + 1 + yolan(list[i], acc, indent + 1)
        first = false
        i = i + 1
    if 80 - indent < length:
        sep = strjoin("\n", nspace(indent))
    else:
        sep = " "
    i = 0
    while i < len(seppos):
        acc[seppos[i]] = sep
        i = i + 1
    if is_array(list[len(list) - 1]) and list[len(list) - 1][0] == COMMENT:
        array_push(acc, strjoin("\n", nspace(indent - 1)))
    array_push(acc, ")")
    return length

#
# dump
#
token = next_token()
prettyprinter = undefined
end_line_with_semicolon = true
if arguments[0] == "lightscript":
    prettyprinter = lightscript
elif arguments[0] == "yolan":
    prettyprinter = yolan
    end_line_with_semicolon = false
elif arguments[0] == "javascript":
    print("load(\"stdlib.js\");")
    prettyprinter = javascript
elif arguments[0] == "python":
    print("from stdlib import *")
    prettyprinter = python
    end_line_with_semicolon = false
else:
    print("expects \"lightscript\", \"yolan\", or \"javascript\" as first argument")
    print("using lightscript as default")
    prettyprinter = lightscript
#
t = parse()
while t != EOF:
    if t[0] != ";":
        #print("\n--------------\n" +uneval(t));
        #print("\n" + yolan(t));
        if end_line_with_semicolon and t[0] != COMMENT:
            lineend = ";"
        else:
            lineend = ""
        print(prettyprinter(t) + lineend)
    t = parse()
