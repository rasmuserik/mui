require("xmodule").def("ssjs",function(){
     if(typeof(process) === "undefined" || process.versions.node === undefined) {
        throw "could not load ssjs, - not on node!";
     }


    exports.urlFetch = function(url, callback) {
        var result = [];
        if(url.slice(0,7) !== "http://") {
            throw "not http!";
        }
        url = url.slice(7);
        var i = url.indexOf("/");
        if(i === -1) {
            host = url;
            path = "/";
        } else {
            host = url.slice(0, i);
            path = url.slice(i);
        }
        var client = require('http').createClient(80, host);
        var request = client.request('GET', path, {'host': host});
        request.end();

        request.on('response', function (response) {
            response.on('data', function(chunk) { result.push(chunk); });
            response.on('end', function() { callback(result.join("")) });
        });
    }


});
