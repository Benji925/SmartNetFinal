"use strict";

const express = require("express"),
  app = express(),
  homeController = require("./controllers/homeController"),
  errorController = require("./controllers/errorController"),
  layouts = require("express-ejs-layouts");
  const authRouter = require('./routes/authentication');
  const Contact = require('./models/Contact')

  const isLoggedIn = authRouter.isLoggedIn

  const mongoose = require("mongoose");
  mongoose.connect(
     'mongodb://localhost/smartNet',
     {useNewUrlParser:true})
  const db = mongoose.connection;
  db.on('error',(x)=>console.log("connection error"+x))
  db.once('open',(x)=>console.log("We connected at "+new Date()+x))

app.set("view engine", "ejs");
app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(express.json());
app.use(layouts);
app.use(express.static("public"));
app.use(authRouter)
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/courses", homeController.showCourses);
app.get("/contact", homeController.showSignUp);
app.post("/contact", homeController.postedSignUpForm);
app.get("/newContact", homeController.showNewContact);
app.get("/showContacts", homeController.showContacts);
app.get("/about", homeController.about);
app.post("/about", homeController.about);


app.get('/profiles',
    isLoggedIn,
    async (req,res,next) => {
      try {
        res.locals.profiles = await User.find({})
        res.render('profiles')
      }
      catch(e){
        next(e)
      }
    }
  )

app.use('/publicprofile/:userId',
    async (req,res,next) => {
      try {
        let userId = req.params.userId
        res.locals.profile = await User.findOne({_id:userId})
        res.render('publicprofile')
      }
      catch(e){
        console.log("Error in /profile/userId:")
        next(e)
      }
    }
)


app.get('/profile',
    isLoggedIn,
    async (req,res) => {
      let contacts = await Contact.find({userId:req.user._Id})
      res.locals.numContacts = contacts.length
      console.log(JSON.stringify(contacts,null,2))
      //res.locals.contacts = contacts

      //double check^
      res.render('profile')
    })

app.get('/editProfile',
    isLoggedIn,
    (req,res) => res.render('editProfile'))

app.post('/editProfile',
    isLoggedIn,
    async (req,res,next) => {
      try {
        let username = req.body.username
        let age = req.body.age
        req.user.username = username
        req.user.age = age
        req.user.imageURL = req.body.imageURL
        await req.user.save()
        res.redirect('/profile')
      } catch (error) {
        next(error)
      }

    })

app.get('/allContacts',
    async (req,res,next) => {
        try {
            let contacts = await Contact.find();
            res.json(contacts)
        } catch (error) {
            res.json({error:true})
        }
    }
    )



app.use(errorController.pageNotFoundError);
app.use(errorController.internalServerError);

app.listen(app.get("port"), () => {
  console.log(`Server running at http://localhost:${app.get("port")}`);
});
module.exports = app;
