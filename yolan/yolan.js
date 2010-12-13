/* Code compiled from yolan */
load("stdlib.js");
// ;
// Parser;
// ;
function nextc() {
    // global vars: c;
    c = getch()
};
nextc();
function getnext() {
    // global vars: c;
    var result, elem, quote;
    result = array();
    while(string_contains(" \n\r\t", c)) {
        nextc()
    };
    if((c === "[")) {
        nextc();
        elem = getnext();
        while(!((elem === false))) {
            array_push(result, elem);
            elem = getnext()
        };
        return(result)
    } else if((c === "]")) {
        nextc();
        return(false)
    } else if((c === "'")) {
        nextc();
        while(!((c === "'"))) {
            if((c === "\\")) {
                nextc();
                if((c === "n")) {
                    c = "\n"
                } else if((c === "r")) {
                    c = "\r"
                } else if((c === "t")) {
                    c = "\t"
                }
            };
            array_push(result, c);
            nextc()
        };
        nextc();
        return(array("str", array_join(result, "")))
    } else if(string_contains("0123456789", c)) {
        while(string_contains("0123456789", c)) {
            array_push(result, c);
            nextc()
        };
        return(array("num", array_join(result, "")))
    } else  {
        while(!(string_contains(" \n\r\t[]", c))) {
            array_push(result, c);
            nextc()
        };
        return(array_join(result, ""))
    }
};
// ;
// JavaScript Compiler;
// ;
indent_count = 0;
function increase_indent() {
    // global vars: indent_count;
    indent_count = (indent_count + 1)
};
function decrease_indent() {
    // global vars: indent_count;
    indent_count = (indent_count - 1)
};
function indent() {
    // global vars: indent_count;
    var i, result;
    result = "";
    i = indent_count;
    while((0 < i)) {
        result = (result + "    ");
        i = (i - 1)
    };
    return(result)
};
function infixraw(name, expr) {
    return(strjoin(compile(expr[1]), " ", name, " ", compile(expr[2])))
};
function infix(name, expr) {
    return(strjoin("(", infixraw(name, expr), ")"))
};
function tailblock(expr, n) {
    var result;
    increase_indent();
    result = strjoin(" {\n", indent(), array_join(map(compile, tail(expr, n)), strjoin(";\n", indent())));
    decrease_indent();
    return(strjoin(result, "\n", indent(), "}"))
};
function tableentry(expr) {
    return(strjoin(compile(expr[0]), ":", compile(expr[1])))
};
function compileif(expr) {
    var condition;
    if((expr[0] === "else")) {
        condition = ""
    } else  {
        condition = strjoin("if(", compile(expr[0]), ")")
    };
    return(strjoin(condition, tailblock(expr, 1)))
};
function compile(expr) {
    var expr_head;
    expr_head = expr[0];
    if((get_type(expr) === "string")) {
        return(expr)
    } else if((expr_head === "define")) {
        return(strjoin("function ", expr[1][0], "(", array_join(tail(expr[1]), ", "), ")", tailblock(expr, 2)))
    } else if((expr_head === "locals")) {
        return(strjoin("var ", array_join(tail(expr), ", ")))
    } else if((expr_head === "globals")) {
        return(strjoin("// global vars: ", array_join(tail(expr), ", ")))
    } else if((expr_head === "set")) {
        return(infixraw("=", expr))
    } else if((expr_head === "num")) {
        return(expr[1])
    } else if((expr_head === "str")) {
        return(uneval(expr[1]))
    } else if((expr_head === "table")) {
        return(strjoin("{", array_join(map(tableentry, tail(expr)), ", "), "}"))
    } else if((expr_head === ";")) {
        return(strjoin("// ", array_join(tail(expr), " ")))
    } else if((expr_head === "get")) {
        return(strjoin(compile(expr[1]), "[", compile(expr[2]), "]"))
    } else if((expr_head === "not")) {
        return(strjoin("!(", compile(expr[1]), ")"))
    } else if((expr_head === "eq?")) {
        return(infix("===", expr))
    } else if((expr_head === "<")) {
        return(infix("<", expr))
    } else if((expr_head === "+")) {
        return(infix("+", expr))
    } else if((expr_head === "-")) {
        return(infix("-", expr))
    } else if((expr_head === "or")) {
        return(infix("||", expr))
    } else if((expr_head === "and")) {
        return(infix("&&", expr))
    } else if((expr_head === "cond")) {
        return(array_join(map(compileif, tail(expr)), " else "))
    } else if((expr_head === "while")) {
        return(strjoin("while(", compile(expr[1]), ")", tailblock(expr, 2)))
    } else  {
        return(strjoin(expr_head, "(", array_join(map(compile, tail(expr)), ", "), ")"))
    }
};
// ;
// Python Compiler;
// ;
function py_infixraw(name, expr) {
    return(strjoin(py_compile(expr[1]), " ", name, " ", py_compile(expr[2])))
};
function py_infix(name, expr) {
    return(strjoin("(", py_infixraw(name, expr), ")"))
};
function py_tailblock(expr, n) {
    var result;
    increase_indent();
    result = strjoin("\n", indent(), array_join(map(py_compile, tail(expr, n)), strjoin("\n", indent())));
    decrease_indent();
    return(strjoin(result, "\n", indent()))
};
function py_tableentry(expr) {
    return(strjoin(py_compile(expr[0]), ":", py_compile(expr[1])))
};
function py_compileif(expr) {
    var condition;
    if((expr[0] === "else")) {
        condition = "se:"
    } else  {
        condition = strjoin("if ", py_compile(expr[0]), ":")
    };
    return(strjoin(condition, py_tailblock(expr, 1)))
};
function py_compile(expr) {
    var expr_head;
    expr_head = expr[0];
    if((get_type(expr) === "string")) {
        return(expr)
    } else if((expr_head === "define")) {
        return(strjoin("def ", expr[1][0], "(", array_join(tail(expr[1]), ", "), "):", py_tailblock(expr, 2)))
    } else if((expr_head === "locals")) {
        return(strjoin("# local vars: ", array_join(tail(expr), ", ")))
    } else if((expr_head === "globals")) {
        return(strjoin("global ", array_join(tail(expr), ", ")))
    } else if((expr_head === "set")) {
        return(py_infixraw("=", expr))
    } else if((expr_head === "num")) {
        return(expr[1])
    } else if((expr_head === "str")) {
        return(uneval(expr[1]))
    } else if((expr_head === "table")) {
        return(strjoin("{", array_join(map(py_tableentry, tail(expr)), ", "), "}"))
    } else if((expr_head === ";")) {
        return(strjoin("# ", array_join(tail(expr), " ")))
    } else if((expr_head === "get")) {
        return(strjoin(py_compile(expr[1]), "[", py_compile(expr[2]), "]"))
    } else if((expr_head === "not")) {
        return(strjoin("not (", py_compile(expr[1]), ")"))
    } else if((expr_head === "eq?")) {
        return(py_infix("==", expr))
    } else if((expr_head === "<")) {
        return(py_infix("<", expr))
    } else if((expr_head === "+")) {
        return(py_infix("+", expr))
    } else if((expr_head === "-")) {
        return(py_infix("-", expr))
    } else if((expr_head === "or")) {
        return(py_infix("or", expr))
    } else if((expr_head === "and")) {
        return(py_infix("and", expr))
    } else if((expr_head === "cond")) {
        return(array_join(map(py_compileif, tail(expr)), "el"))
    } else if((expr_head === "while")) {
        return(strjoin("while ", py_compile(expr[1]), ":", py_tailblock(expr, 2)))
    } else  {
        return(strjoin(expr_head, "(", array_join(map(py_compile, tail(expr)), ", "), ")"))
    }
};
// ;
// Pretty printer;
// ;
function nspace(n) {
    var result;
    result = "";
    while((0 < n)) {
        result = (result + " ");
        n = (n - 1)
    };
    return(result)
};
function prettyprint(list, acc, indent) {
    var str, i, escape, seppos, first, sep, length;
    if(!(acc)) {
        acc = array();
        prettyprint(list, acc, 4);
        return(array_join(acc, ""))
    } else if((list[0] === "num")) {
        array_push(acc, list[1]);
        return(1)
    } else if((list[0] === "str")) {
        escape = {"\n":"\\n", "'":"\\'", "\t":"\\t", "\\":"\\\\", "\r":"\\r"};
        str = list[1];
        array_push(acc, "'");
        i = 0;
        while((i < len(str))) {
            array_push(acc, (escape[str[i]] || str[i]));
            i = (i + 1)
        };
        array_push(acc, "'");
        return(len(str))
    } else if((get_type(list) === "string")) {
        array_push(acc, list);
        return(len(list))
    };
    array_push(acc, "[");
    length = 1;
    seppos = array();
    first = true;
    i = 0;
    while((i < len(list))) {
        if(!(first)) {
            array_push(seppos, len(acc));
            array_push(acc, "")
        };
        length = ((length + 1) + prettyprint(list[i], acc, (indent + 4)));
        first = false;
        i = (i + 1)
    };
    if(((110 - indent) < length)) {
        sep = strjoin("\n", nspace(indent))
    } else  {
        sep = " "
    };
    i = 0;
    while((i < len(seppos))) {
        put(acc, seppos[i], sep);
        i = (i + 1)
    };
    array_push(acc, "]");
    return(length)
};
