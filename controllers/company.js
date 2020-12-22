const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { decrypt } = require('../Helpers/crypto');
const { statusCode, returnJsonResponse, returnErrorJsonResponse } = require("../Helpers/status.js");
const User = require('../models/User');
const Ticket = require('../models/Ticket');



module.exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(statusCode.nocontent)
                .json(
                    returnErrorJsonResponse(
                        statusCode.nocontent,
                        "fail",
                        "Please enter all the required fileds",
                    )
                );
        }
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res
                .status(statusCode.unauthorized)
                .json(
                    returnErrorJsonResponse(
                        statusCode.unauthorized,
                        "fail",
                        "The email address " + email + " is not associated with any account. please check email and try again!"
                    )
                );
        }
        if (user.isAdmin) {
            if (!user.isVerified) {
                return res
                    .status(statusCode.unauthorized)
                    .json(
                        returnErrorJsonResponse(
                            statusCode.unauthorized,
                            "fail",
                            "Your Email has not been verified. Please check mail to verify your email"
                        )
                    );
            }
        };
        if (!user.password) {
            return res
                .status(statusCode.unauthorized)
                .json(
                    returnErrorJsonResponse(
                        statusCode.unauthorized,
                        "fail",
                        "Your Email has not been verified. Please check mail to verify your email"
                    )
                );
        };
        const ismatched = await bcrypt.compare(password, user.password);
        if (!ismatched) {
            return res
                .status(statusCode.unauthorized)
                .json(
                    returnErrorJsonResponse(
                        statusCode.unauthorized,
                        "fail",
                        "Invalid Credentials"
                    )
                );
        }
        else {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
            return res
                .status(statusCode.success)
                .header('Authorization', 'Bearer ' + token)
                .json(
                    returnJsonResponse(
                        statusCode.success,
                        "success",
                        "Successfully logged-in",
                        user.isAdmin
                    )
                );
        }
    } catch (error) {
        return res
            .status(statusCode.error)
            .json(
                returnErrorJsonResponse(
                    statusCode.error,
                    "fail",
                    "Something went wrong, Please try again",
                    error
                )
            );
    }
};

module.exports.addUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(statusCode.bad)
                .json(
                    returnErrorJsonResponse(
                        statusCode.nocontent,
                        "fail",
                        "Please enter all the required fileds",
                    )
                );
        }
        console.log(req.user)
        if (req.user.isAdmin == false) {
            return res
                .status(statusCode.bad)
                .json(
                    returnErrorJsonResponse(
                        statusCode.nocontent,
                        "fail",
                        "You are not authorised to Add User!!"
                    )
                );
        }
        let addedUser = await User.find().countDocuments() - 1;
        let encryptUser = await User.findOne({ isAdmin: true });
        let dcrypt = JSON.parse(decrypt(encryptUser.licenseKey));
        if (addedUser >= dcrypt.option) {
            return res
                .status(statusCode.unauthorized)
                .json(
                    returnJsonResponse(
                        statusCode.unauthorized,
                        "Fail",
                        "Exceeded the number of Subscriptions",
                    )
                );
        }
        let user = await User.findOne({ email });
        // if email exist into database
        if (user) {
            return res
                .status(statusCode.success)
                .json(
                    returnJsonResponse(
                        statusCode.success,
                        "success",
                        "This email address is already associated with another account.",
                    )
                );
        }
        else {
            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash(req.body.password, salt);
            user = new User({ email: req.body.email, password: password });
            user.save((error) => {
                if (error) {
                    return res
                        .status(statusCode.bad)
                        .json(
                            returnErrorJsonResponse(
                                statusCode.bad,
                                "fail",
                                "Something went wrong, Please try again",
                                error
                            )
                        );
                };
                return res
                    .status(statusCode.success)
                    .json(
                        returnJsonResponse(
                            statusCode.success,
                            "success",
                            "User Successfully registered",
                            user
                        )
                    );
            });
        }
    } catch (error) {
        console.log(error)
        return res
            .status(statusCode.error)
            .json(
                returnErrorJsonResponse(
                    statusCode.error,
                    "fail",
                    "Something went wrong, Please try again",
                    error
                )
            );
    }
};

