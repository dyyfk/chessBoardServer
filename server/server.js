const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const mongoose = require('mongoose');
const publicPath = path.join(__dirname, '../public');
const passport = require('passport');
const port = process.env.PORT || 3000;
const { ChessRecords } = require('./utils/chessRecords');
const { Users } = require('./utils/users');
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const passportSetup = require('./config/passport-setup');
const keys = require('./config/keys');
var app = express();

app.use(express.static(publicPath));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieSession({
	maxAge: 24 * 60 * 60 * 1000,
	keys: [keys.session.cookieKey]
}));
app.use(passport.initialize());
app.use(passport.session());


app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);


var server = http.createServer(app);
var io = socketIO(server);

var users = new Users();
const Color = { "black": '#000000', "white": '#ffffff' };
var chessRecords = new ChessRecords();

app.get('/', (req, res) => {
	res.render('home');
});

app.get('/login', (req, res) => {
	res.render('login');
});

app.get('/dashboard', (req, res) => {
	res.render('dashboard');
});

app.get('/testground', (req, res) => {
	res.render('testground')
});

mongoose.connect(keys.mongodb.dburl, { useNewUrlParser: true }, () => {
	console.log('connected to mongodb');
});


io.on('connection', (socket) => {
	//	socket.emit('initChess', chessRecord);

	console.log('New users connected');

	socket.on('join', (params, callback) => {
		//		var {name, room, isPlayer} = params;
		var name = params.name;
		var room = params.room;
		var isPlayer = params.isPlayer;
		var message = params.message;
		socket.join(room);

		users.removeUser(socket.id);
		users.addUser(socket.id, name, room, isPlayer);
		var userInRoom = users.getUserList(room);
		var playerInRoom = users.getPlayerList(room);

		if (playerInRoom.length > 2) {
			return callback('this room has already 2 players');
		} else if (playerInRoom.length <= 1) {
			console.log('Waiting for another player');
			socket.emit('waitingPlayer', (message));
		} else if (playerInRoom.length == 2) {
			console.log('Game Started');
			chessRecords.addRecord(socket.id, room);
			var isBlack = Math.random() > 0.5 ? true : false;
			var counter = 0;
			playerInRoom.forEach((player) => {
				var color = counter++ === 0 ? Color.black : Color.white;

				io.to(player.id).emit('gameBegin', color);
				isBlack = !isBlack; // assign a different color to another player
			});
		}

		callback();
	});

	socket.on('judgement', () => {
		var user = users.getUser(socket.id);
		var chessRecord;
		if (user) {
			var room = user.room;
			chessRecord = chessRecords.getRoomRecord(room);
			chessRecord.judge();
			
		}
	});

	socket.on('click', (chessObj, color, callback) => {
		var x = chessObj.x;
		var y = chessObj.y;
		chessObj.color = color;
		var user = users.getUser(socket.id);
		var chessRecord;

		if (user) {
			var room = user.room;
			chessRecord = chessRecords.getRoomRecord(room);
			var err = chessRecord.addChess(x, y, color);
			if (err) {
				return callback(err);
			}
			chessRecord = chessRecords.getRoomRecord(room);
			socket.to(room).emit('updateChess', chessRecord); //TODO: update the chess to the other user
		}

		callback(undefined, chessRecord);
	});

	socket.on('sendMeg', (message) => {
		var id = socket.id;
		var user = users.getUser(id);
		var room = user.room;
		var name = user.name;
		message.from = name;
		io.to(room).emit('receiveMeg', message);
	});
	socket.on('disconnect', () => {
		console.log('User disconnected');
		var user = users.removeUser(socket.id);
		if (user) {
			var room = user.room;
			socket.to(room).emit('gamePause');
			var userInRoom = users.getPlayerList(room);
			if (!userInRoom || userInRoom.length === 0) {
				chessRecords.removeRecord(socket.id);
			}
		}


	});

});



server.listen(port, () => {
	console.log(`listening to the port ${port}`);
});