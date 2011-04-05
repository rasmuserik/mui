require("xmodule").def("muiPage",function(){
    var jsonml = require("jsonml");

    // Generate an uniq id - probably move this to Q
    uniqId = (function() {
        var id = 0;
        return function() {
            return "__mui_id_" + id++;
        }
    })();

    exports.transformFactory = function(config) { return function pageTransform(page, mui) {
        var handlers = {

            section: function(html, node) {
                var result = ["div", {"class": "contentbox"}];
                jsonml.childReduce(node, nodeHandler, result);
                html.push(result);
            },

            input: function(html, node) {
                if(config.midp) {
                    types = {
                        textbox: { type: 0, len: 5000},
                        email: {type: 1, len: 20},
                        tel: { type: 3, len: 20}
                        };
                    type = types[p[1].type];
                    inputelem[p[1].name] = textfield(p[1].label || "", type.len, type.type);
                    return;
                }

                var result = ["div", {"class": "input"}];
                var type = jsonml.getAttr(node, "type");
                if(!type) {
                    throw "input widgets must have a type attribute";
                }
                var name = jsonml.getAttr(node, "name");
                if(!name) {
                    throw "input widgets must have a name attribute";
                }

                var tagAttr = {"class": type, "name": name};

                var label = jsonml.getAttr(node, "label");
                if(label) {
                    var labelid = uniqId();
                    if(config.html5 && config.placeholder) {
                        tagAttr.placeholder = label;
                    } else {
                        result.push(["div", {"class": "label"}, ["label", {"for": labelid}, label, ":"]]);
                    } 
                    tagAttr.id = labelid;
                }

                var value =  jsonml.getAttr(node, "value") || "";

                if(type === "textbox") {
                    result.push(["textarea", tagAttr, value]);                

                } else { // normal input
                    if(config.html5) {
                        tagAttr.type = type;
                        tagAttr.value = value;
                        if(type === "tel" && !config.telInput) {
                            tagAttr.type = "number";
                            
                        }
                    } else if(config.wap) {
                        if(type === "email" || type === "text") {
                            tagAttr.type = "text";
                            tagAttr.inputmode = "latin";
                        } else if(type === "tel") {
                            tagAttr.style = "-wap-input-format:'*N'";
                            tagAttr.type = "text";
                            tagAttr.inputmode = "digits";
                        }
                    }
                    result.push(["input", tagAttr]);
                }
                html.push(result);
            },

            choice: function(html, node) {
                if(config.midp) {
                    var choiceVal = [choice(node[1].label || "")];
                    choiceelem[node[1].name] = choiceVal;
                    for(var i = 2; i < node.length; ++i) {
                        addchoice(choiceVal[0], node[i][2]);
                        choiceVal.push(node[i][1].value);
                    };
                    return;
                }

                var result = ["div", {"class": "input"}];

                var defaultValue =  jsonml.getAttr(node, "value") || "";
                var tagAttr = {"name": jsonml.getAttr(node, "name")};
                var select = ["select", tagAttr];

                var label = jsonml.getAttr(node, "label");
                if(label) {
                    select.push(["option", {}, label]);
                }

    
                jsonml.childReduce(node, function(result, node) {
                    if(node[0] !== "option") {
                        throw "only option nodes are allows as children to choices";
                    }
                    var value =  jsonml.getAttr(node, "value");
                    if(!value) {
                        throw "option widgets must have a value attribute";
                    }
                    var attrs = { value : value };
                    if(value === defaultValue) {
                        attrs.selected = "true";
                    }
                    select.push(["option", attrs, node[2]]);
                    return result;
                }, result);
                result.push(select);
                html.push(result);
            },

            text: function(html, node) {
                if(config.midp) {
                    var text = "";
                    for(var i = 1; i < node.length; ++i) {
                        text += node[i];
                    }
                    stringitem(text);
                    return;
                }
                var result = ["div", {"class": "text"}];
                jsonml.childReduce(node, nodeHandler, result);
                html.push(result);
            },

            button: function(html, node) {
                if(!jsonml.getAttr(node, "fn")) {
                    throw "buttons must have an fn attribute, containing a function to call";
                }

                if(config.midp) {
                    addbutton(p[2],
                        function() {
                            var form = {};
                            for(name in inputelem) {
                                form[name] = textvalue(inputelem[name]);
                            }
                            for(name in choiceelem) {
                                form[name] = choiceelem[name][1+choiceno(choiceelem[name][0])];
                            }
                            mui.formValue = function(name) {
                                return form[name];
                            };
                            p[1].fn(mui);
                        });
                    return;
                }

                if(config.html5) {
                    var fnid = uniqId();
                    __mui__.__callbacks[fnid] = jsonml.getAttr(node, "fn");
                    var attr = {"class": "button", onclick: "__mui__.__call_fn('"+fnid+"');"};
                    var result = ["div", attr];
                    jsonml.childReduce(node, nodeHandler, result);
                    html.push(result);

                } else if(config.wap) {
                    var text = node.slice(2).join("");
                    mui.fns[text] = jsonml.getAttr(node, "fn");
                    var attr = {"class": "button", type: "submit", "name": "_B", value: text};
                    var result = ["input", attr];
                    html.push(result);
                }
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
    
        if(config.midp) {
            jsonml.childReduce(page, nodeHandler, []);
            return;
        }
        if(config.html5) {
            var html = ["form"];
            var title = jsonml.getAttr(page, "title") || "untitled";
            jsonml.childReduce(page, nodeHandler, html);
            return [["div", {"class":"header"}, title], html, ["div", {"class":"contentend"}, " "]];
        }
    
        if(config.wap) {
            var html = ["form", ["input", {type: "hidden", name: "_", value: mui.__session_id__}]];
            var title = jsonml.getAttr(page, "title") || "untitled";
            jsonml.childReduce(page, nodeHandler, html);
            return [["h1", title], html];
        }

    }; };
});