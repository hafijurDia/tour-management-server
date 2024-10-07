const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const databaseInfo = require('./database');

// middlewares
app.use(cors());
app.options('*', cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2ybkr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    //await client.connect();

    const userCollection = client.db('tourmanagement').collection('user');
    const toruristSpotCollection = client.db('tourmanagement').collection('tourist_spots');


    //read all tourist spot
    app.get('/all-tourist-spot', async (req, res) => {
      const cursor = toruristSpotCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

// Get tourist spots added by the current logged-in user
app.get('/my-list', async (req, res) => {
    const email = req.query.email;  // The email of the currently logged-in user should be passed as a query parameter
  
    if (!email) {
      return res.status(400).send({ message: "Email query parameter is required" });
    }
  
    try {
      // Find tourist spots added by this user
      const query = { userEmail: email };  // Filter by email
      const spots = await toruristSpotCollection.find(query).toArray();
      res.send(spots);
    } catch (error) {
      console.error("Error fetching spots for user:", error);
      res.status(500).send({ message: "An error occurred while retrieving the data" });
    }
  });


    //add a tourist spot
    app.post('/add-tourist-spot', async (req, res) => {
      const newSpot = req.body;
      console.log(newSpot);

      const result = await toruristSpotCollection.insertOne(newSpot);
      res.send(result);
    })

    

    //delete a coffee
    app.delete('/coffee/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    })

    //get single coffee
    app.get('/coffee/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    })

    //put update coffee
    app.put('/coffee/:id', async(req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCoffee = req.body;
      const coffee = {
        $set: {
          name: updatedCoffee.name,
          chef:updatedCoffee.chef,
          supplier:updatedCoffee.supplier,
          taste:updatedCoffee.taste,
          category:updatedCoffee.category,
          details:updatedCoffee.details,
          photo:updatedCoffee.photo,
          price: updatedCoffee.price,
        }
      }

      const result = await coffeeCollection.updateOne(filter, coffee, options);
      res.send(result);
    })


    //user related api
    //add a user
    app.post('/user', async (req, res) => {
      const newUser = req.body;
      console.log(newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });
    
    //read all users
    app.get('/user', async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    //patch user logging time upate
    app.patch('/user', async(req,res)=>{
      const user = req.body;
      const filter = {email: user.email}
      const upateDoc = {
        $set: {
          lastSignInTime: user.lastSignInTime
        }
      }
      const result = await userCollection.updateOne(filter, upateDoc)
      res.send(result);
    })


    // delete a user
    app.delete('/user/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await userCollection.deleteOne(query);
      console.log(result);
      res.send(result);

    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.send('coffee making server is running');
})


app.listen(port, () => {
  console.log(`Coffee server is running on port ${port}`);
})