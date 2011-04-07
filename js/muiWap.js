require("xmodule").def("muiWap",function(){

    // Express has bug that means that get-requests
    // doesn't work with international symbols...
    // Do some monkeypatching, if you are using gets... 
    //
    //decodeURIComponent = Q.unescapeUri
    //encodeURIComponent = Q.escapeUri

    var http = require('http');
    var jsonml = require('jsonml');
    var _ = require('underscore')._;
    var Q = require('Q');

    var mainFn = function(mui) {
        mui.showPage(["page", {title: "error"}, ["text", "mui.setMain(...) has not been called"]]);
    }

    function randId() {
        var result = "";
        var cs = "1234567890_-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for(var i=20; i; --i) {
            result += Q.pick(cs);
        }
        return result;
    }

    exports.setMain = function(fn) {
        mainFn = fn;
    }
    var mui = {
        form: {},
        loading: function() {
        },
        setHints: require("muiPage").setHints,
        callJsonpWebservice: function(url, callbackParameterName, args, callback) {
        Q.callJsonpWebservice(url, callbackParameterName, args, callback);
        },
        // TODO
        storage: {
            getItem: function() { },
            setItem: function() { }
        },
        showPage: function(page) {
            var title = jsonml.getAttr(page, "title");
            var html =  ["html", { xmlns: "http://www.w3.org/1999/xhtml", "xml:lang": "en"}, 
                         ["head", ["title", title], ["style", {type: "text/css"}, 
                                                     'body { margin: 1% 2% 1% 2%; font-family: sans-serif; line-height: 130%; }']],
                         ["body"].concat(pageTransform(page, this))];
            this.httpResult.writeHead(200, {'Content-Type': 'text/html'});;
            this.httpResult.end(
                ['<!DOCTYPE html PUBLIC "-//OMA//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">',
                 jsonml.toXml(html)].join(""));
        }
    }
    var pageTransform = require("muiPage").transformFactory({wap: true});


    clients = {};

    var express = require("express");
    var app = express.createServer();

    app.configure(function(){
        //app.use(express.methodOverride());
        app.use(express.bodyParser());
        //app.use(app.router);
    });

    app.all('/', function(req, res){
        var muiObject, sid, fn;
    
        params = req.body || req.query;
        console.log(params);

        if(params._ && clients[params._]) {
            muiObject = clients[params._];
            sid = params._;
        } else {
            muiObject = Object.create(mui);
            sid = muiObject.__session_id__ = randId();
            muiObject.session = {};
            muiObject.fns = {};
            // mem leak, sessions are never deleted
            clients[sid] = muiObject;
        }
        muiObject.httpResult = res;
        muiObject.httpRequest = req;
        muiObject.button = params._B;
        muiObject.formValue = function(name) { return params[name]; };
        muiObject.storage = {};
        muiObject.storage.getItem = function() { return 42; };

        fn = muiObject.fns[Q.unescapeUri(muiObject.button || "")] || mainFn;
        muiObject.fns = {};
        
        delete params._;
        delete params._B;
        fn(muiObject);
        console.log(params, muiObject.fns);

    });
    try {
        app.listen(80);
    } catch(e) {
        app.listen(8080);
    }
});
