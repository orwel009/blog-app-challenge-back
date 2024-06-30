const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")

const app = express()

const users = require("./models/user")
const {userModel} = require("./models/user")

app.use(cors())
app.use(express.json())

mongoose.connect("mongodb+srv://orwel000:orwel123@cluster0.hyugd.mongodb.net/blogChallengeDB?retryWrites=true&w=majority&appName=Cluster0")

const generateHashedPassword = async(password)=>{
    const salt = await bcryptjs.genSalt(10) //assume the cost of salt
    return bcryptjs.hash(password,salt)  
}

app.post("/signup",async(req,res)=>{
    let input = req.body
    let hashedPassword = await generateHashedPassword(input.password)
    input.password = hashedPassword
    userModel.find({"email":input.email}).then(
        (response)=>{
            if (response.length>0) {
                res.json({"status":"email already exist"})
            } else {
                let user = new users.userModel(input)
                console.log(user)
                user.save()
                res.json({"status":"success"})
            }
        }
    ).catch()
})


app.listen(8080,()=>{
    console.log("Server Started")
})