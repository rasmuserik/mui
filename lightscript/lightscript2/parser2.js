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
        return ["string", pop_string()];
    } else if (char_is(num)) {
        while (char_is(num)) {
            push_char();
        };
        return ["number", pop_string()];
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
                return ["comment", pop_string()];
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
var infixstr = function (node, indent) {
    return prettyprint(node[1], indent) + " " + node[0] + " " + prettyprint(node[2], indent);
};
var blockstr = function (node, indent) {
    if (node[0] !== "list{") {
        return prettyprint(node, indent);
    };
    var acc = "{";
    var i = 1;
    var prevcomment = false;
    while (i < len(node)) {
        acc = acc + "\n" + indentstr(indent + indentinc) + prettyprint(node[i], indent + indentinc);
        if (node[i][0] !== "comment") {
            acc = acc + ";";
        };
        i = i + 1;
    };
    return acc + "\n" + indentstr(indent) + "}";
};
var prettyprint = function (node, indent) {
    indent = indent || 0;
    fn = pp[node[0]];
    if (fn) {
        return fn(node, indent);
    } else {
        return "" + node[0];
    };
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
var infix = function (id, prio) {
    bp[id] = prio;
    led[id] = function (left, token) {
        return [id, left, parse(prio)];
    };
    pp[id] = infixstr;
};
var infixr = function (id, prio) {
    bp[id] = prio;
    led[id] = function (left, token) {
        return [id, left, parse(prio - 1)];
    };
    pp[id] = infixstr;
};
var infixlist = function (id, endsymb, prio) {
    bp[id] = prio;
    led[id] = function (left, token) {
        return readlist(["apply" + id, left], endsymb);
    };
    pp["apply" + id] = function (node, indent) {
        return prettyprint(node[1], indent) + id + tailstr(tail(node), indent, ", ") + endsymb;
    };
};
var list = function (id, endsymb) {
    nud[id] = function () {
        return readlist(["list" + id], endsymb);
    };
    pp["list" + id] = function (node, indent) {
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
        return node[0] + " " + prettyprint(node[1], indent) + " " + blockstr(node[2], indent);
    };
};
/////////////////////////////////////////
// Parser
//
var default_nud = function (o) {
    unshift(o, "id");
    return o;
};
var parse = function (rbp) {
    rbp = rbp || 0;
    var t = token;
    token = next_token();
    var left = (nud[t[0]] || default_nud)(t);
    while (rbp < (bp[token[0]] || 0) && ! is_separator(t[0])) {
        t = token;
        token = next_token();
        left = led[t[0]](left, t);
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
infixlist("(", ")", 600);
infixlist("[", "]", 600);
infix("*", 500);
infix("%", 500);
infix("/", 500);
infix("+", 400);
infix("-", 400);
infix("===", 300);
infix("==", 300);
infix("!==", 300);
infix("!=", 300);
infix("<=", 300);
infix("<", 300);
infix(">=", 300);
infix(">", 300);
infixr("&&", 200);
infixr("||", 200);
infixr("else", 200);
infix("=", 100);
infix("in", 50);
list("(", ")");
list("{", "}");
pp["list{"] = function (node, indent) {
    var acc = [];
    var i = 1;
    var ind = indent + indentinc;
    while (len(i < node)) {
        if (node[i][0] == "id") {
            node[i][0] = "string";
        };
        array_push(acc, prettyprint(node[i], ind) + ": " + prettyprint(node[i + 1], ind));
        i = i + 2;
    };
    if (len(acc) == 0) {
        return "{}";
    } else {
        return "{\n" + indentstr(ind) + array_join(acc, ",\n" + indentstr(ind)) + "\n" + indentstr(indent) + "}";
    };
};
list("[", "]");
map(prefix, ["var", "return", "-", "!", "throw"]);
map(prefix2, ["while", "for", "if", "function", "try", "catch"]);
map(passthrough, ["undefined", "null", ";", ":", ",", ")", "}", "(eof)", "false", "true", "id", "string", "number", "comment"]);
// pretty printing
pp["else"] = function (node, indent) {
    return blockstr(node[1], indent) + " else " + blockstr(node[2], indent);
};
pp["string"] = function (node) {
    var str = node[1];
    var result = ["\""];
    var i = 0;
    while (i < len(str)) {
        var c = str[i];
        if (c == "\\") {
            array_push(result, "\\\\");
        } else if (c == "\n") {
            array_push(result, "\\n");
        } else if (c == "\r") {
            array_push(result, "\\r");
        } else if (c == "\t") {
            array_push(result, "\\t");
        } else if (c == "\"") {
            array_push(result, "\\\"");
        } else {
            array_push(result, c);
        };
        i = i + 1;
    };
    array_push(result, "\"");
    return array_join(result, "");
};
pp["comment"] = function (node) {
    return "//" + node[1];
};
pp["-"] = function (node, indent) {
    if (len(node) === 2) {
        return "-" + prettyprint(node[1], indent);
    } else {
        return prettyprint(node[1], indent) + " - " + blockstr(node[2], indent);
    };
};
//
// dump
//
token = next_token();
t = readlist(["list{"], "");
//for (elem in t) {
//    print(prettyprint(t[elem]));
//}
//while((t = parse()) !== EOF) {
//    print(uneval(t));
//    print(prettyprint(t));
//};
// Function that prettyprints a list of lists
function listpp(list, acc, indent) {
    if (! acc) {
        acc = [];
        listpp(list, acc, 0);
        return array_join(acc, "");
    };
    if (!is_array(list)) {
        var str = uneval(list);
        array_push(acc, str);
        return len(str);
    };
    var len = 1;
    array_push(acc, "[");
    var seppos = [];
    var first = true;
    var i = 0;
    while (i < len(list)) {
        if (! first) {
            array_push(seppos, len(acc));
            array_push(acc, "");
        };
        len = len + 1 + listpp(list[i], acc, indent + 1);
        first = false;
        i = i + 1;
    };
    var nspace = function (n) {
        var result = "";
        while (n > 0) {
            result = result + " ";
            n = n - 1;
        };
        return result;
    };
    var sep;
    if (len > 72 - indent) {
        sep = ",\n" + nspace(indent);
    } else {
        sep = ", ";
    };
    i = 0;
    while (i < len(seppos)) {
        acc[seppos[i]] = sep;
        i = i + 1;
    };
    array_push(acc, "]");
    return len;
};
//print(listpp(t));
print(blockstr(t) . slice(2, -2));
