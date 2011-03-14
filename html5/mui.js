define(function(require, exports, module) {

jsonml = require("jsonml");

// # Mobile user interface - html5 version
exports.showPage = function(page) {
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
});
