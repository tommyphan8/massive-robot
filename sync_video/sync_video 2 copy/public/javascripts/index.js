var main = function () {
    "use strict";

    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    var socket = io();

    socket.on('broadcast start', function(data){
        player.seekTo(data, false)
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
    // end Socket.io script
    var button;
    button =$('#startBtn');
    button.on("click", function () {
            // {time:0} object will be change when we can get video data from API or ...
            socket.emit('start', player.getCurrentTime());
    });
    button =$('#stopBtn');
    button.on("click", function () {
            socket.emit('stop', null);
    });
    button =$('#pauseBtn');
    button.on("click", function () {
            socket.emit('pause', null);
    });
};


var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        playerVars: {
            //controls: 0,
            //disablekb: 1
        },
        videoId: 'M7lc1UVf-VE',
        events: {
            'onReady': onPlayerReady,
            // 'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    //player.cueVideoByUrl("https://www.youtube.com/v/DYLbmSp5itA");
    //event.loadVideoByUrl("https://www.youtube.com/watch?v=nN6gFQMr3yU", 14, "default");
    
    //event.target.playVideo();
}

$(document).ready(function () {
    main();
});
