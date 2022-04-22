// imports
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

/**
 * --------------------------------------------------
 * Middleware
 * --------------------------------------------------
 */
app.use(cors());
app.use(express.json());

/**
 * --------------------------------------------------
 * Connecting to database
 * --------------------------------------------------
 * Mongo DB
 * --------------------------------------------------
 */

const uri = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.PASS}@nodedb.scooa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



/**
 * --------------------------------------------------
 * services api
 * --------------------------------------------------
 */

async function servicesApi() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const servicesCollection = client.db('Services').collection('service');
        /**
         * --------------------------------------------------
         * Get All Services
         * --------------------------------------------------
         */
        app.get('/api/services', async (req, res) => {
            const services = await servicesCollection.find().toArray();
            res.send(services);
        });

        /**
         * --------------------------------------------------
         * add new service
         * --------------------------------------------------
         */
        app.post('/api/services', async (req, res) => {
            const newService = req.body;
            const result = await servicesCollection.insertOne(newService);
            res.send(result);
        });
    } finally {
        /**
         * --------------------------------------------------
         * Close the connection
         * --------------------------------------------------
         */
        // client.close();

    }

}
servicesApi().catch(console.dir)



/**
 * --------------------------------------------------
 * root url
 * --------------------------------------------------
 */

app.get('/', (req, res) => {
    res.send('hello world');
});

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});