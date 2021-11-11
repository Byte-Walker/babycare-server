const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express());

// MongoDB configuration
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5pp73.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri);
console.log(uri);

async function run() {
    try {
        await client.connect();

        // Connect to the database
        const database = client.db('BabycareDB');
        const productCollection = database.collection('products');

        // Get all the products
        app.get('/products', async (req, res) => {
            const cursor = await productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })

    }
    finally {
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
