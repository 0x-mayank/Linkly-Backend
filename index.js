import express from 'express'
import mongoose from 'mongoose';
import cors from 'cors';
import { nanoid } from 'nanoid';
import QRCode from 'qrcode';
import dotenv from "dotenv";
dotenv.config();


const app =express();
app.use(cors())
app.use(express.json())


// database connection
mongoose.connect(process.env.DATABASE_URL)
    .then(()=>console.log("DB connected successfully"))
    .catch((err)=>console.log("Failed to connect ERR: ", err))



const urlSchema = new mongoose.Schema({
    originalUrl:String,
    shortUrl:String,
    clicks:{
        type:Number,
        default:0
    },
});

const Url = mongoose.model('Url', urlSchema)

app.post('/api/short',async (req,res)=>{
    try{
        const { originalUrl } =req.body;
        if(!originalUrl) return res.status(400).json({error: "OriginalUrl error"});
        const  shortUrl  = nanoid(6)
        const short = shortUrl;
        const url = new Url({ originalUrl, shortUrl });
        const myUrl = `https://linkly-backend-r1cb.onrender.com/${shortUrl}`;
        const qrCodeImg = await QRCode.toDataURL(myUrl);

        await url.save();
        res.status(200).json({message: "Url Generated", shortUrl: myUrl,short,qrCodeImg})
    }
    catch (error){
        console.log(error)
        res.status(500).json({error: "Server Error"})
    }
})


app.get('/:shortUrl', async(req,res)=>{
    try{
        const { shortUrl }= req.params;
        const url = await Url.findOne({shortUrl});
        if(url){
            url.clicks++;
            await url.save();
            return res.redirect(url.originalUrl)
        }else{
            return res.status(404).json({error:'Url Not Found'});
        }
    }
    catch(error){
        console.log("ERRROR: ",error);
    }
})


app.listen(3000,()=>console.log("Sever is running on port 3000"))