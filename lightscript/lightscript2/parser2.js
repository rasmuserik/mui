load("stdlib.js");
/////////////////////////////////////////////
// Tokeniser
//
var c = " ";
var str = "";
var char_is = function (str) {
    return string_contains(str, c);
};
var skip_char = function () {
    c = getch();
};
var push_char = function () {
    str = str + c;
    skip_char();
};
var pop_string = function () {
    var result = str;
    str = "";
    return result;
};
var symb = "=!<>&|/*+-%";
var num = "1234567890";
var alphanum = num + "_qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
var EOF = ["(eof)"];
var next_token = function () {
    while (char_is(" \n\r\t")) {
        skip_char();
    };
    if (c === "'" || c === "\"") {
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
        return [" string", pop_string()];
    } else if (char_is(num)) {
        while (char_is(num)) {
            push_char();
        };
        return [" number", pop_string()];
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
                return [" comment", pop_string()];
            };
        };
        while (char_is(symb)) {
            push_char();
        };
        return [pop_string()];
    } else if (c === undefined) {
        return EOF;
    } else {
        push_char();
        return [pop_string()];
    };
};
//////////////////////////////////////
// Pretty printer
//
var pp = {};
var indentinc = 4;
var indentstr = function (n) {
    var i = 0;
    var result = "";
    while (i < n) {
        result = result + " ";
        i = i + 1;
    };
    return result;
};
var tailstr = function (node, indent, str) {
    node = tail(node);
    return array_join(map(function (node) {
        return prettyprint(node, indent);
    }, node), str);
};
var infixstr = function (name) {
    return function (node, indent) {
        var left = prettyprint(node[1], indent);
        if (get(bp, node[1][0], 1000) < bp[name]) {
            left = "(" + left + ")";
        };
        var right = prettyprint(node[2], indent);
        if (get(bp, node[2][0], 1000) <= bp[name]) {
            right = "(" + right + ")";
        };
        return left + " " + name + " " + right;
    };
};
var infixrstr = function (name) {
    return function (node, indent) {
        var left = prettyprint(node[1], indent);
        if (get(bp, node[1][0], 1000) <= bp[name]) {
            left = "(" + left + ")";
        };
        var right = prettyprint(node[2], indent);
        if (get(bp, node[2][0], 1000) < bp[name]) {
            right = "(" + right + ")";
        };
        return left + " " + name + " " + right;
    };
};
var blockstr = function (node, indent) {
    if (node[0] !== "table") {
        return prettyprint(node, indent);
    };
    var acc = "{";
    var i = 1;
    var prevcomment = false;
    while (i < len(node)) {
        acc = acc + "\n" + indentstr(indent + indentinc) + prettyprint(node[i], indent + indentinc);
        if (node[i][0] !== " comment") {
            acc = acc + ";";
        };
        i = i + 1;
    };
    return acc + "\n" + indentstr(indent) + "}";
};
var default_prettyprint = function (node, indent) {
    return "" + node[0];
};
var prettyprint = function (node, indent) {
    indent = indent || 0;
    return get(pp, node[0], default_prettyprint)(node, indent);
};
///////////////////////////////////////
// Operator constructors
//
var bp = {};
var led = {};
var nud = {};
// utility functions
var readlist = function (acc, endsymb) {
    while (token[0] !== endsymb && token !== EOF) {
        var t = parse();
        if (! is_separator(t[0])) {
            array_push(acc, t);
        };
    };
    token = next_token();
    return acc;
};
// syntax constructors
var infix = function (id, prio, name) {
    name = name || id;
    bp[id] = prio;
    led[id] = function (left, token) {
        return [name, left, parse(prio)];
    };
    pp[name] = infixstr(id);
};
var swapinfix = function (id, prio, name) {
    name = name;
    bp[id] = prio;
    led[id] = function (left, token) {
        return [name, parse(prio), left];
    };
    pp[name] = infixstr(name);
};
var infixr = function (id, prio, name) {
    name = name || id;
    bp[id] = prio;
    bp[name] = prio;
    led[id] = function (left, token) {
        return [name, left, parse(prio - 1)];
    };
    pp[name] = infixrstr(id);
};
var infixlist = function (id, endsymb, prio, name) {
    bp[id] = prio;
    led[id] = function (left, token) {
        return readlist([name, left], endsymb);
    };
    pp[name] = function (node, indent) {
        return prettyprint(node[1], indent) + id + tailstr(tail(node), indent, ", ") + endsymb;
    };
};
var list = function (id, endsymb, name) {
    nud[id] = function () {
        return readlist([name], endsymb);
    };
    pp[name] = function (node, indent) {
        return id + tailstr(node, indent, ", ") + endsymb;
    };
};
var passthrough = function (id) {
    nud[id] = function (token) {
        return token;
    };
    pp[id] = function (node, indent) {
        return node[len(node) - 1];
    };
};
var prefix = function (id) {
    nud[id] = function () {
        return [id, parse()];
    };
    pp[id] = function (node, indent) {
        return node[0] + " " + prettyprint(node[1], indent);
    };
};
var prefix2 = function (id) {
    nud[id] = function () {
        return [id, parse(), parse()];
    };
    pp[id] = function (node, indent) {
        return node[0] + " (" + prettyprint(node[1], indent) + ") " + blockstr(node[2], indent);
    };
};
/////////////////////////////////////////
// Parser
//
var default_nud = function (o) {
    unshift(o, " id");
    return o;
};
var macros = {};
var identity = function (o) {
    return o;
};
var apply_macros = function (obj) {
    return get(macros, obj[0], identity)(obj);
};
var parse = function (rbp) {
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
// Syntax definitions
//
// Definition of operator precedence and type
//
var is_separator = function (c) {
    return string_contains(";,:", c);
};
infixlist("(", ")", 600, "call");
infixlist("[", "]", 600, "subscript");
infix("*", 500);
infix("%", 500);
infix("/", 500);
infix("+", 400);
//
// [- a ?b?]
infix("-", 400);
prefix("-");
pp["-"] = function (node, indent) {
    if (len(node) === 2) {
        return "-" + prettyprint(node[1], indent);
    } else {
        return prettyprint(node[1], indent) + " - " + blockstr(node[2], indent);
    };
};
//
infix("==", 300, "===");
infix("===", 300);
infix("!=", 300, "!==");
infix("!==", 300);
infix("<=", 300);
infix("<", 300);
swapinfix(">=", 300, "<=");
swapinfix(">", 300, "<");
infixr("&&", 200, "and");
infixr("||", 200, "or");
//
// ['cond' cond1 body1 cond2 body2 ... bodyelse]
//
prefix2("if");
infixr("else", 200);
macros["if"] = function (obj) {
    if (obj[2][0] === "else") {
        array_push(obj, obj[2][2]);
        obj[2] = obj[2][1];
        if (obj[3][0] === "cond") {
            var child = obj[3];
            obj[3] = child[1];
            var i = 2;
            while (i < len(child)) {
                array_push(obj, child[i]);
                i = i + 1;
            };
        };
    };
    obj[0] = "cond";
    return obj;
};
pp["cond"] = function (node, indent) {
    var acc = [];
    var i = 2;
    while (i < len(node)) {
        array_push(acc, "if (" + prettyprint(node[i - 1], indent) + ") " + blockstr(node[i], indent));
        i = i + 2;
    };
    acc = array_join(acc, " else ");
    if (i === len(node)) {
        acc = acc + " else " + blockstr(node[i - 1], indent);
    };
    return acc;
};
//
//
list("(", ")", "paren");
macros["paren"] = function (obj) {
    if (len(obj) === 2) {
        return obj[1];
    } else {
        return obj;
    };
};
//
infix("=", 100);
list("{", "}", "table");
pp["table"] = function (node, indent) {
    var acc = [];
    var i = 1;
    var ind = indent + indentinc;
    while (len(i < node)) {
        if (node[i][0] === " id") {
            node[i][0] = " string";
        };
        array_push(acc, prettyprint(node[i], ind) + ": " + prettyprint(node[i + 1], ind));
        i = i + 2;
    };
    if (len(acc) === 0) {
        return "{}";
    } else {
        return "{\n" + indentstr(ind) + array_join(acc, ",\n" + indentstr(ind)) + "\n" + indentstr(indent) + "}";
    };
};
list("[", "]", "array");
map(prefix, ["var", "return", "!"]);
map(prefix2, ["while", "for"]);
//
// [function [args ...] ...]
prefix2("function");
macros["function"];
macros["function"] = function (node) {
    if (node[1][0] !== "paren") {
        node[1] = ["paren", node[1]];
    };
    node[1][0] = "args";
    return node;
};
pp["function"] = function (node, indent) {
    return "function (" + array_join(map(prettyprint, tail(node[1])), ", ") + ") " + blockstr(node[2], indent);
};
//
// 
map(passthrough, [";", ":", ",", ")", "}", "(eof)", " id", " number"]);
//
// String literals
//
passthrough(" string");
pp[" string"] = function (node) {
    var str = node[1];
    var result = ["\""];
    var i = 0;
    while (i < len(str)) {
        var c = str[i];
        if (c === "\\") {
            array_push(result, "\\\\");
        } else if (c === "\n") {
            array_push(result, "\\n");
        } else if (c === "\r") {
            array_push(result, "\\r");
        } else if (c === "\t") {
            array_push(result, "\\t");
        } else if (c === "\"") {
            array_push(result, "\\\"");
        } else {
            array_push(result, c);
        };
        i = i + 1;
    };
    array_push(result, "\"");
    return array_join(result, "");
};
// 
// Comments
//
passthrough(" comment");
pp[" comment"] = function (node) {
    return "//" + node[1];
};
//
// dump
//
token = next_token();
while ((t = parse()) !== EOF) {
    if (uneval(t) !== uneval([";"])) {
        //print(uneval(t));
        //print(listpp(t));
        var lineend;
        if (t[0] === " comment") {
            lineend = "";
        } else {
            lineend = ";";
        };
        print(prettyprint(t) + lineend);
    };
};
