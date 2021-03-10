const {validationResult} = require("express-validator");


exports.runValidation = (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        // set the HTTP status for the response
        // only grab a first error message
        return res.status(422).json({"error": error.array()[0].msg});
    }
    next();
}

