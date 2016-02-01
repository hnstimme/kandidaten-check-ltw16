var currentQuestionID = 0,
currentQuestion,
selections = [], // [questionId, selectionId, type(privat/politisch)]
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

  // Load data of correct next question from JSON
  function loadData(){
    // Iterate through questions & search for requested question
    $.each(quiz, function(key, val) {
      if( val.id == currentQuestionID ){
        $(".question > h3").text(val.frage);
        currentQuestion = val;
      }

      // Iterate through answers of current question
      var i=0;
      $.each(val.antworten, function(key_answer, val_answer){
        if(val.id==currentQuestionID){
          $(".tile-grid").append('<div class="tile" data-index="'+ i +'"><span class="logo answer"></span><div class="title">'+ val_answer +'</div></div>')
          i=i+1;
        }
      })
    })

    $(".tile-grid").randomize(".tile");
  }

  // Prepare for new question or wahlkreis selection
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

    console.log("Current: "+currentQuestionID);
  }

  // Change div containing the wahlkreis selection to the question markup
  function changeToQuestion (){
    $(".wahlkreis").addClass("question").removeClass("wahlkreis");
    $(".tile-grid .tile:first-child").before('<button class="previousQuestion"><img class="twisted" src="img/next.svg"></button>');

    loadQuestion();
  }

  // Change div containing a question to the wahlkreis selection
  function changeToWahlkreis (){
    $(".question").addClass("wahlkreis").removeClass("question");
    $(".tile-grid").empty()
    $(".tile-grid").append('<div class="tile" id="Eppingen"><span class="logo"><span>EP</span></span><div class="title">Eppingen</div></div>')
    $(".tile-grid").append('<div class="tile" id="Heilbronn"><span class="logo"><span>HN</span></span><div class="title">Heilbronn</div></div>')
    $(".tile-grid").append('<div class="tile" id="Neckarsulm"><span class="logo"><span>NSU</span></span><div class="title">Neckarsulm</div></div>')
    $(".tile-grid").append('<div class="tile" id="Hohenlohe"><span class="logo"><span>HOH</span></span><div class="title">Hohenlohe</div></div>');

    $(".wahlkreis h3").html('Wähle deinen Wahlkreis');

    currentQuestionID = 0;
  }

  $("section").on('click', '.nextQuestion' ,function () {

    console.log("Load next question");
    if($(".question").length != 0){
      // Save the answer selection from user
      selections[currentQuestionID] = new Array();
      selections[currentQuestionID].push(picked, currentQuestion.typ)
      console.log(selections);

      // Initialize new question
      currentQuestionID+=1;
      loadQuestion();
    }
    else{
      changeToQuestion();
    }
  })
  $("section").on('click', '.previousQuestion' ,function () {
    console.log("Load previous question");

    // Initialize previous question
    if($(".question").length != 0){
      currentQuestionID-=1;
      loadQuestion();
    }
    else{
      changeToQuestion();
    }
  })

  // User selected an answer: Show "next" button & save picked answer
  $("section").on( 'click', '.tile' ,function () {
    // Save picked answer
    picked=$(this).attr("data-index");
    // New CSS style for picked answer
    $(".tile").removeClass("picked");
    $(this).addClass("picked");

    // Show button
    if($(".nextQuestion").length == 0){
      $(".tile-grid .tile:last-child").after('<button class="nextQuestion"><img src="img/next.svg"></button>')
    }
  })

  // Save wahlkreis id, the user selected
  $("body").on('click', '.wahlkreis .tile' ,function () {
    selectedWahlkreis = $(this).attr("id");
  })

  // Randomize order of potential answers
  $.fn.randomize = function(selector){
    (selector ? this.find(selector) : this).parent().each(function(){
        $(this).children(selector).sort(function(){
            return Math.random() - 0.5;
        }).detach().appendTo(this);
    });

    return this;
  };
});
