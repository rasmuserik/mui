define(function(require, exports, module) {

jsonml = require("jsonml");
console.log(jsonml);

// # Mobile user interface - html5 version

mui = {};

mui.showPage = function(page) {
    showHTML(pageTransform(page));
};

function pageTransform(page) {
    return page;
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
    next.setAttribute("onClick", "handleClick()");
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


//
// # Test application

function genWord() {
    var i, length, s;
    length = 2+0|(Math.random() * 8);
    s = "";
    for(i=0;i<length;++i) {
        s += String.fromCharCode(97+(0|(Math.random()*25)));
    }
    return s;
}

function nextText() {
    var length, i, s;
    length = 5+0|(Math.random() * 50);
    s = "";
    for(i=0;i<length;++i) {
        s += genWord() + " ";
    }
    return s;
}

handleClick = function() {
    showHTML([
            ["div", {"class": "header"}, "header"], 
            ["div", {"class": "contentbox"}, nextText()],
            ["div", {"class": "contentbox"}, nextText()],
            ["div", {"class": "contentbox"}, nextText()],
            ["div", {"class": "footer"}, "footer"]]);
}
require.ready(function() {
    handleClick();
});

});
