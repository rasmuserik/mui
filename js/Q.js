require("xmodule").def("Q",function(){

    var randint = exports.randint = function(n) {
        console.log("randint!");
        console.log(Math);
        console.log(Math.random);
        console.log(Math.random());
        return 0 | (Math.random()*n)
    };

    var pick = exports.pick = function(a) {
        console.log("pick");
        return a[randint(a.length)];
    };

    var features = exports.features = {
        browser: typeof(navigator) !== "undefined",
        nodejs: typeof(process) !== "undefined" && process.versions.node !== undefined,
        lightscript: typeof(LightScript) !== "undefined"
    };

    var executeRemote = exports.executeRemote = function(url) {
        if(features.nodejs) {
            urlFetchNodejs(url, function(txt) {
                Function(txt)();
            });
        } else if(features.browser) {
            var scriptTag = document.createElement("script");
            scriptTag.setAttribute("src", url);
            document.getElementsByTagName("head")[0].appendChild(scriptTag);
        } else {
            throw "unsupported operation"
        }
    };

    function urlFetchNodejs(url, callback) {
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


    var id = 0;
    function uniqId() {
        console.log("uniq");
        var letters = 'qwertyuiopasdfghjklzxcvbnmQWERTYIUOPASDFGHJKLZXCVBNM_$'
        console.log("uniq: pick, exports.pick ", pick, exports.pick);
        var result = pick(letters);
        for(var i = 0; i < 10; ++i) {
            console.log("B");
            result += pick(letters+"1234567890");
        }
        console.log("C");
        result += ++id;
        return result;
    }
    
    exports.callJsonpWebservice = function(url, callbackParameterName, args, callback) {
        console.log("JsonpWebservice");
        // clone args, as we want to add a jsonp-callback-name-property
        // without altering the original parameter
        args = Object.create(args); 

        console.log("A");

        // temporary global callback function, that deletes itself after used
        var callbackName = "_Q_" + uniqId();
        console.log("B");
        var callbackFn = global[callbackName] = function(data) {
            if(global.hasOwnProperty(callbackName)) {
                delete global[callbackName];
                try {
                    callback(data);
                } catch(e) {
                    callbackError(e);
                }
            }
        }
        // if we haven't got an answer after one minute, assume that an error has occured, 
        // and call the callback, without any arguments.
        setTimeout(callbackFn, 60000);

        args[callbackParameterName] = callbackName;

        executeRemote(url + "?" + encodeUrlParameters(args));
    }

    var encodeUrlParameters = exports.encodeUrlParameters = function (args) {
        var result = [];
        for(name in args) {
            result.push(escapeUri(name) + "=" + escapeUri("" + args[name]));
        }
        return result.join("&");
    }


    // Fixed uri escape. JavaScripts escape, encodeURI, ... are buggy.
    // These should work.
    exports.unescapeUri = function(uri) {
        uri = uri.replace(RegExp("((\+)|%([0-9a-fA-F][0-9a-fA-F]))", "g"), 
                          function(_1,_2,plus,hexcode) { 
                              if(plus) {
                                  return " ";
                              } else {
                                  return String.fromCharCode(parseInt(hexcode, 16));
                              }
                          })
        uri = uri.replace(RegExp("&#([0-9][0-9][0-9]*);", "g"), function(_, num) { 
            return String.fromCharCode(parseInt(num, 10)); 
        });
        return uri;
    }

    var urichars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_~.";
    var escapeUri = exports.escapeUri = function (uri) {
        var result = [];
        for(var i=0;i<uri.length;++i) {
            var c = uri[c];
            if(urichars.indexOf(c) >= 0) {
                result.push(c);
            } else {
                c = c.charCodeAt(0);
                if(c > 255) {
                    result.push(escapeUri("&#" + c + ";"));
                } else {
                    result.push( "%" + (c<16?"0":"") + c.toString(16));
                }
            }
        }
        return result.join();
    };

});
