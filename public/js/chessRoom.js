
var socket = io();
//------- begin of the chessBoard -------
var canvas = document.querySelector('.chessBoard');
var length = window.innerHeight<window.innerWidth ? window.innerWidth : window.innerHeight;
var width = canvas.width = canvas.height = window.innerHeight>window.innerWidth ? window.innerWidth : window.innerHeight;

var originX = document.querySelector('.chessBoard').getBoundingClientRect().left;


//
//			rect = canvas.getBoundingClientRect();
//console.log(rect.top, rect.right, rect.bottom, rect.left);

var c = canvas.getContext('2d');


const CHESS_RADIUS = 15; 
const INTERVAL = (canvas.width - 2 * 20) / 18;

var chessBoard;

function clickSound(){
	$("#clickSound")[0].play();
}
//TODO: this should be a utility function

function opaqueChessBoard(){
//    var c = $('.chessBoard')[0].getContext('2d');
//    if(c){
        c.save();
        c.globalAlpha = 0.4;
        chessBoard.renderNewChessboard();
//    }
}

function firework(){
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
    },true);
};


$('#send-meg').click(function(){
    var input =  $('#text-meg').val();
    var message = {
        text: input,
        createAt: Date.now()
    }
    socket.emit('sendMeg',message);
});

function createChessBoard(color){
	chessBoard = new Chessboard(INTERVAL, CHESS_RADIUS,c,canvas.width,canvas.height,color,originX,0);
	//there should be no margin in y axis
	chessBoard.renderNewChessboard();
	$('.chessBoard').css('cursor', 'none');
	$('.chessBoard').mouseleave(function(){
		chessBoard.renderNewChessboard(); // this prevents a chess being drawn when the cursor leaves the chessBoard
	});
	
	canvas.addEventListener('mousemove',function(event){
		chessBoard.hover(event); 
	});

	canvas.addEventListener('click', function(event){
		var chessObj = chessBoard.click(event);
		if(chessObj){
			socket.emit('click',chessObj,color,function(err,chessRecord){
				if(!err){
					chessBoard.renderNewChessboard(chessRecord);
					clickSound();
				}
			});
		}
	});

	
	socket.on('initChess',function(chessRecord){
		for(var i =0;i<chessRecord.colorArr.length;i++){
			for(var j =0;j<chessRecord.colorArr[i].length;j++){
				if(chessRecord.colorArr[i][j]){
				   	chessBoard.addChess(i,j,chessRecord.colorArr[i][j]);
				}
			}
		}
	});

	socket.on('updateChess',function(chessRecord){
		chessBoard.renderNewChessboard(chessRecord);
		clickSound();
	});
}
//-----end of the chessBoard ----

socket.on('connect', function(){
	console.log('Connected to server');
});
socket.on('gameBegin',function(color){
	createChessBoard(color);
	$('.chess-room').hide();
	$('#waitingMeg').remove();
	$('.message').append('<h2 id = "beginMeg">Players ready, game begin</h2>');
	$('.message').hide().show('slow');
	setTimeout(function(){
		$('#beginMeg').remove();
		$('.chess-room').show('slow');
	},1000)
});

socket.on('waitingPlayer',function(){
	$('.chess-room').hide();
	$('.index-container').remove();
	$('.message').append('<h2 id = "waitingMeg">Waiting for players... </h2>');
	$('#waitingMeg').append('<div class="fa fa-spinner fa-spin"></div>');
});


socket.on('receiveMeg',function(message){
//    $('#chats-container').append('<h2></h2>').text(`${name}: ${text}`);
    var formattedTime = moment(message.createdAt).format('h:mm a');
	var template = jQuery('#message-template').html();
	var html = Mustache.render(template ,{
		text: message.text,
		from: message.from,
		createdAt: formattedTime
	});
	
	jQuery('.chat').append(html);
});

socket.on('gamePause',function(){
    $('.message').append('<h2 id="pauseMeg" class="font-weight-bold">Game paused, opponent left. <i class="fas fa-pause"></i></h2>');
        
    opaqueChessBoard();
    
});

socket.on('gameWon', function(){
    $('.message').append('<h2 id = "wonMeg">You won! <i class="fas fa-smile"></i></h2>');
    
    firework();
});


socket.on('disconnect',function(){
	console.log('Connection lost');
});




