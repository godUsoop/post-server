const Category = require("../models/category");
const Link = require("../models/link");
const slugify = require("slugify");
const formidable = require("formidable");
const AWS = require("aws-sdk");
const {v4 : uuidv4} = require('uuid');
const fs = require("fs");



const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})


exports.create = (req, res) => {


    const { name, image, content } = req.body;
    // image data
    const base64Data = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const type = image.split(';')[0].split('/')[1];

    const slug = slugify(name);
    let category = new Category({ name, content, slug });

    const params = {
        Bucket: 'mini111',
        Key: `category/${uuidv4()}.${type}`,
        Body: base64Data,
        ACL: 'public-read',
        ContentEncoding: 'base64',
        ContentType: `image/${type}`
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.log(err);
            res.status(400).json({ error: 'Upload to s3 failed' });
        }
        console.log('AWS UPLOAD RES DATA', data);
        category.image.url = data.Location;
        category.image.key = data.Key;
        category.postedBy = req.user._id;

        // save to db
        category.save((err, success) => {
            if (err) {
                console.log(err);
                res.status(400).json({ error: 'Duplicate category' });
            }
            return res.json(success);
        });
    });
}

exports.list = (req, res) => {
    // display all category
    Category.find({}).exec((err, result) => {
        if (err) {
            return res.status(400).json({error: "Category can not load"})
        }
        
        return res.json(result);
    })
};


exports.read = (req, res) => {

    const {slug} = req.params;
    let limit = req.body.limit ? parseInt(req.body.limit) : 10;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;


    // send the user info who create the category
    Category.findOne({slug}).populate("postedBy", "_id name username").exec((err, category) => {
        if (err) {
            return res.status(400).json({error: "could not load category"});
        }
        
        // find all the links that they are accotiated with the Category
        Link.find({categories: category})
            .populate("postedBy", "_id name username")
            .populate("categories", "name")
            .sort({createdAt: -1})
            .limit(limit)
            .skip(skip)
            .exec((err, links) => {
                if (err) {
                    return res.status(400).json({error: "Could not load link"}); 
                }
                return res.json({category, links})
            });
     
    });


}

exports.update = (req, res) => {
    const {slug} = req.params;
    const {name, image, content} = req.body;


    // image data
    const base64Data = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const type = image.split(';')[0].split('/')[1];


    Category.findOneAndUpdate({slug}, {name, content}, {new: true}).exec((err, updated) => {
        if (err) {
            return res.status(400).json({error: "Could not update category"});
        }


        console.log("updated: ", updated);

        // remove old image and update new one if new image upload
        if (image) {
            // remove s3 image
            const deleteParams = {
                Bucket: 'mini111',
                Key: `${updated.image.key}`
            };

            s3.deleteObject(deleteParams, function(err, success) {
                if (err) {
                    console.log("s3 delete error: ", err)
                } else {
                    console.log("s3 deleted update: ", success)
                }
            });


            // upload new image to s3
            const params = {
                Bucket: 'mini111',
                Key: `category/${uuidv4()}.${type}`,
                Body: base64Data,
                ACL: 'public-read',
                ContentEncoding: 'base64',
                ContentType: `image/${type}`
            };
            s3.upload(params, (err, data) => {
                if (err) {
                    console.log(err);
                    res.status(400).json({ error: 'Upload to s3 failed' });
                }
                console.log('AWS UPLOAD RES DATA', data);
                updated.image.url = data.Location;
                updated.image.key = data.Key;
                
        
                // save to db
                updated.save((err, success) => {
                    if (err) {
                        console.log(err);
                        res.status(400).json({ error: 'Duplicate category' });
                    }
                    return res.json(success);
                });
            });

        } else {
            res.json(updated);
        }
    })
}

exports.remove = (req, res) => {
    
    const {slug} = req.params;
    Category.findOneAndRemove({slug}).exec((err, data) => {
        if (err) {
            return res.status(400).json({error: "Could not delete category"});
        }

        const deleteParams = {
            Bucket: 'mini111',
            Key: `${data.image.key}`
        };

        s3.deleteObject(deleteParams, function(err, success) {
            if (err) {
                console.log("s3 delete error: ", err)
            } else {
                console.log("s3 deleted update: ", success)
            }
        });
        
        
        res.json({message: "Category deleted"});

    })
}