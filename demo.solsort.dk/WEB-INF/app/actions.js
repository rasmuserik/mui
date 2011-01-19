foo = require('ringo/httpclient');

exports.index = function (req) {
    return {
        status: 200,
        headers: {"Content-Type": "text/html"},
        body: ["<html><head><title></title></head><body>", uneval(req), uneval(foo) ,"</body></html>"]
    };
};
