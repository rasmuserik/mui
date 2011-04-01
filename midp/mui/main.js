require("xmodule").def("main",function(){
require("mui");

function main(mui) {
  mui.showPage(["page", {title: "Sp\xf8rg biblioteket"},
      ["section",
        ["text", "sporge..."],
        ["input", {type: "textbox", name: "question", label: "Mit sp\xf8rgsm\xe5l"}],
        ["choice", {name: "deadline"},
          ["option", {value: "choose"}, "V\xe6lg tidsfrist..."],
          ["option", {value: "-1"}, "ingen"],
          ["option", {value: "2"}, "2 timer"],
          ["option", {value: "24"}, "24 timer"],
          ["option", {value: "48"}, "2 dage"],
          ["option", {value: "168"}, "1 uger"] ],
        ["choice", {name: "use"},
          ["option", {value: "choose"}, "Svaret skal bruges til..."],
          ["option", {value: "personal"}, "Almen interesse"],
          ["option", {value: "business"}, "Erhverv"],
          ["option", {value: "school1"}, "Folkeskole"],
          ["option", {value: "school2"}, "Gymnasium"],
          ["option", {value: "school3"}, "Videreg\xe5ende uddannelse"],
          ["option", {value: "school4"}, "Universitet/Forskning"] ],
        ["input", {type: "email", name: "email", label: "Min emailadresse"}],
        ["input", {type: "tel", name: "mobile", label: "Mit mobilnummer"}],
        ["choice", {name: "answer"},
          ["option", {value: "choose"}, "Jeg vil have svar p\xe5..."],
          ["option", {value: "email"}, "Email"],
          ["option", {value: "sms"}, "SMS"], ] ],
        ["button", {fn: ask}, "Sp\xf8rg"] ]);
}

function ask(mui) {     
  mui.loading();
  var deadline = "";
  if (mui.form.deadline !== "-1") {
    deadline = " indenfor de n\xe6ste " + mui.form.deadline + " timer";
  }
  var answer = "";
  if (mui.form.answer === "email" && mui.form.email !== "") {
    answer = " p\xe5 " + mui.form.email; 
  } else if (mui.form.answer === "sms" && mui.form.mobile !== "") {
    answer = " via sms til " + mui.form.mobile;
  }
  mui.callJsonpWebservice("http://didicas.dbc.dk/openquestion.addi.dk/trunk/", "callback", 
    { action: "createQuestion",
      agencyId: "150024",
      qandaServiceName: "Biblioteksvagten",
      questionContent: mui.form.question,
      questionDeadline: mui.form.deadline,
      questionUsage: mui.form.use,
      userEmail: mui.form.email,
      outputType: "json"
    }, function(result) {
      if (result.createQuestionResponse.questionReceipt.$ === "Ack") {
        mui.showPage( ["page", {title: "Sp\xf8rg biblioteket"}, 
          ["section", 
            ["text", "Sp\xf8rgsm\xe5let er afleveret. Du vil f\xe5 svar", deadline, answer, "."], 
            ["button", {fn: main}, "Nyt sp\xf8rgsm\xe5l"]]]);
      } else {
        mui.showPage( ["page", {title: "Sp\xf8rg biblioteket"}, 
            ["text", "Noget gik desv\xe6rre galt, pr\xf8v igen"], 
            ["button", {fn: main}, "Nyt sp\xf8rgsm\xe5l"]]);
      }
    });
}

require("mui").setMain(main);
});
