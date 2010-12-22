//
//  Defines
//
IDENTIFIER = " id ";
STRING = " string ";
NUMBER = " num ";
COMMENT = " comment ";
PAREN = " paren ";
CURLY = "dict";
//
//  Tokeniser
//
c = " ";
str_acc = "";
char_is(str) = {
    return string_contains(str, c);
};
skip_char() = {
    global c;
    c = getch();
};
push_char() = {
    global str_acc;
    str_acc = str_acc + c;
    skip_char();
};
pop_string() = {
    global str_acc;
    var result = str_acc;
    str_acc = "";
    return result;
};
symb = "=!<>&|/*+-%";
num = "1234567890";
alphanum = num + "_qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
EOF = ["(eof)"];
next_token() = {
    global c;
    while (c != undefined && char_is(" \n\r\t")) {
        skip_char();
    };
    if (c === undefined) {
        return EOF;
    } else if (c === "'" || c === "\"") {
        var quote = c;
        skip_char();
        while (c !== undefined && c !== quote) {
            if (c === "\\") {
                skip_char();
                if (c === "n") {
                    c = "\n";
                } else if (c === "t") {
                    c = "\t";
                } else if (c === "r") {
                    c = "\r";
                };
            };
            push_char();
        };
        skip_char();
        return [STRING, pop_string()];
    } else if (char_is(num)) {
        while (char_is(num)) {
            push_char();
        };
        return [NUMBER, pop_string()];
        // varname
    } else if (char_is(alphanum)) {
        while (char_is(alphanum)) {
            push_char();
        };
        return [pop_string()];
        // read comment or multi character symbol
    } else if (char_is(symb)) {
        if (c === "/") {
            push_char();
            if (c === "/") {
                skip_char();
                pop_string();
                while (c !== undefined && c !== "\n") {
                    push_char();
                };
                return [COMMENT, pop_string()];
            };
        };
        while (char_is(symb)) {
            push_char();
        };
        return [pop_string()];
    } else {
        push_char();
        return [pop_string()];
    };
};
//
//  General pretty printing utilities
//
string_literal(str) = {
    var escape = {
        "\n": "\\n",
        "\"": "\\\"",
        "\t": "\\t",
        "\\": "\\\\",
        "\r": "\\r"
    };
    return array_join(push(fold(function(elem, acc) { return push(acc, get(escape, elem, elem)) }, str, ["\""]), "\""), "");
};
nspace(n) = {
    var result = "";
    var i = 0;
    while (i < n) {
        result = result + "    ";
        i = i + 1;
    };
    return result;
};
// print node, with parenthesis if needed
// ie. if the head of the node has lower priority than prio
// then add parenthesis around it.
pp_prio(prettyprinter, node, indent, prio) = {
    if (get(bp, str(node[0]), 1000) < prio) {
        return "(" + prettyprinter(node, indent) + ")";
    } else {
        return prettyprinter(node, indent);
    };
};
pp_infix(prettyprinter, name) = {
    return function(node, indent) { return pp_prio(prettyprinter, node[1], indent, bp[name]) + " " + name + " " + pp_prio(prettyprinter, node[2], indent, bp[name] + 1) };
};
pp_infixr(prettyprinter, name) = {
    return function(node, indent) { return pp_prio(prettyprinter, node[1], indent, bp[name] + 1) + " " + name + " " + pp_prio(prettyprinter, node[2], indent, bp[name]) };
};
pp_block(prettyprinter, node, indent) = {
    _(elem, acc) = {
        acc = acc + "\n" + nspace(indent + 1) + prettyprinter(elem, indent + 1);
        if (elem[0] !== COMMENT) {
            acc = acc + ";";
        };
        return acc;
    };
    return fold(_, tail(node), "{") + "\n" + nspace(indent) + "}";
};
pp_default(pp, node, indent) = {
    if (is_string(node)) {
        return node;
    } else {
        return pp(node[0], indent) + "(" + array_join(fold(function(elem, acc) { return push(acc, pp(elem, indent)) }, tail(node), []), ", ") + ")";
    };
};
//
//  LightScript pretty printer
//
ls = {};
ls_tail(node, indent, str) = {
    return array_join(map(lightscript_curried(indent), tail(node)), str);
};
ls_infix(name) = {
    return pp_infix(lightscript, name);
};
ls_infixr(name) = {
    return pp_infixr(lightscript, name);
};
ls_block(node, indent) = {
    return pp_block(lightscript, node, indent);
};
ls_default(node, indent) = {
    return pp_default(lightscript, node, indent);
};
lightscript(node, indent) = {
    indent = indent || 0;
    return get(ls, str(node[0]), ls_default)(node, indent);
};
lightscript_curried(indent) = {
    return function(node) { return lightscript(node, indent) };
};
//
// JavaScript pretty printer
//
//
js = {};
js_tail(node, indent, str) = {
    return array_join(map(javascript_curried(indent), tail(node)), str);
};
js_infix(name) = {
    return pp_infix(javascript, name);
};
js_infixr(name) = {
    return pp_infixr(javascript, name);
};
js_block(node, indent) = {
    return pp_block(javascript, node, indent);
};
js_default(node, indent) = {
    return pp_default(javascript, node, indent);
};
javascript(node, indent) = {
    indent = indent || 0;
    return get(js, str(node[0]), js_default)(node, indent);
};
javascript_curried(indent) = {
    return function(node) { return javascript(node, indent) };
};
//
// Python pretty printer
//
//
py = {};
py_tail(node, indent, str) = {
    return array_join(map(python_curried(indent), tail(node)), str);
};
py_infix(name) = {
    return pp_infix(python, name);
};
py_infixr(name) = {
    return pp_infixr(python, name);
};
py_block(node, indent) = {
    return fold(function(elem, acc) { return acc + "\n" + nspace(indent + 1) + python(elem, indent + 1) }, tail(node), "");
};
py_default(node, indent) = {
    return pp_default(python, node, indent);
};
python(node, indent) = {
    indent = indent || 0;
    return get(py, str(node[0]), py_default)(node, indent);
};
python_curried(indent) = {
    return function(node) { return python(node, indent) };
};
//
//   Operator constructors
//
bp = {};
led = {};
nud = {};
//
// utility functions
//
readlist(acc, endsymb) = {
    global token;
    while (token[0] !== endsymb && token !== EOF) {
        var t = parse();
        if (! is_separator(t[0])) {
            array_push(acc, t);
        };
    };
    token = next_token();
    return acc;
};
//
// syntax constructors
//
infix(id, prio, name) = {
    name = name || id;
    bp[id] = prio;
    bp[name] = prio;
    led[id] = function(left, token) { return [name, left, parse(prio)] };
    ls[name] = ls_infix(id);
    js[name] = js_infix(id);
    py[name] = py_infix(id);
};
swapinfix(id, prio, name) = {
    bp[id] = prio;
    led[id] = function(left, token) { return [name, parse(prio), left] };
};
infixr(id, prio, name) = {
    name = name || id;
    bp[id] = prio;
    bp[name] = prio;
    led[id] = function(left, token) { return [name, left, parse(prio - 1)] };
    ls[name] = ls_infixr(id);
    js[name] = js_infixr(id);
    py[name] = py_infixr(id);
};
infixlist(id, endsymb, prio, name) = {
    bp[id] = prio;
    led[id] = function(left, token) { return readlist([name, left], endsymb) };
    ls[name] = function(node, indent) { return lightscript(node[1], indent) + id + ls_tail(tail(node), indent, ", ") + endsymb };
    js[name] = function(node, indent) { return javascript(node[1], indent) + id + js_tail(tail(node), indent, ", ") + endsymb };
    py[name] = function(node, indent) { return python(node[1], indent) + id + py_tail(tail(node), indent, ", ") + endsymb };
};
list(id, endsymb, name) = {
    nud[id] = function(token) { return readlist([name], endsymb) };
    ls[name] = function(node, indent) { return id + ls_tail(node, indent, ", ") + endsymb };
    js[name] = function(node, indent) { return id + js_tail(node, indent, ", ") + endsymb };
    py[name] = function(node, indent) { return id + py_tail(node, indent, ", ") + endsymb };
};
passthrough(id) = {
    nud[id] = function(token) { return token };
    ls[id] = function(node, indent) { return node[len(node) - 1] };
    js[id] = function(node, indent) { return node[len(node) - 1] };
    py[id] = function(node, indent) { return node[len(node) - 1] };
};
prefix(id) = {
    nud[id] = function(token) { return [id, parse()] };
    ls[id] = function(node, indent) { return node[0] + " " + lightscript(node[1], indent) };
    js[id] = function(node, indent) { return node[0] + " " + javascript(node[1], indent) };
    py[id] = function(node, indent) { return node[0] + " " + python(node[1], indent) };
};
prefix2(id) = {
    nud[id] = function(token) { return [id, parse(), parse()] };
    ls[id] = function(node, indent) { return node[0] + " (" + lightscript(node[1], indent) + ") " + ls_block(node[2], indent) };
    js[id] = function(node, indent) { return node[0] + " (" + javascript(node[1], indent) + ") " + js_block(node[2], indent) };
    py[id] = function(node, indent) { return node[0] + " (" + python(node[1], indent) + ") " + py_block(node[2], indent) };
};
//
//  Parser
//
default_nud(o) = {
    return cons(IDENTIFIER, o);
};
macros = {};
identity(o) = {
    return o;
};
apply_macros(obj) = {
    return get(macros, obj[0], identity)(obj);
};
parse(rbp) = {
    global token;
    rbp = rbp || 0;
    var t = token;
    token = next_token();
    var left = get(nud, t[0], default_nud)(t);
    left = apply_macros(left);
    while (rbp < get(bp, token[0], 0) && ! is_separator(t[0])) {
        t = token;
        token = next_token();
        left = led[t[0]](left, t);
        left = apply_macros(left);
    };
    return left;
};
//
//  Syntax definitions
//
//  Definition of operator precedence and type
//
is_separator(c) = {
    return string_contains(";,:", c);
};
//
infixlist("(", ")", 600, "call");
macros_call(node) = {
    return tail(node);
};
macros["call"] = macros_call;
//
// 
infixlist("[", "]", 600, "get");
pp_get(prettyprinter) = {
    result(node, indent) = {
        if (len(node) === 3) {
            return prettyprinter(node[1], indent) + "[" + prettyprinter(node[2], indent) + "]";
        } else {
            assert(len(node) === 4);
            return prettyprinter(cons("call", node), indent);
        };
    };
    return result;
};
ls["get"] = pp_get(lightscript);
js["get"] = pp_get(javascript);
py["get"] = pp_get(python);
//
// Standard binary operators
//
infix("*", 500);
infix("%", 500);
infix("/", 500);
infix("+", 400);
//
// [- a ?b?]
//
infix("-", 400);
prefix("-");
pp_sub(pp) = {
    sub(node, indent) = {
        if (len(node) === 2) {
            return "-" + pp(node[1], indent);
        } else {
            return pp(node[1], indent) + " - " + pp(node[2], indent);
        };
    };
    return sub;
};
ls["-"] = pp_sub(lightscript);
js["-"] = pp_sub(javascript);
py["-"] = pp_sub(python);
//
infix("==", 300, "===");
infix("===", 300, "eq?");
py["eq?"] = pp_infix(python, "==");
infix("!=", 300, "!==");
infix("!==", 300, "neq?");
py["neq?"] = pp_infix(python, "!=");
infix("<=", 300);
infix("<", 300);
swapinfix(">=", 300, "<=");
swapinfix(">", 300, "<");
infixr("&&", 250, "and");
py["and"] = pp_infixr(python, "and");
infixr("||", 200, "or");
py["or"] = pp_infixr(python, "or");
//
// [cond [cond1 body1...] [cond2 body2...] ... [else bodyelse...]]
//
prefix2("if");
infixr("else", 200);
untable(obj) = {
    if (obj[0] === CURLY) {
        return tail(obj);
    } else {
        return [obj];
    };
};
macros_if(obj) = {
    if (obj[2][0] === CURLY) {
        var result = ["cond", obj[2]];
        result[1][0] = obj[1];
    } else if (obj[2][0] === "else") {
        if (obj[2][2][0] === "cond") {
            result = cons("cond", obj[2][2]);
            result[1] = cons(obj[1], untable(obj[2][1]));
        } else {
            result = ["cond", cons(obj[1], untable(obj[2][1])), cons("else", untable(obj[2][2]))];
        };
    } else {
        print("ERROR: " + str(obj));
        assert(false);
    };
    return result;
};
macros["if"] = macros_if;
pp_condcasecurried(prettyprinter, pp_block, indent) = {
    result(node) = {
        if (node[0] === "else") {
            return pp_block(node, indent);
        } else {
            return "if (" + prettyprinter(node[0], indent) + ") " + pp_block(node, indent);
        };
    };
    return result;
};
ls["cond"] = function(node, indent) { return array_join(map(pp_condcasecurried(lightscript, ls_block, indent), tail(node)), " else ") };
js["cond"] = function(node, indent) { return array_join(map(pp_condcasecurried(javascript, js_block, indent), tail(node)), " else ") };
py_condcasecurried(indent) = {
    result(node) = {
        if (node[0] === "else") {
            return "se:" + py_block(node, indent);
        } else {
            return "if " + python(node[0], indent) + ":" + py_block(node, indent);
        };
    };
    return result;
};
py["cond"] = function(node, indent) { return array_join(map(py_condcasecurried(indent), tail(node)), "\n" + nspace(indent) + "el") };
//
//
list("(", ")", PAREN);
macros_paren(obj) = {
    if (len(obj) === 2) {
        return obj[1];
    } else {
        return obj;
    };
};
macros[PAREN] = macros_paren;
//
// Assignment
infix("=", 100, "set");
macros_set(obj) = {
    if (is_string(obj[1])) {
        return obj;
    } else if (obj[1][0] === "get") {
        // put
        return obj;
    } else {
        obj[0] = "function";
        return macros["function"](obj);
    };
};
macros["set"] = macros_set;
//
// table
list("{", "}", CURLY);
pp_table(prettyprinter) = {
    result(node, indent) = {
        var acc = [];
        var i = 1;
        var ind = indent + 1;
        while (i < len(node)) {
            if (is_string(node[i])) {
                node[i] = [STRING, node[i][0]];
            };
            array_push(acc, prettyprinter(node[i], ind) + ": " + prettyprinter(node[i + 1], ind));
            i = i + 2;
        };
        if (len(acc) === 0) {
            return "{}";
        } else {
            return "{\n" + nspace(ind) + array_join(acc, ",\n" + nspace(ind)) + "\n" + nspace(indent) + "}";
        };
    };
    return result;
};
ls[CURLY] = pp_table(lightscript);
js[CURLY] = pp_table(javascript);
py[CURLY] = pp_table(python);
// [array arrayelements...]
list("[", "]", "array");
// [return expr]
prefix("return");
prefix("!");
py["!"] = function(elem, indent) { return "not " + python(elem[1], indent) };
// [while condition body...]
prefix2("while");
macros_while(node) = {
    var result = cons("while", node[2]);
    assert(node[2][0] === CURLY);
    result[1] = node[1];
    return result;
};
macros["while"] = macros_while;
ls["while"] = function(node, indent) { return "while (" + lightscript(node[1], indent) + ") " + ls_block(tail(node), indent) };
js["while"] = function(node, indent) { return "while (" + javascript(node[1], indent) + ") " + js_block(tail(node), indent) };
py["while"] = function(node, indent) { return "while " + python(node[1], indent) + ":" + py_block(tail(node), indent) };
//
// [var ...]
list("var", ";", "var");
ls["var"] = function(node, indent) { return "var " + array_join(map(lightscript_curried(indent), tail(node)), ", ") };
js["var"] = function(node, indent) { return "var " + array_join(map(javascript_curried(indent), tail(node)), ", ") };
py["var"] = function(node, indent) { return array_join(map(python_curried(indent), tail(node)), "\n" + nspace(indent)) };
list("global", ";", "global");
ls["global"] = function(node, indent) { return "global " + array_join(map(lightscript_curried(indent), tail(node)), ", ") };
js["global"] = function(node, indent) { return "//global " + array_join(map(javascript_curried(indent), tail(node)), ", ") };
py["global"] = function(node, indent) { return "global " + array_join(map(python_curried(indent), tail(node)), ", ") };
//
// [define [fnname args...] body...]
// [lambda [args...] expr]
prefix2("function");
macros_function(node) = {
    var result = cons("define", node[2]);
    assert(node[2][0] === CURLY);
    result[1] = node[1];
    if (is_string(result[1])) {
        result[1] = [PAREN, result[1]];
    };
    if (result[1][0] === PAREN) {
        assert(len(result) === 3);
        result[0] = "lambda";
        result[1] = tail(result[1]);
        if (result[2][0] === "return") {
            result[2] = result[2][1];
        };
    };
    return result;
};
macros["function"] = macros_function;
ls["define"] = function(node, indent) { return node[1][0] + "(" + array_join(map(lightscript, tail(node[1])), ", ") + ") = " + ls_block(tail(node), indent) };
ls["lambda"] = function(node, indent) { return "function(" + array_join(map(lightscript, node[1]), ", ") + ") { return " + lightscript(node[2], indent) + " }" };
js["define"] = function(node, indent) { return "function " + node[1][0] + "(" + array_join(map(javascript, tail(node[1])), ", ") + ") " + js_block(tail(node), indent) };
js["lambda"] = function(node, indent) { return "function(" + array_join(map(javascript, node[1]), ", ") + ") { return " + javascript(node[2], indent) + " }" };
py["define"] = function(node, indent) { return "def " + node[1][0] + "(" + array_join(map(function(s) { return s + " = None" }, map(python, tail(node[1]))), ", ") + "):" + py_block(tail(node), indent) + "\n" };
py["lambda"] = function(node, indent) { return "lambda " + array_join(map(python, node[1]), ", ") + " : (" + python(node[2], indent) + ")" };
//
// 
map(passthrough, [";", ":", ",", ")", "}", "(eof)", NUMBER]);
//
// 
passthrough(IDENTIFIER);
macros[IDENTIFIER] = function(obj) { return obj[1] };
//
// String literals
passthrough(STRING);
ls[STRING] = function(node, indent) { return string_literal(node[1]) };
js[STRING] = ls[STRING];
py[STRING] = ls[STRING];
// 
//  Comments
passthrough(COMMENT);
ls[COMMENT] = function(node, indent) { return "//" + node[1] };
js[COMMENT] = ls[COMMENT];
py[COMMENT] = function(node, indent) { return "#" + node[1] };
//
//  List pretty printer
//
yolan(list, acc, indent) = {
    if (acc == undefined) {
        acc = [];
        yolan(list, acc, 1);
        return array_join(acc, "");
    } else if (is_string(list)) {
        array_push(acc, list);
        return len(list);
    } else if (list[0] === NUMBER) {
        array_push(acc, list[1]);
        return 1;
    } else if (list[0] === STRING) {
        return len(string_literal(list[1]));
    };
    if (list[0] === COMMENT) {
        array_push(acc, ";" + list[1]);
        return 1000;
    };
    array_push(acc, "(");
    var length = 1;
    var seppos = [];
    var first = true;
    var i = 0;
    while (i < len(list)) {
        if (! first) {
            array_push(seppos, len(acc));
            array_push(acc, " ");
        };
        length = length + 1 + yolan(list[i], acc, indent + 1);
        first = false;
        i = i + 1;
    };
    if (80 - indent < length) {
        var sep = strjoin("\n", nspace(indent));
    } else {
        var sep = " ";
    };
    i = 0;
    while (i < len(seppos)) {
        acc[seppos[i]] = sep;
        i = i + 1;
    };
    if (is_array(list[len(list) - 1]) && list[len(list) - 1][0] === COMMENT) {
        array_push(acc, strjoin("\n", nspace(indent - 1)));
    };
    array_push(acc, ")");
    return length;
};
//
// dump
//
token = next_token();
prettyprinter = undefined;
end_line_with_semicolon = true;
if (arguments[0] === "lightscript") {
    prettyprinter = lightscript;
} else if (arguments[0] === "yolan") {
    prettyprinter = yolan;
    end_line_with_semicolon = false;
} else if (arguments[0] === "javascript") {
    print("load(\"stdlib.js\");");
    prettyprinter = javascript;
} else if (arguments[0] === "python") {
    print("from stdlib import *");
    prettyprinter = python;
    end_line_with_semicolon = false;
} else {
    print("expects \"lightscript\", \"yolan\", or \"javascript\" as first argument");
    print("using lightscript as default");
    prettyprinter = lightscript;
};
//
t = parse();
while (t !== EOF) {
    if (t[0] !== ";") {
        //print("\n--------------\n" +uneval(t));
        //print("\n" + yolan(t));
        if (end_line_with_semicolon && t[0] !== COMMENT) {
            var lineend = ";";
        } else {
            var lineend = "";
        };
        print(prettyprinter(t) + lineend);
    };
    t = parse();
};
