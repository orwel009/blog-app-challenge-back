const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")

const app = express()

const users = require("./models/user")
const {userModel} = require("./models/user")
const blogs = require("./models/blog")
const {blogModel} = require("./models/blog")

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
    ).catch(
        (error)=>{
            res.json(error)
        }
    )
})

app.post("/signin",(req,res)=>{
    let input = req.body
    userModel.find({"email":input.email}).then(
        (response)=>{
            if (response.length>0) {
                let dbpassword = response[0].password
                bcryptjs.compare(input.password,dbpassword,(error,isMatch)=>{
                    if (isMatch) {
                        jwt.sign({email:input.email},"blog-challenge-app",{expiresIn:"1d"},
                            (error,token)=>{
                            if (error) {
                                res.json({"status":"unable to create token"})
                            } else {
                                res.json({"status":"succes","userId":response[0]._id,"token":token})
                            }
                        })
                    } else {
                        res.json({"status":"Invalid credentials"})
                    }
                })
            } else {
                res.json({"status":"user not found"})
            }
        }
    ).catch(
        (error)=>{
            res.json(error)
        }
    )
})

app.post("/addBlog",(req,res)=>{
    let token = req.headers["token"]
    jwt.verify(token,"blog-challenge-app",(error,decoded)=>{
        if (error) {
            res.json({"status":"unauthorized access"})
        } else {
            if(decoded)
                {
                    userEmail = decoded.email
                    userModel.findOne({"email":userEmail}).then(
                        (response)=>{
                            const currentUser = response.name
                            let input = req.body
                            input.author=currentUser
                            let blog = new blogModel(input)
                            console.log(blog)
                            blog.save()
                            res.json({"status":"success"})
                        }
                    ).catch(
                        (error)=>{
                            res.json(error)
                        }
                    )
                }
        }
    })
})

app.post("/editBlog",(req,res)=>{
    let token = req.headers["token"]
    let blogId = req.body._id;
    jwt.verify(token,"blog-challenge-app",(error,decoded)=>{
        if (error) {
            res.json({"status":"unauthorized access"})
        } else {
            if(decoded)
                {
                    blogModel.findOne({"_id":blogId}).then(
                        (response)=>{
                            console.log(response)
                            Object.assign(response, req.body);
                            response.date = new Date()
                            response.save()
                            res.json({"status":"success"})
                        }
                    ).catch(
                        (error)=>{
                            res.json(error)
                        }
                    )
                }
        }
    })
})


app.listen(8080,()=>{
    console.log("Server Started")
})