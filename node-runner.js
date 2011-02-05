require.paths.unshift('.')
http = require('http');
jsonml = require('jsonml');
_ = require('underscore');

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

// application
var app = {}
var handles = {
    "search": function(env) {
        var page = {};
        page.next = "default";
        page.content = [
            ["button", "not implemented yet"]];
        env.show(page);
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
    env = node_xhtml_ui(req, res);
    console.log(env);
    app.main(env);
}).listen(8080, "127.0.0.1");
