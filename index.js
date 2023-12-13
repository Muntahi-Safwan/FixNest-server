const express = require("express");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.89qplrh.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const serviceCollection = client.db("FixNestDB").collection("services");
        const bookingCollection = client.db("FixNestDB").collection("bookings");

        // Get Services
        app.get("/services", async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // Add a service into the Database
        app.post("/services", async (req, res) => {
            const newService = req.body;
            // console.log(newProduct);
            const result = await serviceCollection.insertOne(newService);
            res.send(result);
        });

        // Get Single Service Data from Database
        app.get("/service/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await serviceCollection.findOne(query);
            res.send(result);
        });

        // Book Service into database
        app.post("/bookings", async (req, res) => {
            const bookService = req.body;
            // console.log(newProduct);
            const result = await bookingCollection.insertOne(bookService);
            res.send(result);
        });

        // My Services from the Database based on USER
        app.get("/myServices", async (req, res) => {
            console.log(req.query.email);
            let query = {};
            if (req.query?.email) {
                query = { user_email: req.query.email };
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        });

        // Update Service Info
        app.put("/service/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedService = req.body;
            console.log(updatedService);
            const service = {
                $set: {
                    name: updatedService.name,
                    user_name: updatedService.user_name,
                    user_img: updatedService.user_img,
                    serviceArea: updatedService.serviceArea,
                    price: updatedService.price,
                    short_description: updatedService.short_description,
                    photo_url: updatedService.photo_url,
                },
            };

            const result = await bookingCollection.updateOne(
                filter,
                service,
                options
            );
            console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
            );
            res.send(result);
        });

        // Delete Service from the Database
        app.delete("/service/:id", async (req, res) => {
            const id = req.params.id;
            console.log("Delete from server", id);
            const query = { _id: new ObjectId(id) };
            console.log(query);
            const result = await bookingCollection.deleteOne(query);
            console.log(result);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Server is Running");
});

app.listen(port, () => {
    console.log(`Server is running on port:  ${port}`);
});
