const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
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

const verifyJWT = (req, res, next) => {
    // const user = req.query.email;
    const HeaderToken = req.headers.authorization;
    console.log(HeaderToken);
    const token = HeaderToken.split(' ')[1];

    if (!HeaderToken) {
        return res.status(401).send({ message: 'Unauthorized user!' });
    }
    jwt.verify(token, process.env.JWT_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden credentials' });
        }
        req.decoded = decoded;
        next();
    })

    // console.log(token, user);
}

const run = async () => {
    try {
        const serviceCollection = client.db('genius-car').collection('services');
        const OrderCollection = client.db('genius-car').collection('orders');

        // operations to service collection
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/services/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: id };
            const cursor = await serviceCollection.findOne(query);
            // const result = await cursor.toArray();
            res.send(cursor);
        })

        // jwt token send 
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.JWT_TOKEN, { expiresIn: '1d' });
            res.send({ token });
        })


        // doing operations to service collection
        app.get('/orders', verifyJWT, async (req, res) => {
            // console.log(req.query);
            let Query = {};
            if (req.query.email) {
                Query = { email: req.query.email }
            }
            const cursor = OrderCollection.find(Query);
            const orders = await cursor.toArray();
            res.send(orders);
        })
        app.post('/orders', verifyJWT, async (req, res) => {
            const order = req.body;
            const cursor = await OrderCollection.insertOne(order);
            res.send(cursor)
        })
        app.patch('/orders/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            // console.log(status, id);
            const query = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    status: status,
                }
            }
            const result = await OrderCollection.updateOne(query, updatedDoc);
            // console.log(result)
            res.send(result);
        })
        app.delete('/orders/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await OrderCollection.deleteOne(query);
            res.send(result);
        })


    } finally {
        // await client.close();
    }
}
run().catch(err => console.error(err))


app.get('/', (req, res) => {
    res.send('Welcome to genius car server site')
})

app.listen(port, () => console.log(`listening to port ${port}`))
