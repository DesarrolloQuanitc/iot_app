const express = require('express');
const router = express.Router();

router.get("/testing",(req,res)=>{
    res.send("HELLOW IOT API FROM DEVICES")
})

module.exports= router;