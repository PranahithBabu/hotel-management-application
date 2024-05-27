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

// const cors = require('cors')
// const cors = require('cors');

app.use(cors({}));
// app.use(
//     cors({
//         origin: 'http://localhost:5173',
//         method: ['GET','POST','PUT','DELETE'],
//         allowedHeaders: ['Content-Type']
//     })
// )

// const corsOptions = {
//     origin: 'http://localhost:5173', // Allow only the frontend to access
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed methods
//     credentials: true, // Allow cookies to be sent with requests
//     optionsSuccessStatus: 204 // Some legacy browsers choke on 204
//   };
  
// app.use(cors(corsOptions));

// app.use(express.urlencoded({ extended: true }));

app.get('/', (req,res) => {
    res.status(200).send('In GET');
})

// Register
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
        console.log("HERE: ",err.message);
        return res.status(500).send({message: err.message});
    }
});

// Login
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
        const token = jwt.sign({user : {id: user.id, email: user.email, isAdmin}}, process.env.JWT_SECRET, 
            // {expiresIn: '1h'}
        );
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

// Admin Home Page Requests
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
            // const {roomNumber, roomType, roomPrice, roomAvailability} = req.body;
            const roomExist = await Room.findById(_id);
            // const roomExist = await Room.findOne(roomNumber);
            if(!roomExist){
                return res.status(404).send({message:"Room doesnot Exist"});
            }else{
                const updatedRoom = await Room.findByIdAndUpdate(_id, {roomType, roomPrice, roomAvailability});
                // const updatedRoom = await Room.findByIdAndUpdate(roomNumber, {roomType, roomPrice, roomAvailability});
                updatedRoom.save();
                return res.status(200).send({updatedRoom, message:"Room Updated Successfully"});
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
            // console.log("IN DELETE: ", roomExist.roomPrice);
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

// Customer Home Page Requests
app.get('/c/home/:userId', verifyToken, async(req,res) => {
    try{
        const userId = req.params.userId;
        if (!req.user.isAdmin && userId === req.user.id) {
            let rooms = await Room.find();
            return res.status(200).json({ rooms });
        } else {
            return res.status(403).send({ message: "Access denied. Only customer can access this route or invalid token." });
        }
    }catch(err){
        console.log(err.message);
        return res.status(500).send({message: err.message});
    }
})

app.post('/c/home/:userId', verifyToken, async (req,res) => {
    try {
        const userId = req.params.userId;
        if (!req.user.isAdmin && userId === req.user.id) {
            const {_id, startDate, endDate} = req.body;
            const roomExist = await Room.findById(_id);
            if(roomExist && roomExist.roomAvailability){
                const newReservation = new Reservation({
                    userId: userId,
                    roomNumber: roomExist.roomNumber,
                    roomType: roomExist.roomType,
                    startDate: startDate,
                    endDate: endDate,
                    price: roomExist.roomPrice
                })
                await newReservation.save();
                const updatedAvailability = await Room.findByIdAndUpdate(_id, {roomAvailability: false});
                updatedAvailability.save();
                return res.status(200).send({newReservation, message: "New Reservation Added" });
            }else{
                return res.status(403).send({ message: "Room is already booked or doesnot exist" });
            }
        } else {
            return res.status(403).send({ message: "Access denied. Only customer can access this route or invalid token." });
        }
    }catch(err){
        console.log(err.message);
        return res.status(500).send({message: err.message});
    }
})

// Admin Dashboard Page Requests
app.post('/a/dashboard/:userId', verifyToken, async (req,res) => {
    try{
        const userId = req.params.userId;
        if (req.user.isAdmin && userId === req.user.id) {
            const {roomNumber, roomType, roomPrice, startDate, endDate} = req.body;
            const bookingExist = await Room.findOne({roomNumber});
            if(!bookingExist){
                return res.status(403).send({message: "Room doesnot exist"});
            }
            if(bookingExist.roomAvailability){
                const newReservation = new Reservation({
                    userId: userId,
                    roomNumber: roomNumber,
                    roomType: roomType,
                    startDate: startDate,
                    endDate: endDate,
                    price: roomPrice
                })
                await newReservation.save();
                const updatedAvailability = await Room.findOneAndUpdate({roomNumber: roomNumber}, {roomAvailability: false});
                await updatedAvailability.save();
                return res.status(200).send({ newReservation, message: "Room booked successfully" });
            }else{
                return res.status(403).send({ message: "Room already booked. Please check for other rooms." });
            }
        } else {
            return res.status(403).send({ message: "Access denied. Only admin can access this route or invalid token." });
        }
    }catch(err){
        console.log(err.message);
        return res.status(500).send({message: err.message});
    }
})

app.get('/a/dashboard/:userId', verifyToken, async (req,res) => {
    try{
        const userId = req.params.userId;
        if (req.user.isAdmin && userId === req.user.id) {
            let reservations = await Reservation.find();
            return res.status(200).json({ reservations });
        } else {
            return res.status(403).send({ message: "Access denied. Only admin can access this route or invalid token." });
        }
    }catch(err){
        console.log(err.message);
        return res.status(500).send({message: err.message});
    }
})

app.put('/a/dashboard/:userId', verifyToken, async (req,res) => {
    try{
        const userId = req.params.userId;
        if (req.user.isAdmin && userId === req.user.id) {
            const {_id, startDate, endDate, status} = req.body;
            if(status && !(status === "pending" || status === "approved" || status === "rejected" || status === "canceled" )){
                return res.status(403).send({message: "Invalid status message"});
            }
            const reservationExist = await Reservation.findById(_id);
            if(reservationExist){
                const updatedReservation = await Reservation.findByIdAndUpdate(_id, {
                    userId: userId,
                    ...(startDate && { startDate }),
                    ...(endDate && { endDate }),
                    status: status
                })
                await updatedReservation.save();

                // Getting DATE intact to block booked dates with available one's (In progress)
                if(status && status === "approved"){
                    const updatedBooking = await Reservation.findByIdAndUpdate(_id, {
                        bookedStartDate: reservationExist.startDate,
                        bookedEndDate: reservationExist.endDate
                    });
                    await updatedBooking.save();
                    return res.status(200).send({updatedBooking, message: "Reservation updated successfully with BOOKING" });
                }

                return res.status(200).send({updatedReservation, message: "Reservation updated successfully" });
            }else{
                return res.status(403).send({ message: "Reservation doesnot exist. Create a new one!" });
            }
        } else {
            return res.status(403).send({ message: "Access denied. Only admin can access this route or invalid token." });
        }
    }catch(err){
        console.log(err.message);
        return res.status(500).send({message: err.message});
    }
})

app.delete('/a/dashboard/:userId', verifyToken, async (req,res) => {
    try{
        const userId = req.params.userId;
        if (req.user.isAdmin && userId === req.user.id) {
            const {_id} = req.body;
            const reservationExist = await Reservation.findById(_id);
            const room = await Room.findOne({roomNumber: reservationExist.roomNumber});
            if(reservationExist){
                let deletedReservation = await Reservation.findByIdAndDelete(_id);
                room.roomAvailability = true;
                await room.save();
                return res.status(200).json({ deletedReservation, message: "Deleted reservation successfully" });
            }else{
                return res.status(404).json({ message: "Reservation doesnot exist. Or failed to delete" });
            }
        } else {
        return res.status(403).send({ message: "Access denied. Only admin can access this route or invalid token." });
        }
    }catch(err){
        console.log(err.message);
        return res.status(500).send({message: err.message});
    }
})

// Customer Dashboard Page Requests
app.get('/c/dashboard/:userId', verifyToken, async (req,res) => {
    try{
        const userId = req.params.userId;
        if (!req.user.isAdmin && userId === req.user.id) {
            let reservations = await Reservation.find({userId: userId});
            return res.status(200).json({ reservations });
        } else {
            return res.status(403).send({ message: "Access denied. Only customer can access this route or invalid token." });
        }
    }catch(err){
        console.log(err.message);
        return res.status(500).send({message: err.message});
    }
})

app.put('/c/dashboard/:userId', verifyToken, async (req,res) => {
    try{
        const userId = req.params.userId;
        if (!req.user.isAdmin && userId === req.user.id) {
            const {_id, startDate, endDate} = req.body;
            const reservationExist = await Reservation.findById(_id);
            if(!reservationExist){
                return res.status(403).send({ message: "Reservation doesnot exist. Plese make an reservation." });
            }
            const updatedReservation = await Reservation.findByIdAndUpdate(_id, {
                userId: userId,
                ...(startDate && {startDate}),
                ...(endDate && {endDate})    
            })
            await updatedReservation.save();
            return res.status(200).send({ message: "Reservation updated successfully" });
        } else {
            return res.status(403).send({ message: "Access denied. Only customer can access this route or invalid token." });
        }
    }catch(err){
        console.log(err.message);
        return res.status(500).send({message: err.message});
    }
})

app.delete('/c/dashboard/:userId', verifyToken, async (req,res) => {
    try{
        const userId = req.params.userId;
        if (!req.user.isAdmin && userId === req.user.id) {
            const {_id} = req.body;
            const reservationExist = await Reservation.findById(_id);
            const room = await Room.findOne({roomNumber: reservationExist.roomNumber});
            if(!reservationExist) {
                return res.status(403).send({message: "Reservation doesnot exist"});
            }
            await Reservation.findByIdAndDelete(_id);
            room.roomAvailability = true;
            await room.save();
            return res.status(200).send({message: "Deleted reservation successfully."})
        } else {
            return res.status(403).send({ message: "Access denied. Only customer can access this route or invalid token." });
        }
    }catch(err){
        console.log(err.message);
        return res.status(500).send({message: err.message});
    }
})

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

