const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors({
    origin: ['http://localhost:5173', 'https://asta-185de.web.app']
}));
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qemc4ul.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        //Collections
        const userCollection = client.db('asta').collection('users');
        const eventCollection = client.db('asta').collection('events');
        const bookingsCollection = client.db('asta').collection('bookings');
        const ordersCollection = client.db('asta').collection('orders');
        // user related api
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        })


        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exist', insertedId: null })
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })

        //events related api
        app.get('/events', async (req, res) => {
            const cursor = eventCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/events/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            const options = {
                projection: { _id: 1, eventName: 1, eventFee: 1, img: 1, description: 1, eventType: 1 },
            };
            const result = await eventCollection.findOne(query, options);
            res.send(result);
        })

        //bookings related api

        app.get('/bookings', async (req, res) => {
            console.log(req.query.email);
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookingsCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            const options = {
                projection: { _id: 1, eventName: 1, eventFee: 1, img: 1, description: 1, eventType: 1, img: 1, serviceData: 1, email: 1, },
            };
            const result = await bookingsCollection.findOne(query, options);
            res.send(result);
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        });

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query);
            res.send(result);
        })

        //orders related api

        app.get('/orders', async (req, res) => {
            console.log(req.query.email);
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            if (req.query?.orderDate) {
                query = { orderDate: req.query.orderDate }
            }
            const result = await ordersCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            const options = {
                projection: { _id: 1, eventId: 1, img: 1, eventName: 1, eventType: 1, email: 1, photographer: 1, hotel: 1, caterer: 1, photographerType: 1, hotelType: 1, catererType: 1, eventFee: 1, photographerFee: 1, catererFee: 1, hotelFee: 1, guests: 1, total: 1, orderDate: 1, orderTime: 1, eventDate: 1 },
            };
            const result = await ordersCollection.findOne(query, options);
            res.send(result);
        })

        app.post('/orders', async (req, res) => {
            const orders = req.body;
            const query = { orderDate: orders.orderDate };
            const existingDate = await ordersCollection.findOne(query);
            if (existingDate) {
                return res.send({ message: 'You cannot order more than 1 in 24 hours', insertedId: null })
            }
            const result = await ordersCollection.insertOne(orders);
            res.send(result);
        });


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send(`<h1 style="text-align:center;font-family:Monospace;">Asta Server Is Running...</h1>
    <h2 style="text-align:center;font-family:Monospace;"><a href='http://localhost:5000/users'>users</a></h2>
    <h2 style="text-align:center;font-family:Monospace;"><a href='http://localhost:5000/events'>events</a></h2>
    <h2 style="text-align:center;font-family:Monospace;"><a href='http://localhost:5000/bookings'>bookings</a></h2>
    <h2 style="text-align:center;font-family:Monospace;"><a href='http://localhost:5000/orders'>orders</a></h2>`)
})

// app.get('/', (req, res) => {
//     res.send(`<h1 style="text-align:center">Asta Server Is Running...</h1>
//     <h2 style="text-align:center;font-family:Monospace;"><a href='https://asta-server-three.vercel.app/users'>users</a></h2>
//     <h2 style="text-align:center;font-family:Monospace;"><a href='https://asta-server-three.vercel.app/events'>events</a></h2>
//     <h2 style="text-align:center;font-family:Monospace;"><a href='https://asta-server-three.vercel.app/bookings'>bookings</a></h2>
//     <h2 style="text-align:center;font-family:Monospace;"><a href='https://asta-server-three.vercel.app/orders'>orders</a></h2>`)
// })

app.listen(port, () => {
    console.log(`Asta Is Running On Port: ${port}`)
})