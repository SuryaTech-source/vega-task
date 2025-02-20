const multer = require("multer");
const path = require("path");
const fs = require('fs')

function commonUpload(destinationPath) {

  var storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, destinationPath);
    },
    filename: function (req, file, callback) {
      var uploadName = file.originalname.split('.');

      var extension = '.' + uploadName[uploadName.length - 1];
      var fileName = uploadName[0] + Date.now().toString();
      fs.readFile(destinationPath + file.originalname, function (err, res) {
        if (!err) {
          callback(null, fileName + extension);
        } else {
          callback(null, fileName + extension);
        }
      });
    }
  });
  var uploaded = multer({ storage: storage, limits: { fieldSize: 25 * 1024 * 1024 } }); /**----{limits : {fieldNameSize : 100}}---*/
  return uploaded;
}
module.exports = { commonUpload };