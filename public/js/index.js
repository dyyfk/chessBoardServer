var socket = io();

//------- begin of the chessBoard -------
var canvas = document.querySelector('.chessBoard');
	canvas.width = canvas.height = window.innerHeight>window.innerWidth ? window.innerWidth : window.innerHeight;


var c = canvas.getContext('2d');


const chessRadius = 15; 
const interval = (canvas.width - 2 * 20) / 18;


var chessBoard = new Chessboard(interval, chessRadius,c);
chessBoard.renderNewChessboard();
var isBlack = true;



//
//
////function Point(x,y){
////    this.x = x;
////    this.y = y;
////}
////function Chess(x,y){
////
////    this.radius = 15;
////	var self = this;
////    this.draw = function(){
////        c.beginPath();
////        c.arc(this.x, this.y,this.radius,Math.PI*2,false);
////        c.stroke();
////		c.fill();
////    };
////    this.update = function(mouse){
////        for(var i =0;i<pointArr.length;i++){	
////            if(mouse.x - pointArr[i].x < interval/2 && mouse.x - pointArr[i].x > -interval/2 &&
////               mouse.y - pointArr[i].y < interval/2 && mouse.y - pointArr[i].y > -interval/2){
////                this.x = pointArr[i].x; 
////                this.y = pointArr[i].y;  
////            }
////        }
////    }
////	this.click = function(){
////		var pos = {
////			x:self.x,
////			y:self.y,
////		};
////		if(isBlack)
////			blackChessArr.push(pos);
////		else 
////			whiteChessArr.push(pos);
////	}
////	
////
////}
////var blackChessArr= [];
////var whiteChessArr= [];
////var pointArr = [];
////var color;
////
////

//
//

//
//
canvas.addEventListener('mousemove',function(event){
	chessBoard.hover(event); //TODO: add a color the hovering chess
});

//canvas.addEventListener('click', function(){
//	chess.click();
//	socket.emit('updateChess',blackChessArr,whiteChessArr,isBlack);
//});

//(function animate(){
//    requestAnimationFrame(animate);
//})();
////
//socket.on('connection', function(){
//	console.log('Connected to server');
//});
////
//socket.on('updateChess',function(newBlackChessArr,newWhiteChessArr, updatedIsBlack){
//	whiteChessArr = newWhiteChessArr;
//	blackChessArr = newBlackChessArr;
////	isBlack = updatedIsBlack;
//	c.fillStyle = isBlack ? '#000000' : '#ffffff';
//	clearChessBoard();
//});

//-----end of the chessBoard ----

//var resignButton = document.getElementById('resignButton');

