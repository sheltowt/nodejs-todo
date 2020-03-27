//dependencies required for the app
var express = require("express");
var cookieParser = require('cookie-parser');
var cookieEncrypter = require('./cook');
var bodyParser = require("body-parser");
var app = express();

var config = require('./config.json');

var secretKey = config["secret_key"];

app.use(cookieParser(secretKey));
app.use(cookieEncrypter(secretKey));

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
//render css files
app.use(express.static("public"));

//placeholders for added task
var task = ["create cloudflare worker"];
//placeholders for removed task
var complete = ["set up TLS"];

//post route for adding new task 
app.post("/addtask", function(req, res) {
    console.log("adding task")
    var newTask = req.body.newtask;
    //add the new task from the post route
    task.push(newTask);
    res.cookie('should_work', "true", {
      maxAge: 900000,
      signed: true,
      httpOnly: true
    });
    res.redirect("/");
});

app.post("/removetask", function(req, res) {
    console.log("removing task")
    var completeTask = req.body.check;
    //check for the "typeof" the different completed task, then add into the complete task
    if (typeof completeTask === "string") {
        complete.push(completeTask);
        //check if the completed task already exits in the task when checked, then remove it
        task.splice(task.indexOf(completeTask), 1);
    } else if (typeof completeTask === "object") {
        for (var i = 0; i < completeTask.length; i++) {
            complete.push(completeTask[i]);
            task.splice(task.indexOf(completeTask[i]), 1);
        }
    }
    res.cookie('should_work', "false", {
      maxAge: 900000,
      signed: true,
      httpOnly: true
    });
    res.redirect("/");
});

app.get("/entertainment", function(req, res) {
    console.log("shouldWork")
    console.log("entertainment")
    console.log(req.signedCookies)
    if (req.signedCookies.should_work) {
        var shouldWork = new Buffer(req.signedCookies.should_work).toString();
        console.log(shouldWork)
        if (shouldWork == "false") {
            console.log("redirecting")
            res.redirect(307, "https://www.youtube.com/watch?v=XyNlqQId-nk");
        } else {
          console.log("no redirect")
          res.render("index", { task: task, complete: complete });
        }      
    } else {
        console.log("no cookie")
        res.render("index", { task: task, complete: complete });         
    }
});

//render the ejs and display added task, completed task
app.get("/", function(req, res) {
    res.render("index", { task: task, complete: complete });
});

//set app to listen on port 3000
app.listen(3000, function() {
    console.log("server is running on port 3000");
});