const LINES = 19;

class Chessboard{
	constructor(interval, chessRadius,canvas,width,height,color,originX,originY) {
		this.canvas = canvas;
		this.radius = 15;
		this.interval = interval; // interval between chess to chess
		this.pointArr = new Array(LINES);
		this.chessArr = new Array(LINES);
		this.chessRadius = chessRadius;
		this.width = width;
		this.height = height;
		this.color = color;
		this.originX = originX || 20;
		this.originY = originY || 20;
		this.init();
	}
	init(){
		for(var i = 0;i<this.pointArr.length;i++){
			this.pointArr[i] = new Array(LINES);
		}
		for(var i=0;i<this.chessArr.length;i++){
			this.chessArr[i] = new Array(LINES);
    		for(var j=0;j<this.chessArr[i].length;j++){
        		var chess = new Chess(20+this.interval*i,20+this.interval*j, this.chessRadius, undefined);
        		this.chessArr[i][j] = chess;
			}
		}
	}
	addChess(x,y,color){
		//TODO: Check for the new chess x and y
		if(!this.pointArr[x][y]){
			this.pointArr[x][y] = true;
			this.chessArr[x][y].color = color;
		}
		this.renderNewChessboard();
	}
	update(mouse){
		//TODO: this method has some performace issues
		for(var i =0;i<this.chessArr.length;i++){
			for(var j = 0; j<this.chessArr[i].length;j++){
				if(mouse.y - this.chessArr[i][j].y < this.interval/2 && mouse.y - this.chessArr[i][j].y > -this.interval/2
					&& mouse.x - this.chessArr[i][j].x < this.interval/2 && mouse.x - this.chessArr[i][j].x > -this.interval/2){
					var chessObj = {
						x:i,
						y:j,
						chess:new Chess(this.chessArr[i][j].x,this.chessArr[i][j].y, this.chessRadius, this.color)
					}

					return chessObj;
				}
			}
		}
	}

	getChess(){
		return this.chessArr;
	}
	drawChessBoard(){
    	//draw the outter line
		
		this.canvas.fillStyle = '#000000';
        this.canvas.beginPath();
        this.canvas.moveTo(this.originY,this.originY);
        this.canvas.lineTo(this.originX,canvas.height - this.originY);
        this.canvas.lineTo(this.canvas.width - 20, canvas.height - 20);
//        this.canvas.lineTo(this.canvas.width - this.originX, this.originY);
//        this.canvas.lineTo(this.originX,this.originY);
    //draw the inner line
		for(var i = 1; i<18; i++){
			this.canvas.moveTo(20+this.interval*i,20);
			this.canvas.lineTo(20+this.interval*i,canvas.height - 20);
		}   
		for(var i = 1; i<18; i++){
			this.canvas.moveTo(20,20+this.interval*i);
			this.canvas.lineTo(canvas.width-20,20+this.interval*i);
		}
		this.canvas.stroke();
	}
	renderNewChessboard(chessRecord){
		this.canvas.clearRect(0,0,this.width,this.height);
		this.drawChessBoard();
        this.drawStar();
		if(chessRecord){
			this.init();
			for(var i = 0; i<chessRecord.colorArr.length; i++){
				for(var j = 0; j<chessRecord.colorArr[i].length; j++){
					if(chessRecord.colorArr[i][j]){
						this.pointArr[i][j] = true;
						this.chessArr[i][j].color = chessRecord.colorArr[i][j];
					}
				}
			}
		}
		this.drawAllChess();
	}
	
	drawStar(){
	    //draw the dot 
	    this.canvas.fillRect(20+this.interval*3-3,20+this.interval*3-3,6,6); 
	    this.canvas.fillRect(20+this.interval*3-3,20+this.interval*9-3,6,6);
	    this.canvas.fillRect(20+this.interval*3-3,20+this.interval*15-3,6,6);
	    this.canvas.fillRect(20+this.interval*9-3,20+this.interval*3-3,6,6);
	    this.canvas.fillRect(20+this.interval*9-3,20+this.interval*9-3,6,6);
	    this.canvas.fillRect(20+this.interval*9-3,20+this.interval*15-3,6,6);
	    this.canvas.fillRect(20+this.interval*15-3,20+this.interval*3-3,6,6);
	    this.canvas.fillRect(20+this.interval*15-3,20+this.interval*9-3,6,6);
	    this.canvas.fillRect(20+this.interval*15-3,20+this.interval*15-3,6,6);
		//TODO: fix this god damn hard code
	    
	    this.canvas.stroke();
	}
	drawAllChess(){
		for(var i = 0; i<this.pointArr.length;i++){
			for(var j =0;j<this.pointArr[i].length;j++){
				if(this.pointArr[i][j]){		
					this.drawChess(this.chessArr[i][j]);
				}
			}
		}

	}
	drawChess(chess){
		var style = this.canvas.fillStyle;
		this.canvas.fillStyle = chess.color;
		
		this.canvas.beginPath();
		this.canvas.arc(chess.x,chess.y,chess.radius,Math.PI*2,false);
		this.canvas.stroke();
		this.canvas.fill();
		this.canvas.fillStyle = style;
	}
	click(mouse){
		var chessObj = this.update(mouse);
		return chessObj;
	}
	hover(mouse){
		var chessObj = this.update(mouse);
		if(chessObj){
			this.renderNewChessboard();
			this.drawChess(chessObj.chess);
		}
	}
	
}
