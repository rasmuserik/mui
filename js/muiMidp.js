require("xmodule").def("muiMidp", function() {
    exports.setMain = function(muiCallback) {
        console.log("setMain: ", muiCallback);
    }
});
