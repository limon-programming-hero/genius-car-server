const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());
const username = process.env.REACT_APP_USER;
const password = process.env.REACT_APP_PASSWORD;

const uri = `mongodb+srv://${username}:${password}@cluster1.bwrdsn7.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        const serviceCollection = client.db('genius-car').collection('services');
        const query = {};
        const cursor = serviceCollection.find(query);
        const result = await cursor.toArray();

    } finally {
        // await client.close();
    }
}
run().catch(err => console.error(err))


app.get('/', (req, res) => {
    res.send('Welcome to genius car server site')
})

app.listen(port, () => console.log(`listening to port ${port}`))
