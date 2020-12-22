const express = require('express');
const router= express.Router();
const {addUser, getUsers, getTickets, createTicket, login, compareLicenseNo} = require('../controllers/company');
const {protect} = require('../Helpers/protect')

router.post('/login',login);
router.post('/adduser',protect, addUser);  //local
router.get('/getusers',protect, getUsers);  //local
router.get('/gettickets',protect, getTickets);  //local 
router.post('/createticket',protect, createTicket); //local
router.post('/comparelicenseNo',compareLicenseNo);


module.exports= router;