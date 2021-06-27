const sql = require("./connection");
const User = require("./user.model");

const Image = function (image) {
  this.name = image.name;
  this.tag = image.tag;
  this.url = image.url;
  this.category = image.category;
  this.user_id = image.user_id;
};

Image.create = (newImage, result) => {
  sql.query("INSERT INTO images SET ?", newImage, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...newImage });
  });
};

Image.getImageById = (id, result) => {
  console.log(id);
  sql.query(`SELECT * FROM images WHERE id ="${id}" `, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found image: ", res[0]);
      result(null, res[0]);
      return;
    }
  });
};

Image.bookmarkImages = (id, result) => {
  sql.query(`UPDATE images SET favorite = 1 WHERE id ="${id}" `, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    if (res.affectedRows == 0) {
      result({ type: "not_found" }, null);
      return;
    }
    result(null, { id: id });
  });
};

Image.getbookmarkImages = (result) => {
  sql.query("SELECT * FROM images where favorite =1", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    result(null, res);
  });
};

Image.findAllImages = (category, user_id, result) => {
  console.log(category);
  let the_query = 'SELECT * FROM images WHERE user_id = "' + user_id + '" ';
  if (category)
    the_query =
      'SELECT * FROM images WHERE  user_id = "' +
      user_id +
      '" AND category = "' +
      category +
      '" ';
  console.log(the_query);
  sql.query(the_query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    result(null, res);
  });
};

Image.getImagesByNameAndTag = (value, result) => {
  sql.query(
    `SELECT * FROM images WHERE name LIKE "%${value}%" OR tag LIKE "%${value}%" `,
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      console.log("images: ", res);
      result(null, res);
    },
  );
};

module.exports = Image;
