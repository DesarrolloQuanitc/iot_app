//require
const express= require('express');

//instances 
const app=express();

//listener
app.listen(3001,()=>{
    console.log("API SERVER LSTENING ON PORT 3001");
})

//End Point Test 
app.get("/testing",(req,res)=>{
    res.send("HELLOW IOT API")
})