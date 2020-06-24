"use strict";
let Contact = require('../models/Contact')
var courses = [
  {
    title: "Event Driven Cakes",
    cost: 50
  },
  {
    title: "Asynchronous Artichoke",
    cost: 25
  },
  {
    title: "Object Oriented Orange Juice",
    cost: 10
  }
];

exports.showCourses = (req, res) => {
  res.render("courses", {
    offeredCourses: courses
  });
};

exports.showSignUp = (req, res) => {
  res.render("contact");
};

exports.showNewContact = (req, res) => {
  res.render("newContact");
};

exports.about = (req, res) => {
  res.render("about");
};

exports.profile = (req,res) => {
  res.render("profile")
}

exports.postedSignUpForm = async (req, res) => {
  try {
    let formData = req.body
    let newContact = new Contact(
      {

        userId: req.user._id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        contactWhen: req.body.contactWhen,
        meetingLocation: req.body.meetingLocation,
        company: req.body.company,
        otherNotes: req.body.otherNotes,
      })
      await newContact.save()
      res.redirect("/")
  }
  catch(e){
    console.log("error")
  }
}

exports.showContacts = async (req, res) => {
    try{
      res.locals.contacts = await Contact.find({userId:req.user._id})
      res.render("showContacts")
    } catch(e){
      console.log("error")
    }
  }
