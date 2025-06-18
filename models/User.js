const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
      type: String,
      required: [true, 'Please add a name'],
      match: [
        /^(?:[A-Z][a-z]+ [A-Z][a-z]+|[ก-๙]{2,} [ก-๙]{2,})$/,
          'Please add a valid name in the format "Name Surname"'
      ]
  },
    email:{
        type:String,
        required:[true,'Please add an email'],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email'
        ]
    },
    photo: {
      type: String
    },
    tel: {
        type: String,
        required: [true, 'Please add a phone number'],
        unique: true,
        match: [
            /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/,
            'Please add a valid phone number'
        ]
    },
    thai_id: {
      type: String,
      default:""
    },
    role: {
        type:String,
        enum: ['user','lawyer','admin'],
        default: 'user'
    },
    password: {
        type:String,
        required:[true,'Please add a password'],
        minlength: 6,
        select: false
    },
    line_id:{
      type:String,
      default:""
    },
    location: {
      district: {
        type: String,
        required: [true, 'Please add a district']
      },
      province: {
        type: String,
        required: [true, 'Please add a province']
      }
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt:{
        type: Date,
        default: Date.now
    }
});

//Encrypt password using bcrypt
UserSchema.pre('save',async function(next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
});

//Sign JWT and return
UserSchema.methods.getSignedJwtToken=function() {
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE
    });
}

//Match user entered password to hashed password in database
UserSchema.methods.matchPassword=async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

module.exports = mongoose.model('User', UserSchema);
