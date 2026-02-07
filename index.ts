import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io'; 
import connectDB from './config/db';
const app = express();
const httpServer = createServer(app);




app.get('/', (req, res) => {
    res.send('Hello World!');
} );

connectDB().then(() => {
    console.log('Connected to MongoDB');
}
).catch(() => {
   console.error('Failed to connect to MongoDB');
});



app.listen(3000, () => {
    console.log('Server is running on port 3000');
});