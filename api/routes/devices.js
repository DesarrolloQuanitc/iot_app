const express = require("express");
const router = express.Router();
const axios = require("axios");
const { checkAuth } = require('../middlewares/authentication.js')


import { axisBottom, index } from 'd3';
import { async } from 'q';
/*
 ___  ______________ _____ _      _____ 
|  \/  |  _  |  _  \  ___| |    /  ___|
| .  . | | | | | | | |__ | |    \ `--. 
| |\/| | | | | | | |  __|| |     `--. \
| |  | \ \_/ / |/ /| |___| |____/\__/ /
\_|  |_/\___/|___/ \____/\_____/\____/  
*/
import Device from '../models/device.js';
import SaverRule from '../models/emqx_saver_rule.js'


/* 
  ___  ______ _____ 
 / _ \ | ___ \_   _|
/ /_\ \| |_/ / | |  
|  _  ||  __/  | |  
| | | || |    _| |_ 
\_| |_/\_|    \___/ 
*/


const auth ={

  auth:{
    username:"admin",
    password:"emqxsecret"
  }

}


//GET DEVICES
router.get("/device", checkAuth ,async(req, res) => {

  try {
    const userId = req.userData._id;

    //get devices 
    var devices= await  Device.find({userId: userId});
    devices=JSON.parse(JSON.stringify(devices));

    //Get saver rules 
    const saverRules =  await getSaverRules(userId);

    devices.forEach((device,index ) =>{

      devices[index].saverRule = saverRules.filter(saverRule => saverRule.dId == device.dId)[0];

    })
  
    const  toSend={
      status: "succes",
      data:devices
    }

    res.json(toSend);

  } catch (error) {
    
    console.log("ERROR GETTING DEVICES");

    const toSend = {
      status: "error",
      error: error
    }

    return res.status(500).json(toSend);


  }

 

});


/* 
{
   "newDevice":{
      "dId":"121212",
      "name":"HOME",
      "templateName":"esp32 template",
      "templateId":"ababab"
   }
}
*/

//NEW DEVICE
router.post("/device", checkAuth , async (req, res) => {

    try {
      const userId = req.userData._id;
      var newDevice = req.body.newDevice;
    
      newDevice.userId = userId;
      newDevice.createdTime = Date.now();

      await createSaverRule(userId,newDevice.dId,true);

      const device = await Device.create(newDevice);

      await selectDevice(userId,newDevice.dId);
    
      const toSend = {
        status: "success"
      }
    
      return res.json(toSend);

    } catch (error) {
      
      console.log("ERROR CREATING DEVICE");
      console.log(error);

      const toSend = {
        status: "error",
        error: error
      }

      return res.status(500).json(toSend);

    }
    

  

  
});

// DELETE DEVICE
router.delete("/device",checkAuth , async(req, res) => {

  try {

  const userId= req.userData._id;
  const dId = req.query.dId

  await deleteSaverRule(dId)

  const result =await Device.deleteOne({userId:userId,dId:dId});

  const toSend = {
    status: "success",
    data: result
  }

  return res.json(toSend);
    
  } catch (error) {
    console.log("ERROR DELETING DEVICE");
    console.log(error);

    const toSend = {
        status: "error",
        error: error
      }

    return res.status(500).json(toSend);

  }
  
  
  
});

//SELECTED DEVICE
router.put("/device", checkAuth ,(req, res) => {
  
  const dId = req.body.dId;
  const userId= req.userData._id;
  
  if(selectDevice(userId,dId)){
    const toSend = {
      status: "success"
    }
  
    return res.json(toSend);
  }else{

    const toSend = {
      status: "error"
    }
  
    return res.json(toSend);
  }
  
  

});

//SAVER-RULE STATUS UPDATER
router.put('/saver-rule', checkAuth, async (req, res) => {

  
  const rule = req.body.rule;

  console.log(rule)

  await updateSaverRuleStatus(rule.emqxRuleId, rule.status)

  const toSend = {
    status: "success"
  };

  res.json(toSend);
  

});





/* 
______ _   _ _   _ _____ _____ _____ _____ _   _  _____ 
|  ___| | | | \ | /  __ \_   _|_   _|  _  | \ | |/  ___|
| |_  | | | |  \| | /  \/ | |   | | | | | |  \| |\ `--. 
|  _| | | | | . ` | |     | |   | | | | | | . ` | `--. \
| |   | |_| | |\  | \__/\ | |  _| |_\ \_/ / |\  |/\__/ /
\_|    \___/\_| \_/\____/ \_/  \___/ \___/\_| \_/\____/  
*/


async function selectDevice(userId,dId){

  try {
    
    const result = await Device.updateMany({userId:userId},{selected: false});
    const resul2 = await Device.updateOne({dId:dId,userId:userId},{selected:true});


  return true ;

  } catch (error) {
    
    console.log("ERROR IN SELECT DEVICE FUNCTION");
    console.log(error);

    return false ;

  }

  

}

/*

SAVER RULES FUNCTIONS 

*/

//Get saver rules
async function getSaverRules(userId){

  try {

    const rules=await SaverRule.find({userId:userId});
    return rules;
    
  } catch (error) {

    return false
  }


}

//Create saver rule
async function createSaverRule(userId,dId,status){

  try {
    
    const url = "htttp://localhost:8085/api/v4/rules" 

    const topic = userId + "/" + dId + "/+/sdata";

    const rawsql = "SELECT topic, payload FROM \"" + topic + "\" WHERE payload.save = 1";

    var newRule = {
      rawsql: rawsql,
      actions: [
        {
          name: "data_to_webserver",
          params: {
            $resource: global.saverResource.id,
            payload_tmpl: '{"userId":"' +  userId + '","payload":${payload},"topic":"${topic}"}'
          }
        }
      ],
      description: "SAVER-RULE",
      enabled: status
    };

    //save rule in emqx
    const res= await axios.post(url,newRule,auth)

    if(res.status === 200 && res.data.data){

      console.log(res.data.data)

      await SaverRule.create({
        userId:userId,
        dId:dId,
        emqxRuleId:res.data.data.id,
        status:status
      })

      return true;

    }else{
      return false;
    }

    } catch (error) {
      console.log("ERROR creating saver rule")
      console.log(error)
      return true;
    }


}

//update saver rule
async function updateSaverRuleStatus(emqxRuleId,status){

  const url="http://localhost:8085/api/v4/rules/" + emqxRuleId

  const newRule = {
    enabled: status
  }

  const res = await axios.put(url,newRule,auth)

  if (res.status === 200 && res.data.data) {
    await SaverRule.updateOne({ emqxRuleId: emqxRuleId }, { status: status });
    console.log("Saver Rule Status Updated...".green);
    return {
      status: "success",
      action: "updated"
    };
  }


}

//delte saver rule
async function deleteSaverRule(dId){
  try {
    
    const mongoRule= await SaverRule.findOne({dId:dId});

    const url="http://localhost:8085/api/v4/rules/" + mongoRule.emqxRuleId

    const emqxRuleId=await axios.delete(url,auth)

    const deleted=await SaverRule.deleteOne({dId:dId})

    return true


  } catch (error) {
    
    console.log(error)
    return false

  }
}



module.exports = router;