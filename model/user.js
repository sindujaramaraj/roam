var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var userSchema = new Schema({
	username: String,
    password: String,
    email: String,
    joined: {"type": Date, "default": Date.now},
    location: String
});

userSchema.statics.findUserByEmail = function(email, cb) {
	this.find({
		email: email
	}, cb);
};

userSchema.statics.findUserByUsername = function(username, cb) {
	this.find({
		username: username
	}, cb);
};

var User = mongoose.model('User', userSchema);

module.exports = User;