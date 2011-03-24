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
        var workaround = {};
        var moduleFn = {};
        var loadStack = [];
        var path = "."

        function setPath(newPath) {
            path = newPath;
        }

        // Asynchronous fetch 
        function fetch(name) {
            var scriptTag = document.createElement("script");

            // TODO: handling of path
            scriptTag.src = path + "/" + name + ".js" 

            // Currently no IE 6/7 support - could be implemented
            // with addional onreadystatechange...
            function callback() {
                load(name);

                var loading = loadStack;
                loadStack = [];
                while(loading.length > 0) {
                    load(loading.pop());
                }
            }

            /* seems to be standard */
            scriptTag.onload = callback;
            /* IE-6/7 */
            scriptTag.onreadystatechange = function() { this.readyState === 'complete' && callback(); };
            document.head.appendChild(scriptTag);
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

        var def = function(name, fn) {
            moduleFn[name] = fn;
            load(name);
        }

        var modules = { xmodule: { 
            def: def,
            setPath: setPath } };

    } else {
        exports.def = function(name, fn) {
            fn();
        };
        exports.setPath = function() { };
    }
})();

