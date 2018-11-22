<<<<<<< HEAD
var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/splash", function (req, res) {
    res.sendFile("splash.html", {root: "./public"});
});

/* Pressing the 'PLAY' button, returns this page */
router.get("/play", function(req, res) {
    res.sendFile("game.html", {root: "./public"});
=======
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
>>>>>>> 905487eb105b55a629d51aadcaa3ebdbecd4ff86
});

module.exports = router;
