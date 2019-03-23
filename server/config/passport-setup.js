const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./keys');
const User = require('../models/user-model');


passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.findById(id).then((user) => {
		done(null, user);
	});
});


passport.use(
	new GoogleStrategy({
		//options for the google strat
		callbackURL: '/auth/google/redirect',
		clientID: keys.google.clientID,
		clientSecret: keys.google.clientSecret
	}, (accessToken, refreshToken, profile, done) => {
		//passport callback function
		console.log(profile._json.image.url)
		User.findOne({ googleId: profile.id }).then((user) => {
			if (user) {
				done(null, user);
			} else {
				new User({
					username: profile.displayName,
					googleId: profile.id,
					thumbnail: profile._json.image.url
				}).save().then((user) => {
					console.log(user);
					done(null, user);
				});
			}
		});


	})
);