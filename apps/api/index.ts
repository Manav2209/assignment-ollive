import cors from "cors";
import express from "express";

const app = express();
app.use(express.json());
app.use(cors())

app.post("/auth/signup", (req , res) => {

})
app.post("/auth/signin" , (req , res) => {
    
})