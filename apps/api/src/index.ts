import cors from "cors";
import express from "express";
import { prisma } from "db";
import {signinSchema, signupSchema} from "common";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { authMiddleware } from "./middleware";

const app = express();
app.use(express.json());
app.use(cors())

app.post("/auth/signup", async (req , res) => {
    const {success , data} = signupSchema.safeParse(req.body);
    if(!success){
        return res.status(401).json({
            success:false,
            error:"INVALD_SCHEMA",
            data:null
        })
    }

    const checkEmailExists = await prisma.user.findUnique({
        where:{
            email:data.email
        }
    })

    if(checkEmailExists){
        return res.status(400).json({
            success:false,
            error:"EMAIL_ALREADY_EXISTS",
            data:null
        })
    }

    const hashPassword = await bcrypt.hash(data.password , 10)
    try{
        const user = await prisma.user.create({
            data:{
                email: data.email,
                username:data.username,
                password: hashPassword
            }
        })

        return res.status(201).json({
            success:true,
            data:user,
            error:null
        })
    }catch(e){
        return res.status(500).json({
            error:"INTERNAL_SERVER_ERROR",
            data:null, 
            success:false
        })
    }
})
app.post("/auth/signin" , async (req , res) => {
    const {success , data} = signinSchema.safeParse(req.body);
    if(!success){
        return res.status(401).json({
            success:false,
            error:"INVALD_SCHEMA",
            data:null
        })
    }

    const user = await prisma.user.findUnique({
        where:{
            email: data.email
        }
    })

    if(!user){
        return res.status(400).json({
            success:false,
            error:"USER_DOESNOT_EXISTS",
            data:null
        })
    }

    const checkPassword = await bcrypt.compare( data.password , user.password);

    if(!checkPassword){
        return res.status(400).json({
            success:false,
            error:"INCORRECT_PASSWORD",
            data:null
        })
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
    });

    return res.status(200).json({
        data:{
            user: {
                id: user.id,
                email: user.email,
                name: user.username,
            },
            token
        },
        success:true,
        error : null
    });
})

app.post("/chat", authMiddleware , (req , res) => {
    
})

app.get("/conversations" , authMiddleware ,(req , res) => {

})

app.post("/conversations" ,authMiddleware , (req , res) => {

})

app.get("/conversations/:id" , authMiddleware , (req , res) => {


})
app.delete("/conversations" , authMiddleware , (req , res) =>{

})