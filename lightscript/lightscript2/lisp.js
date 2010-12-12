load("lisplib.js");

var c = " "
var getnext = function() {
    var result = [];
    while(" \n\r\t".indexOf(c) !== -1) {
        c = getch();
    }
    switch(c) {
        case "[":
            c = getch();
            var elem = getnext();
            while(elem !== false) {
                result.push(elem);
                elem = getnext();
            }
            return result;
            
        case "]":
            c = getch();
            return false;
        case "'":
            c = getch();
            while(c != "'") {
                if(c == "\\") { 
                    c = getch(); 
                    if(c == "n") {
                        c = "\n";
                    } else if(c == "r") {
                        c = "\r";
                    } else if(c == "t") {
                        c = "\t";
                    }
                }
                result.push(c);
                c = getch();
            }
            c = getch();
            return ["str", result.join('')];
        default:
            while(" \n\r\t[]'".indexOf(c) == -1) {
                result.push(c);
                c = getch()
            }
            return result.join("");
    }
}
function getnext(){var result,elem,quote;result=array();while(string_contains(" \n\r\t",c)){nextc()};if((c==="[")){nextc();elem=getnext();while(!((elem===false))){array_push(result,elem);elem=getnext()};return(result)}else if((c==="]")){nextc();return(false)}else if((c==="'")){nextc();while(!((c==="'"))){if((c==="\\")){nextc();if((c==="n")){c="\n"}else if((c==="r")){c="\r"}else if((c==="t")){c="\t"}};array_push(result,c);nextc()};nextc();return(array("str",array_join(result,"")))}else if(string_contains("0123456789",c)){while(string_contains("0123456789",c)){array_push(result,c);nextc()};return(array("num",array_join(result,"")))}else {while(!(string_contains(" \n\r\t[]",c))){array_push(result,c);nextc()};return(array_join(result,""))}}

function tailblock(expr, n) {
    return "{" + map(compile, tail(expr, n)).join(";") + "}"
}

function compileif(expr) {
    var result = "";
    if(expr[0] != 'else') {
        result = "if(" + compile(expr[0]) + ")";
    }
    result = result + tailblock(expr, 1);
    return result;
}
function infix(opname, expr) {
    return "(" + compile(expr[1]) + opname + compile(expr[2]) + ")";
}

function compile(expr) {
    var result, i;
    if(typeof(expr) == "string") {
        return expr;
    }
    switch(expr[0]) {
        case "define":
            return "function " + expr[1][0] + "(" 
                    + tail(expr[1]).join(",") + ")"
                    + tailblock(expr,2);
        case "locals":
            return "var " + tail(expr).join(",");
        case "while":
            return "while(" + compile(expr[1]) + ")" 
                    + tailblock(expr,2);
        case "switch":
            return result;
        case "num":
            return expr[1];
        case "str":
            return uneval(expr[1])
        case "cond":
            return map(compileif, tail(expr)).join('else ');
        case "eq?":
            return infix('===', expr);
        case "and":
            return infix('&&', expr);
        case "not":
            return "!(" + compile(expr[1]) + ")";
        case ";":
            return "";
        case "set":
            return expr[1] + "=" + compile(expr[2]);
        default:
            return expr[0] + "(" + map(compile, tail(expr)).join(",") + ")";
    }
}

print('load("lisplib.js");');
var expr = getnext()
while(expr !== false) {
 // print(uneval(expr));
//    print(listpp(expr));
    print(compile(expr));
    expr = getnext()
}
