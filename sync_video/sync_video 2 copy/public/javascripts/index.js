var main = function () {
    "use strict";

    //variable for user in current room
    var currentSync = {"youtubeID": "", "leader": "", "users" : [], "room": ""};

    //current list of all rooms of type array
    var currentRooms;

    var socket = io();

    socket.on('testing', function(data) {
        console.log(data);
    });

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

    //use to update json object containing currentSync
    socket.on('update rooms', function (rooms) {
        currentRooms = rooms;
        console.log('inside update rooms');
        console.log(currentRooms);
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
                $('<option></option>').val(text.room).html(text.room)
            ); 
       });
    });
    // end Socket.io script
    var roomName;
    var button;
    var lookup; //used to search room id from array currentRooms
    //on click off create button
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

        //check if room exists, return bool if exists
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
        //else we will add room to roomList along with leader and youtube id
        $('#roomList').append(
                $('<option></option>').val(roomName).html(roomName)
            ); 
        $('#roomName').val('');
        currentSync.room = roomName;
        currentSync.youtubeID = $("#link").val();
        currentSync.leader = $("#name").val();
        //clear list of users for new room
        currentSync.users = [];
        currentSync.users.push($("#name").val());
        player.cueVideoById($("#link").val());
        console.log(currentSync);
        //emit to server the json object currentSync
        socket.emit('create room', currentSync);
    });

    //user press join
    button =$('#joinBtn');
    button.on("click", function(){
        var exists = false;

        //socket.join(roomName);
        var selectedRoom = $('#roomList option:selected').val();
        console.log('selectedRoom:'+selectedRoom);
        //error purposes
        if(selectedRoom===""){
            alert('select room Name');
            return;
        }

        lookup = $.grep(currentRooms, function(e) { return e.room === selectedRoom});

        $.each(lookup[0].users, function(index, value) {
            if (value === $("#name").val()) {
                exists = true;
                return;
            }
        });

        if(exists){
            alert('Name: '+ $("#name").val() +' already exists');
            return; 
        }


        // else select current room and emit to server, add to user
        //server will return update room object for other users in the current room
        $('#currentRoom').text(selectedRoom);
        $('#roomList').val('');

        player.cueVideoById(lookup[0].youtubeID);
        lookup[0].users.push($("#name").val());
        var temp = lookup[0];
        console.log(currentRooms);
        //console.log(lookup[0]);

        socket.emit('join room', temp);
    });
    //user press leave, 
    button =$('#leaveBtn');
    //user leaves room update dserver side the user has left
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


//loads YOUTUBE API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


//CREATES and Initializes Player
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
    height: '390',
    width: '640',
    playerVars: {
        controls: 1,
        disablekb: 1
    },
    //videoId: 'M7lc1UVf-VE',
        events: {
        //'onReady': onPlayerReady,
        //  'onStateChange': onPlayerStateChange
     }
    });
        //console.log(player);

}

$(document).ready(function () {
    main();
});
