# Code compiled from yolan
from stdlib import *
# 
# Utility definitions
# 
def str_escape(str):
    # local vars: i, escape, acc
    acc = array()
    escape = {'\n':'\\n', '\'':'\\\'', '\t':'\\t', '\\':'\\\\', '\r':'\\r'}
    array_push(acc, '\'')
    i = 0
    while (i < len(str)):
        array_push(acc, (escape.get(str[i], None) or str[i]))
        i = (i + 1)
    
    array_push(acc, '\'')
    return(array_join(acc, ''))

# 
# Parser
# 
def nextc():
    global c
    c = getch()

nextc()
def getnext():
    global c
    # local vars: result, elem, quote
    result = array()
    while string_contains(' \n\r\t', c):
        nextc()
    
    if (c == '['):
        nextc()
        elem = getnext()
        while not ((elem == false)):
            array_push(result, elem)
            elem = getnext()
        
        return(result)
    elif (c == ']'):
        nextc()
        return(false)
    elif (c == '\''):
        nextc()
        while not ((c == '\'')):
            if (c == '\\'):
                nextc()
                if (c == 'n'):
                    c = '\n'
                elif (c == 'r'):
                    c = '\r'
                elif (c == 't'):
                    c = '\t'
                
            
            array_push(result, c)
            nextc()
        
        nextc()
        return(array('str', array_join(result, '')))
    elif string_contains('0123456789', c):
        while string_contains('0123456789', c):
            array_push(result, c)
            nextc()
        
        return(array('num', array_join(result, '')))
    else:
        while not (string_contains(' \n\r\t[]', c)):
            array_push(result, c)
            nextc()
        
        return(array_join(result, ''))
    

# 
# JavaScript Compiler
# 
indent_count = 0
def increase_indent():
    global indent_count
    indent_count = (indent_count + 1)

def decrease_indent():
    global indent_count
    indent_count = (indent_count - 1)

def indent():
    global indent_count
    # local vars: i, result
    result = ''
    i = indent_count
    while (0 < i):
        result = (result + '    ')
        i = (i - 1)
    
    return(result)

def infixraw(name, expr):
    return(strjoin(compile(expr[1]), ' ', name, ' ', compile(expr[2])))

def infix(name, expr):
    return(strjoin('(', infixraw(name, expr), ')'))

def tailblock(expr, n):
    # local vars: result
    increase_indent()
    result = strjoin(' {\n', indent(), array_join(map(compile, tail(expr, n)), strjoin(';\n', indent())))
    decrease_indent()
    return(strjoin(result, '\n', indent(), '}'))

def tableentry(expr):
    return(strjoin(compile(expr[0]), ':', compile(expr[1])))

def compileif(expr):
    # local vars: condition
    if (expr[0] == 'else'):
        condition = ''
    else:
        condition = strjoin('if(', compile(expr[0]), ')')
    
    return(strjoin(condition, tailblock(expr, 1)))

def compile(expr):
    # local vars: expr_head
    expr_head = expr[0]
    if (get_type(expr) == STRING_TYPE):
        return(expr)
    elif (expr_head == 'define'):
        return(strjoin('function ', expr[1][0], '(', array_join(tail(expr[1]), ', '), ')', tailblock(expr, 2)))
    elif (expr_head == 'locals'):
        return(strjoin('var ', array_join(tail(expr), ', ')))
    elif (expr_head == 'globals'):
        return(strjoin('// global vars: ', array_join(tail(expr), ', ')))
    elif (expr_head == 'set'):
        return(infixraw('=', expr))
    elif (expr_head == 'num'):
        return(expr[1])
    elif (expr_head == 'str'):
        return(str_escape(expr[1]))
    elif (expr_head == 'table'):
        return(strjoin('{', array_join(map(tableentry, tail(expr)), ', '), '}'))
    elif (expr_head == ';'):
        return(strjoin('// ', array_join(tail(expr), ' ')))
    elif (expr_head == 'idx'):
        return(strjoin(compile(expr[1]), '[', compile(expr[2]), ']'))
    elif (expr_head == 'get'):
        return(strjoin(compile(expr[1]), '[', compile(expr[2]), ']'))
    elif (expr_head == 'not'):
        return(strjoin('!(', compile(expr[1]), ')'))
    elif (expr_head == 'eq?'):
        return(infix('===', expr))
    elif (expr_head == '<'):
        return(infix('<', expr))
    elif (expr_head == '+'):
        return(infix('+', expr))
    elif (expr_head == '-'):
        return(infix('-', expr))
    elif (expr_head == 'or'):
        return(infix('||', expr))
    elif (expr_head == 'and'):
        return(infix('&&', expr))
    elif (expr_head == 'load'):
        return(strjoin('load("', expr[1], '.js")'))
    elif (expr_head == 'cond'):
        return(array_join(map(compileif, tail(expr)), ' else '))
    elif (expr_head == 'while'):
        return(strjoin('while(', compile(expr[1]), ')', tailblock(expr, 2)))
    else:
        return(strjoin(expr_head, '(', array_join(map(compile, tail(expr)), ', '), ')'))
    

