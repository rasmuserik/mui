mui = {};

exports = {};
document.write('<script src="jsonml.js"></script>');
document.write('<link rel="stylesheet" href="mui.css"></script>');
jsonml = exports;

mui = {};
(function(){
    
    
    // # Mobile user interface - html5 version
    mui.showPage = function(page) {
        if(page[0] !== "page") {
            throw("Parameter to showPage must be a jsonml 'page'");
        } 
        showHTML(pageTransform(page));
    };
    
    var dispatch = function() { throw "Dispatch function not defined. Remember to call mui.setDispatch. Before showing ui-elements that may call back"; };
    
    mui.setDispatch = function(dispatchFunction) {
        dispatch = dispatchFunction;
    };
    uniqId = (function() {
        var id = 0;
        return function() {
            return "__mui_id_" + ++id;
        }
    })();
    
    function pageTransform(page) {
    
        var handlers = {
            inputarea: function(html, node) {
                var result = ["div", {"class": "contentbox"}];
    
                var labelid = uniqId();
                if(jsonml.getAttr(node, "label")) {
                    result.push(["div", {"class": "label"}, ["label", {"for": labelid}, jsonml.getAttr(node, "label"), ":"]]);
                }
    
                result.push(["textarea", {"id": labelid}, ""]);
                html.push(result);
            },
            choice: function(html, node) {
                var result = ["div", {"class": "contentbox"}];
    
                var labelid = uniqId();
                if(jsonml.getAttr(node, "label")) {
                    result.push(["div", {"class": "label"}, ["label", {"for": labelid}, jsonml.getAttr(node, "label"), ":"]]);
                }
    
                var name = jsonml.getAttr(node, "name");
                if(!name) {
                    throw "choice widgets must have a name attribute";
                }
    
                jsonml.childReduce(node, function(html, node) {
                    if(node[0] !== "option") {
                        throw "only option nodes are allows as children to choices";
                    }
                    if(!jsonml.getAttr(node, "value")) {
                        throw "option widgets must have a value attribute";
                    }
                    var result = ["input", {"type": "radio", "name": name, "value": jsonml.getAttr(node, "value")}];
                    jsonml.childReduce(node, nodeHandler, result);
                    html.push(["div", {"class": "option"}, result]);
                    return html;
                }, result);
                html.push(result);
            },
            text: function(html, node) {
                var result = ["div", {"class": "contentbox"}];
                jsonml.childReduce(node, nodeHandler, result);
                html.push(result);
            },
            button: function(html, node) {
                if(!jsonml.getAttr(node, "id")) {
                    throw "buttons must have an id attribute";
                }
                var attr = {"type": "submit", "value": "TODO", "class": "button", onclick: "handleClick()" + jsonml.getAttr(node, "id") + /* TODO */ "');"};
                var result = ["span", attr];
                var result = ["div", {"class": "button", "onClick": "handleClick()"}];
                jsonml.childReduce(node, nodeHandler, result);
                html.push(result);
            }
        };
    
        function nodeHandler(html, node) {
            if(typeof(node) === "string") {
                html.push(node);
            } else {
                var handle = handlers[node[0]]; 
                if(!handle) {
                    throw "mui received a page containing an unknown tagtype: " + node[0];
                }
                handle(html, node);
            }
            return html;
        }
    
        var html = ["form"];
        var title = jsonml.getAttr(page, "title") || "untitled";
        jsonml.childReduce(page, nodeHandler, html);
        return [["div", {"class":"header"}, title], html, ["div", {"class":"contentend"}, " "]];
    }
    
    function height(dom) {
        return document.defaultView.getComputedStyle(dom, "").getPropertyValue("height");
    }
    
    function gId(name) {
        return document.getElementById(name);
    }
    
    function domRemove(node) {
        node.parentNode.removeChild(prev);
    }
    
    function showHTML(html) {
        next = document.createElement("div");
        next.setAttribute("id", "next");
        next.innerHTML = html.map(jsonml.toXml).join('');
        var current = gId("current");
        gId("container").insertBefore(next, current);
        current.style.top = "-" + height(next);
        setTimeout(slidein, 0);
    }
    
    function slidein() {
        window.scroll(0,0);
    
        domRemove(gId("prev"));
    
        gId("current").setAttribute("id", "prev");
    
        var next = gId("next");
        next.setAttribute("id", "current");
    
        gId("container").style.height = Math.max(parseInt(height(next), 10), window.innerHeight) + "px";
    }

    document.write('<div id="container"><div id="current"></div><div id="prev"></div></div>');
    function main() {
        muiCallback(mui, {"event": "start"});
    }
    setTimeout(main, 400);
    
})();
