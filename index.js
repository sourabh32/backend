import express from "express"
import path from "path"
import mongoose from "mongoose"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
import bcyrpt from "bcrypt"
const app = express()
const users = []

mongoose.connect("mongodb://127.0.0.1:27017",{
    dbname:"backend"
}).then(()=> console.log("connected sucsessfuly"))
.catch((e)=>console.log(e))

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String
})
const User = mongoose.model("users",userSchema)

//middleware
app.use(cookieParser())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(path.resolve(),"public")))

const isAuthenticated = async (req,res,next)=>{
    const {token} = req.cookies
    if(token){
        const  decodedData = jwt.verify(token,"bakasur")
        req.user = await User.findById(decodedData._id)
        next()
    }
    else{
        res.render("login")
    }
}

//setting up view engine
app.set("view engine","ejs")

app.get("/",isAuthenticated,(req,res)=>{
   
    res.render("logout",{name:req.user.name})
},)
app.get("/register",(req,res)=>{
   
    res.render("register")
},)


app.post("/login", async (req,res)=>{
    const {email, password} = req.body
    let user =await User.findOne({email})
    if(!user){
       return res.redirect("/register")
    }
    const isMatch = await  bcyrpt.compare(password,user.password)
    if (!isMatch) return res.render("login",{email,message:"incorrect Pssword"})
    const token = jwt.sign({_id:user._id},"bakasur")

    res.cookie("token",token,{httpOnly:true,expires: new Date(Date.now() +60*1000)})
    res.redirect("/")

})
app.post("/register",async (req,res)=>{
   const {name,email,password} = req.body
   
   let user  = await User.findOne({email})
   if(user){
   return res.redirect("/")
   }
  const hashed = await bcyrpt.hash(password,10)
    user= await User.create({name,email,password:hashed})
    const token = jwt.sign({_id:user._id},"bakasur")

    res.cookie("token",token,{httpOnly:true,expires: new Date(Date.now() +60*1000)})
    res.redirect("/")
})
app.get("/logout",(req,res)=>{
    res.cookie("token",null,{httpOnly:true,expires: new Date(Date.now())})
    res.redirect("/")
})





app.post("/", async (req,res)=>{
    const {name,email} =req.body
   await Mssg.create({name,email})
   res.redirect("/sucsess")
})


app.listen(5000,()=>{
    console.log("listening at 5000")
})


