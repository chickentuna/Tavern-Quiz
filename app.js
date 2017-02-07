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
	return axios.get('http://www.stands4.com/services/v2/syno.php?word=' + word + '&uid=5568&tokenid=UdJmSHBQsYGz41Id')
}
function processSynonyms(data) {
	var possibilities = [];

	var parser = new DOMParser();
	var xmlDoc = parser.parseFromString(data,"text/xml");

	var xmlSynonyms = $(xmlDoc).find('results synonyms');

	for (var i = 0; i < xmlSynonyms.length; ++i) {
		if (!xmlSynonyms[i].childNodes[0]) {
			break;
		}
		var synonyms = xmlSynonyms[i].childNodes[0].nodeValue;
		var remain = synonyms.split(', ').filter(w=>w.indexOf(' ') === -1);
		possibilities = possibilities.concat(remain);
	}
	
	return possibilities;
}

var cardImg;

function getCallback(index, list) {
	return function(data) {
		var all = processSynonyms(data.data);
		var truth = list[index][0]
		list[index] = all;
		all.push(truth);
	};
}

function launch() {
	$('#card img').attr('src', '');

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
			promises.push(retrieveSynonymns(word).then(getCallback(i, possibles)));
		}

	}

	//TODO: if possessive, pick only nouns

	axios.all(promises).then(function() {
		var propositions = [realName.split(' ').map(w=>w[0].toUpperCase() + w.slice(1)).join(' ')];

		$('#card img').attr('src', cardImg);
		if (possibles.every(v => v.length == 1)) {
			launch();
			return;
		}

		var n = 6;
		for (var i = 0; i < n; ++i) {

			var reconstructed = possibles.map(arr => choose(arr)).map(str => str[0].toUpperCase() + str.slice(1));
			var name = reconstructed.join(' ');
			if (propositions.indexOf(name) == -1) {
				propositions.push(name);
			}
			
		}

		shuffle(propositions);
		$('#propositions').empty();
		for (var i = 0; i < propositions.length; ++i) {
			if (propositions[i] == realName) {
				$('#propositions').append('<li><button onclick="correct()">' + propositions[i] + '</button></li>')	
			} else {
				$('#propositions').append('<li><button onclick="wrong()">' + propositions[i] + '</button></li>')
			}
		}
	});

	
}

function correct() {
	alert('Correct');
	launch();
}
function wrong() {
	alert('Wrong');
	launch();
}

function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}

var key = 'TeR4qHrTKo2ruvyPMlHc'

