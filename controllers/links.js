// create, list, read, update, remove
const Link = require("../models/link");
const User = require("../models/user");
const Category = require("../models/category");
const slugify = require("slugify");
const formidable = require("formidable");
const AWS = require("aws-sdk");
const {v4 : uuidv4} = require('uuid');
const fs = require("fs");

const {linkPublishParams} = require("../email/params");


AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});



// Create SES service object
const ses = new AWS.SES({apiVersion: '2010-12-01'});


exports.create = (req, res) => {

    const {title, url, categories, type, medium} = req.body;
    // console.table({title, url, categories, type, medium});
    
    const slug = url
    let link = new Link({title, url, categories, type, medium, slug});

    link.postedBy = req.user._id;


    // single category or categories; use postman
    // const arrCategories = categories && categories.split(",");
    // link.categories = arrCategories;

    link.save((err, data) => {
        console.log(err);
        if (err) {
            return res.status(400).json({error: "link save failed"})
        }

        res.json(data);


        // find all users in the category
        User.find({categories: {$in: categories}}).exec((err, users) => {
            if (err) {
                throw new Error(err);
                console.log("Error finding users to send email on link publish");
            }

            Category.find({_id: {$in: categories}}).exec((err, result) => {
                data.categories = result;


                // send email to those user who have matching categories
                for (let i=0; i < users.length; i ++) {
                    const params = linkPublishParams(users[i].email, data);
                    const sendEmail = ses.sendEmail(params).promise();

                    sendEmail
                        .then(success => {
                            console.log("email submitted to SES: ", success);
                            return;
                        })
                        .catch(failure => {
                            console.log("email submitted to SES: ", failure);
                            return;
                        })
                }
            })
        })
    })

}




exports.list = (req, res) => {

    let limit = req.body.limit ? parseInt(req.body.limit) : 10;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;


    Link.find({})
        .populate("postedBy", "name")
        .populate("categories", "name slug")
        .sort({createdAt: -1})
        .limit(limit)
        .skip(skip)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({error: "link can not display"});
            }
            return res.json(data);
        })

};

exports.viewCount = (req, res) => {
    const {link_Id} = req.body;
    Link.findByIdAndUpdate(link_Id, {$inc: {views: 1}}, {upsert: true, new: true}).exec((err, result) => {
        if (err) {
            return res.status(400).json({error: "Could not update view count"});
        }
        res.json(result);
    })
};






exports.read = (req, res) => {
    const {id} = req.params;
    console.log("ID:", id);
    Link.findOne({_id: id}).exec((err, data) => {
        if (err) {
            return res.status(400).json({error: "Error finding the link"});
        }
        res.json(data);
    })
};


exports.update = (req, res) => {

    const {id} = req.params;
    const {title, url, categories, type, medium} = req.body;
    Link.findOneAndUpdate({_id: id}, {title, url, categories, type, medium}, {new: true}).exec((err, updated) => {
        if (err) {
            console.log("error: ", err);
            return res.status(400).json({error: "Error updaing the link"});
        }
        res.json(updated);
    })
};



exports.remove = (req, res) => {

    const {id} = req.params;
    Link.findOneAndRemove({_id: id}).exec((err, data) => {
        if (err) {
            return res.status(400).json({error: "Error removing the link"});
        }

        res.json({message: "Link remove successfully"});
    })

};


exports.trending = (req, res) => {
    Link.find()
        .populate('postedBy', 'name')
        .populate("categories", "name")
        .sort({ views: -1 })
        .limit(5)
        .exec((err, links) => {
            if (err) {
                return res.status(400).json({
                    error: 'Links not found'
                });
            }
            res.json(links);
        });
};




exports.trendingInCategory = (req, res) => {
    const {slug} = req.params;

    Category.findOne({slug}).exec((err, category) => {
        if (err) {
            return res.stauts(400).json({error: "Could not load category"})
        }

        Link.find({categories: category})
            .populate('postedBy', 'name')
            .populate("categories", "name")
            .sort({views: -1})
            .limit(5)
            .exec((err, links) => {
                if (err) {
                    return res.status(400).json({error: "Could not load links"})
                }
                res.json(links);
            })
    })
}