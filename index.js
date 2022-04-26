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
        const productsCollection = client.db('E-shop').collection('products');
        /**
         * --------------------------------------------------
         * Get All Services
         * --------------------------------------------------
         */
        app.get('/api/products', async (req, res) => {
            const services = await productsCollection.find().toArray();
            res.send(services);
        });
        /**
         * --------------------------------------------------
         * Get Single Service
         * 
         */
        app.get('/api/products/:id', async (req, res) => {
            const id = req.params.id;
            const service = await productsCollection.findOne({ _id: ObjectId(id) });
            res.send(service);
        })

        /**
         * --------------------------------------------------
         * add new service
         * --------------------------------------------------
         */
        app.post('/api/products', async (req, res) => {
            const newService = req.body;
            const result = await productsCollection.insertOne(newService);
            res.send(result);
        });

        /**
         * --------------------------------------------------
         * product get by ordered details
         * --------------------------------------------------
         */

        app.post('/api/product/order', async (req, res) => {
            const ordered_details = req.body;
            const ids = ordered_details.map(id => ObjectId(id));
            console.log(ordered_details);
            const query = { _id: { $in: ids } };
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        })


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
 * order api
 * --------------------------------------------------
 */

async function orderApi() {
    try {
        /**
         * --------------------------------------------------
         * Connect to MongoDB
         * --------------------------------------------------
         */
        await client.connect();
        console.log('Connected to order');
        const ordersCollection = client.db('E-shop').collection('orders');

        /**
         * --------------------------------------------------
         * get orders
         * --------------------------------------------------
         */
        app.get('/api/orders', async (req, res) => {
            const email = req.query.email;
            if (email) {
                const orders = await ordersCollection.find({ email: email }).toArray();
                res.send(orders);
            } else {
                const orders = await ordersCollection.find().toArray();
                res.send(orders);
            }
        });

        /**
         * --------------------------------------------------
         * add new order
         * --------------------------------------------------
         */
        app.post('/api/orders', async (req, res) => {
            const p_id = req.body.p_id;
            const email = req.body.email;
            let qtn;
            let product;
            const cursor = await ordersCollection.find({ p_id: p_id, email: email }).toArray();
            if (cursor[0]?.p_id === p_id && cursor[0]?.email === email) {
                qtn = cursor[0].qtn + 1;
                console.log(qtn);
                const result = await ordersCollection.updateOne({ p_id: p_id, email: email }, { $set: { qtn: qtn } });
                console.log(result);
                res.send(result);

            } else {
                qtn = 1;
                product = {
                    p_id: p_id,
                    qtn: qtn,
                    email: email
                }
                const result = await ordersCollection.insertOne(product);
                res.send(result);
            }


        });
    }
    finally {
        /**
        * --------------------------------------------------
        * Close the connection
        * --------------------------------------------------
        */
        // client.close();
    }

}

orderApi().catch(console.dir)



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