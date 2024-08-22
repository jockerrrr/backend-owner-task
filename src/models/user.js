const mongoose = require('mongoose')
const validator=require("validator")
const bcryptjs = require('bcryptjs')
const jwt=require("jsonwebtoken")

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        validate(value){
            let password=new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])");
            if(!password.test(value)){
                throw new Error("password should contain upper,lowercase letters,symbols,numbers");
            }
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(val){
            if(!validator.isEmail(val)){
                throw new Error('Invalid email')
            }
        }
    },
    age: {
        type: Number,
        default: 18,
        validate(val){
            if(val<=0){
                throw new Error("invalid age")
            }
        }

        
    },
    city:{
        type: String
    },
    tokens:[
        {
            type: String,
            required: true,
        }
    ]
})

UserSchema.pre('save', async function (next) {
    const user = this;
    
    // Only hash the password if it has been modified (or is new)
    if (user.isModified('password')) {
        user.password = await bcryptjs.hash(user.password, 8);
    }
    
});

//////////////////////////////////////////////////////////
UserSchema.statics.findByCredentials=async (em,pass)=>{
    const user=await User.findOne({email:em})
    // console.log(user)
    if(!user){
        throw new Error('Unable to login')
    }
    // console.log(user)
    const isMatch=await bcryptjs.compare(pass,user.password)
    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user     
}
//////////////////////////////////////////////////////

UserSchema.methods.generateToken=async function(){
    const user=this
    const secretKey="bassem123"
    const token=await jwt.sign({_id:user._id.toString()},secretKey)
    user.tokens=user.tokens.concat(token)
    await user.save()
    return token

}
//////////////////////////////////////////////////////
//to hide data
UserSchema.methods.toJSON= function(){
    const user=this

    const userObject=user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}

const User=mongoose.model('user',UserSchema)
module.exports = User


