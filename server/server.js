const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const {ChessRecords} = require('./utils/chessRecords');
const {Users} = require('./utils/users');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();
const Color = {"black":'#000000',"white":'#ffffff'};
var chessRecords = new ChessRecords();
io.on('connection', (socket)=>{
//	socket.emit('initChess', chessRecord);

	console.log('New users connected');
	
	socket.on('join', (params,callback)=>{
		var roomSelected = params.roomJoined || params.roomCreated;
		var isPlayer = params.player === 'on' ? true : false;
		socket.join(roomSelected);

		users.removeUser(socket.id);
		users.addUser(socket.id,params.name,roomSelected,isPlayer);
		var userInRoom = users.getUserList(roomSelected);
		var playerInRoom = users.getPlayerList(roomSelected);

		if(playerInRoom.length>2){
			return callback('this room has already 2 players');
		}else if(playerInRoom.length<=1){
			console.log('Waiting for another player');
		}else if(playerInRoom.length==2){
			console.log('Game Started');

			chessRecords.addRecord(socket.id, roomSelected);
			var isBlack = Math.random() > 0.5 ? true : false;
			var counter = 0;
			playerInRoom.forEach((player)=>{
				var color = counter++ === 0 ? Color.black : Color.white;
				io.to(player.id).emit('gameBegin', color);
				isBlack = !isBlack; // assign a different color to another player
			});
		}
			console.log(chessRecords);

		callback();
	});
	
	socket.on('click',(chessObj,color,callback)=>{
		var x = chessObj.x;
		var y = chessObj.y;
		chessObj.color = color;
		var user = users.getUser(socket.id);
		if(user){
			var room = user.room;
			var chessRecord = chessRecords.getRoomRecord(room);

			var err = chessRecord.addChess(x,y,color);
			if(err){
				return callback(err);
			}
			socket.to(room).emit('updateChess',chessObj); //TODO: update the chess to the other user
		}

		callback();
	});
	socket.on('disconnect',()=>{
		console.log('User disconnected');
		
		var user = users.removeUser(socket.id);
		if(user){
		   	var room = user.room;
			var userInRoom = users.getPlayerList(room);
			if(!userInRoom||userInRoom.length===0){
				chessRecords.removeRecord(socket.id);
			}
		}

		
	});
});


app.use(express.static(publicPath));

server.listen(port,()=>{
	console.log(`listening to the port ${port}`);
});