# 
# Python Compiler
# 
def py_infixraw(name, expr):
    return(strjoin(py_compile(expr[1]), ' ', name, ' ', py_compile(expr[2])))

def py_infix(name, expr):
    return(strjoin('(', py_infixraw(name, expr), ')'))

def py_tailblock(expr, n):
    # local vars: result
    increase_indent()
    result = strjoin('\n', indent(), array_join(map(py_compile, tail(expr, n)), strjoin('\n', indent())))
    decrease_indent()
    return(strjoin(result, '\n', indent()))

def py_tableentry(expr):
    return(strjoin(py_compile(expr[0]), ':', py_compile(expr[1])))

def py_compileif(expr):
    # local vars: condition
    if (expr[0] == 'else'):
        condition = 'se:'
    else:
        condition = strjoin('if ', py_compile(expr[0]), ':')
    
    return(strjoin(condition, py_tailblock(expr, 1)))

def py_compile(expr):
    # local vars: expr_head
    expr_head = expr[0]
    if (get_type(expr) == STRING_TYPE):
        return(expr)
    elif (expr_head == 'define'):
        return(strjoin('def ', expr[1][0], '(', array_join(tail(expr[1]), ', '), '):', py_tailblock(expr, 2)))
    elif (expr_head == 'locals'):
        return(strjoin('# local vars: ', array_join(tail(expr), ', ')))
    elif (expr_head == 'globals'):
        return(strjoin('global ', array_join(tail(expr), ', ')))
    elif (expr_head == 'set'):
        return(py_infixraw('=', expr))
    elif (expr_head == 'num'):
        return(expr[1])
    elif (expr_head == 'str'):
        return(str_escape(expr[1]))
    elif (expr_head == 'table'):
        return(strjoin('{', array_join(map(py_tableentry, tail(expr)), ', '), '}'))
    elif (expr_head == ';'):
        return(strjoin('# ', array_join(tail(expr), ' ')))
    elif (expr_head == 'idx'):
        return(strjoin(compile(expr[1]), '[', compile(expr[2]), ']'))
    elif (expr_head == 'get'):
        return(strjoin(py_compile(expr[1]), '.get(', py_compile(expr[2]), ', None)'))
    elif (expr_head == 'not'):
        return(strjoin('not (', py_compile(expr[1]), ')'))
    elif (expr_head == 'eq?'):
        return(py_infix('==', expr))
    elif (expr_head == '<'):
        return(py_infix('<', expr))
    elif (expr_head == '+'):
        return(py_infix('+', expr))
    elif (expr_head == '-'):
        return(py_infix('-', expr))
    elif (expr_head == 'or'):
        return(py_infix('or', expr))
    elif (expr_head == 'and'):
        return(py_infix('and', expr))
    elif (expr_head == 'load'):
        return(strjoin('from ', expr[1], ' import *'))
    elif (expr_head == 'cond'):
        return(array_join(map(py_compileif, tail(expr)), 'el'))
    elif (expr_head == 'while'):
        return(strjoin('while ', py_compile(expr[1]), ':', py_tailblock(expr, 2)))
    else:
        return(strjoin(expr_head, '(', array_join(map(py_compile, tail(expr)), ', '), ')'))
    

# 
# Pretty printer
# 
def nspace(n):
    # local vars: result
    result = ''
    while (0 < n):
        result = (result + ' ')
        n = (n - 1)
    
    return(result)

def prettyprint(list, acc, indent):
    # local vars: str, i, escape, seppos, first, sep, length
    if not (acc):
        acc = array()
        prettyprint(list, acc, 4)
        return(array_join(acc, ''))
    elif (list[0] == 'num'):
        array_push(acc, list[1])
        return(1)
    elif (list[0] == 'str'):
        escape = {'\n':'\\n', '\'':'\\\'', '\t':'\\t', '\\':'\\\\', '\r':'\\r'}
        str = list[1]
        array_push(acc, '\'')
        i = 0
        while (i < len(str)):
            array_push(acc, (escape.get(str[i], None) or str[i]))
            i = (i + 1)
        
        array_push(acc, '\'')
        return(len(str))
    elif (get_type(list) == STRING_TYPE):
        array_push(acc, list)
        return(len(list))
    
    array_push(acc, '[')
    length = 1
    seppos = array()
    first = true
    i = 0
    while (i < len(list)):
        if not (first):
            array_push(seppos, len(acc))
            array_push(acc, '')
        
        length = ((length + 1) + prettyprint(list[i], acc, (indent + 4)))
        first = false
        i = (i + 1)
    
    if ((110 - indent) < length):
        sep = strjoin('\n', nspace(indent))
    else:
        sep = ' '
    
    i = 0
    while (i < len(seppos)):
        put(acc, seppos[i], sep)
        i = (i + 1)
    
    array_push(acc, ']')
    return(length)

