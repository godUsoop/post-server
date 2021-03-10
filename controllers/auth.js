const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Link = require("../models/link");
const {registerEmailParams, forgotPasswordEmailParams} = require("../email/params");
const shordId = require("shortid"); 
const expressJWT = require("express-jwt");
const _ = require("lodash");


AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});



// Create SES service object
const ses = new AWS.SES({apiVersion: '2010-12-01'});

exports.register = (req, res) => {
    // res.json({"data": "welcome to the page rnoirene  wenfjnwei"})
    // console.log("REGISTER CONTROLLER", req.body);
    const {name, email, password, categories} = req.body;


    User.findOne({email: email}).exec((error, user) => {
        if (user) {
            return res.status(400).json({error: "Email already exists"})
        } 

        // create a jwt by using name, email, password with a secret and set expire time to 5m
        const token = jwt.sign({
            name: name,
            email: email,
            password: password,
            categories: categories
        }, process.env.JWT_ACCOUNT_ACTIVATION,  {expiresIn: "5m"});
        
        // Create sendEmail params 
        const params = registerEmailParams(email, token);

        // Create a ses promise
        const sendEmail = ses.sendEmail(params).promise();

        sendEmail
            .then((data) => {
                console.log("email subbmitted to SES", data)
                // res.send("Email sent")
                res.json({message: "Email has been sent, please follow instruction to complete registration"});
            })
            .catch((error) => {
                console.log(error);
                res.json({message: "We could not verify your email, please try again"});
            });
    });
};




// register activate field
exports.registerActivate = (req, res) => {
    
    const {token} = req.body;
    

    // decoded jwt 
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function(err, decoded) {

        // lacks of valid authentication; i.g. token expired
        if (err) {
            return res.status(401).json({error: "token expired" });
        }

        const {name, email, password, categories} = jwt.decode(token);
        const username = shordId.generate();

        User.findOne({email: email}).exec((err, user) => {
            if (user) {
                return res.status(401).json({error: "email already exists"});
            };
            

            // add new user
            const newUser = new User({username, name, email, password, categories});

            newUser.save((err, result) => {
                if (err) {
                    return res.status(401).json({error: "Try again later"});

                }
                return res.json({message: "Successfully registered! Please login"});
            })
        })
    })
}


// login field
exports.login = (req, res) => {

    const {email, password} = req.body;
    // console.table({email, password});

    User.findOne({email: email}).exec((err, user) => {

        if (!user) {
            return res.status(400).json({error: "email dose not exist. Please register an account"});
        }

        // use custom authenticate method 
        if (!user.authenticate(password)) {
            return res.status(400).json({error: "email and password do not match"});

        }

        // generate a token
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: "5d"});
        
        // destruct the user object
        const {_id, role, name, email} = user

        // saving the local storage in the frontend
        // token can be use as access token; only limit to login user
        // save this in the cookie
        return res.json({token: token, user: {_id, role, name, email}});
    })
}



// checks JWTs against a secret, if is the same then access succseefully
exports.requireSignin = expressJWT({secret: process.env.JWT_SECRET, algorithms: ['HS256']});

exports.authMiddleware = (req, res, next) => {
    
    // avaiable from requireSignon if matches the secret 
    const authId = req.user._id;

    User.findOne({_id: authId}).exec((err, user) => {
        if (!user) {
            return res.status(400).json({
                error: "User not found"
            })
        }

        // if (user.role !== "subscriber") {
        //     return res.status(400).json({
        //         error: "admin resource access deny"
        //     })
        // }

        // add profile property to req
        req.profile = user;
        console.log("user profile: ", req.profile);
        next();
    })
}

exports.adminMiddleware = (req, res, next) => {
    // avaiable from requireSignon if matches the secret 
    const adminId = req.user._id;

    User.findOne({_id: adminId}).exec((err, user) => {
        if (!user) {
            return res.status(400).json({
                error: "User not found"
            })
        }

        if (user.role !== "admin") {
            return res.status(400).json({
                error: "admin resource access deny"
            })
        }

        // add profile property to req
        req.profile = user;
        console.log(req.profile);
        next();
    });
};




exports.forgotPassword = (req, res) => {

    const {email} = req.body;

    User.findOne({email: email}).exec((err, user) => {

        if (!user) {
            return res.status(400).json({error: "User not found"})
        }

        const token = jwt.sign({name: user.name}, process.env.JWT_RESET_PASSWORD, {expiresIn: "5m"});

        // Create sendEmail params 
        const params = forgotPasswordEmailParams(email, token);


        // update resetPassword link to db
        user.updateOne({resetPasswordLink: token}).exec((err, success) => {
            if (err) {
                return res.status(400).json({error: "Password reset failed, try againa later"});
            }


            const sendEmail = ses.sendEmail(params).promise();
            sendEmail
                .then(data => {
                    console.log("email submitted to ses", data)
                    res.json({message: "Email has been sent, please follow instruction to complete reset password"});
                })
                .catch(error => {
                    console.log("ses reset password failed", error)
                    res.json({message: "Can not verify your email"});
                })
        })
    })
};


exports.resetPassword = (req, res) => {

    const {resetPasswordLink, newPassword} = req.body;

    // check if token is expired
    if (resetPasswordLink) {
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, (err, decoded) => {
            if (err) {
                return res.status(400).json({
                    error: "token is expired"
                })
            }

            User.findOne({resetPasswordLink: resetPasswordLink}).exec((err, user) => {

                if (!user) {
                    return res.status(400).json({
                        error: "Not a valid token"
                    })
                }


                const updateUserInfo = {
                    password: newPassword,
                    // set reset password link back to empty
                    resetPasswordLink: ""
                };
                
                // overwrite the eariler user object
                user = _.extend(user, updateUserInfo);
                user.save((err, result) => {
                    if (err) {
                        return res.status(400).json({error: "password can not reset, try again later"});
                    }
                    return res.json({message: "Successfully reset your password"});
                })
            })
        });
    }
}



exports.authUpdateDeleteLink = (req, res, next) => {
    const {id} = req.params;

    Link.findOne({_id: id}).exec((err, data) => {
        if (err) {
            return res.status(400).json({error: "Could not find link"});
        }

        // id is from requiredSignin
        let authUser = data.postedBy._id.toString() === req.user._id.toString();

        if (!authUser) {
            return res.status(400).json({error: "You are not ahthorized to Delete or Update link"});
        }

        next();
    })
}