import mongoose from "mongoose";

export const connectDB = async(req,res) =>{
    await mongoose.connect("mongodb+srv://ishitasaxena3050_db_user:IAMsuhani3050@cluster0.i0qhpwx.mongodb.net/")  
    .then(() =>{
        console.log("DB CONNECTED");
    })
}