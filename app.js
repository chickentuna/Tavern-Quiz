function randInt(n) {
	return Math.floor(n * Math.random());
}

function choose(arr) {
	return arr[randInt(arr.length)];
}

var ignore = [
	'can',
	'of',
	'the'
]

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
	return axios.get('http://thesaurus.altervista.org/thesaurus/v1?word=' + word + '&language=en_US&output=json&key=TeR4qHrTKo2ruvyPMlHc')
}
function processSynonyms(data) {
	var possibilities = [];

	for (var i = 0; i < data.response.length; ++i) {
		var synonyms = data.response[i].list.synonyms;
		var remain = synonyms.split('|').map(word => word.replace(/\ \([^)]*\)$/, '')).filter(word => word.indexOf(' ') === -1);
		possibilities = possibilities.concat(remain);
	}
	
	return possibilities;
}

var cardImg;

function getCallback(index, list) {
	return function(data) {
		var all = processSynonyms(data.data);
		list[index] = all;
	};
}

function launch() {
	var category = choose(categories);
	var n = randInt(allCards.en[category].length)
	var card = choose(allCards.en[category]);

	cardImg = allCards.ru[category].filter(v=>v.cardId === card.cardId)[0].img;

	var realName = card.name;
	var decontructed = realName.split(' ');

	var possibles = [];
	var promises = [];
	for (var i = 0; i < decontructed.length; ++i) {
		var word = decontructed[i];
		var possessive = word.indexOf("'s") > -1;
		if (possessive) {
			word = word.replace("'s", '');
		}
		
		possibles[i] = [decontructed[i]];

		if (ignore.indexOf(word) == -1) {
			promises.push(retrieveSynonymns(word).then(getCallback(i, possibles));
		}
	}

	axios.all(promises).then(function() {
		var propositions = [realName];	
		$('#propositions').empty();
		$('#propositions').append('<li><button onclick="launch()">'+realName+'</button></li>')
		$('#card img').attr('src', cardImg);
		console.log(possibles);
	});

	
}

var key = 'TeR4qHrTKo2ruvyPMlHc'

