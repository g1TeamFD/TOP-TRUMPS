// This script controls the mechanics behind a "top trumps"-style game for industries

// Customization messages
var chooseCardMsg = "(Choose an Industry)";
var noCardSelectionMsG = "No industry selected";
var noCategorySelectionMsG = "Select exactly five attributes";
var turnWonMsg = "This turn is yours!";
var turnLostMsg = "Opponent won this turn...";
var turnDrawMsg = "It's a draw!";
var gameWonMsg = "You dominate the industry! Score: ";
var gameLostMsg = "Opponent dominates the industry: ";
var gameDrawMsg = "Industry standoff: ";
var turnWaitMsg = "Choose attributes to play";
var gameOverMsg = "Industry Game Over";
var gameWaitMsg = "Start a new industry game?";

// Game configuration
var numberOfRounds = 7;
var numberOfCategories = 5;
var progressBarPercentage = "width: 14.29%";
var currentRound = 1;

// Data headers and customization for industry attributes
var data_header = ["Industry", "Market Size (USD Billion)", "Growth Rate (%)", "Employment (Million)", "Global Reach (Countries)", "Innovation Index"];
var data_suffix = ["", " Billion", " %", " Million", "", ""];
var data_comparison = ["", "larger", "larger", "larger", "larger", "larger"];

// Industry data cards
var tech = ["Technology", 5000, 10.5, 50, 190, 95];
var finance = ["Finance", 3100, 7.3, 20, 150, 85];
var healthcare = ["Healthcare", 3700, 6.5, 30, 180, 80];
var energy = ["Energy", 2700, 5.0, 25, 160, 70];
var education = ["Education", 2000, 4.5, 15, 140, 75];
var retail = ["Retail", 4200, 8.5, 60, 170, 60];
var automotive = ["Automotive", 1600, 3.5, 10, 130, 65];
var agriculture = ["Agriculture", 900, 3.0, 20, 120, 55];
var realEstate = ["Real Estate", 2500, 4.0, 10, 110, 50];
var telecommunications = ["Telecommunications", 1300, 6.0, 5, 180, 85];
var media = ["Media", 1200, 7.0, 8, 160, 75];
var aerospace = ["Aerospace", 700, 5.5, 3, 140, 90];
var logistics = ["Logistics", 1000, 6.8, 12, 150, 60];
var hospitality = ["Hospitality", 850, 4.0, 15, 100, 50];
var pharmaceuticals = ["Pharmaceuticals", 1500, 5.0, 4, 140, 90];

// Group all industry cards
var allCards = [tech, finance, healthcare, energy, education, retail, automotive, agriculture, realEstate, telecommunications, media, aerospace, logistics, hospitality, pharmaceuticals];

// list of cards for player to choose from
var cardsList = [
  ["tech", "Technology"], ["finance", "Finance"], ["healthcare", "Healthcare"],
  ["energy", "Energy"], ["education", "Education"], ["retail", "Retail"],
  ["automotive", "Automotive"], ["agriculture", "Agriculture"],
  ["realEstate", "Real Estate"], ["telecommunications", "Telecommunications"],
  ["media", "Media"], ["aerospace", "Aerospace"], ["logistics", "Logistics"],
  ["hospitality", "Hospitality"], ["pharmaceuticals", "Pharmaceuticals"]
];

// Inititate buttons and information displays
var startGameButton;
var startTurnButton;
var newGameButton;
var showSummaryButton;
var waitingButton;
var infoLine;
var summaryList;
var gameProgressBar;
var computerCardDiv;

// set width of hud and button container on small devices
var viewportWidth = $(window).width();
if (viewportWidth <= 576) {
  $("#hudcontent").css("maxWidth", viewportWidth);
  $("#buttons").css("maxWidth", viewportWidth);
  $("#infocontent").css("maxWidth", viewportWidth);
}

// initiate variables for later use
var gameMode;
var chosenCard;
var chosenCategories;
var playerCards;
var computerCards;
var playerPoints;
var computerPoints;
var playerCount;
var computerCount;
var currentPlayerCard;
var currentComputerCard;
var stateOfGame;

