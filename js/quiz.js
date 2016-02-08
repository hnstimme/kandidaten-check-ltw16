var currentQuestionID = 0,
currentQuestionOrderID = 0,
currentQuestion, // Array
questionOrder = [],
selections = [], // [selectionId, type(privat/politisch)]
selectedWahlkreis,
picked,
quiz,
numberOfQuestions,
candidates;

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
    $(".tiles .tile").remove();
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
            changeToResult();
          }
        }
        // If user want to display the wahlkreise
        else {
          changeToWahlkreis();
        }
      }

      $(".tiles").randomize(".tile");
      if($("div.nextQuestion").length == 0){
        $(".tiles").after('<div class="waitForTheButton nextQuestion"></div>');
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
          var displayTile = '<div class="tile" data-index="'+ i +'"><span class="logo answer"></span><div class="title">'+ val_answer +'</div></div>'

          $(".tiles").append(displayTile);
          i=i+1;
        }
      });
    });

    if(currentQuestionOrderID in selections){
      var pickedId = +selections[currentQuestionOrderID][0];
      var pickedElement = $('.tile').eq(pickedId);

      // New CSS style for picked answer
      setPickedClass(pickedElement);
    }
  }

  function setPickedClass (HtmlElement){
    $(".tile").removeClass("picked");
    $(".tile").removeClass("blind");
    $(HtmlElement).addClass("picked");
    $(".tile:not(.picked)").addClass("blind");
  }

  // Calculate results for result page; returns person and percentage of accordance
  function getResult (type){
    var personsPoints = 0,
    highestPoints = 0,
    personWithHighestPoints = 0,
    numberOfQuestionsOfType = 0;

    // Iterate through persons
    for(var h=0; h < 4; h++){
      // Iterate through answers
      for( var j=0; j < selections.length; j++){
        // if type of answer and person matchtes, increment counter
        if (selections[j][1] === type){
          numberOfQuestionsOfType++;
          if(selections[j][0] == h){
            personsPoints++;
          }
        }
      }
      // Perhaps replace new highest points
      if(personsPoints > highestPoints){
        highestPoints = personsPoints;
        personWithHighestPoints = h;
      }
      personsPoints = 0;
    }
    numberOfQuestionsOfType /= 4;

    var percentageOfAccordance = Math.round((highestPoints / numberOfQuestionsOfType ) * 100)
    return [personWithHighestPoints, percentageOfAccordance, numberOfQuestionsOfType];
  }

  // Returns the candidate JSON object
  function getCandidate(wahlkreis, id){
    var saveCandidate = {};

    $.each(candidates, function (json_wahlkreis, wahlkreis_kandidaten){
      $.each(wahlkreis_kandidaten, function(json_next_wahlkreis, candidate){
        if(json_wahlkreis == wahlkreis){
          if(candidate.id == id){
            saveCandidate = candidate;
          }
        }
      });
    });

    return saveCandidate;
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
    $(".tile-grid").append('<div class="tiles"></div>');
    $(".tiles").append('<div class="tile" id="Eppingen"><span class="logo"><span>EP</span></span><div class="title">Eppingen</div></div>')
    $(".tiles").append('<div class="tile" id="Heilbronn"><span class="logo"><span>HN</span></span><div class="title">Heilbronn</div></div>')
    $(".tiles").append('<div class="tile" id="Neckarsulm"><span class="logo"><span>NSU</span></span><div class="title">Neckarsulm</div></div>')
    $(".tiles").append('<div class="tile" id="Hohenlohe"><span class="logo"><span>HOH</span></span><div class="title">Hohenlohe</div></div>');
    $(".tiles").after('<div class="waitForTheButton nextQuestion"></div>');

    $(".wahlkreis h3").html('Wähle deinen Wahlkreis');

    // Reset variables
    currentQuestionID = 0;
    questionOrder = [];
  }

  // Show personal result of user (change from questions to result div)
  function changeToResult (){
    // Get results [return datatype is Array]
    var privateResult = getResult("privat");
    var politicalResult = getResult("politisch");

    var privateCandidate = getCandidate(selectedWahlkreis, privateResult[0])
    var politicalCandidate = getCandidate(selectedWahlkreis, politicalResult[0])

    $(".question").addClass("personal-result").removeClass("question");
    $(".personal-result > h3").html("Dein Ergebnis");
    $(".tile-grid").remove();
    $(".personal-result > h3").after('<div class="candidates"></div>');

    var candidatesDisplay= '<div class="candidate"></div>';
    $(".candidates").html(candidatesDisplay + candidatesDisplay);

    $(".candidate").html('<div class="percentage"><div class="picture"><img src="img/kandidaten/'+ politicalCandidate.bild_url +'"></div></div> <p class="info">'+politicalCandidate.kandidaten_name+', '+politicalCandidate.partei+', 34 Jahre, verheiratet, ein Kind, Neckarsulm</p> <h2>'+politicalResult[1]+'%</h2><div class="topic">Politisch</div>');
    $(".candidate:last-child").html('<div class="percentage"><div class="picture"><img src="img/kandidaten/'+ politicalCandidate.bild_url +'"></div></div> <p class="info">'+privateCandidate.kandidaten_name+', '+privateCandidate.partei+', 45 Jahre, verheiratet, fünf Kinder, Neckarsulm</p> <h2>'+privateResult[1]+'%</h2> <div class="topic">Privat</div>');
  }

  $("section").on('click', 'button.nextQuestion' ,function () {
    if($(".question").length != 0){
      // Save the answer selection from user
      selections[currentQuestionOrderID] = new Array();
      selections[currentQuestionOrderID].push(picked, currentQuestion.typ)

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
    setPickedClass(this);

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
    // Load quiz JSON
    $.getJSON('js/quiz.json', function (json){
      quiz=json;
    });

    // Load candidates JSON
    $.getJSON('js/candidates.json', function (json){
      candidates=json;
    });
  }

  init();

  /* Not own functions */
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
