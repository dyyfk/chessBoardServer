const LINES = 19;

class ChessRecord{
	constructor() {
		this.colorArr = new Array(LINES);
		for(var i = 0;i<this.colorArr.length;i++){
			this.colorArr[i] = new Array(LINES);
		}

	}
	addChess(x,y,color){
		//TODO: Check for the new chess x and y
		if(!this.colorArr[x][y]){
			this.colorArr[x][y] = color;
			return true; // true stands for the chess being successufully added to the array
		}
		return false;
	}



	
	
}

module.exports = {ChessRecord};
