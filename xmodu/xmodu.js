(function() {
    global = this;

    if(true /* browser and no require/exports loader */) {

        global.require = function(name) {
            if(modules[name]) {
                return modules[name];
            } 
            throw {missingModule: name};
        }

        // function to make certain requires behav
        workaround = {};

        loadStack = [];

        // Asynchronous fetch 
        function fetch(name) {
            // TODO: finish script tag;
            var scriptTag = document.createElement("script");

            // TODO: handling of path
            scriptTag.src = name + ".js" 

            // Currently no IE 6/7 support - could be implemented
            // with addional onreadystatechange...
            scriptTag.onload = function() {
                --fetching;
                load(name);

                var loading = loadStack;
                loadStack = [];
                while(loading.length > 0) {
                    load(loading.pop());
                }
            }
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

                    if(!e.missingModule) {
                        throw e;
                    }

                    fetch(e.missingModule);
                    loadStack.push(name);
                    return;
                }

                modules[name] = global.exports;
                delete global.exports;
                return;
            }
            if(workaround[name]) {
                workaround[name](name, modules);
            }
            throw "Unable to load: " + name
        }

        var xmodu = function(name, fn) {
            moduleFn[name] = fn;
        }

        var modules = { xmodu: { xmodu: xmodu} };

    } else {
        exports.xmodu = function(name, fn) {
            module_def();
        }
    }
})();

