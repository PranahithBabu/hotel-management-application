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
        if(password !== confirmPassword){
            return res.status(400).send({
                message: 'Passwords doesnot match'
            });
        }
        let isAdmin = false;
        if(secretKey && (secretKey === process.env.SECRET_KEY)){
            isAdmin = true;
        }
        const exist = await User.findOne({email});
        if(exist) {
            return res.status(400).send({
                message: 'User Exists'
            });
        }
        let newUser = new User({
            name, email, password, confirmPassword, isAdmin
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
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).send({
                message: "Input all the fields to login"
            });
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
        const isAdmin = user.isAdmin;
        const token = jwt.sign({user : {id: user.id, email: user.email, isAdmin}}, process.env.JWT_SECRET, {expiresIn: '1h'});
        if(isAdmin){
            return res.json({token, redirect: '/a/home', id: user.id});
        }else{
            return res.json({token, redirect: '/c/home', id: user.id});
        }
    }catch(err){
        console.log(err.message);
        return res.status(500).send({message: err.message});
    }
});

app.post('/a/home/:userId', verifyToken, async (req,res) => {
    try{
        const userId = req.params.userId;
        if (req.user.isAdmin && userId === req.user.id) {
            const {roomNumber, roomType, roomPrice, roomAvailability} = req.body;
            const roomExist = await Room.findOne({roomNumber});
            if(roomExist){
                return res.status(401).send({message: "Room Exists"});
            }
            const newRoom = new Room({
                userId, roomNumber, roomType, roomPrice, roomAvailability
            })
            newRoom.save();
            return res.status(200).send({message: "New Room Added" });
        } else {
            return res.status(403).send({ message: "Access denied. Only admin can access this route or invalid token." });
        }   
    }catch(err){
        console.log(err.message);
        return res.status(500).send({message: err.message});
    }
})

app.get('/a/home/:userId', verifyToken, async(req,res) => {
    try{
        const userId = req.params.userId;
        if (req.user.isAdmin && userId === req.user.id) {
            let rooms = await Room.find();
            return res.status(200).json({ rooms });
        } else {
            return res.status(403).send({ message: "Access denied. Only admin can access this route or invalid token." });
        }
    }catch(err){
        console.log(err.message);
        return res.status(500).send({message: err.message});
    }
});

app.put('/a/home/:userId', verifyToken, async (req,res) => {
    try{
        const userId = req.params.userId;
        if (req.user.isAdmin && userId === req.user.id) {
            const {_id, roomNumber, roomType, roomPrice, roomAvailability} = req.body;
            const roomExist = await Room.findById(_id);
            if(roomExist){
                const updatedRoom = await Room.findByIdAndUpdate(_id, {roomPrice, roomAvailability});
                updatedRoom.save();
                return res.status(200).send({updatedRoom, message:"Room Updated Successfully"})
            }else{
                return res.status(404).send({message:"Room doesnot Exist"})
            }
        } else {
            return res.status(403).send({ message: "Access denied. Only admin can access this route or invalid token." });
        }
    }catch(err){
        console.log(err.message);
        return res.status(500).send({message: err.message});
    }
})

app.delete('/a/home/:userId', verifyToken, async (req,res) => {
    try {
        const userId = req.params.userId;
        if (req.user.isAdmin && userId === req.user.id) {
            const {_id} = req.body;
            const roomExist = await Room.findById(_id);
            if(roomExist){
                const deletedRoom = await Room.findByIdAndDelete(_id);
                return res.status(200).send({ deletedRoom, message: "Deleted Room Successfully" });
            }else{
                return res.status(403).send({ message: "Room doesnot Exist" });
            }
        } else {
            return res.status(403).send({ message: "Access denied. Only admin can access this route or invalid token." });
        }
    }catch(err){
        console.log(err.message);
        return res.status(500).send({message: err.message});
    }
})

app.get('/c/home/:userId', verifyToken, async(req,res) => {
    try{
        const userId = req.params.userId;if (!req.user.isAdmin && userId === req.user.id) {
            let rooms = await Room.find();
            return res.status(200).json({ rooms });
        } else {
            return res.status(403).send({ message: "Access denied. Only customer can access this route or invalid token." });
        }
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

