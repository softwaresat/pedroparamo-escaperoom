const express = require('express')
const app = express()
const router = express.Router();
const path = require('path');
const moment = require('moment-timezone');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var assert = require('assert');
app.set('view engine', 'ejs');
var http = require("http").Server(app);
var io = require('socket.io')(http);

const { response } = require('express');

function Team(name, points, lastStation){
  this.name = name;
  this.points = points;
  this.lastStation = lastStation;
}

let allTeams = [];


app.use(express.static('views'))
app.use(express.json({
  limit: '50mb'
}));
app.use(express.urlencoded({
  limit: '50mb',
  extended: true
}));
app.use(session({
  secret: "faeb4453e5d14fe6f6d04637f78077c76c73d1b4",
  proxy: true,
  resave: true,
  saveUninitialized: true,
  expires: new Date(Date.now() + (30 * 86400 * 1000))
}));
app.use(cookieParser());
app.set('trust proxy', true);
var spamProtection = [{ user: "test", messages: 2 }];
setInterval(function () {
  spamProtection = [];
}, 30000)

io.on('connection', (socket) => {
  socket.on('updateLeaderboard', async function(team) {
    io.emit('updateLeaderboard', team);
  })

})


app.get('/', function (req, res) {
  res.render('station1', {});
  console.log(allTeams);

})
app.get('/leaderboard', function (req, res) {

    res.render('leaderboard', {allTeams: allTeams.sort((a, b) => a.points - b.points)});
    
  
  })
  app.get('/station1', function (req, res) {
    res.render('station1', {});
    
  
  }) 
  app.get('/station2', function (req, res) {
    res.render('station2', {});
    
  
  })
  app.get('/station3', function (req, res) {
    res.render('station3', {});
    
  
  })
  app.get('/station4', function (req, res) {
    res.render('station4', {});
    
  
  })
  app.post('/submit', function (req, res) {
        let teamName = req.body.team_name;
        let newPoints = req.body.point_count;
        let stationNumber = req.body.station_number;    
        let containsTeam = false;
        let counter = 0;
        for(let i = 0; i < allTeams.length; i++){
          if(allTeams[i].name == teamName){
            containsTeam = true;
            counter = i;
            if(allTeams[i].lastStation == stationNumber-1){
              allTeams[i].points = parseInt(allTeams[i].points) + parseInt(newPoints);
            }
          }
        }
        io.emit("updateLeaderboard", allTeams[counter]);

        if(!containsTeam){
          newTeam = new Team(teamName, newPoints, 1);
          allTeams.push(newTeam);
          io.emit("updateLeaderboard", newTeam);

        }
        res.redirect("/station"+stationNumber)

  })
http.listen(3000, () => console.log('Server is live on port 3000!'))
