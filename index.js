const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express());
app.use(express.json());

// MongoDB configuration
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5pp73.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();

        // Connect to the database
        const database = client.db('BabycareDB');
        const productCollection = database.collection('products');
        const userCollection = database.collection('users');
        const orderCollection = database.collection('orders');
        const reviewCollection = database.collection('reviews');

        // ----------------Product-------------------

        // Get all the products
        app.get('/products', async (req, res) => {
            const cursor = await productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        // Get single product
        app.get('/singleProduct/:productId', async (req, res) => {
            const query = { _id: ObjectId(req.params.productId) };
            const product = await productCollection.findOne(query);
            res.send(product);
        });

        // Delete single product
        app.delete('/deleteproduct/:productId', async (req, res) => {
            const productId = req.params.productId;
            const filter = { _id: ObjectId(productId) };
            const result = await productCollection.deleteOne(filter);
            res.send(result);
        });

        // Insert product
        app.post('/addproduct', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
        });

        //---------------------- Set user -----------------------
        app.post('/user', async (req, res) => {
            // Parse the user from body
            const user = req.body;
            const result = await userCollection.insertOne({
                uid: user.uid,
                email: user.email,
                role: 'user',
            });
            res.send(result);
        });
        // ----------------------Get user--------------------------
        app.get('/user/:uid', async (req, res) => {
            const uid = req.params.uid;
            const filter = { uid: uid };
            const user = await userCollection.findOne(filter);
            res.send(user);
        });

        // Make admin
        app.put('/makeadmin/:email', async (req, res) => {
            // Parse the user from body
            const email = req.params.email;

            // create a filter for a profile to update
            const filter = { email: email };

            // this option instructs the method to create a document if no documents match the filter
            const options = { upsert: true };

            // create a document that sets the updated info of the user
            const updateDoc = {
                $set: {
                    role: 'admin',
                },
            };
            const result = await userCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            console.log(result);
            res.send(result);
        });

        // ---------------------------Order-------------------------------------------

        // Post orders
        app.post('/postorder', async (req, res) => {
            const orderDetails = req.body;
            const result = await orderCollection.insertOne(orderDetails);
            res.send(result);
        });

        // Get user orders
        app.get('/getorders/:userId', async (req, res) => {
            const userId = req.params.userId;
            const filter = { orderedBy: userId };
            const cursor = await orderCollection.find(filter);
            const orders = await cursor.toArray();

            res.send(orders);
        });

        // Get all orders
        app.get('/getorders', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        // Delete order
        app.delete('/deleteorder/:orderId', async (req, res) => {
            const orderId = req.params.orderId;
            const filter = { _id: ObjectId(orderId) };
            const result = await orderCollection.deleteOne(filter);
            res.send(result);
        });

        // Approve order
        app.put('/approveorder/:orderId', async (req, res) => {
            const orderId = req.params.orderId;
            const filter = { _id: ObjectId(orderId) };
            const updateDoc = {
                $set: {
                    status: 'approved',
                },
            };
            const options = { upsert: true };
            const result = await orderCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });

        // ------------------------------------------------------------------------------------------------

        // ----------------------------Reviews-----------------------------------------
        app.post('/addreview', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });

        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });
    } finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello from your server');
});

app.listen(port, () => {
    console.log('listening on port ' + port);
});
