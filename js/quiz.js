var currentQuestionID = 0,
currentQuestionOrderID = 0,
currentQuestion, // Array
questionOrder = [],
selections = [], // [selectionId, type(privat/politisch)]
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
  },
  {
    "id": 3,
    "frage": "Welchen Lieblingsfilm der Kandidaten mögen Sie  am meisten?",
    "antworten":
      {
        "Gurr-Hirsch": "Vom Winde verweht",
        "Blättgen": "Herr der Ringe",
        "Winkler": "Ziemlich beste Freunde",
        "Heitlinger": "Cowboys & Alien"
      },
      "typ": "privat"
  },
  {
    "id": 4,
    "frage": "Welche Schlagzeile würden Sie ebenso wie die Kandidaten  gerne einmal lesen?",
    "antworten":
      {
        "Gurr-Hirsch": "Südliche Hemisphäre hat aufgeholt - frühere Entwicklungsländer werden nicht mehr ausgebeutet",
        "Blättgen": "Heute keine schlechten Nachrichten zu vermelden!",
        "Winkler": "Arabischer Frühling kehrt zurück – Junge Demokratien rund ums Mittelmeer blühen auf",
        "Heitlinger": "Weltweit kein Krieg mehr"
      },
      "typ": "privat"
  }];

  // Generate order of questions, for randomize
  function generateQuestionOrder (){
    for(var g=0; g < 5; g++){
      questionOrder.push(g);
    }
    shuffle(questionOrder);
    console.log(questionOrder);
  }

  // Prepare for new question or wahlkreis selection
  function loadQuestion(){
    $(".question > h3").empty();
    $(".tile-grid .tile").remove();
    $("button.nextQuestion").remove();

    // Load data of correct next question from JSON
    if(currentQuestionOrderID != -1){
      currentQuestionID = questionOrder[currentQuestionOrderID];

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
      $(".tile-grid:last-child").append('<div class="waitForTheButton nextQuestion"></div>');
    }
    else {
      changeToWahlkreis();
    }

    console.log("currentQuestionID: "+currentQuestionID);
    console.log("currentQuestionOrderID: "+currentQuestionOrderID);
  }

  // Change div containing the wahlkreis selection to the question markup
  function changeToQuestion (){
    $(".wahlkreis").addClass("question").removeClass("wahlkreis");
    $(".tile-grid .previousQuestion").replaceWith('<button class="previousQuestion"><img class="twisted" src="img/next.svg"></button>');

    currentQuestionOrderID = 0;
    loadQuestion();
  }

  // Change div containing a question to the wahlkreis selection
  function changeToWahlkreis (){
    $(".question").addClass("wahlkreis").removeClass("question");
    $(".tile-grid").empty()
    $(".tile-grid").append('<div class="waitForTheButton previousQuestion"></div>');
    $(".tile-grid").append('<div class="tile" id="Eppingen"><span class="logo"><span>EP</span></span><div class="title">Eppingen</div></div>')
    $(".tile-grid").append('<div class="tile" id="Heilbronn"><span class="logo"><span>HN</span></span><div class="title">Heilbronn</div></div>')
    $(".tile-grid").append('<div class="tile" id="Neckarsulm"><span class="logo"><span>NSU</span></span><div class="title">Neckarsulm</div></div>')
    $(".tile-grid").append('<div class="tile" id="Hohenlohe"><span class="logo"><span>HOH</span></span><div class="title">Hohenlohe</div></div>');
    $(".tile-grid").append('<div class="waitForTheButton nextQuestion"></div>');

    $(".wahlkreis h3").html('Wähle deinen Wahlkreis');

    currentQuestionID = 0;
  }

  $("section").on('click', 'button.nextQuestion' ,function () {
    console.log("Load next question");

    if($(".question").length != 0){
      // Save the answer selection from user
      selections[currentQuestionOrderID] = new Array();
      selections[currentQuestionOrderID].push(picked, currentQuestion.typ)
      console.log(selections);

      // Initialize new question
      currentQuestionOrderID+=1;
      loadQuestion();
    }
    else{
      changeToQuestion();
    }
  })
  $("section").on('click', 'button.previousQuestion' ,function () {
    console.log("Load previous question");

    // Initialize previous question
    if($(".question").length != 0){
      currentQuestionOrderID-=1;
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
    if($("button.nextQuestion").length == 0){
      $(".tile-grid div.nextQuestion").replaceWith('<button class="nextQuestion"><img src="img/next.svg"></button>')
    }
  })

  // Save wahlkreis id, the user selected
  $("body").on('click', '.wahlkreis .tile' ,function () {
    selectedWahlkreis = $(this).attr("id");
  })

  function init (){
    // Before anything else generate shuffled question order
    generateQuestionOrder();
  }

  init();

  /* Functions */
  // Randomize order of potential answers
  $.fn.randomize = function(selector){
    (selector ? this.find(selector) : this).parent().each(function(){
        $(this).children(selector).sort(function(){
            return Math.random() - 0.5;
        }).detach().appendTo(this);
    });

    return this;
  };

  // Shuffle an array
  function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
});
