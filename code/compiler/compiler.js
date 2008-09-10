load("stdmob.js");

//
// Utility functions for tokeniser
//

var is_num = function(c) {
	return "0" <= c && c <= "9";
}

var is_alphanum = function(c) {
	return is_num(c) || c === "_" || ("a" <= c && c <= "z") || ("A" <= c && c <= "Z");
}

var is_symb = function(c) {
	return c === "=" || c === "!" || c === "<" || c === "&" || c === "|";
}

// 
// Tokeniser state
//

token_c = " ";

//
// Tokeniser
// 
next_token = function() {
	var c = token_c;
	var val = undefined;
	var token;
	while(c === " " || c === "\n" || c === "\t") {
		c = getch();
	}
	var str = [];
	if(c === "\"") {
		c = getch();
		while(c !== undefined && c !== "\"") {
			if(c === "\\") {
				c = getch();
				if(c === "n") {
					c = "\n";
				} else if(c === "t") {
					c = "\t";
				}
			}
			push(str, c);
			c = getch();
		}
		c = getch();
		val= join(str, "");
		str= ["(string)"];
	} else if(is_num(c)) {
		while(is_num(c)) {
			push(str, c);
			c = getch();
		}
		val = join(str, "");
		str = ["(number)"];
	} else if(is_alphanum(c)) {
		while(is_alphanum(c)) {
			push(str, c);
			c = getch();
		}
	} else if(is_symb(c)) {
		while(is_symb(c)) {
			push(str, c);
			c = getch();
		}
	} else if(c === "/") {
		c = getch();
		if(c === "/") {
			while(c !== "\n") {
				c = getch();
			}
			token_c = getch();
			return next_token();
		} else {
			push(str, "/");
		}
	} else {
		push(str, c);
		c = getch();
	}

	token_c = c;
	token = {};

	if(str[0] === undefined) {
		str = "(end)";
	} else {
		str = join(str, "");
	}
	token.str = str;
	token.nud = nuds[str] || function() { return [this.str]; };
	if(leds[str] === undefined) {
		token.bp = 0;
	} else {
		token.led = leds[str].fn;
		token.bp = leds[str].bp;
	};
	token.sep = seps[str];
	token.val = val;
	return token;
}

//
// tables of parsing functions and options for a given token string
//
nuds = {};
leds = {};
seps = {};

//
// functions for defining operator precedence and type
//
infix = function(str, bp) {
	leds[str] = {};
	leds[str].bp = bp;
	leds[str].fn = function(left) {
		return [this.str, left, parsep(this.bp)];
	}
}

infixr = function(str, bp) {
	leds[str] = {};
	leds[str].bp = bp;
	leds[str].fn = function(left) {
		return [this.str, left, parsep(this.bp - 1)];
	}
}

infixl = function(str, bp) {
	leds[str] = {};
	leds[str].bp = bp;
	leds[str].fn = function(left) {
		return readlist([join(["apply ", this.str], ""), left]);
	}
}


readlist = function(acc) {
	var p = parse();
	while(p[0] !== "(end)") {
		if(p[0] !== "(sep)") {
			push(acc, p);
		}
		p = parse();
	}
	return acc;
}

end = function(str) {
	seps[str] = true;
	nuds[str] = function() {
		return ["(end)", this.str];
	}
}

seperator = function(str) {
	seps[str] = true;
	nuds[str] = function() {
		return ["(sep)", this.str];
	}
}

list = function(str) {
	nuds[str] = function() {
		return readlist([str]);
	}
}

atom = function(str) {
	nuds[str] = function() {
		return [this.str];
	}
}

prefix = function(str) {
	nuds[str] = function() {
		return [this.str, parse()];
	}
}

prefix2 = function(str) {
	nuds[str] = function() {
		return [this.str, parse(), parse()];
	}
}

nuds["(string)"] = function() {
	return [this.str, this.val];
}

nuds["(number)"] = function() {
	return [this.str, this.val];
}

