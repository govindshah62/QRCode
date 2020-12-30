const express = require('express');
const router= express.Router();
const {addUser, getUsers, getTickets, createTicket, login, addAdminUser,deleteUser, searchTicket, ticketSearch} = require('../controllers/company');
const {protect} = require('../Helpers/protect')

router.post('/login',login);
router.post('/adduser',protect, addUser); 
router.get('/getusers',protect, getUsers); 
router.get('/gettickets',protect, getTickets);  
router.post('/createticket',protect, createTicket);
router.post('/addAdminUser',addAdminUser);
router.put('/deleteUser',protect,deleteUser);
router.get('/searchtickets',protect,searchTicket);  
router.get('/ticketsearch',protect,ticketSearch);  

module.exports= router;