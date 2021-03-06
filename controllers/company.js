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
        };
        let encryptUser = await User.findOne({ isAdmin: true });
        let dcrypt = JSON.parse(decrypt(encryptUser.licenseKey));
        if (new Date(dcrypt.expiryDate) < new Date(Date.now())) {
            return res
                .status(statusCode.unauthorized)
                .json(
                    returnJsonResponse(
                        statusCode.unauthorized,
                        "Fail",
                        "Your Subscription has expired, Please renew your Subscription!!",
                    )
                );
        };
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
            const token = jwt.sign({ id: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
            return res
                .status(statusCode.success)
                .header('Authorization', 'Bearer ' + token)
                .json(
                    returnJsonResponse(
                        statusCode.success,
                        "success",
                        "Successfully logged-in",
                        { isAdmin: user.isAdmin, Token: token }
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
        };
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
        };
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
                .status(statusCode.bad)
                .json(
                    returnErrorJsonResponse(
                        statusCode.nocontent,
                        "fail",
                        "Please fill all the required fileds",
                    )
                );
        }
        else {
            const ticket = new Ticket({
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
                        );
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

module.exports.addAdminUser = async (req, res, next) => {
    try {
        const {
            companyName,
            email,
            isAdmin,
            isVerified,
            option,
            licenseKey,
            licenseNo,
            password,
        } = req.body;
        if (!companyName || !email || !isAdmin || !isVerified || !option || !licenseKey || !licenseNo || !password) {
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
            const user = new User({
                companyName: companyName,
                email: email,
                isAdmin: isAdmin,
                isVerified: isVerified,
                option: option,
                licenseKey: licenseKey,
                licenseNo: licenseNo,
                password: password
            });
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
                            "AdminUser Saved Successfully"
                        )
                    );
            });
        };
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
    };
};

module.exports.deleteUser = async (req, res, next) => {
    try {
        const { deleteUser, updateUser } = req.body;
        if (!deleteUser || !updateUser) {
            return res
                .status(statusCode.bad)
                .json(
                    returnErrorJsonResponse(
                        statusCode.nocontent,
                        "fail",
                        "Please enter all the required fileds",
                    )
                );
        };
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
        };
        await User.deleteOne({ email: deleteUser }, async (error) => {
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
            await Ticket.updateMany({ senderEmailId: deleteUser }, { senderEmailId: updateUser }, (error) => {
                return res
                    .status(statusCode.success)
                    .json(
                        returnJsonResponse(
                            statusCode.success,
                            "success",
                            "User deleted and updated Successfully"
                        )
                    )
            });
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
}

module.exports.searchTicket = async (req, res, next) => {
    try {
        let start = parseInt(req.body.start);
        let end = parseInt(req.body.end);
        const tickets = await Ticket.find().sort('-createdAt').skip(start).limit(end || 30);
        return res
            .status(statusCode.success)
            .json(
                returnJsonResponse(
                    statusCode.success,
                    "success",
                    "Ticket Fetched Successfully",
                    tickets
                )
            )
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
}

module.exports.ticketSearch = async (req, res, next) => {
    try {
        const searchString = req.body.searchString.trim();
        if (!searchString) {
            return res
                .status(statusCode.bad)
                .json(
                    returnErrorJsonResponse(
                        statusCode.nocontent,
                        "fail",
                        "Please enter search parameters.",
                    )
                );
        };
        const tickets = await Ticket.find({ $or: [{ receiverEmailId: searchString }, { receiverPersonName: searchString }, { receiverDepartment: searchString }, { receiverCompany: searchString }, { senderEmailId: searchString }, { senderPersonName: searchString }] }).sort('-createdAt');
        return res
            .status(statusCode.success)
            .json(
                returnJsonResponse(
                    statusCode.success,
                    "success",
                    "Ticket Fetched Successfully",
                    tickets
                )
            )
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
}