require("xmodule").def("muiMidp", function() {
    console.log("A");
    var mui = {};
    var tickerFn = setTicker;
    console.log("B");
    setTicker = undefined;
    mui.loading = function() {
        tickerFn("loading...");
    }
    console.log("C");
    var newForm = newform;
    newform = undefined;
    newForm("Mui App");
    console.log("D");
    mui.loading();

    function childReduce(arr, fn, acc) {
        if(!Array.isArray(arr)) {
            console.log("Error: childReduce expected array, got:", arr);
        }
        var first = arr[1];
        if(typeof(first) === "object" && Array.isArray(first)) {
            acc = fn(acc, first);
        }
        for(var i=2; i < arr.length; ++i) {
            acc = fn(acc, arr[i]);
        }
        return acc;
    }
    var formelem;
    function showSubPage(acc, p) {
        if(Array.isArray(p)) {
            var type = p[0];
            if(type == "section") {
                childReduce(p, showSubPage);
                console.log(type);
            } else if(type == "input") {
                types = {
                    textbox: { type: 0, len: 5000},
                    email: {type: 1, len: 20},
                    tel: { type: 3, len: 20}
                    };
                type = types[p[1].type];
                formelem[p[1].name] = textfield(p[1].label || "", type.len, type.type);
            } else if(type == "text") {
                stringitem(p[1]);
            } else if(type == "button") {
                addbutton(p[2], p[1].fn);
            } else {
                console.log("Unexpected page element:", type);
            }
        } else {
            console.log("Unexpected page element:", p);
        }
    }

    mui.showPage = function(page) {
        formelem = {};
        newForm(page[1].title || "untitled");
        childReduce(page, showSubPage);
    }

    console.log("E");
/*
    newform("Hello world");
    var t = textfield("textbox", 5000, 0);
    textfield("email", 40, 1);
    textfield("tel", 20, 3);
    var c = choice("choice...");
    addchoice(c, "a");
    addchoice(c, "b");
    addchoice(c, "c");
    addbutton("foo", function() { console.log("foo", textvalue(t)); });
    addbutton("bar", function() { console.log("bar", choiceno(c)); });
    stringitem("helo");
    */

    console.log("F");
    mui.loading();
    exports.setMain = function(muiCallback) {
        console.log("setMain: ", muiCallback);
        muiCallback(mui);
    }
    console.log("G");
});
