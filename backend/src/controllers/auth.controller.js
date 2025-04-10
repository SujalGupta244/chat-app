import cloudinary from "../lib/cloudinary.js"
import { generateToken } from "../lib/utils.js"
import User from "../models/user.model.js"
import bcrypt from 'bcryptjs'

const signup = async (req,res) =>{
    const {fullName, email, password} = req.body
    try {
        if(!password || !fullName || !email){
            return res.status(400).json({message:"Some Fields are empty"})
        }
        
        if(password.length < 6){
            return res.status(400).json({message:"Password must be at least 6 charaters"})
        }
        
        const user = await User.findOne({email})
        
        if(user){
            return res.status(400).json({message:"Email already exists"})
        }

        const salt = await bcrypt.genSalt(10)

        const hashedPass = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullName,
            email,
            password: hashedPass
        })

        if(newUser){
            generateToken(newUser._id, res)
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullName,
                email,
                profilePic: newUser.profilePic})
        }else{
            res.status(400).json({message: "Invalid User data"})
        }
    } catch (error) {
        console.log("Error in signup controller",error.message)
        res.status(500).json({message: "Internal server error"})
    }
}


const login = async(req,res) =>{

    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({message: "Invalid credentials"})
        }
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid credentials"})
        }

        generateToken(user._id, res)

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        })

    } catch (error) {
        console.log("Error in login controller",error.message)
        res.status(500).json({message: "Internal server error"})        
    }

}

const logout = async(req,res) =>{
    try {
        res.cookie("jwt","", {maxAge: 0})

        res.status(200).json({message: "Logged out successfully"})
        
    } catch (error) {
        console.log("Error in logout controller",error.message)
        res.status(500).json({message: "Internal server error"})
    }
}


const updateProfile = async(req, res) =>{
    try {
        const {profilePic} = req.body

        const userId = req.user._id
        // console.log(profilePic)
        if(!profilePic){
            return res.status(400).jsons({message: "Profile pic is required"})
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic,{
            folder: "chat_profile_images", //  folder name here
          })
        const uploadUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {new:true})

        res.status(200).json(uploadUser)



    } catch (error) {
        console.log("Error in updateProfile controller",error.message)
        res.status(500).json({message: "Internal server error"})
    }
}

const checkAuth = async(req, res) =>{
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in checkAuth controller",error.message)
        res.status(500).json({message: "Internal server error"})
    }
}

export {signup, login, logout, updateProfile, checkAuth}