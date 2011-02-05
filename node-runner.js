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

    return {
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
app.main = function(env) {
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

// node-runner

http.createServer(function (req, res) {
   res.writeHead(200, {'Content-Type': 'text/html'});

   env = node_xhtml_ui(req, res);
   app.main(env);
}).listen(8080, "127.0.0.1");
