const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
    statusCode,
    returnErrorJsonResponse,
    returnJsonResponse,
  } = require('./status');


module.exports.protect= async(req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token){
        return res
        .status(statusCode.unauthorized)
        .json(returnErrorJsonResponse(statusCode.unauthorized, "fail", "Login to get authorised access to this route"));
    }
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = await User.findOne({email:decoded.id});
        next();
    } catch (error) {
        return res
        .status(statusCode.unauthorized)
        .json(returnErrorJsonResponse(statusCode.unauthorized, "fail", "Login to get authorised access to this route"));
    }
};