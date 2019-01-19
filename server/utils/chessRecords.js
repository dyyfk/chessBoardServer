const {ChessRecord} = require('./chessRecord');
const LINES = 19;
class ChessRecords{
	constructor(){
		this.chessRecords = [];
	} 
 	addRecord(id,room,colorArr,nextRound){
		var chessRecord = new ChessRecord(id,room);
		if(nextRound&&colorArr){
			chessRecord.initChessRecord(colorArr,nextRound);
		}
		this.chessRecords.push(chessRecord);
 	}
 	removeRecord(id){
		var record = this.getRecord(id);
 	
 		if(record){
 			this.chessRecords = this.chessRecords.filter((record)=> record.id !== id);
 		}
 		return record;
 	}
 	getRecord(id){
 		return this.chessRecords.filter((record)=>record.id === id)[0];
 	}
	getRoomRecord(room){
		return this.chessRecords.filter((record)=>record.room === room)[0];
	}
}

module.exports = {ChessRecords};