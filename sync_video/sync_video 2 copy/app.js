var express = require("express"),
	app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    mongoose = require("mongoose"),
    $ = require('jquery');

app.use("/public",express.static(__dirname + "/public"));
//app.use(express.bodyParser());

mongoose.connect('mongodb://localhost/video');
var db = mongoose.connection;

db.on('error', function (err) {
console.log('connection error', err);
});
db.once('open', function () {
console.log('connected.');
});
var videoSchema = mongoose.Schema({
    name: String,
    actions: [ String ]
});

var Video = mongoose.model("video", videoSchema);

http.listen(5555, function(){
  console.log('listening on *:5555');
});


var currentSync = {"youtubeID": "", "leader": "", "users" : [], "room": ""};
var rooms =[];


io.on('connection', function (socket) {
    console.log("a user connected rooms:"+rooms);
    io.sockets.emit('update rooms', rooms);

    socket.on('create room', function(current) {
        rooms.push(current);
        console.log('create room: '+ current.room);
        //console.log('list of rooms: ' + rooms[0].youtubeID);
        socket.join(current.room);
        socket.room = current.room;
        socket.broadcast.emit('update rooms', rooms);
    });

    // join to room and save the room name
    socket.on('join room', function (data) {
        //socket.set('room', room, function() { 
          //  console.log('room ' + room + ' saved'); 
        //});
        var room = data.room;
        console.log("join room:"+room);
        //socket.set('room', room, function() { console.log('room ' + room + ' saved'); } );
        socket.join(room);
        socket.room = room;

  
        console.log($.inArray(data, rooms));
        //lookup = $.grep(rooms, function(e) { return e.room === room});
        //console.log(lookup);
        //lookup = data;
        //socket.broadcast.emit('update rooms', rooms);


        //socket.broadcast.in(socket.room).emit("testing", "testing");
    });
    // leave  room 
    socket.on('leave room', function (room) {
        console.log("leave room:"+room);
        socket.leave(room);
        socket.room = null;
    })

    socket.on('start', function (data) {
        console.log('in server socket event start');
        // save start action in database
        /*var video = new Video({name: req.body.videoName,actions:[start]});
        video.save(function(err) {
            if(err !== null){
                console.log(err);
            }else{
                console.log("the url was saved");
            } 
        });*/     
        console.log("b4 broadcast start emit socket.room:"+socket.room);
        socket.broadcast.in(socket.room).emit('broadcast start', data);
        //socket.broadcast.emit('broadcast start', data);
    });

    socket.on('stop', function (data) {
        console.log('in server socket event stop');
        // save stop action in database
        console.log("b4 broadcast stop emit")
        socket.broadcast.in(socket.room).emit('broadcast stop', data);
    });

    socket.on('pause', function (data) {
        console.log('in server socket event pause');
        // save pause action in database
        console.log("b4 broadcast pause emit")
        socket.broadcast.in(socket.room).emit('broadcast pause', data);
    });
  
});


//display action happen for video
app.get("/videoActions.json", function (req, res) {
    video.find({}, function (err, result) {
	   res.json(result);
    });
});
app.get("/", function (req, res) {
    res.sendFile('/public/index.html', {root: __dirname });
});

