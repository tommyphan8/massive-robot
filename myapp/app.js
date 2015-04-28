var express = require("express"),
	app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    mongoose = require("mongoose");

app.use("/public",express.static(__dirname + "/public"));
//app.use(express.bodyParser());

var currentSync = {"youtubeID": "", "leader": "", "users" : []};


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

io.on('connection', function (socket) {
    console.log("a user connected");

    socket.on('play', function (data) {
        console.log(data);
        console.log('in server socket event start');
     
        console.log("b4 broadcast start emit")
        socket.broadcast.emit('broadcast play', data);
    });

    socket.on('stop', function (data) {
        console.log('in server socket event stop');
        // save stop action in database
        console.log("b4 broadcast stop emit")
        socket.broadcast.emit('broadcast stop', data);
    });

    socket.on('pause', function (data) {
        console.log('in server socket event pause');
        // save pause action in database
        console.log("b4 broadcast pause emit")
        socket.broadcast.emit('broadcast pause', data);
    });

    socket.on('start', function (data) {
        currentSync = data;
        console.log(currentSync);
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

app.post("/start", function (req, res) {
    console.log("start");
    res.json(currentSync);
});

