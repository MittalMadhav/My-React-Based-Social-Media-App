const express = require('express');
const connectDB = require('./config/db');

const app = express();

//Connecting the mongoDB Database to Mongoose
connectDB();

app.get('/', (req, res) => res.send('API Running')); //if localhost port 5000 server recieves anything, send a message
//app.get is a route, / points to the root of the domain
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
