const express= require('express');
const router=express.Router();
const axios=require('axios');
const color=require('colors');



router.post('/saver-webhook',async (req,res)=>{
    
    const data=req.body;
    console.log(data.m);

    res.json("{}");

})

module.exports=router