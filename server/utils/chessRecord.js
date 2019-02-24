const LINES = 19;
const Color = {"black":'#000000',"white":'#ffffff'};

class ChessRecord{
	constructor(id,room) {
		this.id = id;
		this.room = room;
		this.nextRound = Color.black;
		this.colorArr = new Array(LINES);
		for(var i = 0;i<this.colorArr.length;i++){
			this.colorArr[i] = new Array(LINES);
		}
		this.joinedChess = []; // this is a temp variable that should only be used when calculating the joined chess
		this.daJie = null;
	}
	addChess(x,y,color){
		//TODO: Check for the new chess x and y
		if(this.colorArr[x][y]){
			return 'Cannot place chess on an existed one';
		}
		else if(this.nextRound!==color){
			return 'It is another players round';
		}
		this.colorArr[x][y] = color; // assign color first so it is easier to count escape
		var capturedChess = this.determineCapture(x,y,color); // capture case
		if(capturedChess.length===1){
		   	var capturedX = capturedChess[0].x;
			var capturedY = capturedChess[0].y;
			if(this.daJie&&this.daJie.x===capturedX&&this.daJie.y ===capturedY){
				this.colorArr[x][y] = null;
				return 'ko(da jie), cannot place a chess in this position';
			}
	   	}
		capturedChess.forEach((chess)=>{
			var x = chess.x;
			var y = chess.y;
			this.colorArr[x][y] = null; // mark the captured chess as undefined
		});
		var escape = this.calculateEscape(x,y,color);
		if(capturedChess.length===1&&escape===1&&this.joinedChess.length===1){ // da jie situation
			this.daJie =  this.joinedChess[0];
		}else{
			this.daJie = null;
		}
		var valid = this.determineValid(x,y,color);
		if(!valid) {
			this.colorArr[x][y] = null;
			return 'No escape, Cannot place chess here';
		}
		this.nextRound = this.nextRound === Color.black ? Color.white : Color.black;
		
	}
	determineValid(x,y,color){
//		color = color === Color.black ? Color.white : Color.black;
		this.joinedChess = [];
		var escape = this.escapeHelper(x,y,color,0);
		return escape !== 0;
		// if a chess is surrounded

	}
	determineCapture(x,y,color){
		color = color === Color.black ? Color.white : Color.black;
		var joinedChess = [];
		if(x-1>=0&&this.colorArr[x-1][y]===color){
			var escape = this.calculateEscape(x-1,y,color);
			
			if(escape===0){
				joinedChess.push(...this.joinedChess);
			}
		}
		if(x+1<LINES&&this.colorArr[x+1][y]===color){
			var escape = this.calculateEscape(x+1,y,color);

			if(escape===0){
				joinedChess.push(...this.joinedChess);
			}
		}
		if(y-1>=0&&this.colorArr[x][y-1]===color){
			var escape = this.calculateEscape(x,y-1,color);

			if(escape===0){
				joinedChess.push(...this.joinedChess);
			}
		}
		if(y+1<LINES&&this.colorArr[x][y+1]===color){
			var escape = this.calculateEscape(x,y+1,color);

			if(escape===0){
				joinedChess.push(...this.joinedChess);
			}
		}
		return joinedChess;
		
	}
	calculateEscape(x,y,color){
		this.joinedChess = [];  // initialize so that it could count the joined pieces

		var escape = this.escapeHelper(x,y,color,0);
		return escape;
	}
	escapeHelper(x,y,color,escape,from){
		if(!this.colorArr[x][y]){
			escape++; // no chess here
		}else if(this.colorArr[x][y]!==color){
			return escape; // no the same chess 
		}
		
		
		if(this.colorArr[x][y]===color){
			this.joinedChess.push({
				x:x,
				y:y
			});
			// same chess, recursive case
			if(x-1>=0 && !this.joinedChess.some((chess)=>chess.x===x-1&&chess.y===y)){
				escape = this.escapeHelper(x-1,y,color,escape);
			}
			if(x+1<LINES && !this.joinedChess.some((chess)=>chess.x===x+1&&chess.y===y)){
				escape = this.escapeHelper(x+1,y,color,escape);   
			}
			if(y-1>=0 && !this.joinedChess.some((chess)=>chess.x===x&&chess.y===y-1)){
				escape = this.escapeHelper(x,y-1,color,escape);   
			}
			if(y+1<LINES && !this.joinedChess.some((chess)=>chess.x===x&&chess.y===y+1)){
				escape = this.escapeHelper(x,y+1,color,escape);
			}

		}
		
		return escape;
	}
			  
	initChessRecord(colorArr,nextRound){
		if(colorArr){
			if(colorArr.length!=LINES){
				return 'Chessrecord lines mismatched';
			}
			for(var i = 0; i < colorArr.length; i++){
				for(var j = 0; j < colorArr[i].length; j++){
					if(colorArr[i].length!=19){
						return 'Chessrecord lines mismatched';   
					}
					addChess(i,j,colorArr[i][j]);
				}
			}
			this.nextRound = nextRound;
		}
	}
	
}

module.exports = {ChessRecord};
