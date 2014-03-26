var User = require('../model/user.js');

module.exports.controller = function(app) {
	/**
	 * Handle user login
	 */
	app.post('/login', function(req, res) {
		var email = req.body.email;
		var password = req.body.password;
		User.findUserByEmail(email, function(err, users) {
			if (err) {
				res.send({
					status: 'error',
					message: err
				});
				return console.error(err);
			}
			if (users && users.length) { //user found
				if (users[0].password == password) { 
					setSession(req, users[0]);
					res.send({ //password match
						status: 'success',
						message: 'Login Successful!'
					});	
				} else { //password does not match
					res.send({
						status: 'failure',
						message: 'Username and password does not match'
					});
				}
			} else { //user not found
				res.send({
					status: 'failure',
					message: 'User not found!'
				});
			}
		});
	});

	/**
	 * Handle user signup
	 */
	app.post('/signup', function(req, res) {
		var username = req.body.username;
		var email = req.body.email;
		var password = req.body.password;
		//check existing username and email
		User.findUserByUsername(username, function(err, users) {
			if (err) {
				res.send({
					status: 'error',
					message: err
				});
				return;
			}
			if (users && users.length) { //existing user
				res.send({
					status: 'failure',
					message: 'Username '  + username + ' already exists!'
				});
			} else {
				User.findUserByEmail(email, function(err, users) {
					if (err) {
						res.send({
							status: 'error',
							message: err
						});
						return;
					}
					if (users && users.length) { //existing user
						res.send({
							status: 'failure',
							message: 'Email '  + email + ' already exists!'
						});
					} else { //success
						//create user
						var userModel = new User({
							username: username,
							email: email,
							password: password
						});
						userModel.save(function(err, user) {
							if (err) {
								res.send({
									status: 'error',
									message: 'Error during signup.. Try again later..'
								});
								return console.err(err);
							} else {
								setSession(req, user);
								res.send({
									status: 'success',
									message: 'User created'
								});
							}
						});
					}
				});
			}
		});
	});
	
	function setSession(req, user) {
		debugger;
		req.session.user = user._id;
		req.session.username = user.username;
		req.session.email = user.email;
	}
};