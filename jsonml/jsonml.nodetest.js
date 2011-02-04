    sys = require('sys');
    jsonml = require('jsonml');
    require('fs').readFile("test.xml", function(err, data) {
        if(err) {
            console.log("error loading file");
            return;
        }
        //console.log(data.toString("utf-8"));
        //console.log((jsonml.parseXML(data.toString("utf-8"))));
        console.log(jsonml.toXml(jsonml.parseXML(data.toString("utf-8"))[1]));
    });

