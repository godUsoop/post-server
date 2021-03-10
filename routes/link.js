const express = require("express");
const router = express.Router();


// import validators
const {linkValidator, updateLinkValidator} = require("../validators/link");
const {runValidation} = require("../validators");

const {requireSignin, authMiddleware, adminMiddleware, authUpdateDeleteLink } = require("../controllers/auth");
const {create, list, read, update, remove, viewCount, trending, trendingInCategory} = require("../controllers/links");



// create, read, update, delete category

// using json
router.post("/link", linkValidator, runValidation, requireSignin, authMiddleware, create);

// useing form data
// router.post("/category", requireSignin, adminMiddleware, create);

router.post("/links", requireSignin, adminMiddleware, list);
router.put("/view-count", viewCount);

router.get("/link/popular", trending);
router.get("/link/popular/:slug", trendingInCategory);
router.get("/link/:id", read);
router.put("/link/:id", updateLinkValidator, runValidation, requireSignin, authMiddleware, authUpdateDeleteLink,update);
router.put("/link/admin/:id", updateLinkValidator, runValidation, requireSignin, adminMiddleware, update);
router.delete("/link/:id", requireSignin, authMiddleware, authUpdateDeleteLink, remove);
router.delete("/link/admin/:id", requireSignin, adminMiddleware, remove);


module.exports = router;


