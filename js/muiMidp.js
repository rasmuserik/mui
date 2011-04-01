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

    mui.showPage = function(page) {
        newForm(page[1].title || "untitled");
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
