const {User} = require('./user');

class Users{
	constructor(){
		this.users = [];
	} 
 	addUser(id,name,room,isPlayer){
		var user = new User(id,name,room,isPlayer);
		this.users.push(user);
 	}
 	removeUser(id){
		var user = this.getUser(id);
 	
 		if(user){
 			this.users = this.users.filter((user)=> user.id !== id);
 		}
 		return user;
 	}
 	getUser(id){
 		return this.users.filter((user)=>user.id === id)[0];
 	}
 	getUserList(room){
 		var users = this.users.filter((user) => user.room === room); 
//  		var usersName = users.map((user) => user.name); 
 		return users;
 	}
	getPlayerList(room){
		var players = this.users.filter((user) => user.isPlayer === true);
		return players;
	}
}

module.exports = {Users};


