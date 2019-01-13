var socket = io();
//------- begin of the chessBoard -------
var canvas = document.querySelector('.chessBoard');

if(innerHeight>innerWidth){
    canvas.height = innerWidth;
    canvas.width = innerWidth;
}else{
    canvas.height = innerHeight;
    canvas.width = innerHeight;
}
var c = canvas.getContext('2d');


var chessRadius = 15; 
var interval = (canvas.width - 2 * 20) / 18;
drawChessBoard();
drawStar();
//var startingline 

function drawChessBoard(){
    //draw the outter line
        c.beginPath();
        c.moveTo(20,20);
        c.lineTo(20,canvas.height - 20);

        c.lineTo(canvas.width - 20, canvas.height - 20);
        c.lineTo(canvas.width - 20, 20);
        c.lineTo(20,20);
    //draw the inner line
    for(var i = 1; i<18; i++){
        c.moveTo(20+interval*i,20);
        c.lineTo(20+interval*i,canvas.height - 20);
    }   
    for(var i = 1; i<18; i++){
        c.moveTo(20,20+interval*i);
        c.lineTo(canvas.width-20,20+interval*i);
    }
		c.stroke();
}

function drawStar(){
    
    //draw the dot 
    c.fillRect(20+interval*3-3,20+interval*3-3,6,6); 
    c.fillRect(20+interval*3-3,20+interval*9-3,6,6);
    c.fillRect(20+interval*3-3,20+interval*15-3,6,6);
    c.fillRect(20+interval*9-3,20+interval*3-3,6,6);
    c.fillRect(20+interval*9-3,20+interval*9-3,6,6);
    c.fillRect(20+interval*9-3,20+interval*15-3,6,6);
    c.fillRect(20+interval*15-3,20+interval*3-3,6,6);
    c.fillRect(20+interval*15-3,20+interval*9-3,6,6);
    c.fillRect(20+interval*15-3,20+interval*15-3,6,6);
    
    c.stroke();
};


function Point(x,y){
    this.x = x;
    this.y = y;
}
var chessArr = [];
var pointArr = [];
for(var i=0;i<19;i++){
    for(var j=0;j<19;j++){
        var point = new Point(20+interval*i,20+interval*j);
        pointArr.push(point);
    }
}
function Chess(x,y){
    this.x = x;
    this.y = y;
    this.radius = 15;
	var self = this;
    this.draw = function(){
        c.beginPath();
        c.arc(this.x, this.y,this.radius,Math.PI*2,false);
        c.stroke();
		c.fill();
    };
    this.update = function(mouse){
        for(var i =0;i<pointArr.length;i++){
            if(mouse.x - pointArr[i].x < interval/2 && mouse.x - pointArr[i].x > -interval/2 &&
               mouse.y - pointArr[i].y < interval/2 && mouse.y - pointArr[i].y > -interval/2){
                this.x = pointArr[i].x; 
                this.y = pointArr[i].y;  

            }
        }
		
    }
	this.click = function(){
		var pos = {x:self.x,y:self.y};
		chessArr.push(pos);
	}
	

}

function clearChessBoard(){
		c.clearRect(0,0,canvas.width,canvas.height);
		drawChessBoard();
        drawStar();
		drawChess(chessArr);
}


function drawChess(chessArray){
	chessArray.forEach(function(chess){
		c.beginPath();
		c.arc(chess.x, chess.y,chessRadius ,Math.PI*2,false);
		c.stroke();
		c.fill();
	});

}

var chess = new Chess();

canvas.addEventListener('mousemove',function(event){
	clearChessBoard();
    chess.update(event);
    chess.draw();
});

canvas.addEventListener('click', function(){
	chess.click();
	socket.emit('updateChess',chessArr,c.fillStyle);
});
(function animate(){
   

    requestAnimationFrame(animate);
})();

socket.on('connection', function(){
	console.log('Connected to server');
});

socket.on('updateChess',function(newChessArr, styling){
	chessArr = newChessArr;
	c.fillStyle = styling;
	clearChessBoard();
});

//-----end of the chessBoard ----

//var resignButton = document.getElementById('resignButton');

