const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middlewares/authentication.js');

import { async } from 'q';
//models import
import Template from '../models/template.js';

//Delete Templates
router.delete('/template',checkAuth,async(req,res)=>{

    try {
        
        const userId=req.userData._id;
        const templateId=req.query.templateId;

        if (devices.length > 0){

            const response = {
                status: "fail",
                error: "template in use"
            }
    
            return res.json(response);
        }        

        const r= await Template.deleteOne({userId:userId,_id:templateId});

        const response={
            status:"success",
        }

        return res.json(response)

    } catch (error) {
        
        console.log(error);

        const response={
            status:"error",
            error:error
        }

        return res.status(500).json(response);
    }

})

//Get Templates
router.get('/template', checkAuth, async (req, res) => {

    try {

        const userId = req.userData._id;

        const templates = await Template.find({userId: userId})

        const response = {
            status: "success",
            data:templates
        }

        return res.json(response)

    } catch (error) {

        console.log(error);

        const response = {
            status: "error",
            error: error
        }

        return res.status(500).json(response);

    }

});
//Create Template
router.post('/template', checkAuth, async (req, res) => {

    try {

        const userId = req.userData._id;

        var newTemplate = req.body.template;

        newTemplate.userId = userId;
        newTemplate.createdTime = Date.now();

       

        const r = await Template.create(newTemplate);

        const response = {
            status: "success",
        }

        return res.json(response)

    } catch (error) {

        console.log(error);

        const response = {
            status: "error",
            error: error
        }

        return res.status(500).json(response);

    }

});

module.exports = router;