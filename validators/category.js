const {check} = require("express-validator");

exports.categoryValidator = [
    check("name")
        .not()
        .isEmpty()
        .withMessage("Do not forget to enter name")
    ,
    check("image")
        .not()
        .isEmpty()
        .withMessage("Image is required")
    ,
    check("content")
        .isLength({min: 15})
        .withMessage("Content is required and content must have 15 characters long")
];


exports.updateCategoryValidator = [
    check("name")
        .not()
        .isEmpty()
        .withMessage("Do not forget to enter name")
    ,
    check("content")
        .isLength({min: 15})
        .withMessage("Content is required")
];