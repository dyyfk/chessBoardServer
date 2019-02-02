const LINES = 19;

class Chessboard{
	constructor(interval,chessRadius,canvas,width,height,color,originX,originY,margin) {
		this.canvas = canvas;
		this.radius = 15;
		this.interval = interval; // interval between chess to chess
		this.pointArr = new Array(LINES);
		this.chessArr = new Array(LINES);
		this.chessRadius = chessRadius;
		this.width = width;
		this.height = height;
		this.color = color;
		this.originX = originX || 0;
		this.originY = originY || 0;
		this.margin = margin || 20;
		this.init();
	}
	init(){
		for(var i = 0;i<this.pointArr.length;i++){
			this.pointArr[i] = new Array(LINES);
		}
		for(var i=0;i<this.chessArr.length;i++){
			
			this.chessArr[i] = new Array(LINES);
    		for(var j=0;j<this.chessArr[i].length;j++){
        		var chess = new Chess(this.margin+this.interval*i,this.margin+this.interval*j, this.chessRadius, undefined);
        		this.chessArr[i][j] = chess;
			}
		}
	}
	addChess(x,y,color){
		if(x<0||x>=LINES||y<0||y>=LINES){
			return 'cannot place chess outside the chessBoard';
		}
		if(!this.pointArr[x][y]){
			this.pointArr[x][y] = true;
			this.chessArr[x][y].color = color;
		}
		this.renderNewChessboard();
	}
	update(mouse){
		var x = mouse.x - this.originX;
		var y = mouse.y - this.originY;
		//TODO: this method has some performace issues
		for(var i =0;i<this.chessArr.length;i++){
			for(var j = 0; j<this.chessArr[i].length;j++){
				if(y - this.chessArr[i][j].y < this.interval/2 && y - this.chessArr[i][j].y > -this.interval/2
					&& x - this.chessArr[i][j].x < this.interval/2 && x - this.chessArr[i][j].x > -this.interval/2){
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
		this.canvas.moveTo(this.margin,this.margin);
        this.canvas.lineTo(this.margin,canvas.height - this.margin);

        this.canvas.lineTo(canvas.width - this.margin, canvas.height - this.margin);
        this.canvas.lineTo(canvas.width - this.margin, this.margin);
        this.canvas.lineTo(this.margin,this.margin);
    //draw the inner line
		for(var i = 1; i<18; i++){
			this.canvas.moveTo(this.margin+this.interval*i,this.margin);
			this.canvas.lineTo(this.margin+this.interval*i,canvas.height - this.margin);
		}   
		for(var i = 1; i<18; i++){
			this.canvas.moveTo(this.margin,this.margin+this.interval*i);
			this.canvas.lineTo(canvas.width-this.margin,this.margin+this.interval*i);
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
	    this.canvas.fillRect(this.margin+this.interval*3-3,this.margin+this.interval*3-3,6,6); 
	    this.canvas.fillRect(this.margin+this.interval*3-3,this.margin+this.interval*9-3,6,6);
	    this.canvas.fillRect(this.margin+this.interval*3-3,this.margin+this.interval*15-3,6,6);
	    this.canvas.fillRect(this.margin+this.interval*9-3,this.margin+this.interval*3-3,6,6);
	    this.canvas.fillRect(this.margin+this.interval*9-3,this.margin+this.interval*9-3,6,6);
	    this.canvas.fillRect(this.margin+this.interval*9-3,this.margin+this.interval*15-3,6,6);
	    this.canvas.fillRect(this.margin+this.interval*15-3,this.margin+this.interval*3-3,6,6);
	    this.canvas.fillRect(this.margin+this.interval*15-3,this.margin+this.interval*9-3,6,6);
	    this.canvas.fillRect(this.margin+this.interval*15-3,this.margin+this.interval*15-3,6,6);
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
		var shadowColor = this.canvas.shadowColor;
		this.canvas.fillStyle = chess.color;
		this.canvas.beginPath();
		this.canvas.arc(chess.x,chess.y,chess.radius,Math.PI*2,false);
		this.canvas.stroke();
		this.canvas.fill();
		this.canvas.fillStyle = style;
	}
	hoverChess(chess){
		var style = this.canvas.fillStyle;
		var shadowColor = this.canvas.shadowColor;
		this.canvas.fillStyle = chess.color;
		this.canvas.shadowBlur = 10;
		this.canvas.shadowColor = '#88B7B5';
		this.canvas.beginPath();
		this.canvas.arc(chess.x,chess.y,chess.radius,Math.PI*2,false);
		this.canvas.stroke();
		this.canvas.fill();
		this.canvas.fillStyle = style;
		this.canvas.shadowColor = shadowColor;
		this.canvas.shadowBlur = 0;
	}
	click(mouse){
		var chessObj = this.update(mouse);
		return chessObj;
	}
	hover(mouse){
		var chessObj = this.update(mouse);
		if(chessObj){
			this.renderNewChessboard();
			this.hoverChess(chessObj.chess);
		}
	}
	
}
