import express from 'express';
import { PORT, mongoDBURL } from './config.js';
import mongoose from 'mongoose';
import { User } from './models/userModel.js';
import { Room } from './models/roomModel.js';
import { Reservation } from './models/reservationModel.js';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { verifyToken } from './middleware.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

app.get('/', (req,res) => {
    res.status(200).send('In GET');
})

app.post('/register', async(req,res) => {
    try{
        const {name, email, password, confirmPassword, secretKey} = req.body;
        if(!name || !email || !password || !confirmPassword) {
            return res.status(400).send({
                message: 'Input all the fields to register'
            });
        }
        if(secretKey && (secretKey !== process.env.SECRET_KEY)){
            return res.status(400).send({
                message: 'Invalid secret key'
            });
        }
        if(password !== confirmPassword){
            return res.status(400).send({
                message: 'Passwords doesnot match'
            });
        }
        const exist = await User.findOne({email});
        if(exist) {
            return res.status(400).send({
                message: 'User Exists'
            });
        }
        let newUser = new User({
            name, email, password, confirmPassword
        })
        const user = await User.create(newUser);
        return res.status(200).send(user);
    }catch(err){
        console.log(err.message);
        return res.status(500).send({message: err.message});
    }
});

app.post('/login', async(req,res) => {
    try{
        const {email, password, secretKey} = req.body;
        if(!email || !password){
            return res.status(400).send({
                message: "Input all the fields to login"
            });
        }
        if(secretKey && secretKey){

        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).send({
                message: "User not found. Please register"
            });
        }
        if(password !== user.password){
            return res.status(400).send({
                message: "Invalid password"
            });
        }

        // const role = getRole(user);

        const token = jwt.sign({user : {id: user.id, email: user.email}}, process.env.JWT_SECRET, {expiresIn: '1h'});

        // let redirectUrl;
        // if (role === 'admin') {
        //     redirectUrl = '/home/admin';
        // } else {
        //     redirectUrl = '/home/customer';
        // }
        // res.redirect(redirectUrl);
        return res.json({token});
    }catch(err){
        console.log(err.message);
        return res.status(500).send({message: err.message});
    }
});

app.get('/home/admin', verifyToken, async(req,res) => {
    // const {roomNumber, roomType, roomPrice, roomAvailability} = req.body;
    try{
        // if(userRole !== 'admin'){
        //     return res.status(500).send({
        //         message: "Not admin"
        //     });
        // }
        let rooms = await Room.find();
        return res.status(200).json(rooms);
    }catch(err){
        console.log(err.message);
        return res.status(500).send({message: err.message});
    }
});

app.get('/home/customer', verifyToken, async(req,res) => {
    try{
        // if(userRole !== 'customer'){
        //     return res.status(500).send({
        //         message: "Not customer"
        //     });
        // }
        let rooms = await Room.find();
        return res.status(200).json(rooms);
    }catch(err){
        console.log(err.message);
        return res.status(500).send({message: err.message});
    }
});

try{
    mongoose
        .connect(mongoDBURL)
        .then(() => {
            console.log('DB Connected!');
            app.listen(PORT, () => {
                console.log(`App is started at port: ${PORT}`);
            });
        })
}catch(err){
    console.log(err);
}

