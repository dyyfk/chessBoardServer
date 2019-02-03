
var socket = io();
$(function () {
	$("#mdb-lightbox-ui").load("mdb-addons/mdb-lightbox-ui.html");
});
//------- begin of the chessBoard -------
var canvas = document.querySelector('.chessBoard');
var length = window.innerHeight<window.innerWidth ? window.innerWidth : window.innerHeight;
var width = canvas.width = canvas.height = window.innerHeight>window.innerWidth ? window.innerWidth : window.innerHeight;

var originX = document.querySelector('#left-of-board').getBoundingClientRect().right;


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


function createChessBoard(color){
	chessBoard = new Chessboard(INTERVAL, CHESS_RADIUS,c,canvas.width,canvas.height,color,originX,0);
	//there should be no margin in y axis
	chessBoard.renderNewChessboard();
	canvas.addEventListener('mousemove',function(event){
		chessBoard.hover(event); //TODO: add a color the hovering chess
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
	$('.message').append('<h2 id = "waitingMeg">Players ready, game begin</h2>');
	$('.message').hide().show('1600');
	setTimeout(function(){
		$('.message').remove();
		$('.chess-room').show('slow');
	},3000)
});

socket.on('waitingPlayer',function(){
	$('.chess-room').hide();
	$('.index-container').remove();
	$('.message').append('<h2 id = "waitingMeg">Waiting for players... </h2>');
	$('#waitingMeg').append('<div class="fa fa-spinner fa-spin"></div>');
});

socket.on('disconnect',function(){
	console.log('Connection lost');
});



