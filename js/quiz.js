var currentQuestionID = 0,
currentQuestionOrderID = 0,
currentQuestion, // Array
questionOrder = [],
selections = [], // [selectionId, type(privat/politisch)]
selectedWahlkreis,
picked,
quiz,
numberOfQuestions;

$(document).ready(function (){
  // Generate order of questions, for randomize
  function generateQuestionOrder (){
    for(var g=0; g < numberOfQuestions; g++){
      questionOrder.push(g);
    }
    shuffle(questionOrder);

    //Insert "challenges"
    /*
    !!!!
    Temporarily deactivated
    questionOrder.splice(2, 0, 10);
    questionOrder.splice(6, 0, 11);
    questionOrder.splice(9, 0, 12);*/

    console.log(questionOrder);
  }

  // Prepare for new question or wahlkreis selection
  function processQuestion(){
    $(".question > h3").empty();
    $(".tile-grid .tile").remove();
    $("button.nextQuestion").remove();


      // Search for correct wahlkreis
      $.each(quiz, function(wahlkreis, questions){
        // Set number of questions
        numberOfQuestions = questions.length;

        if( wahlkreis === selectedWahlkreis ){
          // Generate shuffled question order
          if(questionOrder.length == 0){
            generateQuestionOrder();
          }

          // Load data of correct next question from JSON
          if(currentQuestionOrderID != -1){
            currentQuestionID = questionOrder[currentQuestionOrderID];

            // If there are stilly any questions to answer
            if(currentQuestionOrderID < numberOfQuestions){
              displayAnswers(questions);
          }
          // If there are no more questions
          else {
            console.log("OHNO");
            changeToResult();
          }
        }
        // If user want to display the wahlkreise
        else {
          changeToWahlkreis();
        }
      }

      $(".tile-grid").randomize(".tile");
      if($("div.nextQuestion").length == 0){
        $(".tile-grid .tile:last-child").after('<div class="waitForTheButton nextQuestion"></div>');
      }
    });
  }

  function displayAnswers(questions){
    // Iterate through questions & search for requested question
    $.each(questions, function(key, val) {
      if( val.id == currentQuestionID ){
        $(".question > h3").text(val.frage);
        currentQuestion = val;
      }

      // Iterate through answers of current question
      var i=0;
      $.each(val.antworten, function(key_answer, val_answer){
        if(val.id==currentQuestionID){
          $(".tile-grid").append('<div class="tile" data-index="'+ i +'"><span class="logo answer"></span><div class="title">'+ val_answer +'</div></div>');
          i=i+1;
        }
      });
    });
  }

  /*>>CHANGE QUIZ HTML STRUCTURE<< FUNCTIONS **/
  // Change div containing the wahlkreis selection to the question markup
  function changeToQuestion (){
    $(".wahlkreis").addClass("question").removeClass("wahlkreis");
    $(".tile-grid .previousQuestion").replaceWith('<button class="previousQuestion"><img class="twisted" src="img/next.svg"></button>');

    currentQuestionOrderID = 0;
    processQuestion();
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

    // Reset variables
    currentQuestionID = 0;
    questionOrder = [];
  }

  // Show personal result of user (change from questions to result div)
  function changeToResult (){
    $(".question").addClass("personal-result").removeClass("question");
    $(".personal-result > h3").html("Dein Ergebnis");
    $(".tile-grid").remove();
    $(".personal-result > h3").after('<div class="candidates"></div>');

    var candidates= '<div class="candidate"></div>';
    $(".candidates").html(candidates + candidates);

    $(".candidate").html('<div class="percentage"><div class="picture"><img src="img/kandidat1.jpg"></div></div> <p class="info">Max Mustermann, Die Partei, 34 Jahre, verheiratet, ein Kind, Neckarsulm</p> <h2>62%</h2><div class="topic">Politisch</div>');
    $(".candidate:last-child").html('<div class="percentage"><div class="picture"><img src="img/kandidat2.jpg"></div></div> <p class="info">Gertrud Mustermann, Die Gute Partei, 45 Jahre, verheiratet, fünf Kinder, Neckarsulm</p> <h2>62%</h2> <div class="topic">Privat</div>');
  }

  $("section").on('click', 'button.nextQuestion' ,function () {
    if($(".question").length != 0){
      // Save the answer selection from user
      selections[currentQuestionOrderID] = new Array();
      selections[currentQuestionOrderID].push(picked, currentQuestion.typ)

      console.log(selections);

      // Initialize new question
      currentQuestionOrderID+=1;
      processQuestion();
    }
    else{
      changeToQuestion();
    }
  })
  $("section").on('click', 'button.previousQuestion' ,function () {
    // Initialize previous question
    if($(".question").length != 0){
      currentQuestionOrderID-=1;
      processQuestion();
    }
  })

  // User selected an answer: Show "next" button & save picked answer
  $("section").on( 'click', '.tile' ,function () {
    // Save picked answer
    picked=$(this).attr("data-index");
    // New CSS style for picked answer
    $(".tile").removeClass("picked");
    $(".tile").removeClass("blind");
    $(this).addClass("picked");
    $(".tile:not(.picked)").addClass("blind");

    // Show button
    if($("button.nextQuestion").length == 0){
      $(".tile-grid div.nextQuestion").replaceWith('<button class="nextQuestion"><img src="img/next.svg"></button>')
    }
  })

  // Save wahlkreis id, the user selected
  $("body").on('click', '.wahlkreis .tile' ,function () {
    selectedWahlkreis = $(this).attr("id");
  })

  function getResult(type){
    var frequency = [[0][1][2][3]]
    currentPerson,
    numberOfAnswers;

    for(var h=0; h<selections.length; h++){
      if(selections[h][1] === type){
        currentPerson = frequency[selections[h][0]];
        numberOfAnswers = frequency[selections[currentPerson][0]];
        frequency[selections[currentPerson][0]].push(numberOfAnswers + 1);
      }
    }
    console.log();
  }

  function init (){
    // Load JSON
    $.getJSON('js/quiz.json', function (json){
      quiz=json;
    });
  }

  init();

  /* Functions */
  // Randomize order of potential answers
  $.fn.randomize = function (selector){
    (selector ? this.find(selector) : this).parent().each(function(){
        $(this).children(selector).sort(function(){
            return Math.random() - 0.5;
        }).detach().appendTo(this);
    });

    return this;
  };

  // Shuffle an array
  function shuffle (array) {
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
