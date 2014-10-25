'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
	return (this.provider !== 'local' || (password && password.length > 5));
};

/**
 * User Schema
 */
var UserSchema = new Schema({
	firstName: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in your first name']
	},
	lastName: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in your last name']
	},
	displayName: {
		type: String,
		trim: true
	},
	email: {
		type: String,
		trim: true,
		default: '',
		unique : 'Email already exists',
		validate: [validateLocalStrategyProperty, 'Please fill in your email'],
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	username: {
		type: String,
		unique: 'testing error message',
		required: 'Please fill in a username',
		trim: true
	},
	password: {
		type: String,
		default: '',
		validate: [validateLocalStrategyPassword, 'Password should be longer']
	},
	salt: {
		type: String
	},
	provider: {
		type: String,
		required: 'Provider is required'
	},
	providerData: {},
	additionalProvidersData: {},
	roles: {
		type: [{
			type: String,
			enum: ['user', 'admin']
		}],
		default: ['user']
	},
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	},

	/* DD-Brifcase specific properties */

	inProjects  : [{
    type : mongoose.Schema.ObjectId, ref : 'Projects'
  }],
  aboutMe : {
    type : String,
    require:true,
    validate: [validateLocalStrategyProperty, 'Please say something about yourself']
  },
	joiningDate : {
    type : Date
  },
  birthDate : {
    type : Date,
    require:true,
  },
  experience : {
    type : Number
  },
	phoneNumber : {
    type : String,
    require:true,
    validate: [validateLocalStrategyProperty, 'Please fill in your phone number'],
    match : [/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/, 'Please fill a valid phone number']
  },
  skills : {
    type : Array
  },
  linkedIn : {
    type : String
  },
  facebook : {
    type : String
  },
  github : {
    type : String
  },
  twitter : {
    type : String
  },
  dribble : {
    type : String
  },
  portfolio : {
    type : String
  },

	/* For reset password */
	resetPasswordToken: {
		type: String
	},
  	resetPasswordExpires: {
  		type: Date
  	}
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function(next) {
	if (this.password && this.password.length > 6) {
		this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
		this.password = this.hashPassword(this.password);
	}

	next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password) {
	if (this.salt && password) {
		return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
	} else {
		return password;
	}
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
	return this.password === this.hashPassword(password);
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
	var _this = this;
	var possibleUsername = username + (suffix || '');

	_this.findOne({
		username: possibleUsername
	}, function(err, user) {
		if (!err) {
			if (!user) {
				callback(possibleUsername);
			} else {
				return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
			}
		} else {
			callback(null);
		}
	});
};

/**
* Transform toJSON method to replace _id with id and remove __v.
*/
UserSchema.set('toJSON', {
		transform: function (doc, ret, options) {
				ret.id = ret._id;
				delete ret._id;
				delete ret.__v;
		}
});

mongoose.model('User', UserSchema);