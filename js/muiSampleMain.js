require("xmodule").def("muiSampleMain",function(){

    require("muiApp").setMain(main);

    function main() {
            mui.showPage(["page", 
                ["inputarea", {"label": "cql query", "name": "query"}], 
                ["button", {"id":"blah"}, "search"],
                ["text", "sample widgets below..."], 
                ["choice", {"name": "foo", "label": "ffkkfk"},
                    ["option", {"value": "1"}, "a"],
                    ["option", {"value": "2"}, "b"]
                ]]);
    }

/*
    function muiCallback(mui, ctx) {
        if(mui.event === "start") {
            mui.showPage(["page", 
                ["inputarea", {"label": "cql query", "name": "query"}], 
                ["button", {"id":"blah"}, "search"],
                ["text", "sample widgets below..."], 
                ["choice", {"name": "foo", "label": "ffkkfk"},
                    ["option", {"value": "1"}, "a"],
                    ["option", {"value": "2"}, "b"],
                ]
            ], ctx);
       } else {
            mui.loading();
            mui.callJsonpWebservice("http://opensearch.addi.dk/1.0/", "callback", {
                action: "search",
                query: mui.form.query,
                source: "bibliotekdk",
                start: "1",
                stepvalue: "1",
                outputType: "json"}, function(result) {
                    mui.showPage(["page", 
                        ["text", "Number of hits: ", result.searchResponse.result.hitCount.$],
                        ["button", {"id": "start"}, "back to start"]
                        ]);
                });
        }
    }
    */
});
