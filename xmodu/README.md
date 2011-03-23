# Cross-platform modules and module loader

## Module loader

Module system designed, such that modules can be used unaltered,
in the browser, in LightScript, and also with the CommonJS module system.

Modules are defined like this:

    require("xmodu").xmodu("$MODULE_NAME", function() {
        ... require("...") ...
        ... exports.... = ...
    });


Loading xmodu adds the following objects to the global scope, if none of them are defined:

    - `require` - used for loading a module, only call within a 
    - `exports` - before loading a module, this will be created as an empty object. Properties set on this object will be available when the module is required.

require and exports has the same base functionality 
as in commonjs module system.

