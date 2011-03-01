var fields = [];
var searchform = [{}, {
    "input": "",
    "id": "term"
}, {
    "button": "Forfatter",
    "id": "field",
    "val": "forfatter",
    "action": search
}, {
    "button": "Titel",
    "id": "field",
    "val": "titel",
    "action": search
}, {
    "button": "Emne",
    "id": "field",
    "val": "emne",
    "action": search
}, {
    "button": "Fritekst",
    "id": "field",
    "val": "fritekst",
    "action": search
}];
var main = function (uiParams) {
    searchform[0] = {
        "text": "Søg i bibliotek.dk"
    };
    createUI(searchform);
    );
};
var fieldsToRequest = function (fields, startpos, count) {
    var request = {
        "start": startpos,
        "count": count
    };
    for (var i in fields) {
        request["field" + (i + 1)] = fields[i]["field"];
        request["term" + (i + 1)] = fields[i]["term"];
    };
    rpcRequest("bibliotek.dk wrapper", request, handleResults);
};
var search = function (uiParams) {
    createUI([{
        "button": "Præcisér søgning"
    }, {
        "text": "Søger... vent venligst.",
        "id": "searchresults"
    }]);
    fields = data["fields"] || [];
    fields . push({
        "field": uiParams["field"],
        "term": uiParams["term"]
    });
    sendRequest(fields, 0, 5);
};
