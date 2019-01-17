const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const {ChessRecord} = require('./utils/chessRecord');
const {Users} = require('./utils/users');
const {User} = require('./utils/user');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();
var chessRecord = new ChessRecord();
const Status = {"black":'#000000',"white":'#ffffff',"pause":0};
var side;
io.on('connection', (socket)=>{
			socket.emit('initChess', chessRecord);

	console.log('New users connected');
	
	socket.on('join', (params,callback)=>{
		var roomSelected = params.roomJoined || params.roomCreated;
		var isPlayer = params.player === 'on' ? true : false;
		var user = new User(socket.id,params.name,roomSelected,isPlayer);

		users.removeUser(socket.id);
		users.addUser(user);
		var userInRoom = users.getUserList(roomSelected);
		var playerInRoom = userInRoom.filter((user)=>user.isPlyaer === true);
		var color;
		if(playerInRoom.length>2){
			return callback('this room has already 2 players');
		}else if(playerInRoom.length===1){
			console.log('Waiting for another player');
			color = Status.black;
		}else{
			console.log('Game Started');
			color = Status.white;
			side = Status.black;
		}
		socket.join(roomSelected);


		callback(undefined,color);
	});
	
	socket.on('click',(chessObj,color,callback)=>{
		var x = chessObj.x;
		var y = chessObj.y;
		chessObj.color = color;
		var result = chessRecord.addChess(x,y,color);
		if(!result){
			return callback('Cannot place chess on an existed one');
		}
		if((color===Status.black&&side!==Status.black)||(color===Status.white&&side!==Status.white)){
			return callback('Now it is another player round');	
		}
		side = side === Status.black ? Status.white : Status.black;
		socket.broadcast.emit('updateChess',chessObj); //TODOL update the chess to the other user
		callback();
	});
	socket.on('disconnect',()=>{
		console.log('User disconnected');
		users.removeUser(socket.id);
	});
});


app.use(express.static(publicPath));

server.listen(port,()=>{
	console.log(`listening to the port ${port}`);
});