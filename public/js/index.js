var socket = io();

//------- begin of the chessBoard -------
var canvas = document.querySelector('.chessBoard');
canvas.width = canvas.height = window.innerHeight>window.innerWidth ? window.innerWidth : window.innerHeight;
var room = prompt('Enter the room you want to join', 'test');


var c = canvas.getContext('2d');


const CHESS_RADIUS = 15; 
const INTERVAL = (canvas.width - 2 * 20) / 18;
var color = Math.random()>0.5 ? '#ffffff' : '#000000'; 


var chessBoard = new Chessboard(INTERVAL, CHESS_RADIUS,c,canvas.width,canvas.height,color);
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
			}
		});
 	}
});

(function animate(){
    requestAnimationFrame(animate);
})();
socket.on('connection', function(){
	console.log('Connected to server');
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
});

//-----end of the chessBoard ----

//var resignButton = document.getElementById('resignButton');

