const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

io.on('connection', (socket)=>{
	console.log('New users connected');
	
	socket.on('disconnect',()=>{
		console.log('User disconnected');
	});
	
	socket.on('updateChess',(blackChessArr,whiteChessArr,isBlack)=>{
//		var uniqueChess = chess.filter((value, index, self)=>{
//			console.log(self.indexOf(value) === index );
//			
//			return self.indexOf(value) === index;
//		});
		var color = switchPlayer(isBlack);
		socket.emit('updateChess', blackChessArr,whiteChessArr, color);
	});
	
});

function switchPlayer(isBlack){
	return !isBlack;
}
app.use(express.static(publicPath));

server.listen(port,()=>{
	console.log(`listening to the port ${port}`);
});