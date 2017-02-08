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
  "The League of Explorers"
];

var englishOnly = [
	"Mean Streets of Gadgetzan",
	"Whispers of the Old Gods",
	"Karazhan"
]

var allCards;

function init() {
	allCards = getAllCards();
	launch();
}

function retrieveSynonymns(word) {
	return axios.get('http://www.stands4.com/services/v2/syno.php?word=' + word + '&uid=5568&tokenid=UdJmSHBQsYGz41Id')
}
function processSynonyms(data, possessive) {
	var possibilities = [];

	var parser = new DOMParser();
	var xmlDoc = parser.parseFromString(data,"text/xml");

	var xmlSynonyms = $(xmlDoc).find('results synonyms');

	for (var i = 0; i < xmlSynonyms.length; ++i) {
		if (!xmlSynonyms[i].childNodes[0]) {
			break;
		}
		var synonyms = xmlSynonyms[i].childNodes[0].nodeValue;
		var remain = synonyms.split(', ').map(w=>w.replace(/\(.\)/, '')).filter(w=>w.indexOf(' ') === -1);
		if (possessive) {
			remain = remain.map(w => w + "'s");
		}
		possibilities = possibilities.concat(remain);
	}
	
	return possibilities;
}

var cardImg;

function getCallback(index, list, possessive) {
	return function(data) {
		var all = processSynonyms(data.data, possessive);
		var truth = list[index][0]
		list[index] = all;
		all.push(truth);
	};
}

function titleCase(str) {
	return str[0].toUpperCase() + str.slice(1);
}

function uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    })
}

var correct = '';

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

		if (ignore.indexOf(word.toLowerCase()) == -1) {
			promises.push(retrieveSynonymns(word).then(getCallback(i, possibles, possessive)));
		}
	}

	axios.all(promises).then(function() {
		if (possibles.every(v => uniq(v.map(w => titleCase(w))).length == 1)) {
			launch();
			return;
		}
		$('#card img').attr('src', cardImg);

		correct = [];
		var props = $('#propositions');
		props.empty();
		for (var j = 0; j < possibles.length; ++j) {
			var sel = document.createElement('select');
			props.append(sel);
			
			var words = uniq(possibles[j].map(w=>titleCase(w)));
			for(var i = 0; i < words.length; i++) {
			    var opt = document.createElement('option');
			    opt.innerHTML = words[i];
			    opt.value = words[i];

			    sel.append(opt);
			    if (words[i] === titleCase(decontructed[j])) {
			    	correct.push(words[i]);
			    }
			}
			if (words.length == 1)  {
				sel.setAttribute('disabled', true)
			}
		}
		props.css('display', 'flex');
	});

	
}

function right() {
	alert('Correct');
	launch();
}
function wrong() {
	alert('Wrong. The correct answer was ' + correct.join(' '));
	launch();
}

function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}

function ok() {
	var answer = []
	var selects = $('#propositions select');
	for (var i = 0; i < selects.length; ++i) {
		answer.push(selects[i].value);
	}
	if (answer.join(' ') === correct.join(' ')) {
		right();
	} else {
		wrong();
	}

}