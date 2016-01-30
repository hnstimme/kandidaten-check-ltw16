var currentQuestion = 0,
candidateA = 0,
candidateB = 0,
candidateC = 0,
candidateD = 0,
selectedWahlkreis = "",
picked;

$(document).ready(function(){
  var quiz=[{
    "id": 0,
    "frage": "Welches der Lieblingsgerichte der Wahlkreiskandidaten schmeckt Ihnen am meisten?",
    "antworten":
      {
        "Gurr-Hirsch": "Selbstgemachte Maultaschen mit Kartoffelsalat",
        "Blättgen": "Rindsroulade",
        "Winkler": "Linsen mit Spätzle",
        "Heitlinger": "Spätzle"
      },
      "typ": "politisch"
  },
  {
    "id": 1,
    "frage": "Die Kandidaten haben uns ihren Lieblingsort in der Region verraten. Wo gefällt es Ihnen am besten?",
    "antworten":
      {
        "Gurr-Hirsch": "Joggingstrecke durch Untergruppenbach",
        "Blättgen": "Wald, egal wo",
        "Winkler": "Weinausschank am Zweifelberg bei gutem Wetter, bei mir daheim vorm Kachelofen bei schlechtem Wetter",
        "Heitlinger": "Drei-Burgen-Blick Rohrbach"
      },
      "typ": "privat"
  }

    ];

  function loadData(){
    $.each(quiz, function(key, val) {
      if(val.id==currentQuestion){
        $(".question > h3").text(val.frage);
      }

      console.log(val.id);
      console.log(val.frage);

      var i=0;
      $.each(val.antworten, function(key_answer, val_answer){
        if(val.id==0){
          $(".tile-grid").append('<div class="tile" data-index="'+ i +'"><span class="logo answer"></span><div class="title">'+ val_answer +'</div></div>')
          i=i+1;
        }

        console.log(key_answer+": "+val_answer);
      })
    })
  }

  function nextQuestion(){
    $(".question > h3").empty();
    $(".tile-grid").empty();

    loadData();

    currentQuestion++;
  }

  function processQuestion(){

  }

  function saveWahlkreis() {

  }

  $(".nextQuestion").click(function (){
    nextQuestion();
  })

  $(".tile").click(function(){
    picked=$(this).attr("data-index");
    $(".tile").removeClass("picked");
    $(this).addClass("picked");
  })

  $(".wahlkreis .tile").click(function(){
    selectedWahlkreis = $(this).attr("id");
  })
});
