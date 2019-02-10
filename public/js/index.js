var socket = io();
$(function(){
	
	$('.ripple').ripples();
	
	$('#join-btn').on('click',function(e){

		e.preventDefault();
		const hours = new Date().getHours()
		const isDayTime = hours > 6 && hours < 20
		if(!isDayTime){
			$("body").css({
				'background':'linear-gradient(rgba(255,255,255,0),rgba(255,255,255,0)), url(assets/img/bg-chess-room-night.jpg)center/cover fixed no-repeat'
			});
		}else{
			$("body").css({
				'background':'linear-gradient(rgba(255,255,255,0),rgba(255,255,255,0.7)), url(assets/img/bg-chess-room.jpg)center/cover fixed no-repeat'
			});
		}
		
		
		var name = $('#name-field');
		var room = $('#room-field');
		var player = $('#player-field');
		$('.index-container').remove();
        $('body').sakura();
        $('body').load( '/chessRoom.html' ,function(){
			socket.emit('join',	{
				room: room.val(),
				name: name.val(),
				isPlayer: player.val() === 'on' ? true : false,
				message: 'Good ' + (isDayTime ? 'morning, ' : 'evening, ') + name.val() 
			}, function(err){
					if(err){
						window.location.href = '/';
						alert(err);
					}
				
				}
			);
		});
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


