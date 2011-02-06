// application
var webservice = "http://localhost:1234/";

var handles = {

    "search": function(env) {
        env.show({
            title: "Søgeresultater",
            callback: "search-callback",
        });
    },

    "search-callback": function(env) {
        var query = env.params.query;

        env.remoteCall(webservice + "search", 
            {first: env.first, count: env.count, query: query}, 
            function(response) {

        var content;
        var result = {};
        result.first = env.first;
        result.count = response.entries.length;
        result.total = response.total;
        result.content = content = [];
        for(var i = 0; i < response.entries.length; ++i) {
            var entry = response.entries[i];
            var entryno = env.first + i;
            content.push(["entry", 
                {id: JSON.stringify([query, entryno]), next: "show-entry"}, 
                ["em", entry.author, ": "], 
                entry.title]);
        }

        env.entries(result);

        }); 
    },

    "æ ø + ": function(env) {
        var page = {};
        page.title = "bibliotek.dk";
        page.next = "search";
        page.content = [
            /*["input", {label: "Forfatter"}],
            ["input", {label: "Titel"}],
            ["input", {label: "Emne"}],
            ["input", {label: "Fritekst"}],*/
            ["input", {name: "query"}],
            ["button", "Søg"]];
        env.show(page);
    },

    "default": function(env) {
        if(env.params.button !== "default" && handles[env.params.button]) {
            handles[env.params.button](env);
        } else {
            env.show({
                title: "demo",
                next: "demo",
                content: [
                    ["button", "æ ø + "],
                    ["button", "fib"],
                    ["button", "ui-demo"],
                    ["button", "callback-demo"],
                    ["button", "default"]]});
        }
    },

    "ui-demo": function(env) {
        env.show({title: "ui-demo",
                next: "default",
                content: [
                    ["button", "button"], 
                    ["input", {label: "input with label"}]]})
    },

    "callback-demo": function(env) {
        env.show({callback: "callback-demo-callback"});
    },
    "callback-demo-callback": function(env) {
        var values = ["Once", "upon", "a", "midnight", "dreary", "while", 
                "I", "pondered", "weak", "and", "weary", "over", "many", 
                "a", "quaint", "an", "curious", "volume", "of", 
                "forgotten", "lore", "while", "i", "nodded", "nearly", 
                "napping", "suddenly", "there", "came", "a", "tapping"];

        var result = { total: values.length, content:[] };

        for(i = env.first; i < env.first + env.count && i < result.total; ++i) {
            result.content.push(["entry", "result nr " + i + ": " + values[i]]);
        }
        env.entries(result);
    },

    "fib": function(env) {
        env.show({title: "Fibonacci numbers", callback: "fib-callback"});
    },

    "fib-callback": function(env) {
        function genfibs(n) {
            result = [1, 1];
            for(var i = 2; i < n; ++i) {
                result.push(result[i-1] + result[i-2]);
            }
            return result;
        }

        var fibs = genfibs(env.first + env.count);
        var result = {};
        result.total = 100000;
        result.content = [];
        for(var i = 0; i < env.count; ++i) {
            var n = i + env.first;
            result.content.push(["entry", "the " + (n+1) + "th Fibonacci number is: " + fibs[n]]);
        }
        env.entries(result);
    }

}

exports.main = function(env) {
    (handles[env.pagename] || handles["default"])(env);
}