function formatNumbers(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function shuffleCards() {
  var currentIndex = allCards.length;
  var temporaryValue;
  var randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = allCards[currentIndex];
    allCards[currentIndex] = allCards[randomIndex];
    allCards[randomIndex] = temporaryValue;
  }
}

function updateButtons(state) {
  stateOfGame = state;
  switch (state) {
    case 1:
      document.getElementById("getMode").style.display = "flex";
      getMode();
      break;
    case 2:
      document.getElementById("getCategories").style.display = "flex";
      getCategories();
      break;
    case 3:
      document.getElementById("cards").style.display = "block";
      infoLine.innerHTML = "";
      break;
    case 4:
      startTurnButton.style.display = "inline";
      break;
    case 5:
      infoLine.classList.add("text-light");
      infoLine.innerHTML = `<h4 class='mb-1'>ROUND ${currentRound} OF ${numberOfRounds}</h4>`;
      break;
    case 6:
      showSummaryButton.style.display = "inline";
      break;
    case 7:
      showSummary();
      break;
  }
}

function getMode() {
  var cardsListDropdown = document.getElementById("chosenCardSelect");
  while (cardsListDropdown.hasChildNodes()) {
    cardsListDropdown.removeChild(cardsListDropdown.lastChild);
  }
  var chooseCardMsgElement = document.createElement("option");
  chooseCardMsgElement.value = "noSelection";
  chooseCardMsgElement.appendChild(document.createTextNode(chooseCardMsg));
  cardsListDropdown.appendChild(chooseCardMsgElement);

  for (i = 0; i < cardsList.length; i++) {
    var newCardInList = document.createElement("option");
    newCardInList.value = cardsList[i][0];
    newCardInList.appendChild(document.createTextNode(cardsList[i][1]));
    cardsListDropdown.appendChild(newCardInList);
  }

  $(document).on("click", "#randomCards", function() {
    gameMode = "random";
    initGame();
  });

  $(document).on("click", "#chosenCardButton", function() {
    gameMode = "fixedCard";
    chosenCard = $("#chosenCardSelect :selected").val();
    if (chosenCard == "noSelection") {
      document.getElementById("noCardSelection").innerHTML = noCardSelectionMsG;
    } else {
      initGame();
    }
  });
}

function getCategories() {
  var categoriesList = document.getElementById("chosenCategoriesList");
  while (categoriesList.hasChildNodes()) {
    categoriesList.removeChild(categoriesList.lastChild);
  }

  for (i = 1; i < data_header.length; i++) {
    var newCategoryCheckbox = document.createElement("div");
    newCategoryCheckbox.classList.add("custom-control", "custom-checkbox", "custom-control-inline");

    var newCategoryInput = document.createElement("input");
    newCategoryInput.id = i;
    newCategoryInput.classList.add("custom-control-input");
    newCategoryInput.type = "checkbox";

    var newCategoryLabel = document.createElement("label");
    newCategoryLabel.classList.add("custom-control-label");
    newCategoryLabel.setAttribute("for", i);
    newCategoryLabel.appendChild(document.createTextNode(data_header[i]));

    newCategoryCheckbox.appendChild(newCategoryInput);
    newCategoryCheckbox.appendChild(newCategoryLabel);
    categoriesList.appendChild(newCategoryCheckbox);
  }

  $(document).on("click", "#randomCategories", function() {
    chosenCategories = [1, 2, 3, 4, 5];
    initGame();
  });

  $(document).on("click", "#chosenCategoriesButton", function() {
    chosenCategories = [];
    for (i = 1; i < data_header.length; i++) {
      currentCatID = "#" + i;
      if ($(currentCatID).is(":checked")) chosenCategories.push(i);
    }
    if (chosenCategories.length != numberOfCategories) {
      document.getElementById("noCategorySelection").innerHTML = noCategorySelectionMsG;
    } else {
      initGame();
    }
  });
}

function initGame() {
  shuffleCards();
  buildDecks();
  updateButtons(3);
  playerPoints = 0;
  computerPoints = 0;
  updateScore();
  while (gameProgressBar.hasChildNodes()) {
    gameProgressBar.removeChild(gameProgressBar.lastChild);
  }
  initTurn();
}

// Add the remaining functions `updateScore`, `buildDecks`, `showSummary`, `initTurn`
// to complete the mechanics.
