const express = require("express");
const router = express.Router();


// import validators
const {categoryValidator, updateCategoryValidator} = require("../validators/category");
const {runValidation} = require("../validators");

const {requireSignin, adminMiddleware} = require("../controllers/auth");
const {create, list, read, update, remove} = require("../controllers/category");



// create, read, update, delete category

// using json
router.post("/category", categoryValidator, runValidation, requireSignin, adminMiddleware, create);

// useing form data
// router.post("/category", requireSignin, adminMiddleware, create);



router.get("/categories", list)
router.post("/category/:slug", read);
router.put("/category/:slug", updateCategoryValidator, runValidation, requireSignin, adminMiddleware, update);
router.delete("/category/:slug", requireSignin, adminMiddleware, remove);


module.exports = router;

