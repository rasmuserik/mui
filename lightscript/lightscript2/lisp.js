/* Code compiled from yolan */
load("lisplib.js");



function nextc(){c=getch()}
nextc()
function getnext(){var result,elem,quote;result=array();while(string_contains(" \n\r\t",c)){nextc()};if(c==="["){nextc();elem=getnext();while(!(elem===false)){array_push(result,elem);elem=getnext()};return(result)}else if(c==="]"){nextc();return(false)}else if(c==="'"){nextc();while(!(c==="'")){if(c==="\\"){nextc();if(c==="n"){c="\n"}else if(c==="r"){c="\r"}else if(c==="t"){c="\t"}};array_push(result,c);nextc()};nextc();return(array("str",array_join(result,"")))}else if(string_contains("0123456789",c)){while(string_contains("0123456789",c)){array_push(result,c);nextc()};return(array("num",array_join(result,"")))}else {while(!(string_contains(" \n\r\t[]",c))){array_push(result,c);nextc()};return(array_join(result,""))}}



function infix(name,expr){return(strjoin(compile(expr[1]),name,compile(expr[2])))}
function tailblock(expr,n){return(strjoin("{",array_join(map(compile,tail(expr,n)),";"),"}"))}
function compileif(expr){var condition;if(expr[0]==="else"){condition=""}else {condition=strjoin("if(",compile(expr[0]),")")};return(strjoin(condition,tailblock(expr,1)))}
function compile(expr){var type;type=expr[0];;if(typeof(expr)==="string"){return(expr)}else if(type==="define"){return(strjoin("function ",expr[1][0],"(",array_join(tail(expr[1]),","),")",tailblock(expr,2)))}else if(type==="locals"){return(strjoin("var ",array_join(tail(expr),",")))}else if(type==="set"){return(infix("=",expr))}else if(type==="num"){return(expr[1])}else if(type==="str"){return(uneval(expr[1]))}else if(type===";"){return("")}else if(type==="get"){return(strjoin(compile(expr[1]),"[",compile(expr[2]),"]"))}else if(type==="not"){return(strjoin("!(",compile(expr[1]),")"))}else if(type==="eq?"){return(infix("===",expr))}else if(type==="cond"){return(array_join(map(compileif,tail(expr)),"else "))}else if(type==="while"){return(strjoin("while(",compile(expr[1]),")",tailblock(expr,2)))}else {return(strjoin(type,"(",map(compile,tail(expr)),")"))}}



print("/* Code compiled from yolan */")
print("load(\"lisplib.js\");")
;
expr=getnext()
while(!(expr===false)){;print(compile(expr));expr=getnext()}
