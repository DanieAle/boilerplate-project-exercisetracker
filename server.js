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
  console.log(req.body.date);
  if(req.body.date === '' || req.body.date === undefined){
    exercise = {
      description: req.body.description,
      duration: req.body.duration,
      date: new Date().toDateString()
    }
  }
  else{
    exercise = {
      description: req.body.description,
      duration: req.body.duration,
      date: new Date(req.body.date).toDateString()
    }
  }
  User.findOneAndUpdate({_id: req.params._id},{"$push":{exercises:exercise}},{new:true},
    (err,updated) =>{
      if(err) return console.error(err);
      console.log('Updated');
      res.send({
        _id: updated._id,
        username: updated.name,
        description: req.body.description,
        duration: parseInt(req.body.duration),
        date: exercise.date
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

app.get('/api/users/:_id/logs?',(req,res) =>{
  console.log(req.query,req.params);
  User.findOne({_id: req.params._id},(err,found) =>{
    if(err) return console.error(err);
    console.log(found);
    let l;
    let array;
    if(req.query.limit === undefined && req.query.from === undefined && req.query.to === undefined){
      array = found.exercises;
    }
    else{
    if(req.query.limit === undefined){
      l = found.exercises.length;
    }
    else l = req.query.limit;
    array = found.exercises.filter(exer =>{
      let item;
      
      let fro = req.query.from;
      let to = req.query.to;
      if(fro === undefined){
        fro = new Date(1980,1,1);
      }
      if(to === undefined){
        to = new Date();
      }
      if(l >0){
        let date = new Date(exer.date);
        
        if(new Date(fro) <= date && new Date(to) >= date){
          item = exer;
        }
        if(item === undefined){
          item = false;
        }
        l--;
        console.log(item);
        return item;
      }
    });
  }
    res.send({
      username: found.name,
      _id: found._id,
      log: array,
      count: array.length
    });
  });
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
