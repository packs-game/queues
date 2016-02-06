var lib = require('packs-lib');
var queue = lib.queue;

var activeSeeks = [];

function handleMessage(data, done) {
	switch (data.type) {
		case 'search':
			if (activeSeeks.indexOf(data.id) === -1) {
				activeSeeks.push(data.id);
			}
			checkPairings();
			return done();
		case 'cancel':
			if (activeSeeks.indexOf(data.id) !== -1) {
				activeSeeks.splice(activeSeeks.indexOf(data.id), 1);
			}
			checkPairings();
			return done();
	}
	console.log('ERR', data, 'NOT HANDLED');
	return done({
		err: 'not_handled_by_service'
	});
}

var matchmakingQueueParser = queue.listen('matchmaking', handleMessage);

//randomly pulls 2 players from the queue and pairs them up
function checkPairings() {
	console.log('Awaiting pairings: ' + activeSeeks.length + ' users.');
	while (activeSeeks.length >= 2) {
		var players = [];
		var rand1 = Math.floor(Math.random() * activeSeeks.length);
		var randomPlayer = activeSeeks.splice(rand1, 1)[0];
		//do it in this order since we need to remove the selected one before we randomly decide the next one
		var rand2 = Math.floor(Math.random() * activeSeeks.length);
		var randomPlayer2 = activeSeeks.splice(rand2, 1)[0];
		players.push(randomPlayer);
		players.push(randomPlayer2);
		queue.send('game-pairing', {
			players: players
		});
	}
}