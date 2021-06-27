var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const user = require("../controllers/user.controller.js");
const multer = require("multer");
const config = require("../config");

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, config.accessTokenSecret, (err, user) => {
      if (err) {
        console.log(err);
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    console.log(file);
    var filetype = "";
    if (file.mimetype === "image/gif") {
      filetype = "gif";
    }
    if (file.mimetype === "image/png") {
      filetype = "png";
    }
    if (file.mimetype === "image/jpeg") {
      filetype = "jpg";
    }
    cb(null, "image-" + Date.now() + "." + filetype);
  },
});

var upload = multer({ storage: storage });

router.post("/user", user.create);
router.get("/users", user.findAll);
router.post("/login", user.login);
router.put("/update", authenticateJWT, user.update);

router.post(
  "/upload/image",
  authenticateJWT,
  upload.single("file"),
  user.uploadImage,
);

router.get("/download/image", authenticateJWT, user.downoladImage);
router.post("/bookmark/image", authenticateJWT, user.bookmarkImages);
router.get("/bookmark/images", authenticateJWT, user.getbookmarkImages);
router.get("/images", authenticateJWT, user.findAllImages);
router.get("/image", authenticateJWT, user.getImagesByNameAndTag);

module.exports = router;
