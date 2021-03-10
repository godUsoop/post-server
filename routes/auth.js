const express = require("express");
const router = express.Router();
const {register, registerActivate, login, requireSignin, forgotPassword, resetPassword} = require("../controllers/auth");

// import validators
const {registerValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator} = require("../validators/auth");
const {runValidation} = require("../validators/index");


// apply more middlewares

// register field
router.post("/register", registerValidator, runValidation, register);


// register activate field
router.post("/register/activate", registerActivate);


// login field
router.post("/login", loginValidator, runValidation, login);


// forgot filed
router.put("/forgot-password", forgotPasswordValidator, runValidation, forgotPassword)

// reset password filed
router.put("/reset-password", resetPasswordValidator, runValidation, resetPassword)

// apply middleware; only have token to access that page
// router.get("/secret", requireSignin, (req, res) => {
//     res.json({data: "this is secret page for logged in user only"})
// })


module.exports = router;
