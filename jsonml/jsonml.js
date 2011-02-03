define(function(require, exports, module) {
    exports.parseXML = function(xml) {
        if(typeof(xml) !== "string") {
            throw "jsonml.parseXML only supports string arguments at the moment";
        }

        var c;
        var pos = -1;
        function next_char() {
            ++pos;
            if(pos < xml.length) {
                c = xml[pos];
            } else {
                c = undefined;
            }
            return c;
        }
        next_char();

        var whitespace = " \n\r\t";
        function is_a(str) {
            return str.indexOf(c) !== -1;
        }

        while(is_a(whitespace)) { next_char(); }

        stack = []
        tag = ["document root"];

        function read_dashdash() {
            return c === '-' && next_char() && c === '-' && next_char();
        }
        function handle_comment() {
            if(c === '!') {
                var prevpos = pos;
                next_char();
                if(read_dashdash()) {
                    while(c && !read_dashdash()) {
                        next_char();
                    }
                    next_char();
                } else {
                    pos = prevpos;
                }
            }
        }
        function next_char_in_tag() {
            next_char();
            handle_comment();
            return c;
        }
        function readtagname() {
            var tagname = "";
            while(c && !is_a(whitespace + ">/")) {
                tagname += c;
                next_char_in_tag();
            }
            return tagname;
        }
        function read_until(symb) {
                var buffer = [];
                while(c && !is_a(symb)) {
                    buffer.push(c);
                    next_char();
                }
                return buffer.join("");
        }
        while(c) {
            if(is_a("<")) {
                next_char_in_tag();
                if(is_a("?")) {
                    while(c && !is_a(">")) {
                        next_char_in_tag();
                    }
                    next_char();

                } else if(is_a("/")) {
                    next_char_in_tag();
                    if(readtagname() !== tag[0] || !is_a(">")) {
                        throw "Error ending tag";
                    }
                    next_char();
                    var parent_tag = stack.pop();
                    parent_tag.push(tag);
                    tag = parent_tag;

                } else {
                    var newtag = [readtagname()];

                    var attributes = {}
                    var has_attributes = false;
                    while(c && is_a(whitespace)) { next_char_in_tag(); };
                    while(c && !is_a(">/")) {
                        has_attributes = true;
                        var attr = read_until("=");
                        next_char_in_tag();
                        var value_terminator = whitespace;
                        if(is_a('"\'')) {
                            value_terminator = c;
                        }
                        next_char_in_tag();
                        attributes[attr] = read_until(value_terminator);
                        next_char_in_tag();
                        while(c && is_a(whitespace)) { next_char_in_tag(); };
                    }

                    if(has_attributes) { newtag.push(attributes); }

                    if(is_a("/")) {
                        next_char_in_tag();
                        if(!is_a(">")) {
                            throw 'expected ">" after "/" within tag';
                        }
                        tag.push(newtag);
                    } else {
                        stack.push(tag);
                        tag = newtag;
                    }
                    next_char();
                }
            } else {
                tag.push(read_until("<"));
            }
        }
        return tag;
    }
});

