const mongoose = require('mongoose');
require('dotenv').config();

function connectToMongo(callback) {
  return mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      callback && callback(mongoose);
    })
}

module.exports = connectToMongo;
