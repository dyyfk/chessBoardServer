
var socket = io();

//------- begin of the chessBoard -------
var canvas = document.querySelector('.chessBoard');
canvas.width = canvas.height = window.innerHeight>window.innerWidth ? window.innerWidth : window.innerHeight;


			var rect = document.querySelector('.chessBoard-box').getBoundingClientRect();
console.log(rect.top, rect.right, rect.bottom, rect.left);

			rect = canvas.getBoundingClientRect();
console.log(rect.top, rect.right, rect.bottom, rect.left);


var c = canvas.getContext('2d');


const CHESS_RADIUS = 15; 
const INTERVAL = (canvas.width - 2 * 20) / 18;




var chessBoard;

function clickSound(){
	var sound = new Audio('./assets/sounds/firststone.mp3');
	sound.play();
}
//TODO: this should be a utility function


function createChessBoard(color){
	chessBoard = new Chessboard(INTERVAL, CHESS_RADIUS,c,canvas.width,canvas.height,color);
	chessBoard.renderNewChessboard();
	canvas.addEventListener('mousemove',function(event){
		chessBoard.hover(event); //TODO: add a color the hovering chess
	});

	canvas.addEventListener('click', function(event){
		var chessObj = chessBoard.click(event);
		if(chessObj){
			socket.emit('click',chessObj,color,function(err){
				if(!err){
					chessBoard.addChess(chessObj); 
					clickSound();
				}
			});
		}
	});

	
	socket.on('initChess',function(chessRecord){
		for(var i =0;i<chessRecord.colorArr.length;i++){
			for(var j =0;j<chessRecord.colorArr[i].length;j++){
				if(chessRecord.colorArr[i][j]){
					var chessObj = {
						x:i,
						y:j,
						chess: new Chess(i,j,CHESS_RADIUS,chessRecord.colorArr[i][j])
					}
				   	chessBoard.addChess(chessObj);
				}
			}
		}
	});

	socket.on('updateChess',function(chessObj){
		chessBoard.addChess(chessObj);
		clickSound();
	});
}
//-----end of the chessBoard ----

socket.on('connect', function(){
	console.log('Connected to server');
});
socket.on('gameBegin',function(color){
	createChessBoard(color);
});

socket.on('waitingPlayer',function(){
	$('.message').append('Waiting for players');
});

socket.on('disconnect',function(){
	console.log('Connection lost');
});



