import cors from "cors";
import express from "express";
import { prisma } from "db";
import {
    createConversationSchema,
    signinSchema,
    signupSchema
} from "common";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { authMiddleware, type AuthRequest } from "./middleware";

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
            data:{
                id: user.id,
                email : user.email,
                username: user.username
            },
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

app.post("/chat", authMiddleware , async (req , res) => {


    
})

app.get("/conversations", authMiddleware, async (req: AuthRequest, res) => {
    try {
        const conversations = await prisma.conversation.findMany({
            where: {
            userId: req.user!.userId,
            },
            orderBy: {
            updatedAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            data: conversations,
            error: null,
        });
        } catch (e) {
        return res.status(500).json({
            success: false,
            error: "INTERNAL_SERVER_ERROR",
            data: null,
        });
    }
});

app.post("/conversations" ,authMiddleware , async (req : AuthRequest , res) => {
    const {success , data} = createConversationSchema.safeParse(req.body);
    if(!success){
        return res.status(401).json({
            success:false,
            error:"INVALD_SCHEMA",
            data:null
        })
    }
    try {
        const conversation = await prisma.conversation.create({
            data: {
                title: data.title || "New Chat",
                userId: req.user!.userId,
            },
        });
    
        return res.status(201).json({
            success: true,
            data: conversation,
            error: null,
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            error: "INTERNAL_SERVER_ERROR",
            data: null,
        });
    }

})

app.get("/conversations/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
        const conversation = await prisma.conversation.findFirst({
            where: {
            id: req.params.id as string,
            userId: req.user!.userId,
            },
            include: {
            messages: {
                orderBy: {
                createdAt: "asc",
                },
            },
            },
        });

        if (!conversation) {
            return res.status(404).json({
            success: false,
            error: "CONVERSATION_NOT_FOUND",
            data: null,
            });
        }
        return res.status(200).json({
            success: true,
            data: conversation,
            error: null,
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            error: "INTERNAL_SERVER_ERROR",
            data: null,
        });
    }
});

app.delete("/conversations/:id" , authMiddleware , async(req : AuthRequest , res) =>{
    try{
        const conversation = await prisma.conversation.delete({
            where: {
                userId: req.user?.userId,
                id: req.params.id as string
            }
        })

        if(!conversation){
            return res.json(404).json({
            success: false,
            error: "DOES_NOT_EXIST",
            data: null,
        });
    }

        return res.status(200).json({
            success: true,
            data: conversation,
            error: null,
        });
    

    }catch(e){
        return res.status(500).json({
            success: false,
            error: "INTERNAL_SERVER_ERROR",
            data: null,
        });
    }

})

app.listen(3000)