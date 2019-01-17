const {User} = require('./user');

class Users{
	constructor(){
		this.users = [];
	} 
 	addUser(userObj){
		this.users.push(userObj);
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
}

module.exports = {Users};


