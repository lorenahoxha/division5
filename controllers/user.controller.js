const jwt = require("jsonwebtoken");
const fs = require("fs");
const fetch = require("node-fetch");
const download = require("image-downloader");
const cookieParser = require("cookie-parser");
const User = require("../models/user.model.js");
const Image = require("../models/image.model.js");
const config = require("../config");

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  const user = new User({
    email: req.body.email,
    fname: req.body.fname,
    lname: req.body.lname,
    password: req.body.password,
  });

  User.create(user, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Error on Creating the user",
      });
    else res.send(data);
  });
};

exports.findAll = (req, res) => {
  User.getAll((err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Error on geting the user.",
      });
    else res.send(data);
  });
};

exports.login = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }
  const user = new User({
    email: req.body.email,
    password: req.body.password,
  });

  User.login(user, (err, data) => {
    if (err) {
      res.status(500).send({
        message: "Error login User with email:" + req.body.email,
      });
    } else {
      console.log(data);
      const accessToken = jwt.sign(
        {
          username: data.email,
          id: data.id,
        },
        config.accessTokenSecret,
        { expiresIn: 60 * 60 },
      );
      res.send({ token: accessToken });
    }
  });
};

exports.update = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Data missing",
    });
  }
  User.updateById(req.user.id, new User(req.body), (err, data) => {
    if (err) {
      if (err.type === "not_found") {
        res.status(404).send({
          message: `User not Found`,
        });
      } else {
        res.status(500).send({
          message: "Error updating User with id " + req.user.id,
        });
      }
    } else res.send(data);
  });
};

exports.uploadImage = (req, res) => {
  if (!req.file) {
    res.status(500).send({
      message: "Missing file",
    });
  }

  if (!config.CATEGORIES.includes(req.body.category))
    res.status(500).send({
      message: "Invalid Category",
    });

  const image = new Image({
    name: req.file.filename,
    category: req.body.category,
    tag: req.body.tag,
    user_id: req.user.id,
    url: "http://localhost:3001/images/" + req.file.filename,
  });

  Image.create(image, (err, data) => {
    if (err) {
      res.status(500).send({
        message: "Error Uploading Image",
      });
    } else res.send(data);
  });
};

exports.downoladImage = (req, res) => {
  Image.getImageById(req.query.id, (err, data) => {
    if (err) {
      res.status(404).send({
        message: `Not found Image with id ${req.params.customerId}.`,
      });
    } else {
      const options = {
        url: data.url,
        dest: __dirname,
      };
      download
        .image(options)
        .then(({ filename }) => {
          console.log("Saved to", filename);
        })
        .catch((err) => console.error(err));

      res.send(data);
    }
  });
};

exports.bookmarkImages = (req, res) => {
  console.log(req.body.id);
  Image.bookmarkImages(req.body.id, (err, data) => {
    if (err) {
      res.status(404).send({
        message: `Error bookmarking Image with id ${req.body.id}.`,
      });
    } else res.send(data);
  });
};

exports.getbookmarkImages = (req, res) => {
  Image.getbookmarkImages((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving bookmarked images.",
      });
    else res.send(data);
  });
};

exports.findAllImages = (req, res) => {
  Image.findAllImages(req.query.category, req.user.id, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Images.",
      });
    else res.send(data);
  });
};

exports.getImagesByNameAndTag = (req, res) => {
  console.log(req.query.value);
  Image.getImagesByNameAndTag(req.query.value, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Images.",
      });
    else res.send(data);
  });
};
