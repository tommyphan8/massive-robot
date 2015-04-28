
var main = function () {
		
	var currentSync = {"youtubeID": "", "leader": "", "users" : []};
	
	//initialize socket.io and connect
	var socket = io.connect("http://localhost:5555");

	//needed youtube iframe API
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	
	createCouch(currentSync, socket);
	initialStart(join);

	socket.on("broadcast play", function(data) {
		console.log(data);
		player.seekTo(data);
		player.playVideo();
	});

	socket.on("broadcast pause", function(data) {
		console.log(data);
		player.pauseVideo();
		player.seekTo(data);
		//player.playVideo();
	});

	$("#play").click(function() {
		console.log("play");
		player.playVideo();
		socket.emit("play", player.getCurrentTime());
	});

	$("#pause").click(function() {
		player.pauseVideo();
		socket.emit("pause", player.getCurrentTime());

	});

	$("leave").click(function() {

	});





};

var initialStart = function (callback) {
	$.post("start", {}, function (response) {
		console.log(response.youtubeID);
		//currentSync = response;
		if (response.youtubeID != "") {
			$("#joinReg").attr('class', 'active');
			// $("#player").attr('class', 'active');	
		}
		else  {
			$("#registration").attr('class', 'active');

		}
		callback(response);
		
	});


};

var join = function (response) {
	$("#join").click(function() {
		$("#joinReg").attr('class', 'inactive');
		$("#player").attr("class", "active");
		//$("#ytplayer").attr("class", "active");
		console.log(response.youtubeID);
		//player.playVideo();
		player.cueVideoById(response.youtubeID);
	});

}




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
			'onReady': onPlayerReady,
			// 'onStateChange': onPlayerStateChange
		}
	});
	//console.log(player);

}

function test() {
	console.log(player)
	return player;
}

function onPlayerReady(event) {
	
}

function cueVideo() {

	return player;
}

function play() {
	if (ytplayer) {
		socket.emit("play", player.getCurrentTime())
		player.playVideo();
	}
}

function pause() {
	if (ytplayer) {
		player.pauseVideo();
	}
}

function stop() {
	if (ytplayer) {
		player.stopVideo();
	}
}


function leave() {
	$("#name").val("");
	$("#link").val("");
	$("#player").attr("class", "inactive");
	$("#registration").attr("class", "active");
	player.cueVideoById();
	
}

function createCouch(currentSync, socket) {
	$("#submitLink").click(function() {
		
		player.cueVideoById($("#link").val());
		$("#player").attr("class", "active");
		$("#registration").attr("class", "inactive");
		console.log($("#name").text());
		$(".username").append("<p>").text("Username: " + $("#name").val());
		$("#username").attr("class", "active");
		$("#ytplayer").attr("class", "active");
		currentSync.youtubeID = $("#link").val();
		currentSync.leader = $("#name").val();
		currentSync.users.push($("#name").val());

		socket.emit('start', currentSync);
	});
	
}


$(document).ready(main);