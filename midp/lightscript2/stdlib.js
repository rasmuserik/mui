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
function tail(list, n) {
    n = n || 1;
    return list.slice(n);
}
function slice(list, a, b) {
    return list.slice(a, b);
}
function map(fn, list) {
    return list.map(fn);
}
function fold(fn, list, acc) {
    var i = 0;
    while(i < len(list)) {
        acc = fn(list[i], acc);
        i = i + 1;
    }
    return acc;
}
function array_join(list, sep) {
    return list.join(sep);
}
function array_push(list, elem) {
    list.push(elem);
}
function push(list, elem) {
    list.push(elem);
    return list;
}
function string_contains(str, c) {
    return str.indexOf(c) != -1;
}
function strjoin() {
    return Array.prototype.slice.call(arguments).join("");
}
function str(o) {
    return "" + o;
}
function len(obj) {
    return obj.length;
}
function is_array(obj) {
    return obj && obj.constructor === Array
}
function is_string(obj) {
    return typeof (obj) === "string"
}
function get(obj, id, default_value) {
    return obj[id] || default_value;
}
function cons(obj, arr) {
    var result = arr.slice(0);
    result.unshift(obj);
    return result;
}
function assert(ok) {
    if(!ok) throw "ASSERT ERROR";
}
