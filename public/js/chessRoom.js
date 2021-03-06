
var socket = io();
//------- begin of the chessBoard -------
var canvas = document.querySelector('.chessBoard');
var length = window.innerHeight < window.innerWidth ? window.innerWidth : window.innerHeight;
var width = canvas.width = canvas.height = window.innerHeight > window.innerWidth ? window.innerWidth : window.innerHeight;

var originX = document.querySelector('.chessBoard').getBoundingClientRect().left;


//
//			rect = canvas.getBoundingClientRect();
//console.log(rect.top, rect.right, rect.bottom, rect.left);

var c = canvas.getContext('2d');


const CHESS_RADIUS = 20;
const INTERVAL = (canvas.width - 2 * 20) / 18;

var chessBoard;

function chessSound() {
	$("#chessSound")[0].play();
}
function clickSound() {
	$("#clickSound")[0].play();// TODO: add this sound to indicate error when placeing chess
}

function opaqueChessBoard() {
	c.save();
	c.globalAlpha = 0.4;
	chessBoard.renderNewChessboard();
}



$(document).ready(function () {
	$('#timer-toggle-1').unbind('click').click(function () {
		$('#timer-b-container').slideToggle();
	});
	$('#timer-toggle-2').unbind('click').click(function () {
		$('#timer-w-container').slideToggle();
	});

	//	$('body').click(clickSound);//
});

$('#judgement').click(function () {
	socket.emit('judgement');
});


$('#send-meg').click(function () {
	var input = $('#text-meg').val();
	var message = {
		text: input,
		createAt: Date.now()
	}
	socket.emit('sendMeg', message);
});

//TODO: this should be a utility function

function firework() {
	APP.special_effect_canvas.clear();
	APP.special_effect_canvas.init('fireworks_canvas');
	APP.special_effect_canvas.setupEffect('fireworks', undefined, {
		count: 1,
		subCount: 30,
		repeatLimit: 7,
		hueBase: 50,//47,
		hueVariation: 5,//10,
		brightnessBase: 65,
		brightnessVariation: 15,
		lineMin: 2,
		lineMax: 5,
	}, true);
};


function createChessBoard(color) {
	chessBoard = new Chessboard(INTERVAL, CHESS_RADIUS, c, canvas.width, canvas.height, color, originX, 0);
	//there should be no margin in y axis
	chessBoard.renderNewChessboard();
	$('.chessBoard').css('cursor', 'none');
	$('.chessBoard').mouseleave(function () {
		chessBoard.renderNewChessboard(); // this prevents a chess being drawn when the cursor leaves the chessBoard
	});

	canvas.addEventListener('mousemove', function (event) {
		chessBoard.hover(event);
	});

	canvas.addEventListener('click', function (event) {
		var chessObj = chessBoard.click(event);
		if (chessObj) {
			socket.emit('click', chessObj, color, function (err, chessRecord) {
				if (!err) {
					chessBoard.renderNewChessboard(chessRecord);
					chessSound();
				}
			});
		}
	});


	socket.on('initChess', function (chessRecord) {
		for (var i = 0; i < chessRecord.colorArr.length; i++) {
			for (var j = 0; j < chessRecord.colorArr[i].length; j++) {
				if (chessRecord.colorArr[i][j]) {
					chessBoard.addChess(i, j, chessRecord.colorArr[i][j]);
				}
			}
		}
	});

	socket.on('updateChess', function (chessRecord) {
		chessBoard.renderNewChessboard(chessRecord);
		chessSound();
	});
}
//-----end of the chessBoard ----

socket.on('connect', function () {
	console.log('Connected to server');
});
socket.on('gameBegin', function (color) {

	createChessBoard(color);
	$('.chess-room').hide();
	$('#waitingMeg').remove();
	$('body').sakura('stop');
	$('.message').append('<h2 id = "beginMeg">Players ready, game begin</h2>');
	$('.message').hide().show('slow');
	setTimeout(function () {
		$('#beginMeg').remove();
		$('.chess-room').show('slow');
	}, 1000);
});

socket.on('waitingPlayer', function (message) {
	$('.chess-room').hide();
	$('.index-container').remove();
	var line1 = $('<h1></h1>').text(message);
	var line2 = $('<h2></h2>').text('Waiting for players...');
	line2.append('<div class="fa fa-spinner fa-spin"></div>');
	var html = $('<div id = "waitingMeg"></div>').append(line1).append(line2);
	$('.message').append(html);
});


socket.on('receiveMeg', function (message) {
	//    $('#chats-container').append('<h2></h2>').text(`${name}: ${text}`);
	var formattedTime = moment(message.createdAt).format('h:mm a');
	var template = jQuery('#message-template').html();
	var html = Mustache.render(template, {
		text: message.text,
		from: message.from,
		createdAt: formattedTime
	});

	jQuery('.chat').append(html);
});

socket.on('gamePause', function () {
	$('.message').append('<h2 id="pauseMeg" class="font-weight-bold">Game paused, opponent left. <i class="fas fa-pause"></i></h2>');

	opaqueChessBoard();

});

socket.on('gameWon', function () {
	$('.message').append('<h2 id = "wonMeg">You won! <i class="fas fa-smile"></i></h2>');

	firework();
});


socket.on('disconnect', function () {
	console.log('Connection lost');
});




