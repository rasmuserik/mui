(function() {

    if(typeof require === "undefined") {
        var global = this;


        if(!Object.create) {
            Object.create = function(o) {
                var C = function () {};
                C.prototype = o;
                return new C;
            };
        }

        if(typeof(console) === "undefined") {
            alert("Console not available");
            console = {};
            console.log = function() {};
        }

        global.require = function(name) {
            if(modules[name]) {
                return modules[name];
            } 
            if(failedModules[name]) {
                throw "Loading failed: " + name;
            }
            throw {missingModule: name};
        }
        require.paths = [];

        // function to make certain requires behav
        var failedModules = {};
        var workaround = {
            phonegap: {
                url: "mui/external/phonegap.0.9.4.js",
                fn: function() {
                    exports = PhoneGap;
                }
            }
        };
        var moduleFn = {};
        var loadStack = [];
        var defaultPath = "mui/"
        var fetchReqs = {};
        require.paths = [defaultPath];

        // Asynchronous fetch 
        function fetch(name) {
            if(fetchReqs[name]) {
                return;
            }
            fetchReqs[name] = true;

            var scriptTag = document.createElement("script");

            if(require.paths.length !== 1) {
                var err = "require.paths with length other than one is not supported";
                alert(err);
                throw(err);
            }

            // TODO: handling of path
            var url = require.paths[0] + name + ".js";
            if(workaround[name] && workaround[name].url) {
                url = workaround[name].url;
            }
            scriptTag.src = url + "?" + Math.random();

            // Currently no IE 6/7 support - could be implemented
            // with addional onreadystatechange...
            function callback() {
                if(workaround[name]) {
                    moduleFn[name] = moduleFn[name] || workaround[name].fn;;
                }

                load(name);
            }

            /* seems to be standard */
            scriptTag.onload = callback;
            /* IE-6/7 */
            scriptTag.onreadystatechange = function() { this.readyState === 'complete' && callback(); };
            //document.head.appendChild(scriptTag);
            document.getElementsByTagName("head")[0].appendChild(scriptTag);
        }

        function load(name) {
            // already loaded
            if(modules[name]) {
                return;
            }

            if(moduleFn[name]) {
                /* TODO: assert exports is undefined */
                global.exports = {};

                try {
                    moduleFn[name]();

                } catch(e) {
                    delete global.exports;

                    if(e.missingModule) {
                        fetch(e.missingModule);
                        loadStack.push(name);
                        return;
                    }

                    throw e;
                }

                modules[name] = global.exports;
                delete global.exports;

                var loading = loadStack;
                loadStack = [];
                while(loading.length > 0) {
                    load(loading.pop());
                }
                return;
            }
            failedModules[name] = true; 
        }

        var def = function(name, fn) {
            moduleFn[name] = fn;
            load(name);
        }

        var modules = { xmodule: { def: def } };

    } else {
        exports.def = function(name, fn) {
            fn();
        };
        exports.setPath = function() { };
    }
})();

