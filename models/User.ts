import mongoose, { Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config({ path: './config/config.env' });

const secretKey = process.env.THAI_ID_SECRET_KEY!;
const secondKey = process.env.SECOND_SECRET!;



export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  photo?: string;
  tel: string;
  thai_id?: string;
  role: 'user' | 'lawyer' | 'admin';
  password: string;
  line_id?: string;
  location: {
    district: string;
    province: string;
  };
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;

  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getDecryptedThaiId(): string | null;
}

const UserSchema = new mongoose.Schema({
  name: {
      type: String,
      required: [true, 'Please add a name'],
      match: [
        /^(?:[A-Za-z][a-z]+ [A-Za-z][a-z]+|[ก-๙]{2,} [ก-๙]{2,})$/,
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

// Encrypt password and thai_id before save
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (this.isModified('thai_id') && this.thai_id) {
    const encrypted = CryptoJS.AES.encrypt(this.thai_id, secretKey).toString();
    const doubleEncrypted = CryptoJS.TripleDES.encrypt(encrypted, secondKey).toString();
    this.thai_id = doubleEncrypted;
  }

  next();
});

// Decrypt thai_id
UserSchema.methods.getDecryptedThaiId = function () {
  if (!this.thai_id) return null;

  const tripleDesDecrypted = CryptoJS.TripleDES.decrypt(this.thai_id, secondKey).toString(CryptoJS.enc.Utf8);
  const originalValue = CryptoJS.AES.decrypt(tripleDesDecrypted, secretKey).toString(CryptoJS.enc.Utf8);
  return originalValue;
};

// Sign JWT token
UserSchema.methods.getSignedJwtToken = function () {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT_SECRET environment variable is not defined');

  const expiresIn: string | number = process.env.JWT_EXPIRE || '1h';

  return jwt.sign(
    { id: this._id },
    jwtSecret,
    { expiresIn } as jwt.SignOptions
  );
};


// Match password
UserSchema.methods.matchPassword = async function (enteredPassword:string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
