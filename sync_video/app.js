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
    youtubeID: String,
    roomName: String,
    leader: String,
    status: String,
    ranking:{totalRanking:Number, totalVote:Number},
    users:[String],
    actions: [ {actionName:String, userName:String} ]
});

var Video = mongoose.model("video", videoSchema);

http.listen(5555, function(){
  console.log('listening on *:5555');
});


var currentSync = {"youtubeID": "", "leader": "", "users" : [], "room": "", "user": ""};
var rooms =[];



io.on('connection', function (socket) {

    socket.on('disconnect', function() {
        if(socket.user === socket.leader && socket.user != null) {
           console.log("leader left");
           Video.findOne({$and:[
            {'youtubeID':socket.youtubeID} ,
            {'leader':socket.leader},
            {'roomName':socket.roomName}
            ]}, function  (err,result) {
                if(err){
                    console.log('err:'+err);
                }
   
            result.actions.push({actionName:'leader leave',userName:socket.leader});
            result.status ='inactive';
            result.save(function(err) {
                if(err !== null){
                    console.log(err);
                }else{
                    socket.broadcast.in(socket.roomName).emit('leader leaves room');
                    socket.broadcast.in(socket.roomName).emit('socketleave');
                    console.log("the url was saved");
                    Video.find({status:'active'}, 
                        function (err, result) {
                            rooms =result;
                            console.log("a user connected rooms:"+rooms);
                            io.sockets.emit('update rooms', rooms);
                            socket.leave(socket.roomName);
                            socket.roomName = null;
                            socket.leader = null;
                            socket.youtubeID = null;
                            socket.user = null;
                        });
                } 
            });
            
        });
    } else if (socket.user != null) {

        console.log('regular user left' + socket.user + socket.youtubeID + socket.roomName);
        var index;
        Video.findOne({$and:[
            {'youtubeID':socket.youtubeID} ,
            {'leader':socket.leader},
            {'roomName':socket.roomName}
            ]}, function  (err,result) {
                if(err){
                    console.log('err:'+err);
                }
                console.log(result);
               
                //removes user from user array
                console.log(socket.user);
                index = result.users.indexOf(socket.user);
                result.users.splice(index, 1);
                console.log("updated users after delete: " + result.users);

                result.actions.push({actionName:'leave',userName:socket.user});
                result.save(function(err) {
                    if(err !== null){
                        console.log(err);
                    }else{
                        console.log("user that left has been recorded");
                        Video.find({status:'active'}, 
                            function (err, result) {
                                rooms =result;
                                //console.log("a user connected rooms:"+rooms);
                                io.sockets.emit('update rooms', rooms);
                                socket.leave(socket.roomName);
                                socket.roomName = null;
                                socket.leader = null;
                                socket.youtubeID = null;
                                socket.user = null;
                            });
                    } 
                });
            }
        );
    }

});
    Video.find({status:'active'}, function (err, result) {
        rooms =result;
        console.log("a user connected rooms:"+rooms);
        io.sockets.emit('update rooms', rooms);
    });
    
    socket.on('updateTime', function(data) {
        socket.broadcast.in(socket.roomName).emit('updateTime', data);
        
    });
    socket.on('create room', function(current) {
        socket.join(current.roomName);
        socket.roomName = current.roomName;
        socket.leader = current.leader;
        socket.youtubeID = current.youtubeID;
        socket.user = current.user;

        socket.room = current.room; //needed?
        //save create action in database
        var video = new Video({
            youtubeID:current.youtubeID ,
            leader:current.leader,
            roomName:current.roomName,
            status:'active',
            ranking : {totalVote : 0,totalRanking : 0},
            actions:[{actionName:'start',userName:current.leader}]
        });
        video.save(function(err) {
            if(err !== null){
                console.log(err);
            }else{
                console.log("the video was saved");
                Video.find({status:'active'}, function (err, result) {
                    rooms =result;
                    console.log("a user connected rooms:"+rooms);
                    io.sockets.emit('update rooms', rooms);
                });
            } 
        });  
        
    });

    socket.on("request player state", function (data) {
        socket.broadcast.in(socket.roomName).emit("send player state", data);
    });

    // join to room and save the room name
    socket.on('join room', function (current) {
        //socket.set('room', room, function() { 
          //  console.log('room ' + room + ' saved'); 
        //});
        console.log("join room:"+current.roomName);
        //socket.set('room', room, function() { console.log('room ' + room + ' saved'); } );
        socket.join(current.roomName);
        socket.roomName = current.roomName;
        socket.leader = current.leader;
        socket.youtubeID = current.youtubeID;
        socket.user = current.user;


        Video.findOne({status:'active',roomName:current.roomName}, function (err, result) {
            // Fix it user Name in client
            console.log(result);
            console.log("push" + current.user);
            result.users.push(current.user);
            result.save(function(err) {
                if(err !== null){
                    console.log(err);
                }else{
                    console.log("the url was saved");
                    Video.find({status:'active'}, function (err, result) {
                        rooms =result;
                        console.log("a user connected rooms:"+rooms);
                        io.sockets.emit('update rooms', rooms);
                    });
                } 
            });
         
        });
 
        socket.broadcast.in(socket.roomName).emit("request player state");

        //save join action in db
        Video.findOne({$and:[
            {'youtubeID':current.youtubeID} ,
            {'leader':current.leader},
            {'roomName':current.roomName}
            ]}, function  (err,result) {
                if(err){
                    console.log('err:'+err);
                }
                console.log('data.user:'+current.user);
                //to fix
                // user data. need to modify the user client side for currentSync 
                result.actions.push({actionName:'join',userName:current.user});
                result.save(function(err) {
                    if(err !== null){
                        console.log(err);
                    }else{
                        console.log("the url was saved");
                    } 
                });
            });
    });

    socket.on('socketleave', function(data) {
        console.log("socketleave: " + socket.roomName);
        //save leave action in db
        socket.leave(socket.roomName);
        socket.roomName = null;
        socket.leader = null;
        socket.youtubeID = null;
        socket.user = null;
    });
    //if leader leaves room
    socket.on('leader leaves room', function (currentSync) {

        console.log("test: "+currentSync.roomName);
        Video.findOne({$and:[
            {'youtubeID':socket.youtubeID} ,
            {'leader':socket.leader},
            {'roomName':socket.roomName}
            ]}, function  (err,result) {
            if(err){
                console.log('err:'+err);
            }
            //to fix
            // user data. need to modify the user client side for currentSync 
            result.actions.push({actionName:'leader leave',userName:socket.leader});
            result.status ='inactive';
            result.save(function(err) {
                if(err !== null){
                    console.log(err);
                }else{
                    socket.broadcast.in(socket.roomName).emit('leader leaves room');
                    socket.broadcast.in(socket.roomName).emit('socketleave');
                    console.log("the url was saved");
                    Video.find({status:'active'}, 
                        function (err, result) {
                            rooms =result;
                            console.log("a user connected rooms:"+rooms);
                            io.sockets.emit('update rooms', rooms);
                            socket.leave(socket.roomName);
                            socket.roomName = null;
                            socket.leader = null;
                            socket.youtubeID = null;
                            socket.user = null;
                        });
                } 
            });
            
        });
        
    
    });
    // leave  room 
    socket.on('leave room', function (currentSync) {
        var index;
        Video.findOne({$and:[
            {'youtubeID':currentSync.youtubeID} ,
            {'leader':currentSync.leader},
            {'roomName':currentSync.roomName}
            ]}, function  (err,result) {
                if(err){
                    console.log('err:'+err);
                }
                console.log("result is: " +result);
               
                //removes user from user array
                console.log("leave room: " +currentSync.user);
                index = result.users.indexOf(currentSync.user);
                console.log("index to delete: " + index);
                result.users.splice(index, 1);
                console.log("updated users after delete: " + result.users);

                result.actions.push({actionName:'leave',userName:currentSync.user});
                result.save(function(err) {
                    if(err !== null){
                        console.log(err);
                    }else{
                        console.log("user that left has been recorded");
                        Video.find({status:'active'}, 
                            function (err, result) {
                                rooms =result;
                                //console.log("a user connected rooms:"+rooms);
                                io.sockets.emit('update rooms', rooms);
                                socket.leave(socket.roomName);
                                socket.roomName = null;
                                socket.leader = null;
                                socket.youtubeID = null;
                                socket.user = null;
                            });
                    } 
                });
            }
        );

    });

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
        console.log("b4 broadcast start emit socket.roomName:"+socket.roomName);
        socket.broadcast.in(socket.roomName).emit('broadcast start', data);
        //socket.broadcast.emit('broadcast start', data);
    });

    socket.on('stop', function (data) {
        console.log('in server socket event stop');
        // save stop action in database
        console.log("b4 broadcast stop emit")
        socket.broadcast.in(socket.roomName).emit('broadcast stop', data);
    });

    socket.on('pause', function (data) {
        console.log('in server socket event pause');
        // save pause action in database
        console.log("b4 broadcast pause emit")
        socket.broadcast.in(socket.roomName).emit('broadcast pause', data);
    });
  
});


//display action happen for video
app.get("/videoActions.json", function (req, res) {
    Video.findOne(function (err, result) {
	   res.json(result);
    });
});
app.get("/", function (req, res) {
    res.sendFile('/public/index.html', {root: __dirname });
});

