import express from 'express';
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
const PORT = process.env.PORT || 5000;
app.use(express.json());

// app.use(cors({}));

// app.use(cors({
//     origin: 'https://hotel-management-frontend-9fdq.onrender.com',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
//   }));

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
  

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
            const {roomNumber, roomType, roomPrice, roomMaintenance} = req.body;
            const roomExist = await Room.findOne({roomNumber});
            if(roomExist){
                return res.status(401).send({message: "Room Exists"});
            }
            const newRoom = new Room({
                userId, roomNumber, roomType, roomPrice, roomMaintenance
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
            const {_id, roomNumber, roomType, roomPrice, roomMaintenance} = req.body;
            const roomExist = await Room.findById(_id);
            if(!roomExist){
                return res.status(404).send({message:"Room doesnot Exist"});
            }else{
                const updatedRoom = await Room.findByIdAndUpdate(_id, {roomType, roomPrice, roomMaintenance});
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
            if (roomExist) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                const overlappingDates = roomExist.unavailableDates.some(date => {
                    const bookedStart = new Date(date.start);
                    const bookedEnd = new Date(date.end);
                    return !date.roomAvailability && (start <= bookedEnd && end >= bookedStart);
                });
                if(!overlappingDates) {
                    const newReservation = new Reservation({
                        userId: userId,
                        roomNumber: roomExist.roomNumber,
                        roomType: roomExist.roomType,
                        startDate: startDate,
                        endDate: endDate,
                        price: roomExist.roomPrice,
                        status: "pending"
                    })
                    await newReservation.save();
                    return res.status(200).send({ newReservation, message: "New Reservation Added. Awaiting approval" });
                }
                else {
                    return res.status(403).send({ message: "Room is already booked for selected date range." });
                }
            }
            else {
                return res.status(403).send({ message: "Room doesnot exist" });
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
app.post('/a/dashboard/:userId', verifyToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        if (req.user.isAdmin && userId === req.user.id) {
            const { roomNumber, startDate, endDate, status } = req.body;
            if (!startDate || !endDate) {
                return res.status(400).send({ message: "Start and end dates are required" });
            }
            const room = await Room.findOne({ roomNumber });
            if (!room) {
                return res.status(403).send({ message: "Room does not exist" });
            }
            const newStartDate = new Date(startDate);
            const newEndDate = new Date(endDate);
            const isRoomAvailable = room.unavailableDates.every(date => {
                const existingStartDate = new Date(date.start);
                const existingEndDate = new Date(date.end);
                return newEndDate <= existingStartDate || newStartDate >= existingEndDate;
            });
            if (!isRoomAvailable) {
                return res.status(403).send({ message: "Room already booked for the selected dates. Please check for other rooms or dates." });
            }
            const newReservation = new Reservation({
                userId: userId,
                roomNumber: roomNumber,
                roomType: room.roomType,
                startDate: startDate,
                endDate: endDate,
                price: room.roomPrice,
                status: status
            });
            await newReservation.save();
            if(status && status==="approved"){
                room.unavailableDates.push({
                    start: startDate,
                    end: endDate,
                    roomAvailability: false
                });
            }
            await room.save();
            return res.status(200).send({ newReservation, message: "Room booked successfully" });
        } else {
            return res.status(403).send({ message: "Access denied. Only admin can access this route or invalid token." });
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ message: err.message });
    }
});

app.get('/a/dashboard/:userId', verifyToken, async (req,res) => {
    try{
        const userId = req.params.userId;
        if (req.user.isAdmin && userId === req.user.id) {
            let reservations = await Reservation.find();
            let rooms = await Room.find();
            return res.status(200).json({ reservations, rooms});
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
                    userId: reservationExist.userId,
                    ...(startDate && { startDate: new Date(startDate) }),
                    ...(endDate && { endDate: new Date(endDate) }),
                    status: status || reservationExist.status
                })

                if(status && status === "approved"){
                    const room = await Room.findOne({ roomNumber: reservationExist.roomNumber });
                    if (room) {
                        await room.unavailableDates.push({
                            start: reservationExist.startDate,
                            end: reservationExist.endDate,
                            roomAvailability: false
                        });
                        await room.save();
                    }
                    const updatedBooking = await Reservation.findByIdAndUpdate(_id, {
                        bookedStartDate: startDate,
                        bookedEndDate: endDate
                    });
                    return res.status(200).send({updatedBooking, message: "Reservation updated successfully with BOOKING" });
                }
                else if (status && (status === "rejected" || status === "canceled")) {
                    const room = await Room.findOne({ roomNumber: reservationExist.roomNumber });
                    if (room) {
                        room.unavailableDates = room.unavailableDates.filter(date => {
                            return !(new Date(date.start).toISOString() === new Date(startDate).toISOString() && new Date(date.end).toISOString() === new Date(endDate).toISOString());
                        });
                        await room.save();
                    }
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
                if (reservationExist.status === "approved") {
                    const { startDate, endDate } = reservationExist;
                    room.unavailableDates = room.unavailableDates.filter(date => {
                        const existingStartDate = new Date(date.start).toISOString();
                        const existingEndDate = new Date(date.end).toISOString();
                        return !(existingStartDate === new Date(startDate).toISOString() && existingEndDate === new Date(endDate).toISOString());
                    });
                    await room.save();
                }
                let deletedReservation = await Reservation.findByIdAndDelete(_id);
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
            return res.status(200).send({ message: "Reservation updated successfully", updatedReservation });
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
        .connect(process.env.MONGO_DB_URL)
        .then(() => {
            console.log('DB Connected!');
            app.listen(PORT, () => {
                console.log(`App is started at port: ${PORT}`);
            });
        })
}catch(err){
    console.log(err);
}

