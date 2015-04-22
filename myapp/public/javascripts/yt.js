var main = function () {
	console.log("loaded");
	var tag = document.createElement('script');

	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

		




};

var player;
function onYouTubeIframeAPIReady() {
	player = new YT.Player('player', {
		height: '390',
		width: '640',
		playerVars: {
			//controls: 0,
			disablekb: 1
		},
		//videoId: 'M7lc1UVf-VE',
		events: {
			'onReady': onPlayerReady,
			// 'onStateChange': onPlayerStateChange
		}
	});
}

function onPlayerReady(event) {
	player.cueVideoByUrl("https://www.youtube.com/v/DYLbmSp5itA");
	//event.loadVideoByUrl("https://www.youtube.com/watch?v=nN6gFQMr3yU", 14, "default");
	
	//event.target.playVideo();
}

function play() {
  if (ytplayer) {
	player.seekTo(20, false)
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


$(document).ready(main);