nuds["var"] = function() {
	var acc = ["var"];
	var p = parse();
	while(p[0] !== "(end)" && p[1] !== ";") {
		if(p[0] !== "(sep)") {
			push(acc, p);
		}
		p = parse();
	}
	return acc;
}

//
// Definition of operator precedence and type
//
infix(".", 700);
infixl("(", 600);
infixl("[", 600);
infix("+", 400);
infix("-", 400);
infix("===", 300);
infix("!==", 300);
infix("<=", 300);
infix("<", 300);
infixr("&&", 200);
infixr("||", 200);
infixr("else", 200);
infix("=", 100);
end("]");
end(")");
end("}");
end(undefined);
seperator(":");
seperator(";");
seperator(",");
list("(");
list("{");
list("[");
prefix("return");
prefix2("function");
prefix2("if");
prefix2("while");
atom("undefined");
atom("true");
atom("false");

//
// The core parser
//
var parse = function() {
	return parsep(0);
};

token = next_token();
var parsep = function(rbp) {
	var t = token;
	token = next_token();
	var left = t.nud();
	while(rbp < token.bp && !t.sep) {
		t = token;
		token = next_token();
		left = t.led(left);
	}
	return left
}


//
// Compiler
//
ops = {
	"(jump)": 0,
	"(jump if false)": 1,
	"(get local)": 2,
	"(set local)": 3,
	"(set global)": 4,
	"(get global)": 5,
	"(call function)": 6,
	"(call method)": 7,
	//"(json to function)": 8,
	"===" : 9,
	"!==" : 10,
	"<" : 11,
	"<=" : 12,
	"!" : 13,
	"+" : 14,
	// not handling unary minus yet
	// "(neg)": 15,
	// "(minus)": 16,
	"-" : 16, 
	"!" : 17,
	"undefined" : 18,
	"true" : 19,
	"false" : 20,
	"next" : 21,
	"iterator" : 22,
	"length" : 23,
	"join" : 24,
	"pop" : 25,
	"push" : 26,
	"getch" : 27,
	"is_a" : 28,
	"println" : 29,
	"str2int" : 30,
	"(put)" : 31,
	"(get)" : 32,
	"(new array)" : 33,
	"(new object)" : 34,
	"(get literal)" : 35,
}


// "NB: special handling of unary/binary -";
// "ignore load and comment-functions";

nummap = {
	"table": {},
	"list": [],
	"lookup": function(o) {
		var key;
		key = this.table[o];
		if(key === undefined) {
			key = this.list.length;
			push(this.list, o);
			this.table[o] = key;
		}
	}
}

literals = copyobj(nummap);


compile = function(expr, acc, locals) {
	var id = expr[0];
	
	if (id === "<=") {
	} else if (id === "<") {
	} else if (id === "===") {
	} else if (id === "=") {
	} else if (id === "||") {
	} else if (id === "-") {
	} else if (id === "!==") {
	} else if (id === "!") {
	} else if (id === ".") {
	} else if (id === "(") {
	} else if (id === "[") {
	} else if (id === "{") {
	} else if (id === "&&") {
	} else if (id === "+") {
	} else if (id === "apply (") {
	} else if (id === "apply [") {
	} else if (id === "copyobj") {
	} else if (id === "else") {
	} else if (id === "function") {
	} else if (id === "getch") {
	} else if (id === "if") {
	} else if (id === "is_a") {
	} else if (id === "iterator") {
	} else if (id === "join") {
	} else if (id === "length") {
	} else if (id === "load") {
	} else if (id === "next") {
	} else if (id === "(number)") {
	} else if (id === "println") {
	} else if (id === "push") {
	} else if (id === "return") {
	} else if (id === "(string)") {
	} else if (id === "this") {
	} else if (id === "true") {
	} else if (id === "undefined") {
	} else if (id === "var") {
	} else if (id === "while") {
	}

}


t = iterator(readlist([]));
while(x = next(t)) {
	//println(x);
	println(compile(x, [], copyobj(nummap)));
}

