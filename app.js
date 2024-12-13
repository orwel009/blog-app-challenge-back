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
                                res.json({"status":"success","userId":response[0]._id,"token":token})
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

app.post("/getEditBlog",(req,res)=>{
    let token = req.headers["token"]
    let blogId = req.body._id;
    jwt.verify(token,"blog-challenge-app",(error,decoded)=>{
        if (error) {
            res.json({"status":"unauthorized access"})
        } else {
            if (decoded) {
                blogModel.findOne({"_id":blogId}).then(
                    (data)=>{
                        res.json(data)
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

app.post("/deleteBlog",(req,res)=>{
    let token = req.headers["token"]
    let blogId = req.body._id;
    jwt.verify(token,"blog-challenge-app",(error,decoded)=>{
        if (error) {
            res.json({"status":"unauthorized access"})
        } else {
            if(decoded)
                {
                    blogModel.findByIdAndDelete(blogId).then(
                        (response)=>{
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

app.post("/viewBlog",(req,res)=>{
    let token = req.headers["token"]
    jwt.verify(token,"blog-challenge-app",(error,decoded)=>{
        if (error) {
            res.json({"status":"unauthorized access"})
        } else {
            if(decoded)
                {
                    let searchQuery = req.body.searchQuery || "";
                
                    // Define the search criteria
                    let searchCriteria = {};
                    if (searchQuery) {
                        let searchRegex = new RegExp(searchQuery, "i"); // case-insensitive search
                        searchCriteria = {
                            $or: [
                                { title: searchRegex },
                                { content: searchRegex },
                                { author: searchRegex }
                            ]
                        };
                    }
                    blogModel.find(searchCriteria).then(
                        (data)=>{
                            if (data.length>0) {
                                res.json(data)
                            } else {
                                res.json({"status":"No data found"})
                            }
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

app.post("/viewMyBlog",(req,res)=>{
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
                            blogModel.find({"author":response.name}).then(
                                (data)=>{
                                    res.json(data)
                                }
                            ).catch(
                                (error)=>{
                                    res.json(error)
                                }
                            )
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

app.post("/viewMyBlog",(req,res)=>{
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
                            blogModel.find({"author":response.name}).then(
                                (data)=>{
                                    res.json(data)
                                }
                            ).catch(
                                (error)=>{
                                    res.json(error)
                                }
                            )
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