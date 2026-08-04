const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.service")

async function userRegisterController(req, res){
    const { email, password, name} = req.body; 

    const isExists = await userModel.findOne({
        email:email
    })

    if(isExists){
        return res.status(422).json({
            message: "User already regesterd",
            status: "failed"
        })
    }

    const user = await userModel.create({
        name, email, password
    })

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn:"3d"})

    res.cookie("token", token)

    res.status(201).json({
        user: {
            _id: user._id,
            name: user.name,
            email: user.email
        },token
    })
}

/**
 * 
 * asdfasdf 
 * asdasd 
 */
async function userLoginController(req, res){
    const {email, password} = req.body;

    const user = await userModel.findOne({email}).select("+password")

    if(!user){
        res.status(401).json({
            message: "Email is invalid!"
        })
    }

    const isValidPassword = user.comparePassword(password)

    if(!isValidPassword){
        res.status(401).json({
            message: "Email or password invalid!"
        })
    }

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "3d"})

    res.cookie("token", token)
    
    res.status(201).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token
    })

    await emailService.sendRegisterationEmail(user.email, user.name)
}

module.exports = {userRegisterController, userLoginController}