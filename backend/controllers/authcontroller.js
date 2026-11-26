import User from '../models/usermodel.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  sendVerificationEmail,
  sendForgotPasswordEmail
} from "../utils/emailService.js";
// to register a user
export const register =async(req,res) =>{
  try {
    const {name,email,password,role} =req.body;
    const userExist = await User.findOne({email});

    if(userExist){
      return res.status(400).json({
        success:false,
        message:"User already exisits",
      });
    }

    const hashedPassword =await  bcrypt.hash(password, 10);
    const userRole =role || "user";

    // to generate 6 digits OTP
     const verificationOTP =Math.floor(100000 + Math.random() * 900000).toString();
     const verificationOTPExpires = Date.now() + 10  * 60 * 1000 //10mins

     const user =await User.create({
      name,
      email,
      password: hashedPassword,
      role : userRole,
      verificationOTP,
      verificationOTPExpires
     });

     // to send the verification email
     try {
       await sendVerificationEmail(email,name,verificationOTP);

     } catch (error) {
      console.error("Failed to send verification email",error);
     }

     res.status(201).json({
      success:true,
      message:"Account created successfully! Please check your email for the 6-digit verification code. ",
      user :{
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified : false
      }
     })
  } catch (error) {
     res.status(500).json({
      success:false,
      message:error.message
     })
  }
}

// to login a user
export const login = async(req,res) =>{
  try {
    const {email , password} = req.body;
    const user = await User.findOne({email});
    if(!user){
      return res.status(400).json({
        success:false,
        message:"Invalid email or password."
      });
    }

    if(!user.isVerified){
      return res.status(401).json({
        success:false,
        message:"Please verify your email address before logging in."
      })
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return res.status(400).json({
        success:false,
        message:"Invalid email or password."
      })
    }

    // to generate a token
    const token = jwt.sign({id: user._id,role:user.role}, process.env.JWT_SECRET, { expiresIn:"7d"});

    res.status(200).json({
      success:true,
      message:"Login successfull!",
      token,
      user :{
        name:user.name,
        email:user.email,
        role:user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message
    })
  }
}


// to verify the email
export const verifyEmail = async(req,res) =>{
  try {
    const {email,otp} = req.body;
    if(!email || !otp){
      return res.status(400).json({
        success:false,
        message:"Email and OTP are required."
      })
    }

    const user = await User.findOne({
      email,
      verificationOTP:otp,
      verificationOTPExpires :{$gt :Date.now()}
    });

    if(!user){
      return res.status(400).json({
        success:false,
        message:"Invalid or expired OTP"
      });
    }

    user.isVerified =true;
    user.verificationOTP = undefined;
    user.verificationOTPExpires = undefined;
    await user.save();

    res.status(200).json({
      success:true,
      message:"Email verified successfully! You can now log in."
    });
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message
    })
    
  }
}

// if user forgot the password
export const forgotPassword = async(req,res) =>{
  try {
    const {email} =  req.body;
    if(!email){
      return res.status(400).json({
        success:false,
        message:"Email is required"
      });
    }

    const user = await User.findOne({email});
    if(!user){
      return res.status(404).json({
        success:false,
        message:'User with this email not found'
      })
    }

    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const resetOTPExpires = Date.now() + 10 * 60 * 1000//10mins

    user.resetPasswordOTP = resetOTP;
    user.resetPasswordOTPExpires = resetOTPExpires;
    await user.save();

    try {
      await sendForgotPasswordEmail(email,user.name,resetOTP);
    } catch (error) {
      console.error("Failed to send reset email:",error);
      
    }

    res.status(200).json({
      success:true,
      message:"Password reset OTP sent to your email"
    });

  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message
    })
  }

}

//to reset the password
export const resetPassword = async(req,res) =>{
  try {
    const {email,otp,newPassword} =req.body;
    if(!email || !otp || !newPassword){
      return res.status(400).json({
        success:false,
        message:"Email,OTP and new password are required"
      });
    }
    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() }
    });

    if(!user){
      return res.status(400).json({
        success:false,
        message:"Invalid or  Expired OTP"
      })
    }

    // to hash new password
    const hashedPassword = await bcrypt.hash(newPassword,10);
    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;

    await user.save()

    res.status(200).json({
      success:true,
      message:"Password reset successful You can now log in with your new password."
    })
  } catch (error) {
    res.status(500).json({
      success:false,
      message: error.message
    });
  }
}