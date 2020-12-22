const mongoose = require('mongoose');
const { returnErrorJsonResponse, statusCode } = require('../Helpers/status')

const localDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.LOCAL_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
    } catch (error) {
        return returnErrorJsonResponse(
            statusCode.bad,
            "fail",
            "Something went wrong, Please try again",
            error
        );
    }
};

module.exports = localDB;