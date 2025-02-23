import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import allRoutes from "./routes/allRoutes.js"
dotenv.config();
const app=express();
app.use(cors());
app.use(express.json());
app.use("/api",allRoutes);
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`The server is running port ${PORT}`);
})