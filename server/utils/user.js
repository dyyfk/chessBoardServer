Class User{
	constructor(id){
		this.id = id;
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
 	getOpponent(){
 		return this.opponentID;
 	}
	getAllIDs(){
		var ids = [];
		ids.push(this.id);
		ids.push(this.opponentID);
		return ids;
	}
}

module.exports = {User};