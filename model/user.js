var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var userSchema = new Schema({
	username: String,
    password: String,
    email: String,
    joined: {type: Date, default: Date.now}
});
var User = mongoose.model('User', userSchema);

module.exports = User;