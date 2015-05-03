var main = function () {
    "use strict";
    var socket = io();

    socket.on('broadcast start', function(data){
        console.log(JSON.stringify(data));
        console.log('in client boadcast socket event start received');
    });
    socket.on('broadcast stop', function(data){
        console.log(JSON.stringify(data));
        console.log('in client boadcast socket event stop received');
    });
    socket.on('broadcast pause', function(data){
        console.log(JSON.stringify(data));
        console.log('in client boadcast socket event pause received');
    });
    socket.on('update rooms', function (rooms) {
        console.log('inside update rooms');
        /*$('#rooms').empty();
        $.each(rooms , function (val,text){
            var newRoom = $('<div>').text(text);
            newRoom.on('click', function(){
                //this.attr('background','#8ec252');
                alert('in room: '+ text)
                socket.emit('join room', text );    
            })
            $('#rooms').append(newRoom);
       });*/
        
       $('#roomList').empty();
       $('#roomList').append($('<option></option>').
                            val('').html('---select---'));
       $.each(rooms , function (val,text){
           $('#roomList').append(
                $('<option></option>').val(text).html(text)
            ); 
       });
    });
    // end Socket.io script
    var roomName;
    var button;
    button =$('#createBtn');
    button.on("click", function(){
        //socket.join(roomName);
        roomName = $('#roomName').val();
        if($.trim(roomName) === ''){
            alert('Enter room Name');
            return;
        }
        var exists = false;
        console.log('option values:'+$('#roomList option').val)
        $.each($('#roomList option'),function(){
            console.log('option values:'+this.value);
            if (this.value === roomName) {
                exists = true;
                return false;
            }
        });
        if(exists){
            alert('room Name:'+ roomName+' already exists');
            return; 
        }
        $('#roomList').append(
                $('<option></option>').val(roomName).html(roomName)
            ); 
        $('#roomName').val('');
        socket.emit('create room', roomName);
    });
    button =$('#joinBtn');
    button.on("click", function(){
        //socket.join(roomName);
        var selectedRoom = $('#roomList option:selected').val();
        console.log('selectedRoom:'+selectedRoom);
        if(selectedRoom===""){
            alert('select room Name');
            return;
        }
        $('#currentRoom').text(selectedRoom);
        $('#roomList').val('');
        socket.emit('join room', selectedRoom );
    });
    button =$('#leaveBtn');
    button.on("click", function(){
        //socket.leave(roomName);
        if($.trim($('#currentRoom').text()) === '')
            return;
        $('#currentRoom').text('');
        socket.emit('leave room', $('#currentRoom').text() );
    });
    button =$('#startBtn');
    button.on("click", function () {
        if($.trim($('#currentRoom').text()) === ''){
            alert('join to any room first')
            return;
        }
        
            // {time:0} object will be change when we can get video data from API or ...
            socket.emit('start', {time:0});
    });
    button =$('#stopBtn');
    button.on("click", function () {
            socket.emit('stop', {time:0});
    });
    button =$('#pauseBtn');
    button.on("click", function () {
            socket.emit('pause', {time:0});
    });
};

$(document).ready(function () {
    main();
});
