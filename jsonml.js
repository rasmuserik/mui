function JsonML_Error(desc) {
    console.log(desc);
}
function isArray(a) {
    return toString.call(a) === '[object Array]';
}
var entities = {
    "quot": '"',
    "amp": '&',
    "apos": "'",
    "lt": '<',
    "gt": '>'
};
var whitespace = " \n\r\t";
var reventities = (function () {
    var result = {};
    for(var key in entities) {
        result[entities[key]] = key;
    }
    return result;
})();
function xmlEscape(str, acc) {
    for(var i = 0; i < str.length; ++i) {
        var c = str[i];
        var code = c.charCodeAt(0);
        var s = reventities[c];
        if(s) {
            acc.push("&" + s + ";");
        } else if(/*code < 32 ||*/ code >= 128) {
            acc.push("&#" + code + ";");
        } else {
            acc.push(c);
        }
    }
}
function toXmlAcc(jsonml, acc) {
    if(typeof(jsonml) === "string") {
        xmlEscape(jsonml, acc);
    } else if(isArray(jsonml)) {
        acc.push("<");
        acc.push(jsonml[0]);
        var pos = 1;
        var attributes = jsonml[1];
        if(attributes && !isArray(attributes) && typeof(attributes) !== "string") {
            for(var key in attributes) {
                acc.push(' ');
                acc.push(key);
                acc.push('="');
                xmlEscape(attributes[key], acc);
                acc.push('"');
            }
            ++pos;
        }
        if(pos < jsonml.length) {
            acc.push(">");
            {do {
                toXmlAcc(jsonml[pos], acc);
                ++pos;
            } while(pos < jsonml.length); }
            acc.push("</");
            acc.push(jsonml[0]);
            acc.push(">");
        } else {
            acc.push(" />");
        }
    } else {
        JsonML_Error("Error: expected array or string, but got: " + jsonml);
    }
}
function childFold(jsonml, acc, fn) {
    var first = jsonml[1];
    if(typeof(first) === "string" || isArray(first)) {
        acc = fn(first, acc);
    }
    for(var pos = 2; pos < jsonml.length; ++pos) {
        acc = fn(jsonml[pos], acc);
    }
    return acc;
}
exports.childFold = childFold;

exports.childPushMap = function(jsonml, acc, fn) {
    return childFold(jsonml, acc, function(elem, acc) {
        acc.push(fn(elem));
        return acc;
    });
}

exports.toXml = function(jsonml) {
    var acc = [];
    toXmlAcc(jsonml, acc);
    return acc.join('');
}
exports.fromXml = function(xml) {
    if(typeof(xml) !== "string") {
        JsonML_Error("Error: jsonml.parseXML didn't receive a string as parameter");
    }

    // the current char in the string that is being parsed
    var c = xml[0];
    // the position in the string
    var pos = 0;
    // stack for handling nested tags
    var stack = [];
    // current tag being parsed
    var tag = [];
    // read the next char from the string
    function next_char() { c = ++pos < xml.length ? xml[pos] : undefined; }
    // check if the current char is one of those in the string parameter 
    function is_a(str) { return str.indexOf(c) !== -1; }

    while(is_a(whitespace)) { next_char(); }

    // return the string from the current position to right before the first occurence
    // of any of symb. Translate escaped xml entities to their value on the fly.
    function read_until(symb) {
            var buffer = [];
            while(c && !is_a(symb)) {
                if(c === '&') {
                    next_char();
                    var entity = read_until(';');
                    if(entity[0] === '#') {
                        if(entity[1] === 'x') {
                            c = String.fromCharCode(parseInt(entity.slice(2), 16));
                        } else {
                            c = String.fromCharCode(parseInt(entity.slice(1), 10));
                        }
                    } else {
                        c = entities[entity];
                        if(!c) {
                            JsonML_Error("error: unrecognisable xml entity: " + entity);
                        }
                    }
                } 
                buffer.push(c);
                next_char();
            }
            return buffer.join("");
    }

    // The actual parsing
    while(c) {
        if(is_a("<")) {
            next_char();

            // skip <?xml ... > <!-- --> or similar
            if(is_a("?!")) {
                if(xml.slice(pos, pos+3) === "!--") {
                    pos += 3;
                    while(xml.slice(pos, pos+2) !== "--") {
                        ++pos;
                    };
                } 
                read_until('>');
                next_char();

            // end tag </something>
            } else if(is_a("/")) {
                next_char();
                if(read_until(">") !== tag[0]) {
                    JsonML_Error("end tag not matching: " + tag[0]);
                }
                next_char();
                var parent_tag = stack.pop();
                if(tag.length <= 2 && !isArray(tag[1]) && typeof(tag[1]) !== "string") {
                    tag.push("");
                }
                parent_tag.push(tag);
                tag = parent_tag;

            // begin tag <sometag ...>
            } else {
                // read tag name
                var newtag = [read_until(whitespace+">/")];

                // read attributes
                var attributes = {}
                var has_attributes = 0;
                while(c && is_a(whitespace)) { next_char(); };
                while(c && !is_a(">/")) {
                    has_attributes = 1;
                    var attr = read_until(whitespace + "=>");
                    if(c === "=") {
                        next_char();
                        var value_terminator = whitespace+">/";
                        if(is_a('"\'')) { value_terminator = c; next_char(); }
                        attributes[attr] = read_until(value_terminator);
                        if(is_a('"\'')) next_char();
                    } else {
                        JsonML_Error("something not attribute in tag");
                    }
                    while(c && is_a(whitespace)) { next_char(); };
                }
                if(has_attributes) { newtag.push(attributes); }

                // end of tag, is it <.../> or  <...>
                if(is_a("/")) {
                    next_char();
                    if(!is_a(">")) { JsonML_Error('expected ">" after "/" within tag'); }
                    tag.push(newtag);
                } else {
                    stack.push(tag);
                    tag = newtag;
                }
                next_char();
            }

        // content between tags
        } else {
            tag.push(read_until("<"));
        }
    }
    return tag;
}
