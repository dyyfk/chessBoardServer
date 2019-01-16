const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const {ChessRecord} = require('./utils/chessRecord');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

var chessRecord = new ChessRecord();
var socketID = []; //TODO: mock database
io.on('connection', (socket)=>{

//	var socketObj = {
//		socketID: socket.id,
//		color: '#000000' ? 
//	}
	socket.emit('initChess', chessRecord); //这里应该是socket
	
	console.log('New users connected');
	
//	socket.on('join', (room,callback)=>{
//		
//		
//		
//	});
	
	socket.on('click',(chessObj,color, callback)=>{
		var x = chessObj.x;
		var y = chessObj.y;
		chessObj.color = color;
		var result = chessRecord.addChess(x,y,color);
		if(!result){
			return callback('Cannot place chess on an existed one');
		}
		socket.broadcast.emit('updateChess',chessObj);
		callback();
	});
	socket.on('disconnect',()=>{
		console.log('User disconnected');
	});
});


app.use(express.static(publicPath));

server.listen(port,()=>{
	console.log(`listening to the port ${port}`);
});