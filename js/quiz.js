var currentQuestion = 0,
candidateA = 0,
candidateB = 0,
candidateC = 0,
candidateD = 0,
selectedWahlkreis = "",
picked;

$(document).ready(function (){
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
      "typ": "privat"
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
  },
  {
    "id": 2,
    "frage": "Auch Politiker singen gerne unter der Dusche. Welches Lied ist das Beste?",
    "antworten":
      {
        "Gurr-Hirsch": "Die Gedanken sind frei",
        "Blättgen": "Bruce Guthro: The Songsmith",
        "Winkler": "Somewhere aus der West Side Story",
        "Heitlinger": "Nirvana - Smells like Teen Spirit"
      },
      "typ": "privat"
  }];

  function loadData(){
    $.each(quiz, function(key, val) {
      if(val.id == currentQuestion){
        $(".question > h3").text(val.frage);
      }

      var i=0;
      $.each(val.antworten, function(key_answer, val_answer){
        if(val.id==currentQuestion){
          $(".tile-grid").append('<div class="tile" data-index="'+ i +'"><span class="logo answer"></span><div class="title">'+ val_answer +'</div></div>')
          i=i+1;
        }
      })
    })
  }

  function loadQuestion(){
    $(".question > h3").empty();
    $(".tile-grid .tile").remove();
    $(".nextQuestion").remove();

    if(currentQuestion != -1){
      loadData();
    }
    else {
      changeToWahlkreis();
    }

    console.log("Current: "+currentQuestion);
  }

  function changeToQuestion (){
    $(".wahlkreis").addClass("question").removeClass("wahlkreis");
    $(".tile-grid .tile:first-child").before('<button class="previousQuestion"><img class="twisted" src="img/next.svg"></button>');

    loadQuestion();
  }

  function changeToWahlkreis (){
    $(".question").addClass("wahlkreis").removeClass("question");
    $(".tile-grid").empty()
    $(".tile-grid").append('<div class="tile" id="Eppingen"><span class="logo"><span>EP</span></span><div class="title">Eppingen</div></div>')
    $(".tile-grid").append('<div class="tile" id="Heilbronn"><span class="logo"><span>HN</span></span><div class="title">Heilbronn</div></div>')
    $(".tile-grid").append('<div class="tile" id="Neckarsulm"><span class="logo"><span>NSU</span></span><div class="title">Neckarsulm</div></div>')
    $(".tile-grid").append('<div class="tile" id="Hohenlohe"><span class="logo"><span>HOH</span></span><div class="title">Hohenlohe</div></div>');

    $(".wahlkreis h3").html('Wähle deinen Wahlkreis');

    currentQuestion = 0;
  }

  $("section").on('click', '.nextQuestion' ,function () {

    console.log("Load next question");
    if($(".question").length != 0){
      currentQuestion+=1;
      loadQuestion();
    }
    else{
      changeToQuestion();
    }
  })
  $("section").on('click', '.previousQuestion' ,function () {

    console.log("Load previous question");
    if($(".question").length != 0){
      currentQuestion-=1;
      loadQuestion();
    }
    else{
      changeToQuestion();
    }
  })

  $("section").on( 'click', '.tile' ,function () {
    picked=$(this).attr("data-index");
    $(".tile").removeClass("picked");
    $(this).addClass("picked");
    if($(".nextQuestion").length == 0){
      $(".tile-grid .tile:last-child").after('<button class="nextQuestion"><img src="img/next.svg"></button>')
    }
  })

  $("body").on('click', '.wahlkreis .tile' ,function () {
    selectedWahlkreis = $(this).attr("id");
  })
});
