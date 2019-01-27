const LINES = 19;
const Color = {"black":'#000000',"white":'#ffffff'};
const From = {'x+1': 0, 'x-1':1, 'y-1':2,'y+1':3};

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
	}
	addChess(x,y,color){
		//TODO: Check for the new chess x and y
		if(this.colorArr[x][y]){
			return 'Cannot place chess on an existed one';
		}
		else if(this.nextRound!==color){
			return 'It is another players round';
		}
		
		
		var escape = this.calculateEscape(x,y,color);   // capture case
		
		if(escape === 0) {
			return 'No escape, Cannot place chess here';
		}
		
		var capturedChess = this.determineCapture(x,y,color);
		
//		console.log(capturedChess);
		
		
		this.colorArr[x][y] = color;
		this.nextRound = this.nextRound === Color.black ? Color.white : Color.black;	
	}
	determineCapture(x,y,color){
		var escape;
		if(x-1>=0&&this.colorArr[x-1][y]&&this.colorArr[x-1][y]!==color){
			escape = this.calculateEscape(x-1,y,color);
			if(escape===0){
				console.log('captured1');
				return this.joinedChess;
			}
		}
		if(x+1<LINES&&this.colorArr[x+1][y]&&this.colorArr[x+1][y]!==color){
			escape = this.calculateEscape(x+1,y,color);
			if(escape===0){
				console.log('captured2');

				return this.joinedChess;
			}
		}
		if(y-1>=0&&this.colorArr[x][y-1]&&this.colorArr[x][y-1]!==color){
			escape = this.calculateEscape(x,y-1,color);
			if(escape===0){
				console.log('captured3');

				return this.joinedChess;
			}
		}
		if(y+1<LINES&&this.colorArr[x][y+1]&&this.colorArr[x][y+1]!==color){
			escape = this.calculateEscape(x,y+1,color);
			if(escape===0){
				console.log('captured4');
				
				return this.joinedChess;
			}
		}
		
	}
	calculateEscape(x,y,color){
		this.joinedChess = [];  // initialize so that it could count the joined pieces
		this.colorArr[x][y] = color; // assign color so it is easier to count escape

		var escape = this.calculateHelper(x,y,color,0);
		this.colorArr[x][y] = undefined;
		return escape;
	}
	calculateHelper(x,y,color,escape,from){
		if(!this.colorArr[x][y]){
			++escape; // no chess here
		}else if(this.colorArr[x][y]!==color){
			return escape; // no the same chess 
		}
		
		
		if(this.colorArr[x][y]===color){
			this.joinedChess.push({
				x:x,
				y:y
			});
			// same chess, recursive chess
			if(x-1>=0 && from!==From["x+1"]){
				escape = this.calculateHelper(x-1,y,color,escape,From["x-1"]);
			}
			if(x+1<LINES && from!==From["x-1"]){
				escape = this.calculateHelper(x+1,y,color,escape,From["x+1"]);   
			}
			if(y-1>=0 && from!==From["y+1"]){
				escape = this.calculateHelper(x,y-1,color,escape,From["y-1"]);   
			}
			if(y+1<LINES && from!==From["y-1"]){
				escape = this.calculateHelper(x,y+1,color,escape,From["y+1"]);
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
