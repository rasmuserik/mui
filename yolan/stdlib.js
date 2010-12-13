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
                return "]";
            } else {
                return "\n";
            };
        };
    };
})();
function tail(list, n) {
    n = n || 1;
    return list.slice(n);
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
