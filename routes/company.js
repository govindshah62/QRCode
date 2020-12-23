const express = require('express');
const router= express.Router();
const {addUser, getUsers, getTickets, createTicket, login, addAdminUser} = require('../controllers/company');
const {protect} = require('../Helpers/protect')

router.post('/login',login);
router.post('/adduser',protect, addUser); 
router.get('/getusers',protect, getUsers); 
router.get('/gettickets',protect, getTickets);  
router.post('/createticket',protect, createTicket);
router.post('/addAdminUser',addAdminUser);

module.exports= router;