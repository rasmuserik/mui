var GLOBAL = (function () {
    return this;
})();
if (! GLOBAL . readline) {
    readline = (function () {
        importPackage(java . io);
        importPackage(java . lang);
        stream = BufferedReader(InputStreamReader(System["in"]));
        return function () {
            var line = stream . readLine();
            if (line !== null) {
                return "" + line;
            } else {
                return "";
            };
        };
    })();
};
var getch = (function () {
    var line = "";
    var pos;
    var newl = 0;
    return function () {
        pos = pos + 1;
        if (line[pos] !== undefined) {
            newl = 0;
            return line[pos];
        } else {
            pos = -1;
            line = readline();
            newl = newl + 1;
            if (newl > 10) {
                return undefined;
            } else {
                return "\n";
            };
        };
    };
})();
// Function that prettyprints a list of lists
function listpp(list, acc, indent) {
    if (! acc) {
        acc = [];
        listpp(list, acc, 1);
        return array_join(acc, "");
    };
    if (! is_array(list)) {
        var str = "" + list;
        //uneval(list);
        array_push(acc, str);
        return len(str);
    };
    var length = 1;
    array_push(acc, "[");
    var seppos = [];
    var first = true;
    var i = 0;
    while (i < len(list)) {
        if (! first) {
            array_push(seppos, len(acc));
            array_push(acc, "");
        };
        length = length + 1 + listpp(list[i], acc, indent + 1);
        first = false;
        i = i + 1;
    };
    var nspace = function (n) {
        var result = "";
        while (n > 0) {
            result = result + "  ";
            n = n - 1;
        };
        return result;
    };
    var sep;
    if (length > 72 - indent) {
        sep = "\n" + nspace(indent);
    } else {
        sep = " ";
    };
    i = 0;
    while (i < len(seppos)) {
        acc[seppos[i]] = sep;
        i = i + 1;
    };
    array_push(acc, "]");
    return length;
};
function tail(list, n) {
    n = n || 1;
    return list.slice(n);
}
function slice(list, a, b) {
    return list.slice(a, b);
}
function put(obj, key, val) {
    obj[key] = val;
}
function map(fn, list) {
    return list.map(fn);
}
function array_join(list, sep) {
    return list.join(sep);
}
function array_push(list, elem) {
    return list.push(elem);
}
function string_contains(str, c) {
    return str.indexOf(c) != -1;
}
function array() {
    return Array.prototype.slice.call(arguments);
}
function strjoin() {
    return Array.prototype.slice.call(arguments).join("");
}
function len(obj) {
    return obj.length;
}
function get_type(obj) {
    return typeof(obj);
}
function is_array(obj) {
    return obj.constructor === Array
}
function is_string(obj) {
    return typeof (obj) === "string"
}
function idx(obj, id) {
    return obj[id];
}
function get(obj, id, default_value) {
    return obj[id] || default_value;
}
function unshift(arr, obj) {
    arr.unshift(obj);
}
function assert() {
}
STRING_TYPE = get_type("")


