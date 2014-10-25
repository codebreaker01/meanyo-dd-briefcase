'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Project Schema
 */
var ProjectSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Project name',
		trim: true
	},
	description : {
    type : String,
		required: 'Please fill Project description',
		trim : true
  },
  startDate : {
    type : Date,
		required: 'Please specify start date'
  },
  isActive : {
    type : Boolean
  },
  disciplines : {
    type : Array,
		required: 'Please specify skills/disciplines used'
  },
  galleryURLs : {
    type : Array
  },
  appStore : {
    type : String
  },
  playStore : {
    type : String
  },
  website : {
    type : String
  },
  smallLogo : {
    type : String
  },
  hasTeamMembers  :  [{
    type : Schema.ObjectId,
    ref : 'User'
  }],
  lastUpdated : {
    type:Date,
    default:Date.now
  }
});

ProjectSchema.set('toJSON', {
		transform: function (doc, ret, options) {
				ret.id = ret._id;
				delete ret._id;
				delete ret.__v;
		}
});

mongoose.model('Project', ProjectSchema);
