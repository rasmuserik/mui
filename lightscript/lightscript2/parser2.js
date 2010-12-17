load("stdlib.js");
//
// defines
var IDENTIFIER = " id ";
var STRING = " string ";
var NUMBER = " num ";
var COMMENT = " comment ";
/////////////////////////////////////////////
// Tokeniser
//
var c = " ";
var str = "";
function char_is(str) {
    return string_contains(str, c);
};
function skip_char() {
    c = getch();
};
function push_char() {
    str = str + c;
    skip_char();
};
function pop_string() {
    var result = str;
    str = "";
    return result;
};
var symb = "=!<>&|/*+-%";
var num = "1234567890";
var alphanum = num + "_qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
var EOF = ["(eof)"];
function next_token() {
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
    } else if (c === undefined) {
        return EOF;
    } else {
        push_char();
        return [pop_string()];
    };
};
//////////////////////////////////////
// LightScript pretty printer
//
var ls = {};
var indentinc = 4;
function indentstr(n) {
    var i = 0;
    var result = "";
    while (i < n) {
        result = result + " ";
        i = i + 1;
    };
    return result;
};
function ls_tail(node, indent, str) {
    node = tail(node);
    return array_join(map(function _(node) {
        return lightscript(node, indent);
    }, node), str);
};
function ls_infix(name) {
    function result(node, indent) {
        var left = lightscript(node[1], indent);
        if (get(bp, node[1][0], 1000) < bp[name]) {
            left = "(" + left + ")";
        };
        var right = lightscript(node[2], indent);
        if (get(bp, node[2][0], 1000) <= bp[name]) {
            right = "(" + right + ")";
        };
        return left + " " + name + " " + right;
    };
    return result;
};
function ls_infixr(name) {
    function result(node, indent) {
        var left = lightscript(node[1], indent);
        if (get(bp, node[1][0], 1000) <= bp[name]) {
            left = "(" + left + ")";
        };
        var right = lightscript(node[2], indent);
        if (get(bp, node[2][0], 1000) < bp[name]) {
            right = "(" + right + ")";
        };
        return left + " " + name + " " + right;
    };
    return result;
};
function ls_block(node, indent) {
    if (node[0] !== "table") {
        return lightscript(node, indent);
    };
    var acc = "{";
    var i = 1;
    var prevcomment = false;
    while (i < len(node)) {
        acc = acc + "\n" + indentstr(indent + indentinc) + lightscript(node[i], indent + indentinc);
        if (node[i][0] !== COMMENT) {
            acc = acc + ";";
        };
        i = i + 1;
    };
    return acc + "\n" + indentstr(indent) + "}";
};
function ls_default(node, indent) {
    if (is_string(node)) {
        return node;
    } else {
        assert(is_string(node[0]));
        var acc = [];
        var i = 1;
        while (i < len(node)) {
            array_push(acc, lightscript(node[i], indent));
            i = i + 1;
        };
        return node[0] + "(" + array_join(acc, ", ") + ")";
    };
};
function lightscript(node, indent) {
    indent = indent || 0;
    return get(ls, node[0], ls_default)(node, indent);
};
///////////////////////////////////////
// Operator constructors
//
var bp = {};
var led = {};
var nud = {};
// utility functions
function readlist(acc, endsymb) {
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
function infix(id, prio, name) {
    name = name || id;
    bp[id] = prio;
    bp[name] = prio;
    led[id] = function _(left, token) {
        return [name, left, parse(prio)];
    };
    ls[name] = ls_infix(id);
};
function swapinfix(id, prio, name) {
    name = name;
    bp[id] = prio;
    led[id] = function _(left, token) {
        return [name, parse(prio), left];
    };
    ls[name] = ls_infix(name);
};
function infixr(id, prio, name) {
    name = name || id;
    bp[id] = prio;
    bp[name] = prio;
    led[id] = function _(left, token) {
        return [name, left, parse(prio - 1)];
    };
    ls[name] = ls_infixr(id);
};
function infixlist(id, endsymb, prio, name) {
    bp[id] = prio;
    led[id] = function _(left, token) {
        return readlist([name, left], endsymb);
    };
    ls[name] = function _(node, indent) {
        return lightscript(node[1], indent) + id + ls_tail(tail(node), indent, ", ") + endsymb;
    };
};
function list(id, endsymb, name) {
    nud[id] = function _() {
        return readlist([name], endsymb);
    };
    ls[name] = function _(node, indent) {
        return id + ls_tail(node, indent, ", ") + endsymb;
    };
};
function passthrough(id) {
    nud[id] = function _(token) {
        return token;
    };
    ls[id] = function _(node, indent) {
        return node[len(node) - 1];
    };
};
function prefix(id) {
    nud[id] = function _() {
        return [id, parse()];
    };
    ls[id] = function _(node, indent) {
        return node[0] + " " + lightscript(node[1], indent);
    };
};
var prefix2 = function _(id) {
    nud[id] = function _() {
        return [id, parse(), parse()];
    };
    ls[id] = function _(node, indent) {
        return node[0] + " (" + lightscript(node[1], indent) + ") " + ls_block(node[2], indent);
    };
};
/////////////////////////////////////////
// Parser
//
function default_nud(o) {
    unshift(o, IDENTIFIER);
    return o;
};
var macros = {};
function identity(o) {
    return o;
};
function apply_macros(obj) {
    return get(macros, obj[0], identity)(obj);
};
function parse(rbp) {
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
function is_separator(c) {
    return string_contains(";,:", c);
};
//
infixlist("(", ")", 600, "call");
function macros_call(node) {
    if (is_string(node[1])) {
        node = tail(node);
    };
    return node;
};
macros["call"] = macros_call;
//
// Standard binary operators
infixlist("[", "]", 600, "get");
function ls_get(node, indent) {
    if (len(node) === 3) {
        return lightscript(node[1], indent) + "[" + lightscript(node[2], indent) + "]";
    } else {
        unshift(node, "call");
        return lightscript(node, indent);
    };
};
ls["get"] = ls_get;
//
// Standard binary operators
infix("*", 500);
infix("%", 500);
infix("/", 500);
infix("+", 400);
//
// [- a ?b?]
infix("-", 400);
prefix("-");
function ls_sub(node, indent) {
    if (len(node) === 2) {
        return "-" + lightscript(node[1], indent);
    } else {
        return lightscript(node[1], indent) + " - " + ls_block(node[2], indent);
    };
};
ls["-"] = ls_sub;
//
infix("==", 300, "===");
infix("===", 300, "eq?");
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
function macros_if(obj) {
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
macros["if"] = macros_if;
function ls_cond(node, indent) {
    var acc = [];
    var i = 2;
    while (i < len(node)) {
        array_push(acc, "if (" + lightscript(node[i - 1], indent) + ") " + ls_block(node[i], indent));
        i = i + 2;
    };
    acc = array_join(acc, " else ");
    if (i === len(node)) {
        acc = acc + " else " + ls_block(node[i - 1], indent);
    };
    return acc;
};
ls["cond"] = ls_cond;
//
//
list("(", ")", "paren");
function macros_paren(obj) {
    if (len(obj) === 2) {
        return obj[1];
    } else {
        return obj;
    };
};
macros["paren"] = macros_paren;
//
infix("=", 100, "set");
list("{", "}", "table");
function ls_table(node, indent) {
    var acc = [];
    var i = 1;
    var ind = indent + indentinc;
    while (i < len(node)) {
        if (is_string(node[i])) {
            node[i] = [STRING, node[i][0]];
        };
        array_push(acc, lightscript(node[i], ind) + ": " + lightscript(node[i + 1], ind));
        i = i + 2;
    };
    if (len(acc) === 0) {
        return "{}";
    } else {
        return "{\n" + indentstr(ind) + array_join(acc, ",\n" + indentstr(ind)) + "\n" + indentstr(indent) + "}";
    };
};
ls["table"] = ls_table;
list("[", "]", "array");
map(prefix, ["var", "return", "!"]);
map(prefix2, ["while", "for"]);
//
// [function [args ...] ...]
prefix2("function");
var default_function_name = "__anonymous_function__";
function macros_function(node) {
    var result = node[2];
    assert(node[0] === "table");
    unshift(result, "define");
    result[1] = node[1];
    return result;
};
macros["function"] = macros_function;
function ls_function(node, indent) {
    var name = node[1][0];
    if (name === default_function_name) {
        name = "";
    };
    return "function " + name + "(" + array_join(map(lightscript, tail(node[1])), ", ") + ") " + ls_block(node[2], indent);
};
function ls_define(node, indent) {
    var block = tail(node);
    block[0] = "table";
    return "function " + node[1][0] + "(" + array_join(map(lightscript, tail(node[1])), ", ") + ") " + ls_block(block, indent);
};
ls["define"] = ls_define;
//
// 
map(passthrough, [";", ":", ",", ")", "}", "(eof)", IDENTIFIER, NUMBER]);
//
// 
passthrough(IDENTIFIER);
macros[IDENTIFIER] = function _(obj) {
    return obj[1];
};
// String literals
//
passthrough(STRING);
function ls_string(node) {
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
ls[STRING] = ls_string;
// 
// Comments
//
passthrough(COMMENT);
ls[COMMENT] = function _(node) {
    return "//" + node[1];
};
// List pretty printer
function yolan(list, acc, indent) {
    function nspace(n) {
        var result;
        result = "";
        while (0 < n) {
            result = result + " ";
            n = n - 1;
        };
        return result;
    };
    var str;
    var i;
    var escape;
    var seppos;
    var first;
    var sep;
    var length;
    if (! acc) {
        acc = [];
        yolan(list, acc, 4);
        return array_join(acc, "");
    } else if (list[0] === NUMBER) {
        array_push(acc, list[1]);
        return 1;
    } else if (list[0] === STRING) {
        escape = {
            "\n": "\\n",
            "'": "\\'",
            "\t": "\\t",
            "\\": "\\\\",
            "\r": "\\r"
        };
        str = list[1];
        array_push(acc, "'");
        i = 0;
        while (i < len(str)) {
            array_push(acc, escape[str[i]] || str[i]);
            i = i + 1;
        };
        array_push(acc, "'");
        return len(str);
    } else if (is_string(list)) {
        array_push(acc, list);
        return len(list);
    };
    array_push(acc, "[");
    length = 1;
    seppos = [];
    first = true;
    i = 0;
    while (i < len(list)) {
        if (! first) {
            array_push(seppos, len(acc));
            array_push(acc, "");
        };
        length = length + 1 + yolan(list[i], acc, indent + 4);
        first = false;
        i = i + 1;
    };
    if (110 - indent < length) {
        sep = strjoin("\n", nspace(indent));
    } else {
        sep = " ";
    };
    i = 0;
    while (i < len(seppos)) {
        put(acc, seppos[i], sep);
        i = i + 1;
    };
    array_push(acc, "]");
    return length;
};
//
// dump
//
token = next_token();
while ((t = parse()) !== EOF) {
    if (uneval(t) !== uneval([";"])) {
        //print(uneval(t));
        //        print(yolan(t));
        var lineend;
        if (t[0] === COMMENT) {
            lineend = "";
        } else {
            lineend = ";";
        };
        print(lightscript(t) + lineend);
    };
};
