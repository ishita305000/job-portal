import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import authRouter from './routes/authRoutes.js';
import dns from "dns";
import userRouter from './routes/userroutes.js';
import companyRouter from './routes/companyroutes.js';
import jobRouter from './routes/jobroutes.js';
import applicationRouter from './routes/applicationroutes.js';
import interviewRouter from './routes/interviewroutes.js';
import savedRouter from './routes/savedroutes.js'
import inquiryRouter from './routes/inquiryroutes.js';
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");


const PORT =5000;
const app = express();

//DB
connectDB();


//middlewares
app.use(express.json());
app.use(cors({
  origin :["http://localhost:5173","http://localhost:5174"],
  credentials:true
}));

app.use('/uploads',express.static("uploads"));

//routes
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter);
app.use("/api/company",companyRouter);
app.use("/api/job",jobRouter);
app.use("/api/application",applicationRouter);
app.use("/api/interview",interviewRouter);
app.use("/api/application",applicationRouter);
app.use("/api/saved",savedRouter);
app.use("/api/inquiry",inquiryRouter);
app.get("/",(req,res) =>{
  res.send("API WORING")
});

app.listen(PORT, () =>{
  console.log(`Server Started on http://localhost:${PORT}`)
})