var currentQuestionID = 0,
currentQuestionOrderID = 0,
currentQuestion, // Array
questionOrder = [],
selections = [], // [selectionId, type(privat/politisch)]
selectedWahlkreis,
picked,
quiz_data,
numberOfQuestions,
numberOfChallenges = 0,
candidates,
aspectRatio,
headerImg,
privateResult,
politicalResult,
lastWindowWidth;

$(document).ready(function (){
  // Generate order of questions, for randomize
  function generateQuestionOrder (){
    if(questionOrder.length != 0){
      questionOrder == [];
    }

    for(var g=0; g < numberOfQuestions; g++){
      questionOrder.push(g);
    }
    shuffle(questionOrder);

    //Insert challenges
    for(var o=0; o<numberOfChallenges; o++){
      var challengePosition = Math.round(((numberOfQuestions+numberOfChallenges)/(o+1))-1);
      questionOrder.splice(challengePosition, 0, numberOfQuestions+numberOfChallenges-o-1);
    }
  }

  // Creates percentage circles at results (with jQuery library)
  function createCircle (percentageValue, candidateId, radius){
    var politicalCircle = Circles.create({
      id:                  candidateId,
      radius:              radius,
      value:               percentageValue,
      width:               3,
      text:                '',
      colors:              ['white', '#D05C5C'],
      duration:            400,
    });
  }

  function updateCircles(politicalResultValue, privateResultValue) {
    var radius = 100;
    if($(window).width() > 460){
      radius = 100;
    }
    else{
      radius = 70;
    }
    createCircle (politicalResultValue, 'politicalCandidate', radius)
    createCircle (privateResultValue, 'privateCandidate', radius)
  }

  // Update progressbar & progresstext
  function updateProgress ( current, total ){
    $(".progress .currentProgress").css('width', ((current - 1) / total) * 100 +'%');
    $(".progress .progresstext").html('Frage '+ current + ' von ' + (total))
  }

  function setCorrectImgHeight ( element ){
    var widthHeader = $( element ).outerWidth();
    var heightHeader = Math.round(widthHeader / aspectRatio) - 1;
    $( element ).css( 'height', heightHeader);
  }

  // Prepare for new question or wahlkreis selection
  function processQuestion(){
    $(".question > h3").empty();
    $(".tiles .tile").remove();
    $("button.nextQuestion").remove();

      // Search for correct wahlkreis
      $.each(quiz_data, function(wahlkreis, questions){

        if( wahlkreis === selectedWahlkreis ){
          // Generate shuffled question order
          if(questionOrder.length == 0){
            // Set number of questions
            numberOfQuestions = questions.length;

            $.each(questions, function(question, data){
              if(data.typ == 'challenge'){
                numberOfChallenges++;
              }
            });
            numberOfQuestions -= numberOfChallenges;
            generateQuestionOrder();
          }

          // Load data of correct next question from JSON
          if(currentQuestionOrderID != -1){
            currentQuestionID = questionOrder[currentQuestionOrderID];

            // If there are stilly any questions to answer
            if(currentQuestionOrderID < numberOfQuestions+numberOfChallenges){
              displayAnswers(questions);
              updateProgress(currentQuestionOrderID+1, (numberOfChallenges+numberOfQuestions));

              // Scroll to question, when on mobile, for better usability
              if($(window).width() < 500){
                $("html, body").animate({
                  scrollTop: $(".progress").offset().top
                }, 100);
              }
          }
          // If there are no more questions
          else {
            changeToResult();
          }
        }
        // If user want to display the wahlkreise
        else {
          changeToWahlkreis("question");
        }
      }

      // Randomize order of answers
      $(".tiles").randomize(".tile");
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
          if(val.typ != 'challenge'){
            var displayTile = '<div class="tile" data-index="'+ i +'"><span class="logo answer"></span><div class="title" lang="de">'+ val_answer +'</div></div>'

            // If answer is small, then center it
            if ( val_answer.length < 20 ){
              displayTile = '<div class="tile" data-index="'+ i +'"><span class="logo answer"></span><div class="title" style="text-align: center;">'+ val_answer +'</div></div>'
            }

            $(".tiles").append(displayTile);
            i=i+1;
          }
          else if(val.typ == 'challenge'){
            var displayTile = '<div class="tile" data-index="'+ i +'"><img class="challenge" src="img/challenges/'+ val_answer +'"></div>'

            $(".tiles").append(displayTile);
            i=i+1;
          }
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
  function getResult (type, alternative_type){
    var personsPoints = 0,
    highestPoints = 0,
    personWithHighestPoints = 0,
    numberOfQuestionsOfType = 0,
    percentageOfAccordance,
    result = [];

    // Iterate through persons
    for(var h=0; h < 4; h++){
      // Iterate through answers
      for( var j=0; j < selections.length; j++){
        // If alternative type is set, count this also
        if(typeof alternative_type != undefined){
          // if type of answer and person matchtes, increment counter
          if (selections[j][1] === type || selections[j][1] === alternative_type){
            numberOfQuestionsOfType++;
            if(selections[j][0] == h){
              personsPoints++;
            }
          }
          else {
            // if type of answer and person matchtes, increment counter
            if (selections[j][1] === type){
              numberOfQuestionsOfType++;
              if(selections[j][0] == h){
                personsPoints++;
              }
            }
          }
        }
        // if type of answer and person matchtes, increment counter
        if (selections[j][1] === type){
          numberOfQuestionsOfType++;
          if(selections[j][0] == h){
            personsPoints++;
          }
        }
      }

      // Calculate percentage - based on number of questions
      percentageOfAccordance = Math.round((personsPoints / (numberOfQuestionsOfType / (h+1))) * 100)
      // [ person id , percentage ]
      result.push([h, percentageOfAccordance ])

      personsPoints = 0;
    }

    // Sort result descending percentage of candidate result
    result.sort(function (a, b) {
      if( a[1] > b[1] ){
        return -1;
      }
      else if ( a[1] === b[1] ){
        return 0;
      }
      else {
        return 1;
      }
    });

    return result;
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

  /* CHANGE QUIZ HTML STRUCTURE<< FUNCTIONS **/
  // Change div containing the wahlkreis selection to the question markup
  function changeToQuestion (cssClassToRemove){
    $("."+cssClassToRemove).addClass("question").removeClass(cssClassToRemove);
    $('.tiles').empty();
    $(".tile-grid .previousQuestion").replaceWith('<button class="previousQuestion"><img class="twisted" src="img/next.svg"></button>');
    $(".progress").show();
    $(".issues h2 > span").html(selectedWahlkreis);
    $(".issues p").hide();

    currentQuestionOrderID = 0
    processQuestion();
  }

  // Change div containing a question to the wahlkreis selection
  function changeToWahlkreis (cssClassToRemove){
    $("."+cssClassToRemove).addClass("wahlkreis").removeClass(cssClassToRemove);
<<<<<<< HEAD
    $(".issues p").show();
    $(".issues h2 > span").show().html("Wahlkreis wählen");
    $(".issues p").show().html("Für unseren Kandidaten-Check haben die Landtagskandidaten von CDU, Grünen, SPD und FDP persönliche und politische Fragen beantwortet. Die Highlights haben wir ausgewählt. Klicken Sie jeweils auf die Antwort, die Ihnen am besten gefällt. Am Ende erfahren Sie, mit welchem Kandidaten Sie – politisch und privat – am meisten Übereinstimmungen haben.");
=======
>>>>>>> 69ed4d1d10a9be268d276a840bd9e049a1a952d3
    $(".tile-grid").empty()
    $(".tile-grid").append('<div class="waitForTheButton previousQuestion"></div>');
    $(".tile-grid").append('<div class="tiles"></div>');
    $(".tiles").append('<div class="tile" id="Eppingen"><span class="logo"><span>EP</span></span><div class="title">Eppingen</div></div>')
    $(".tiles").append('<div class="tile" id="Heilbronn"><span class="logo"><span>HN</span></span><div class="title">Heilbronn</div></div>')
    $(".tiles").append('<div class="tile" id="Neckarsulm"><span class="logo"><span>NSU</span></span><div class="title">Neckarsulm</div></div>')
    $(".tiles").append('<div class="tile" id="Hohenlohe"><span class="logo"><span>HOH</span></span><div class="title">Hohenlohe</div></div>');
    $(".tiles").after('<div class="waitForTheButton nextQuestion"></div>');

    $(".wahlkreis h3").show().html("Wählen Sie Ihren Wahlkreis");
    $(".progress").hide();

    // Reset variables
    currentQuestionID = 0;
    questionOrder = [];
  }

  // Show personal result of user (change from questions to result div)
  function changeToResult (){
    // Prepare HTML structure for candidates
    $(".question").addClass("personal-result").removeClass("question");
    $(".issues h2 > span").html("Ihr Ergebnis");
    $(".wahlkreis h3").hide();
    $(".personal-result > h3").hide();
    $(".tile-grid").remove();
    $(".progress").hide();
    $(".progress").after('<div class="moreAction"><a class="restartGame">Zurück zum Start</a><a class="wahlkreis" href="http://www.stimme.de/themen/wahlen/landtagswahl2016/'+selectedWahlkreis+'">Mehr Infos zum Wahlkreis '+ selectedWahlkreis +'</a></div>');

    // Get results [return datatype is a two-dimensional array]
    privateResult = getResult("privat", "challenge");
    politicalResult = getResult("politisch");

    // Iterate through candidates
    for(var w = 0; w < 4; w++){
      var privateCandidate = getCandidate(selectedWahlkreis, privateResult[w][0])
      var politicalCandidate = getCandidate(selectedWahlkreis, politicalResult[w][0])

      // Add next candidates container
      if($(".candidates").length == 0){
          $(".personal-result > h3").after('<div class="candidates"></div>');
      }
      else {
        $(".candidates:last-of-type").after('<div class="candidates"></div>');
      }

      // Add first candidate
      $(".candidates:last-of-type").append('<div class="candidate"></div>');
      $(".candidates:last-of-type .candidate:first-of-type").html('<div class="percentage"><div class="chart" id="politicalCandidate"></div><div class="picture"></div></div><p class="info">'+politicalCandidate.kandidaten_name+', '+politicalCandidate.partei+', '+ politicalCandidate.alter +' Jahre</p> <h2>'+politicalResult[w][1]+'%</h2>');

      // Add second candidate
      $(".candidates:last-of-type").append('<div class="candidate"></div>');
      $(".candidates:last-of-type .candidate:last-of-type").html('<div class="percentage"><div class="chart" id="privateCandidate"></div><div class="picture"></div></div><p class="info">'+privateCandidate.kandidaten_name+', '+privateCandidate.partei+', '+ privateCandidate.alter +' Jahre</p> <h2>'+privateResult[w][1]+'%</h2>');

      // Add candidate image
      $(".candidates:last-of-type .candidate:first-of-type .picture").css('background-image', 'url("img/kandidaten/'+ politicalCandidate.bild_url +'")')
      $(".candidates:last-of-type .candidate:last-of-type .picture").css('background-image', 'url("img/kandidaten/'+ privateCandidate.bild_url +'")')
    }

    // Create circles in depending on window size (mobile or not)
    updateCircles(politicalResult[0][1], privateResult[0][1])

    // Add topic to column
    $(".candidates:first-of-type .candidate:first-of-type .percentage").before('<div class="topic">Politisch</div>');
    $(".candidates:first-of-type .candidate:last-of-type .percentage").before('<div class="topic">Privat</div>');

    // Show sharing container
    $(".personal-result").after('<div class="sharing-container"><ul></ul></div>')
    $(".sharing-container ul").append('<li><a href="https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fwww.stimme.de%2Fkandidatencheck" target="_blank" ><img src="img/facebook.png" alt="Facebook Share Icon"></a></li><li><a href="https://twitter.com/intent/tweet?text=Ich%20habe%20den%20%23KandidatenCheck%20von%20%40stimmeonline%20gecheckt!%20Welcher%20Landtagskandidat%20zu%20dir%20passt%2C%20erf%C3%A4hrst%20du%20hier%3A&url=http%3A%2F%2Fwww.stimme.de%2Fkandidatencheck" target="_blank"><img src="img/twitter.png" alt="Twitter Share Icon"></a></li><li id="whatsapp-sharing" style="display: none;"><a href="whatsapp://send?text=Kandidaten-Check%20http%3A%2F%2Fwww.stimme.de%2Fkandidatencheck"><img src="img/whatsapp.png" alt="WhatsApp Share Icon"></a></li>');

    // Add text
    var endingText = '';
    if(selectedWahlkreis != 'Eppingen'){
      endingText = 'Geschafft! Jetzt erfahren Sie, die Antworten welches Kandidaten Sie am häufigsten ausgewählt haben, und welche am seltensten. Auf der linken Seite sehen Sie die politische Übereinstimmung. Auf der rechten Seite sehen Sie, welcher Kandidat Ihnen persönlich am nächsten steht. Antworten zu persönlichen Vorlieben und die Zeichnungen und Bilder zählen als persönliche Übereinstimmung.  Gleiche Antworten auf Sachfragen wurden als politische Übereinstimmung gewertet.';
    }
    else {
      endingText = 'Geschafft! Jetzt erfahren Sie, die Antworten welches Kandidaten Sie am häufigsten ausgewählt haben, und welche am seltensten. Auf der linken Seite sehen Sie die politische Übereinstimmung. Gleiche Antworten auf Sachfragen wurden als politische Übereinstimmung gewertet. Auf der rechten Seite sehen Sie, welcher Kandidat Ihnen persönlich am nächsten steht. Gleiche Antworten zu persönlichen Vorlieben zählen als persönliche Übereinstimmung. In den anderen Wahlkreisen in der Region haben die Politiker drei Zusatzaufgaben wie kuriose Selfies und eine Zeichnung eingeschickt, die Kandidaten aus Eppingen wollten das nicht. Schade!';
    }
    $(".issues p").show().html( endingText );

    // Add credits
    var creditsText = 'Für den Kandidaten-Check haben Volontäre der Heilbronner Stimme die Kandidaten zur Landtagswahl nach Persönlichem und Politischem befragt. Eine Auswahl der Antworten und die Zusatzaufgaben haben es in den Check geschafft.</p>'
    + '<p>Am Projekt beteiligt waren: Henri Chilla, Ranjo Doering, Janis Dietz, Christoph Feil, David Hilzendegen, Felix Klingel, Heiko Nicht, Kirsi-Fee Rexin, Daniel Stahl, Franziska Türk, Katrin Walter, Samantha Walther und Bianca Zäuner</p>'
    +'<p>Wir danken den Politikern, dass sie sich – mehrheitlich – auf diese etwas andere Interviewform eingelassen haben.</p>';
    $(".sharing-container").before('<section class="credits"><h3>Credits</h3><p>' + creditsText + '</section>');

    // Add links for restarting the game & further links
    $(".credits").before('<div class="moreAction"><a class="restartGame">Zurück zum Start</a><a class="wahlkreis" href="http://www.stimme.de/themen/wahlen/landtagswahl2016/'+selectedWahlkreis+'">Mehr Infos zum Wahlkreis '+ selectedWahlkreis +'</a></div>');
  }

  // Reset variables & start from beginning
  function restartGame(){
    $(".personal-result").empty();
    $(".personal-result").append('<h3></h3>');
    $(".personal-result").append('<div class="tile-grid"></div>')
    $("div.moreAction").remove();
    $(".endingText").remove();
    $(".credits").remove();
    $(".sharing-container").remove();

    selectedWahlkreis = null,
    currentQuestionID = 0,
    currentQuestionOrderID = 0,
    politicalResult = null,
    privateResult = null,
    selections = [];

    changeToWahlkreis("personal-result");
  }

  /* EVENTS */
  $("section").on('click', 'button.previousQuestion' ,function () {
    // Initialize previous question
    if($(".question").length != 0){
      currentQuestionOrderID-=1;
      processQuestion();
    }
  })

  // Reset variables & start from beginning
  function restartGame(){
    $(".personal-result").empty();
    $(".personal-result").append('<h3></h3>');
    $(".personal-result").append('<div class="tile-grid"></div>')
    $("div.moreAction").remove();

    selectedWahlkreis = null,
    currentQuestionID = 0,
    currentQuestionOrderID = 0,
    politicalResult = null,
    privateResult = null,
    selections = [];

    changeToWahlkreis("personal-result");
  }

  // Save wahlkreis id, the user selected
  $("body").on('click', '.wahlkreis .tile' ,function () {
    selectedWahlkreis = $(this).attr("id");

    changeToQuestion('wahlkreis');
  })

  // User selected an answer: load next question & save picked answer
  $("body").on( 'click', '.question .tile' ,function () {
    // Save picked answer
    picked=$(this).attr("data-index");
    // New CSS style for picked answer
    setPickedClass(this);

    // If there was a previous question
    if($(".question").length != 0){
      // Save the answer selection from user
      selections[currentQuestionOrderID] = new Array();
      selections[currentQuestionOrderID].push(picked, currentQuestion.typ)

      // Initialize new question
      currentQuestionOrderID+=1;
      processQuestion();
      picked = null;
    }
  })

  $("section").on( 'click', 'button.nextQuestion' ,function () {
    changeToQuestion('wahlkreis');
  })

  $("div").on( 'click', 'div.moreAction a.restartGame' ,function () {
    restartGame();
  })

  // User selected an answer: Show "next" button & save picked answer
  $("section").on( 'mouseenter mouseleave', '.tile' ,function () {
    // New CSS style for picked answer
    setPickedClass(this);
  })

  // Mouse leaves tiles -> remove styles if nothing is picked
  $("section").on( 'mouseleave', '.tiles' ,function () {
    if(currentQuestionOrderID in selections){
      var pickedHtmlElement = $('.tile[data-index='+selections[currentQuestionOrderID][0]+']');
      setPickedClass(pickedHtmlElement);
    }
    else if(typeof picked == "undefined" || picked == null){
      $(".tile").removeClass("picked");
      $(".tile").removeClass("blind");
    }
  })

  /* INITIALIZE */
  function init (){
    // Load quiz JSON
    $.getJSON('js/quiz.json', function (json){
      quiz_data=json;
    });

    // Load candidates JSON
    $.getJSON('js/candidates.json', function (json){
      candidates=json;
    });

    //Set header background-image height
    headerImg = new Image();
    headerImg.onload = function() {
      aspectRatio = this.width / this.height;
      setCorrectImgHeight ( "header" )
    }
    headerImg.src = 'img/header_bg.jpg';

    lastWindowWidth = $(window).width();
  }

  init();

  $( window ).resize(function() {
    //Set header background-image height
    setCorrectImgHeight ( "header" )

    // Update Circles
    if(politicalResult != null && ((lastWindowWidth >= 460 && $(window).width() <= 460)||(lastWindowWidth <= 460 && $(window).width() >= 460))){
      updateCircles(politicalResult[0][1], privateResult[0][1])
    }

    // !!! Check this before release
    // Hide issue, when starting the quiz
    if($(window).width() < 350 ){
      $("section.issues").hide();
    }
    else if ($(window).width() > 350 && $("section.issues").is(":hidden")) {
      $("section.issues").show();
    }

    lastWindowWidth = $(window).width();
  });

  /* NOT OWN FUNCTIONS */
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
