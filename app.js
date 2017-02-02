var http = axios.create({
  headers : {'Access-Control-Allow-Origin': '*'}
});

function randInt(n) {
	return Math.floor(n * Math.random());
}

function choose(arr) {
	return arr[randInt(arr.length)];
}

var categories = [
  "Basic",
  "Classic",
  "Naxxramas",
  "Goblins vs Gnomes",
  "Blackrock Mountain",
  "The Grand Tournament",
  "The League of Explorers",
  "Whispers of the Old Gods",
  "Karazhan"
];

var allCards;

function init() {
	allCards = getAllCards();
	launch();
}

function retrieveSynonymns(word) {
$.ajax({ 
  url: 'http://thesaurus.altervista.org/thesaurus/v1?word=' + word + '&language=en_US&output=json&key=TeR4qHrTKo2ruvyPMlHc',
  success: function(data) {
    process(data);
  }, 
  error: function(xhr, status, error){ 
    launch();
  } 
});
}

function process(data) {
	var possibilities = [];

	for (var i = 0; i < data.response.length; ++i) {
		var synonyms = data.response[i].list.synonyms;
		var remain = synonyms.split('|').map(word => word.replace(/\ \([^)]*\)$/, '')).filter(word => word.indexOf(' ') === -1);
		possibilities = possibilities.concat(remain);
	}
	console.log(possibilities);
	$('#card img').attr('src', cardImg);
}

var cardImg;

function launch() {
	var category = choose(categories);
	var n = randInt(allCards.en[category].length)
	var card = choose(allCards.en[category]);

	cardImg = allCards.ru[category].filter(v=>v.cardId === card.cardId)[0].img;

	var realName = card.name;

	var word = (realName.split(' ')[0]);
	
	$('#propositions').empty();
	$('#propositions').append('<li><button onclick="launch()">'+realName+'</button></li>')

	retrieveSynonymns(word);


}

var key = 'TeR4qHrTKo2ruvyPMlHc'

