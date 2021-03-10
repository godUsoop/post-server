const {check} = require("express-validator");

exports.registerValidator = [
    check("name")
        .not()
        .isEmpty()
        .withMessage("Do not forget to enter name")
    ,
    check("email")
        .isEmail()
        .withMessage("Please enter a valid email")
    ,
    check("password")
        .isLength({min: 8})
        .withMessage("The valid password confined with at least 8 characters long")
    ,
    check("categories")
        .isLength({min: 8})
        .withMessage("Please pick at least one category")
];



exports.loginValidator = [
    check("email")
        .isEmail()
        .withMessage("Please enter a valid email")
    ,
    check("password")
        .isLength({min: 8})
        .withMessage("The valid password confined with at least 8 characters long")
];



exports.forgotPasswordValidator = [
    check("email")
        .isEmail()
        .withMessage("Please enter a valid email")
];



exports.resetPasswordValidator = [
    check('newPassword')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 6 characters long'),
    check('resetPasswordLink')
        .not()
        .isEmpty()
        .withMessage('Token is required')
];



exports.userUpdateValidator = [
    check("name")
        .not()
        .isEmpty()
        .withMessage("Do not forget to enter name")
];