module.exports.createTicket = async (req, res, next) => {
    try {
        const { fileName,
            senderPersonName,
            senderEmailId,
            senderDepartment,
            senderCompany,
            receiverPersonName,
            receiverEmailId,
            receiverCompany,
            receiverDepartment,
            courierTrackingId,
            courierCompany,
            fileSendDate,
            QRCode } = req.body;
        if (!fileName || !senderPersonName || !senderEmailId || !senderDepartment || !senderCompany || !receiverPersonName || !receiverEmailId || !receiverCompany || !receiverDepartment || !courierTrackingId || !courierCompany || !fileSendDate || !QRCode) {
            return res
                .status(statusCode.nocontent)
                .json(
                    returnErrorJsonResponse(
                        statusCode.nocontent,
                        "fail",
                        "Please fill all the required fileds",
                    )
                );
        }
        else {
            ticket = new Ticket({
                fileName: fileName,
                senderPersonName: senderPersonName,
                senderEmailId: senderEmailId,
                senderDepartment: senderDepartment,
                senderCompany: senderCompany,
                receiverPersonName: receiverPersonName,
                receiverEmailId: receiverEmailId,
                receiverCompany: receiverCompany,
                receiverDepartment: receiverDepartment,
                courierTrackingId: courierTrackingId,
                courierCompany: courierCompany,
                fileSendDate: fileSendDate,
                QRCode: QRCode
            });
            ticket.save((error) => {
                if (error) {
                    return res
                        .status(statusCode.bad)
                        .json(
                            returnErrorJsonResponse(
                                statusCode.bad,
                                "fail",
                                "Something went wrong, Please try again",
                                error
                            )
                        );;
                };
                return res
                    .status(statusCode.success)
                    .json(
                        returnJsonResponse(
                            statusCode.success,
                            "success",
                            "Ticket Saved Successfully",
                            ticket
                        )
                    );
            });
        }
    } catch (error) {
        return res
            .status(statusCode.error)
            .json(
                returnErrorJsonResponse(
                    statusCode.error,
                    "fail",
                    "Something went wrong, Please try again",
                    error
                )
            );
    }
};

module.exports.getUsers = async (req, res, next) => {
    try {
        const user = await User.find({ isAdmin: false });
        return res
            .status(statusCode.success)
            .json(
                returnJsonResponse(
                    statusCode.success,
                    "success",
                    "Users Fetched Successfully",
                    user
                )
            );
    } catch (error) {
        return res
            .status(statusCode.error)
            .json(
                returnErrorJsonResponse(
                    statusCode.error,
                    "fail",
                    "Something went wrong, Please try again",
                    error
                )
            );
    }
};

module.exports.getTickets = async (req, res, next) => {
    try {
        const ticket = await Ticket.find();
        return res
            .status(statusCode.success)
            .json(
                returnJsonResponse(
                    statusCode.success,
                    "success",
                    "Ticket Fetched Successfully",
                    ticket
                )
            );
    } catch (error) {
        return res
            .status(statusCode.error)
            .json(
                returnErrorJsonResponse(
                    statusCode.error,
                    "fail",
                    "Something went wrong, Please try again",
                    error
                )
            );
    }
};

module.exports.compareLicenseNo = async (req, res, next) => {
    try {
        await MasterUser.findOne({ licenseNo: req.body.licenseNo }, (error, user) => {
            if (error) {
                return res
                    .status(statusCode.bad)
                    .json(
                        returnErrorJsonResponse(
                            statusCode.bad,
                            "fail",
                            "Something went wrong, Please try again",
                            error
                        )
                    );
            }
            else if (!user) {
                return res
                    .status(statusCode.unauthorized)
                    .json(
                        returnErrorJsonResponse(
                            statusCode.unauthorized,
                            "fail",
                            "We were unable to find the entered License Number."
                        )
                    );
            } else {
                const LUser = new User({
                    licenseKey: user.licenseKey,
                    isAdmin: user.isAdmin,
                    isVerified: user.isVerified,
                    companyName: user.companyName,
                    email: user.email,
                    option: user.option,
                    licenseNo: user.licenseNo,
                    password: user.password
                });
                LUser.save((error) => {
                    if (error) {
                        console.log(error)
                        return res
                            .status(statusCode.bad)
                            .json(
                                returnErrorJsonResponse(
                                    statusCode.bad,
                                    "fail",
                                    "Something went wrong, Please try again",
                                    error
                                )
                            );
                    };
                    return res
                        .status(statusCode.success)
                        .json(
                            returnJsonResponse(
                                statusCode.success,
                                "success",
                                "Your License Number has been successfully verified."
                            )
                        );
                });
            }
        })
    } catch (error) {
        console.log(error)
        return res
            .status(statusCode.error)
            .json(
                returnErrorJsonResponse(
                    statusCode.error,
                    "fail",
                    "Something went wrong, Please try again",
                    error
                )
            );
    }
};