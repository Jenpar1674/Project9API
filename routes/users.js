var express = require('express');
var router = express.Router();
// const User = require("../models").Users;

function asyncHandler(cb){
  return async (req,res, next) => {
      try {
          await cb(req, res, next);
      } catch(err) {
          next(err);
      }
  }
}
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


module.exports = router;
