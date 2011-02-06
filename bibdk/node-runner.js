require.paths.unshift('.')
http = require('http');
jsonml = require('jsonml');
_ = require('underscore')._;

// ui -> html mapper
function uiChildren(ui) {
    var pos;
    var result = [];
    if(_.isArray(ui[1]) || typeof ui[1] !== "object") {
        pos = 1;
    } else {
        pos = 2;
    }
    while(pos < ui.length) {
        if(_.isArray(ui[pos])) {
            result.push(ui2html(ui[pos]));
        } else {
            result.push(ui[pos]);
        }
        ++pos;
    }
    return result;
}
function ui2html(ui) {
    var transformer = ({
        em: function(ui) {
            return ["em"].concat(uiChildren(ui));
        },
        button: function(ui) {
            return ["input", {type: "submit", name: "button", value: ui[1]}];
        },
        input: function(ui) {
            var attr = ui[1];
            var label = attr.label;
            var name = attr.name || label;
            var result = ["div"];
            if(label) {
                result.push(["div", ["label", {for: name}, label + ": "]]);
            }
            result.push(["input", {type: "text", inputmode: "latin predictOff", name: name, id: name}]);
            return result;
        },
        entry: function(ui) {
            return ["div", ["a", {href: ui[1].handle + "?id=" + ui[1].id}].concat(uiChildren(ui))];
        }
    })[ui[0]];
    if(!transformer) {
        console.log("Unknown UI element: " + ui[0]);
        return ui;
    }
    return transformer(ui);
}


// node xhtml ui
function node_xhtml_ui(req, res, app) {

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

        remoteCall: function(url, params, callback) {
            var entries = [];
            var total = 24;
            for(var i = 0; i < params.count; ++i ) {
                if(params.first+i < total) {
                    entries.push({author: "N.N", title: "book " + (params.first+ i)});
                }
            }
            callback({ total: total, entries: entries });
        },

        show: function(page) {
            var title = page.title || "untitled";
            var menu = page.menu || {};
            var next = page.next || ""
            var content = [];

            if(page.content) {
                content.push(["form", {action: next, method: "GET"}].concat(_.map(page.content, ui2html)));
            }

            if(page.callback) {
                var form = ["form", {action: this.pagename, method: "GET"}];
                _.each(params, function(value, key) {
                        if(key.slice(0,4) !== "MUI_") {
                            form.push(["input", {type: "hidden", name: key, value: value}]);
                        }
                });
                var pagename = this.pagename;
                this.pagename = page.callback;
                this.first = parseInt(this.params.MUI_CALLBACK_FIRST || "0", 10);
                if(this.params.MUI_BUTTON === "next") {
                    this.first += 10;
                }
                if(this.params.MUI_BUTTON === "previous") {
                    this.first -= 10;
                }
                form.push(["input", {type: "hidden", name: "MUI_CALLBACK_FIRST", value: "" + this.first}]);
                this.count = 10;
                this.entries = function(entries) {
                    var total = entries.total;
                    var first = (entries.first + 1)
                    var last = (entries.first+entries.content.length)

                    form.push(["div", "" + first, "-", "" + last, " / ",  "" + entries.total]);
                    _.each(entries.content, function(entry) {
                        form.push(ui2html(entry));
                    });
                    if(first >  1) {
                        form.push(["input", {type: "submit", name: "MUI_BUTTON", value:"previous"}]);
                    }
                    if(last < total) {
                        form.push(["input", {type: "submit", name: "MUI_BUTTON", value:"next"}]);
                    }
                };
                app.main(this);
                content.push(form);
            }

            var html = 
                ["html", { xmlns: "http://www.w3.org/1999/xhtml", "xml:lang": "en"}, 
                  ["head", 
                    ["title", title],
                    ["style", {type: "text/css"}, 'body { margin: 1% 2% 1% 2%; font-family: sans-serif; line-height: 130%; }']],
                  ["body", ["h1", title]].concat(content)];

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
        });
    },
    "search-callback": function(env) {
        var query = env.params.query;

        env.remoteCall(webservice + "search", 
            {first: env.first, count: env.count, query: query}, 
            function(response) {

        var content;
        var result = {};
        result.first = env.first;
        result.count = response.entries.length;
        result.total = response.total;
        result.content = content = [];
        for(var i = 0; i < response.entries.length; ++i) {
            var entry = response.entries[i];
            var entryno = env.first + i;
            content.push(["entry", 
                {id: JSON.stringify([query, entryno]), handle: "show-entry"}, 
                ["em", entry.author, ": "], 
                entry.title]);
        }

        env.entries(result);

        }); 
    },
    "default": function(env) {
        var page = {};
        page.title = "bibliotek.dk";
        page.next = "search";
        page.content = [
            /*["input", {label: "Forfatter"}],
            ["input", {label: "Titel"}],
            ["input", {label: "Emne"}],
            ["input", {label: "Fritekst"}],*/
            ["input", {name: "query"}],
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
    env = node_xhtml_ui(req, res, app);
    app.main(env);
}).listen(8080, "127.0.0.1");
