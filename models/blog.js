const mongoose = require("mongoose")

const schema = mongoose.Schema(
    {
        "title":{type:String,required:true},
        "content":{type:String,required:true},
        "author":{type:String,required:true},
        "date":{type:Date,default:Date.now},
    }
)

const blogModel = mongoose.model("blogs",schema)
module.exports = {blogModel}
