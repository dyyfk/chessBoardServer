class User{
	constructor(id, name, room,isPlayer){
		this.id = id;
		this.name = name;
		this.room = room;
		this.isPlayer = isPlayer;
	} 
 	addOpponent(opponentID){
		if(!opponentID)
			this.opponentID = opponentID;
		else
			return 'this user had already have an opponent';
	}
 	removeOpponent(opponentID){ 
		if(opponentID)
			this.opponentID = undefined;
		else
			return 'this user does not have an opponent yet';
	}
 	getOpponentID(){
 		return this.opponentID;
 	}
}

module.exports = {User};