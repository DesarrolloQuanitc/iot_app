const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//models import
import User from "../models/user.js";

//AUTH
//POST -> req.body
//GET -> req.query

//REGISTER
router.post("/register",async (req,res)=>{

    try {
        const name = req.body.name;
        const email=req.body.email;
        const password=req.body.password;

        const encryptedPassword = bcrypt.hashSync(password,10);

        const newUser={
            name:name,
            email:email,
            password:encryptedPassword
        }

        const user= await User.create(newUser);
        
        console.log(user);

        const toSend={
            status:"succes",
        }
        res.json(toSend);
        
    } catch (error) {
        console.log("ERROR - REGISTER-ENDPOINT");
        console.log(error);

        const toSend={
            status:"error",
            error:error ,
        }

        res.status(500).json(toSend)

    }


});


//LOGIN
router.post("/login",async(req,res)=>{
    const email=req.body.email;
    const password=req.body.password;

    var user= await User.findOne({
        email: email
    })

    //IF NO EMAIL 
    if(!user){
        const toSend={
            status:"ERROR",
            error:"Invalid Credentialss"
        }
        
        return res.status(401).json(toSend);
    }


    //IF EMAIL AND PASSWORD ARE CORRECT
    if(bcrypt.compareSync(password,user.password)){
        
        user.set('password',undefined,{strict:false})

        const token = jwt.sign({userData:user},'securePasswordHere',{expiresIn:60*60*24*30})

        const toSend ={
            status:"succes",
            token: token,
            userData: user
        }  

        return res.json(toSend)

    }else{
        const toSend={
            status:"ERROR ",
            error:" INVALID CREDENTIALS"
        }
        return res.status(200).json(toSend);
    }

    

});



// router.get("/new-user", async (req, res) => {

//     try {
//         const user = await User.create({
//             name: "Benjamin",
//             email: "a@d.com",
//             password: "121212"
//           });
//           res.json({"status":"success"})
//     } catch (error) {
//         console.log(error);
//         res.json({"status":"fail"});
//     }


// });

module.exports = router;