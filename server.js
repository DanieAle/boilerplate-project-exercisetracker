const express = require('express')
const app = express()
const cors = require('cors')
const mongodb = require("mongodb");
const mongoose = require('mongoose');
require('dotenv').config()

mongoose.connect(process.env.MONGO_DB,
  {useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify: false });

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
//Scheme
let exercisesSchema = mongoose.Schema({
  description: String,
  duration: Number,
  date: { 
    type: Date
  }
});
let userSchema = mongoose.Schema({
  name: String,
  exercises: [{
    type: exercisesSchema,
    default: {}
  }]
});

//MODEL
//let Exercises = mongoose.model('Exercises',exercisesSchema);
let User = mongoose.model('User',userSchema);

//PORTS
app.post('/api/users',express.urlencoded({extended:true}),(req,res) =>{
  let user = new User({
    name: req.body.username
  });
  user.save();
  console.log('Creado....');
  res.send({username:user.name, _id: user._id});
});
app.post('/api/users/:_id/exercises',express.urlencoded({extended:true}),(req,res) =>{
  console.log(req.params,req.body);
  let exercise;
  if(req.body.date === '' || req.body.date === undefined){
    exercise = {
      description: req.body.description,
      duration: req.body.duration,
      date: new Date()
    }
  }
  else{
    exercise = {
      description: req.body.description,
      duration: req.body.duration,
      date: new Date(req.body.date)
    }
  }
  User.findOneAndUpdate({_id: req.params._id},{exercises:[exercise]},{new:true},
    (err,updated) =>{
      if(err) return console.error(err);
      console.log('Updated');
      res.send({
        _id: req.params._id,
        username: updated.name,
        description: req.body.description,
        duration: req.body.duration,
        date: exercise.date.toDateString()
      });
  });
});
//GETS
app.get('/api/users',(req,res) =>{
  let users = [];
  User.find({},(err,founds) =>{
    if(err) return console.error(err);
    founds.forEach(user =>{
      users.push({
        username: user.name,
        _id: user._id
      });
    });
    res.send(users);
  });
});
app.get('/api/users/:_id/logs:from:to:limit',(req,res) =>{
  let {from,to,limit} = req.params;
  console.log(from,to,limit);
  /*User.findOne({_id: req.params._id},(err,found) =>{
    if(err) return console.error(err);
    let l;
    let array;
    if(limit === undefined && from === undefined && to === undefined){
      array = found.exercises;
    }
    else{
    if(limit === undefined){
      l = found.exercises.length;
    }
    else l = limit;
    array = found.exercises.filter(exer =>{
      let item;
      if(l <0){
        if(from !== undefined && new Date(from) >= new Date(exer.date)){
          item = exer;
        }
        if(to !== undefined && new Date(to) <= new Date(exer.date)){
          item = exer;
        }
        if(from !== undefined || to !== undefined && item !== undefined){
          return item;
        }
        else{
          return exer;
        }
        l--;
      }
    });
  }
    res.send({
      log: found.exercises,
      count: found.exercises.length
    });
  });*/
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
