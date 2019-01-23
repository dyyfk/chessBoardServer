
$(function(){

	$('#join-btn').on('click',function(e){
		window.location.href = '/chessRoom.html';

		e.preventDefault();
		
		var name = $('#name-field');
		var room = $('#room-field');
		var player = $('#player-field');
		socket.emit('join',	{
			room: room.val(),
			name: name.val(),
			isPlayer: player.val() === 'on' ? true : false
		}, function(err){
				if(err){
					return alert(err);
				}
			}
		);
//	
//	$('#join-btn').on('click',function(e){
//		
//	});
	});
});














//var socket = io();
//
//socket.on('updateRoomList',function(rooms){
//	var option = jQuery('<select name="roomJoined"></select>');
//	var displayedRoom = [];
//	var occurence = [];
//	
//	rooms.forEach(function(room){
//		if(!displayedRoom.includes(room)){
//			displayedRoom.push(room);
//			occurence.push(1);
//		}else{
//			occurence[displayedRoom.indexOf(room)]++;
//		}
//	});
//	displayedRoom.forEach(function(room){
//		option.append(jQuery('<option></option>').attr('value',room).text(room+' : ' +occurence[displayedRoom.indexOf(room)]+' Users.'));
//	});
//
//	if(!rooms||rooms.length===0){
//		option.append(jQuery('<option selected disabled hidden></option>').text('No room available'));	
//	}else{
//		option.append(jQuery('<option selected disabled hidden></option>').text('Choose Here'));	
//	}
//	jQuery('#room-list').html(option);
//	
//});


