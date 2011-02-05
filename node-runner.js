require.paths.unshift('.')
http = require('http');
jsonml = require('jsonml');
_ = require('underscore')._;

// ui -> html mapper
function ui2html(ui) {
    var transformer = ({
        button: function() {
            return ["input", {type: "submit", name: "button", value: ui[1]}];
        },
        input: function() {
            var attr = ui[1];
            var label = attr.label;
            var name = attr.name || label;
            var result = ["div"];
            if(label) {
                result.push(["div", ["label", {for: name}, label + ": "]]);
            }
            result.push(["input", {type: "text", inputmode: "latin predictOff", name: name, id: name}]);
            return result;
        }
    })[ui[0]];
    if(!transformer) {
        console.log("Unknown UI element: " + ui[0]);
        return ui;
    }
    return transformer(ui);
}


// node xhtml ui
function node_xhtml_ui(req, res) {

    var pagename, params;
    params = pagename = req.url.split('?')
    pagename = pagename[0].split('/');
    pagename = pagename[pagename.length - 1];
    if(params.length > 1) {
        params.shift();
        params = params.join('').split('&');
        params = _.reduce(params, function(acc, elem) {
            var t = elem.split("=");
            acc[t[0]] = t[1];
            return acc;
        }, {});
    } else {
        params = {};
    }

    return {
        pagename: pagename,
        params: params,
        show: function(page) {
            var title = page.title || "untitled";
            var menu = page.menu || {};
            var next = page.next || ""
            var content = page.content || [];
            var html = 
                ["html", { xmlns: "http://www.w3.org/1999/xhtml", "xml:lang": "en"}, 
                  ["head", 
                    ["title", title],
                    ["style", {type: "text/css"}, 'body { margin: 1% 2% 1% 2%; font-family: sans-serif; line-height: 130%; }']],
                  ["body", ["h1", title],
                    ["form", {action: next, methor: "GET"}].concat(_.map(content, ui2html))]];

            res.end(
                    ['<!DOCTYPE html PUBLIC "-//OMA//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">',
                    jsonml.toXml(html)].join(""));
        }
    };
}

// Notes
/*
   infinite-list:


xhtml:

    x = env(req...pagename="search", ($X=)params)
    app.main(env{pagename="search"}):
        env.show({..., callback="search-callback"}):
            (same env with query passed to search-callback, but should be immutable for app.main)
            app.main(env{pagename="search-callback", first=0, count=10}):
                env.entries({first=0, count=10, total=16, content=[...]});
-> browser ->
    x = env(req...pagename="search", params=$X++{MOUI_CALLBACK_FIRST=10...}(pga. links));
    app.main(env{pagename="search"}):
        env.show({..., callback="search-callback"}):
            app.main(env{pagename="search-callback", first=10, count=10}):
                env.entries({first=10, count=6, total=16, content=[...]});


ajax:
    x = env(req...pagename="search")
    app.main(env{pagename="search"}):
        env.show({..., callback="search-callback"}):
            app.main(env{pagename="search-callback", first=0, count=10}):
                env.entries({first=0, count=10, total=16, content=[...]});
-> scroll fire env-event ->
            app.main(env{pagename="search-callback", first=10, count=10}):
                env.entries({first=10, count=6, total=16, content=[...]});
    


*/

// application
var app = {}

var webservice = "http://localhost:1234/";

var handles = {
    "search": function(env) {
        env.show({
            title: "Søgeresultater",
            callback: "search-callback",
            next: "show-entry"
        });
    },
    "search-callback": function(env) {
        remoteCall(webservice + "search", 
            {first: env.first, count: env.count, query: env.params.query}, 
            function(result) {

        var entryno = env.first - 1;
        var content = _.map(result.entries, function(entry) {
            ++entryno;

            return ["entry", {id: JSON.stringify([env.params.query, entryno])}, ["em", entry.author, ": "], entry.title]
        });
        env.entries({first: env.first, count: env.count, total: result.total, content: content});
        });
    },
    "default": function(env) {
        var page = {};
        page.title = "bibliotek.dk";
        page.next = "search";
        page.content = [
            ["input", {label: "Forfatter"}],
            ["input", {label: "Titel"}],
            ["input", {label: "Emne"}],
            ["input", {label: "Fritekst"}],
            ["button", "Søg"]];
        env.show(page);
    }
}

app.main = function(env) {
    (handles[env.pagename] || handles["default"])(env);
}

// node-runner

http.createServer(function (req, res) {
    var params, t;
    res.writeHead(200, {'Content-Type': 'text/html'});;
    env = node_xhtml_ui(req, res, app.main);
    console.log(env);
    app.main(env);
}).listen(8080, "127.0.0.1");
