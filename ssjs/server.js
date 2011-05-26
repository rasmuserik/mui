// # Server setup - express
var express = require('express');

var app = express.createServer();

app.configure(function(){
    //app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    //app.use(app.router);
});


require('jsdom').jsdom.env( '<div id="container"><div id="current"></div></div>',
        [ 'mui/jquery16min.js', "mui/jsonml.js", "mui/mui.js", "../../sporgetjeneste/code/main.js" ], function(errors, window) {

    var mui = window.mui;
    window.mui = undefined;

    app.get('/', function(req, res){
        handleRequest(req, res, window, mui);
    });

    try {
        app.listen(80);
    } catch(e) {
        app.listen(8080);
    }
});

clients = {};

function handleRequest(req, res, window, mui) {
    var muiObject, sid, fn;
    
    var params = req.body || req.query;
    if(req.cookies && req.cookies._) {
        sid = req.cookies._;
    } else if(params._ && clients[params._]) {
        sid = params._;
    }

    muiObject = clients[sid];

    if(!muiObject) {
        sid = (new Date).getTime() % 10000 + Math.random();
        res.cookie('_', sid, {maxAge: 5*365*24*60*60*1000});

        muiObject = Object.create(mui);
        muiObject.sid = sid;
        muiObject.session = {};
        muiObject.fns = {};

        // TODO: fix mem leak, sessions are never deleted
        clients[sid] = muiObject;

        // TODO actually back store to disk or database
        muiObject.storage = (function() {
            var store = {};
            return {
                getItem: function(key) { return store[key]; },
                setItem: function(key, value) { store[key] = value; }
            };
        })();
    }

    muiObject.formValue = function(name) { return params[name]; };

    muiObject.button = params._B;

    fn = muiObject.fns[/*unescapeUri(*/muiObject.button /*|| "")*/] || mui.main;
    muiObject.fns = {};
    
    window.ssjs = {
        buttonName: function(name, fn) {
            muiObject.fns[name] = fn;
        },
        send: function() {
            res.header("Content-Type", "text/html;charset=UTF-8");
            res.end('<!doctype html><html class="no-js" manifest="mui.appcache">'
                + '<head>'
                + '<link rel="stylesheet" href="mui/mui.css">'
                + '<link rel="shortcut icon" href="icon.png">'
                + '<meta name="MobileOptimized" content="320"/>'
                + '<meta name="HandheldFriendly" content="True">'
                + '<link rel="apple-touch-startup-image" href="splash.png">'
                + '<meta name="apple-mobile-web-app-capable" content="yes">'
                + '<link rel="apple-touch-icon-precomposed" href="icon.png">'
                + '<meta name="viewport" content="width=320, initial-scale=1.0">'
                + '<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">'
                + '<meta name="apple-mobile-web-app-status-bar-style" content="black">'
                + '</head><body><form method="GET" action="/">'
                + window.$("body").html()
                + '</form></body></html>'
            );
        }
    }
        
    delete params._;
    delete params._B;
    fn(muiObject);

}
