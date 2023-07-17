require('dotenv').config()
const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT;
const cors = require('cors')
// middlewere
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USERS}:${process.env.DB_PASSS}@cluster0.smw489h.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const run = async () => {
  try {
    await client.connect()

    const BookCollection = client.db("books-project").collection("books")
    console.log("database connect succefull")

    app.get("/books", async (req, res) => {
      const cursor = BookCollection.find({})
      const product = await cursor.toArray()
      res.send({ status: true, data: product })
    })
    app.get("/books/limit", async (req, res) => {
      const cursor = BookCollection.find({}).limit(10)
      const product = await cursor.toArray()
      res.send({ status: true, data: product })
    })

    app.get("/books/seacrch/:criteria", async (req, res) => {
      const criteria = req.params.criteria
      const cursor = BookCollection.find({ criteria })
      const product = await cursor.toArray()
      res.send({ status: true, data: product })
    })
    app.post("/book", async (req, res) => {
      const book = req.body;
      const result = await BookCollection.insertOne(book)
      console.log(result)
      res.send(result)
    })
    // app.get("/book/:id", async (req, res) => {
    //   const id = req.params.id
    //   console.log("Id:", id)

    //   const result = await BookCollection.findOne({ _id: ObjectId(id) })
    //   console.log(result)
    //   res.send(result)
    // })
    app.delete('/book/:id', async (req, res) => {
      const id = req.params.id

      const result = await BookCollection.deleteOne({ _id: ObjectId(id) })
      res.send(result)
    })
    // comment section
    app.post("/comment/:id", async (req, res) => {
      const productId = req.params.id
      const comment = req.body.comment

      const result = await BookCollection.updateOne({
        _id: ObjectId(productId)
      }, { $push: { comments: comment } })
      if (result.modifiedCount !== 1) {
        console.error("Book Not Found Or Comment Not added")
        res.send({ error: "Book Not Found or comment not added" })
        return
      }
      console.log("comment added successfully")
      res.json({ message: "Comment added successfully" })
    })
    app.get("/comment/:id", async (req, res) => {
      const productId = req.params.id;
      const result = await BookCollection.findOne({ _id: ObjectId(productId) })
      console.log(result)
      if (result) {
        res.json(result)

      } else {
        res.status(404).json({ error: "Product not found" })
      }
    })
  } catch (error) {
    console.log("Mongodb Error : ", error)
  }
}

run().catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


