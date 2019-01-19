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

	}
	addChess(x,y,color){
		//TODO: Check for the new chess x and y
		if(this.colorArr[x][y]){
			return 'Cannot place chess on an existed one';
		}
		else if(this.nextRound!==color){
			return 'It is another players round';
		}
		this.colorArr[x][y] = color;
		this.nextRound = this.nextRound === Color.black ? Color.white : Color.black;	
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
