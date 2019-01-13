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
var isBlack = true;
drawChessBoard();
drawStar();
//var startingline 

function drawChessBoard(){
		var styling = c.fillStyle;
    	//draw the outter line
		c.fillStyle = '#000000';
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
		c.fillStyle = styling;
}

function drawStar(){
	var styling = c.fillStyle;
	c.fillStyle = '#000000';
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
	c.fillStyle = styling;
};


function Point(x,y){
    this.x = x;
    this.y = y;
}
var blackChessArr= [];
var whiteChessArr= [];
var pointArr = [];
var color;
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
		var pos = {
			x:self.x,
			y:self.y,
		};
		if(isBlack)
			blackChessArr.push(pos);
		else 
			whiteChessArr.push(pos);
	}
	

}

function clearChessBoard(){
		c.clearRect(0,0,canvas.width,canvas.height);
		drawChessBoard();
        drawStar();
		drawChess(blackChessArr,whiteChessArr);
}


function drawChess(blackChessArr,whiteChessArr){
	var styling = c.fillStyle;
	blackChessArr.forEach(function(chess){
		c.fillStyle = '#000000';
		c.beginPath();
		c.arc(chess.x, chess.y,chessRadius ,Math.PI*2,false);
		c.stroke();
		c.fill();
	});
	whiteChessArr.forEach(function(chess){
		c.fillStyle = '#ffffff';
		c.beginPath();
		c.arc(chess.x, chess.y,chessRadius ,Math.PI*2,false);
		c.stroke();
		c.fill();
	});

	
	c.fillStyle = styling;
}

var chess = new Chess();

canvas.addEventListener('mousemove',function(event){
	clearChessBoard();
    chess.update(event);
    chess.draw();
});

canvas.addEventListener('click', function(){
	chess.click();
	socket.emit('updateChess',blackChessArr,whiteChessArr,isBlack);
});
(function animate(){
   

    requestAnimationFrame(animate);
})();

socket.on('connection', function(){
	console.log('Connected to server');
});

socket.on('updateChess',function(newBlackChessArr,newWhiteChessArr, updatedIsBlack){
	whiteChessArr = newWhiteChessArr;
	blackChessArr = newBlackChessArr;
	isBlack = updatedIsBlack;
	c.fillStyle = isBlack ? '#000000' : '#ffffff';
	clearChessBoard();
});

//-----end of the chessBoard ----

//var resignButton = document.getElementById('resignButton');

