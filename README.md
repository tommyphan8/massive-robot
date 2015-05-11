The concept for our project was to create a web application that allows one user to control a video and broadcast it to other users that are in the same virtual room. A leader can create a room and control a YouTube video remotely. If there is a reason to pause the video, the leader can do so and that pause action will be emitted to all viewers of the video in real-time causing their videos to pause.

This web application uses the following software and API:

Node
Express
Socket.io
MongoDB
YouTube Player API ( https://developers.google.com/youtube/iframe_api_reference)

In order to use the application:

Find our application at the following link:
https://github.com/tommyphan8/massive-robot

Clone the project to a location of your choosing.

Open up a terminal and run the command ‘mongod’ in order to start MongoDB.

Open up a terminal and change to the directory where the ‘app.js’ file is located. 
(massive-robot -> sync_video) 
Run the command ‘node app.js’

Open up a browser (preferably Chrome - for now*) and go to the following url:

http://localhost:5555

Enter a user name, a YouTube link, and a couch name.

The user name can be alpha-numeric in nature. 

The YouTube link is an eleven character code that can be found at the end of any YouTube video link. Here are a few examples for your convenience:

i9MHigUZKEM (AngularJS in 60ish minutes)
IlLqMEjinN4 (How to effortlessly integrate Three.js into your projects)

The couch name is essentially the name of the room that the video will be playing in.

After these fields are filled in, click the ‘Create’ button. The video that is associated with the YouTube id that you entered will be displayed. 

A box labeled ‘Room Info’ displays a greeting, the name of the leader, and the room name. Underneath this information there is a button labeled ‘leave’. This button allows a user to leave the room they are in.

There is a drop down list labeled ‘Room List’. This is a drop down list of all currently available rooms that you can join. Underneath the room list there is a button labeled ‘join’. This button is used to join a different room.

Open up a new window in Chrome and go to the following url:
http://localhost:5555

Enter a user name. Ignore the other text fields. Select the name of the couch that you previously entered and click on ‘join’.

In the first browser, click on the video to play it. This will play the video in both browsers. Please be aware that there is a slight latency in the play times. If this annoys you, the volume on one of the videos can be turned down. 

Click the ‘leave’ button to return to the homepage.

We decided to use the database for administrative purposes only. In order to view the information stored in the database, go the the following url:

http://localhost:5555/videoActions.json

This will show a history of all the users, rooms, and actions.

*** Please Note ***

This web application does not work in all Firefox browsers. We have seen it work in some instances of Firefox and not in others. This is a bug that we are aware of and are still unsure of how to fix.



























