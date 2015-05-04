var socket = io();
var currentSync = {"youtubeID": "", "leader": "", "users" : [], "roomName": "", "user": ""};
var username = ""; 
var leader = "";

var main = function () {
    "use strict";

    var rooms;
    //variable for user in current room

    var playerState = {"currentTime" : "", "state": ""};

    socket.on('updateTime', function (data) {
        var temp = data - player.getCurrentTime();
        console.log(temp);
        if (player.getPlayerState() === 1) {
            if (temp > 3 || temp < -3) {
                console.log("seek");
                player.seekTo(data);
            }
        }
        
    });
    
    socket.on('socketleave', function() {
        console.log("socketleave");
        socket.emit('socketleave');
    });

    socket.on('leader leaves room', function() {
        console.log("leader leaves");

        $("#player").attr('class', 'inactive');
        $("#leaveBtn").attr('class', 'inactive');
        $("#create").attr('class', 'active');
        $("#main-panel").attr('class', 'inactive');
        $('#username').empty();
        $('#leader').empty();
        $('#room').empty();

        currentSync = {"youtubeID": "", "leader": "", "users" : [], "roomName": "", "user": ""};
        leader = '';
        username = '';
        player.stopVideo();



    });


    //leader will send currentstate along with currenttime
    socket.on('request player state', function() {
        console.log("leader");
        if (leader === currentSync.leader) {
            playerState.currentTime = player.getCurrentTime();
            playerState.state = player.getPlayerState();
            socket.emit("request player state", playerState);
        } 
        
    });

    //when a user receives a player state, it will check if they are playing
    //if they are not playing, player will seek to leader and play
    socket.on('send player state', function(data) {
        console.log("send player state");
        if (data.state === 1 && player.getPlayerState() != 1) {
            console.log("state" + data);
            player.seekTo((data.currentTime + 1.5));
            player.playVideo();
        }
    });

    socket.on('broadcast start', function(data){
        console.log(JSON.stringify(data));
        console.log('in client boadcast socket event start received');
        player.seekTo(data);
        player.playVideo();
    });
    socket.on('broadcast stop', function(data){
        console.log(JSON.stringify(data));
        console.log('in client boadcast socket event stop received');
    });
    socket.on('broadcast pause', function(data){
        console.log(JSON.stringify(data));
        console.log('in client boadcast socket event pause received');
        player.pauseVideo();
        //player.seekTo(data);
    });
    socket.on('update currentSync', function(data) {
        currentSync = data;
        console.log("works" + currentSync);
    });
    //Done
    //use to update json object containing currentSync
    socket.on('update rooms', function (newRooms) {
        console.log("Socket: Update Rooms");
        console.log(newRooms);
        rooms = newRooms;
        if(currentSync.roomName && currentSync.youtubeID && currentSync.leader){
            $.each(rooms , function (index, value){
                if((currentSync.roomName === value.roomName) &&
                   (currentSync.youtubeID === value.youtubeID) &&
                   (currentSync.leader === value.leader) ){
                        currentSync = value;
                        return false;
                }       
           });
        }

        //update rooms in list
        $('#roomList').empty();
        $('#roomList').append($('<option></option>').
                            val('').html('---select---'));
        $.each(rooms , function (val,room){
           $('#roomList').append(
                $('<option></option>').val(room.roomName).html(room.roomName)
            ); 
        });
    });
    // end Socket.io script

    var roomName;
    var button;
    var lookup; //used to search room id from array 
    //Done
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
        } else {

            $('#roomList').append($('<option></option>').val(roomName).html(roomName)); 
            $('#roomName').val('');

            //set currentSync for user in current room
            currentSync.roomName = roomName;
            currentSync.youtubeID = $("#link").val();
            currentSync.leader = $("#name").val();
            currentSync.user = $("#name").val();
            
            //not needed since we have leader already
            // currentSync.users = [];
            // currentSync.users.push($("#name").val());

            //DOM manipulation
            leader = $("#name").val();
            username = $("#name").val();
            $("#username").text("Hello " + username);
            $("#leader").text("Leader: " + leader);
            $("#room").text("Room: " + currentSync.roomName);
            $("#room-info").text("Room Info");


            //load player with video ID for API purposes
            player.cueVideoById($("#link").val());

            //Using CSS to make certain DIVs active or inactive
            $("#create").attr("class", "inactive");
            $("#main-panel").attr("class", "active");
            $("#player").attr("class", "active");
            $("#leaveBtn").attr("class", "active");
            //$("#ytplayer").attr("class", "active");

            $("#name").val("");
            $("#link").val("");

            console.log('currentSync when create room:'+currentSync);

            //emit to server the json object currentSync
            socket.emit('create room', currentSync);

        }
    });

    //user press join
    button =$('#joinBtn');
    button.on("click", function(){
        var exists = false;

        //socket.join(roomName);
        var selectedRoom = $('#roomList option:selected').val();
        console.log('selectedRoom:'+selectedRoom);
        //error purposes
        if(username != "") {
            alert('leave room first');
            return;
        }
        if($('#name').val() === "") {
            alert('Please enter name');
            return;
        }
        if(selectedRoom===""){
            alert('select room Name');
            return;
        }

        lookup = $.grep(rooms, function(e) { return e.roomName === selectedRoom});
        console.log('lookup[0].users:'+lookup[0]);
        if(lookup[0]){
            $.each(lookup[0].users, function(index, value) {
                if (value === $("#name").val()) {
                    exists = true;
                    return;
                }
            });
        }
        if(exists){
            alert('Name: '+ $("#name").val() +' already exists');
            return; 
        } else {
                 // else select current room and emit to server, add to user
        //server will return update room object for other users in the current room
        //$('#currentRoom').text(selectedRoom);
        //$('#roomList').val('');
        username = $("#name").val();
        player.cueVideoById(lookup[0].youtubeID);
        lookup[0].users.push($("#name").val());

        currentSync = lookup[0];
        currentSync.user = $('#name').val();
        
        console.log('username' + $('#name').val());
        console.log(lookup[0]);
        console.log("hello " + username);
        
        $("#username").text("Hello " + username);
        $("#leader").text("Leader: " + currentSync.leader);
        $("#room").text("Room: " + currentSync.roomName);
        
        $("#create").attr("class", "inactive");
        $("#main-panel").attr("class", "active");
        $("#player").attr("class", "active");
        $("#leaveBtn").attr("class", "active");
        $('#name').val('');

        socket.emit('join room', currentSync);

        }


   
    });


    //user press leave, 
    button =$('#leaveBtn');
    //user leaves room update dserver side the user has left
    button.on("click", function(){
        //socket.leave(roomName);
        // if($.trim($('#currentRoom').text()) === '')
        //     return;
        //$('#currentRoom').text('');
        
        console.log("leaders" + leader + currentSync.leader);
        if(leader === currentSync.leader) {
            $("#player").attr('class', 'inactive');
            //$("#ytplayer").attr('class', 'inactive');
            $("#leaveBtn").attr('class', 'inactive');
            $("#main-panel").attr('class', 'inactive');
            $("#create").attr('class', 'active');
            $('#username').empty();
            $('#leader').empty();
            $('#room').empty();
            player.stopVideo();

            leader = "";
            username = "";
            socket.emit('leader leaves room', currentSync);
            //currentSync = {"youtubeID": "", "leader": "", "users" : [], "roomName": "", "user": ""};
            
        } else {
            player.stopVideo();
            currentSync.user = username;
            
            $("#player").attr('class', 'inactive');
            $("#leaveBtn").attr('class', 'inactive');
            $("#main-panel").attr('class', 'inactive');
            $("#create").attr('class', 'active');
            $('#username').empty();
            $('#leader').empty();
            $('#room').empty();

            socket.emit('leave room', currentSync);
            currentSync = {"youtubeID": "", "leader": "", "users" : [], "roomName": "", "user": ""};
            username = "";

        }

        //removes user from currentSync, will emit to server
       
    });

    $("#startBtn").click(function() {
        console.log("play");
        player.playVideo();
        socket.emit("start", player.getCurrentTime());
    });

    $("#pauseBtn").click(function() {
        player.pauseVideo();
        socket.emit("pause", player.getCurrentTime());

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
        disablekb: 1,
        autohide:1,
        showinfo:0
    },
    //videoId: 'M7lc1UVf-VE',
        events: {
            'onStateChange': onStateChange,
            'onReady' : onPlayerReady
            
        //  'onStateChange': onPlayerStateChange
     }
    });
        //console.log(player);

}
function onPlayerReady(event) {

    
    window.setInterval(function () {
        if(currentSync.leader === username && leader != '') {
            
            if (player.getPlayerState() === 1) {

                socket.emit("updateTime", player.getCurrentTime());
            }
        }
    },1000);
    

}

function onStateChange(event) {   
    if(currentSync.leader === username)
    {
        if (player.getPlayerState() === 1) {
            socket.emit("start", player.getCurrentTime());
            socket.emit("testing", player.getCurrentTime());
            console.log(event);
        } else if (player.getPlayerState() === 2) {
           socket.emit("pause", player.getCurrentTime());
       }



   }
}


$(document).ready(function () {
    main();
});
