//require
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const colors = require('colors');

//instances 
const app=express();

//express config
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));
app.use(cors());

//Express rutas
app.use('/api',require('./routes/devices.js'))
app.use('/api',require('./routes/users.js'))
app.use('/api',require('./routes/templates.js'))
app.use('/api',require('./routes/webhooks.js'))
app.use('/api',require('./routes/emqxapi.js'))
app.use('/api',require('./routes/alarms.js'))
app.use("/api", require("./routes/dataprovider.js"));

module.exports=app;


//listener
app.listen(3001,()=>{
    console.log("API SERVER LSTENING ON PORT 3001");
})


//Mongo Connection
const mongoUserName="devuser";
const mongoPassword="devpassword";
const mongoHost="localhost";
const mongoPort="27017";
const mongoDatabase="iotihs";

var uri="mongodb://" + mongoUserName + ":" +mongoPassword + "@" + mongoHost + ":" + mongoPort + "/" + mongoDatabase;

const options = {
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useNewUrlParser:true,
    authSource:"admin"
};

    mongoose.connect(uri,options).then(()=>{
        console.log("\n");
        console.log("*******************************".green);
        console.log(" Mongo Succesfully Conected".green);
        console.log("*******************************".green);
        console.log("\n");
    },
    (err)=>{
        console.log("\n");
        console.log("*******************************".red);
        console.log(" Mongo ERROR".red);
        console.log("*******************************".red);
        console.log("\n");
    }
    
    
    );


