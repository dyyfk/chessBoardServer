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
	
	socket.on('updateChess',(chess,styling)=>{
//		var uniqueChess = chess.filter((value, index, self)=>{
//			console.log(self.indexOf(value) === index );
//			
//			return self.indexOf(value) === index;
//		});
		var newStyling = switchPlayer(styling);
		socket.emit('updateChess', chess,newStyling);
	});
	
});

function switchPlayer(styling){
	console.log(styling==='#FFFFFF');
	console.log(styling);
	if(styling=== '#FFFFFF')
		return '#000000';
	else if (styling=== '#000000')
		return '#FFFFFF';
}
app.use(express.static(publicPath));

server.listen(port,()=>{
	console.log(`listening to the port ${port}`);
});