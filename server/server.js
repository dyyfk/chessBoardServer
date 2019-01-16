const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
//const {Chess} = require('./utils/chess');
//const {Chessboard} = require('./utils/chessboard');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

var blackChessArr = []; 
var whiteChessArr = [];
var color;
io.on('connection', (socket)=>{
	
	
	io.emit('updateChess', blackChessArr,whiteChessArr, color);

	console.log('New users connected');
	
	socket.on('disconnect',()=>{
		console.log('User disconnected');
	});
	
	socket.on('updateChess',(blackChess,whiteChess,isBlack)=>{ //ToDO:1.应该传过来的是一个棋子而不是整个array 2. 传过来的应该是point
//		var uniqueChess = chess.filter((value, index, self)=>{ 
//			console.log(self.indexOf(value) === index );
//			
//			return self.indexOf(value) === index;
//		});
		color = switchPlayer(isBlack);
		blackChessArr = blackChess;
		whiteChessArr = whiteChess;
		io.emit('updateChess', blackChessArr,whiteChessArr, color);
	});
	
});

function switchPlayer(isBlack){
	return !isBlack;
}
app.use(express.static(publicPath));

server.listen(port,()=>{
	console.log(`listening to the port ${port}`);
});