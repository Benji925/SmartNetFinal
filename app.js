"use strict";

const express = require("express"),
  app = express(),
  homeController = require("./controllers/homeController"),
  errorController = require("./controllers/errorController"),
  layouts = require("express-ejs-layouts");
  const authRouter = require('./routes/authentication');
  const Contact = require('./models/Contact');
  const User = require('./models/User');
    const cors = require('cors');

  const isLoggedIn = authRouter.isLoggedIn

  const mongoose = require("mongoose");
  mongoose.connect(
     //'mongodb://localhost/smartNet',
     process.env.MONGODB_URI,
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
app.use(authRouter);
app.use(cors());
app.get("/", (req, res) => {
  res.render("index");
});

const ObjectId = mongoose.Types.ObjectId;

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
      let contacts = await Contact.find({userId:req.user._id})
      res.locals.numContacts = contacts.length
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

app.post('/allContactsMobile',
    async (req,res,next) => {
        try {
            let email=req.body.email;
            let secret=req.body.secret;
            //could use something like deviceID as the secret to keep high security
            let user = await User.findOne({googleemail:email});
            let contacts = await Contact.find({userId:user._id});
            //find the correct user and all of their individual contacts
            res.json(contacts)
        } catch (error) {
            next(error)
        }
    }
    );

app.get('/mobileTest',
    async (req,res,next) => {
        let c =await Contact.findOne({userId:req.user._id});
        let contact={
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email,
            contactWhen: c.contactWhen,
            meetingLocation: c.meetingLocation,
            company: c.company,
            otherNotes: "hello world",
            _id:c._id,
        };
        res.locals.contact=contact;
        res.render('mobileTest')
    });


app.post('/addContactMobile',
    async (req,res,next) => {
        try {
            console.log('request received');
            let email=req.body.email;
            let secret=req.body.secret;
            //could use something like deviceID as the secret to keep high security
            let user = await User.findOne({googleemail:email});
            console.log(req.body.contact);
            let c=(req.body.contact);
            c.contactWhen=new Date();
            c.userId=user._id;
            delete c._id;
            let newContact=new Contact(c);
            console.log(JSON.stringify(c,null,2))
            //create a new contact using the information that is passed in
            await newContact.save();
            let contacts = await Contact.find({userId:user._id});
            console.log('returning data');
            res.json(contacts)
            //give user updated list with changes
        } catch (error) {
            next(error)
        }
    }
);

app.post('/replaceContactMobile',
    async (req,res,next) => {
        try {
            let email=req.body.email;
            let secret=req.body.secret;
            let contact=JSON.parse(req.body.contact);
            console.dir(contact);
            //could use something like deviceID as the secret to keep high security
            let user = await User.findOne({googleemail:email});
            await Contact.deleteOne({_id:contact._id});
            let newContact=new Contact(contact);
            newContact.userID=user._id;
            console.dir(newContact);
            await newContact.save();
            let contacts = await Contact.find({userId:user._id});
            res.json(contacts)
            //give user updated list with changes
        } catch (error) {
            res.json({error:true})
        }
    }
);

app.post('/deleteContactMobile',
    async (req,res,next) => {
        try {
            let email=req.body.email;
            let secret=req.body.secret;
            let contact=JSON.parse(req.body.contact);
            console.dir(contact)
            //could use something like deviceID as the secret to keep high security
            let user = await User.findOne({googleemail:email});
            let z=await Contact.findOne({_id: new ObjectId(contact._id)});
            console.dir(z);
            await Contact.deleteOne({_id: new ObjectId(contact._id)});
            let contacts = await Contact.find({userId:user._id});
            res.json(contacts)
            //give user updated list with changes
        } catch (error) {
            res.json({error:true})
        }
    }
);

app.get("/delete/:id",
  async (req,res,next) => {
    console.log("id = " + req.params.id)
    await Contact.remove({_id:req.params.id})
    res.redirect("/showContacts")
})

app.use(errorController.pageNotFoundError);
app.use(errorController.internalServerError);

app.listen(app.get("port"), () => {
  console.log(`Server running at http://localhost:${app.get("port")}`);
});
module.exports = app;
