const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Middleware to parse JSON payloads
app.use(bodyParser.json());

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
    headers: true,
    maxAge: 86400
}));

app.post('/log-payload', (req, res) => {
    const payload = req.body;

    // Convert the payload to a string
    const payloadString = JSON.stringify(payload, null, 2);

    // Log the payload to a file
    fs.appendFile('payloads.log', payloadString + '\n', (err) => {
        if (err) {
            console.error('Error writing to log file', err);
            return res.status(500).send('Internal Server Error');
        }
        console.log('Payload logged successfully');
        res.status(200).send('Payload received and logged');
    });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
