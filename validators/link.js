const { check } = require('express-validator');

exports.linkValidator = [
    check('title')
        .not()
        .isEmpty()
        .withMessage('Title is required'),
    check('url')
        .not()
        .isEmpty()
        .withMessage('URL is required'),
    check('categories')
        .not()
        .isEmpty()
        .withMessage('Pick a category'),
    check('type')
        .not()
        .isEmpty()
        .withMessage('Pick a type; free or paid'),
    check('medium')
        .not()
        .isEmpty()
        .withMessage('Pick a medium; video or book')
];



exports.updateLinkValidator = [
    check('title')
        .not()
        .isEmpty()
        .withMessage('Title is required'),
    check('url')
        .not()
        .isEmpty()
        .withMessage('URL is required'),
    check('categories')
        .not()
        .isEmpty()
        .withMessage('Pick a category'),
    check('type')
        .not()
        .isEmpty()
        .withMessage('Pick a type; free or paid'),
    check('medium')
        .not()
        .isEmpty()
        .withMessage('Pick a medium; video or book')
];