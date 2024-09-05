const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');

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

// MongoDB connection string
const mongoUri = 'mongodb+srv://hritikpawardev:pawar2700@bookkeeper.hv4oh.mongodb.net/?retryWrites=true&w=majority&appName=BookKeeper';
const client = new MongoClient(mongoUri);

// Connect to MongoDB
async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1); // Exit the app if unable to connect
    }
}

// Periodically clear the collection
function startCleanupTask() {
    const interval = 30 * 60 * 1000; // 30 minutes in milliseconds

    const cleanup = async () => {
        try {
            const database = client.db('Payload-logger');
            const collection = database.collection('Payloads');
            const result = await collection.deleteMany({});
            console.log(`Cleared ${result.deletedCount} documents from Payloads collection`);
        } catch (err) {
            console.error('Error clearing the collection:', err);
        }
    };

    // Initial cleanup
    cleanup();
    
    // Set interval for cleanup task
    const intervalId = setInterval(cleanup, interval);

    // Ensure cleanup task is stopped when the app exits
    process.on('SIGINT', () => {
        clearInterval(intervalId);
        client.close().then(() => {
            console.log('MongoDB connection closed');
            process.exit(0);
        }).catch(err => {
            console.error('Error closing MongoDB connection:', err);
            process.exit(1);
        });
    });
}

// Route to log payload
app.post('/log-payload', async (req, res) => {
    const payload = req.body;

    try {
        // Access the database and collection
        const database = client.db('Payload-logger');
        const collection = database.collection('Payloads');

        // Insert the payload into the collection
        const result = await collection.insertOne(payload);

        console.log('Payload logged to MongoDB:', result.insertedId);
        res.status(200).send('Payload received and logged');
    } catch (err) {
        console.error('Error inserting payload into MongoDB:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server and connect to MongoDB
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectToDatabase();  // Connect to MongoDB when the server starts
    startCleanupTask();  // Start the cleanup task
});
