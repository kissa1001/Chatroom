var mongoose = require('mongoose');
	var chatSchema = mongoose.Schema({
       userName: {type: String},
       msg: String,
       date: {type:Date, default: Date.now}
    });
    var Chat = mongoose.model('Message', chatSchema);
   module.exports= Chat;