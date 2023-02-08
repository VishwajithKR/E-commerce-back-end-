const express = require('express');
const cors = require("cors");
const mongodb = require('mongodb')
const app = express();
const mongoClient = mongodb.MongoClient;
const bcrypt = require('bcrypt');
const url = 'mongodb+srv://Vishwa:vishwa@cluster0.wckof1g.mongodb.net/?retryWrites=true&w=majority'
const jwt = require('jsonwebtoken')

const secret = "ViShWa1998"

app.use(express.json())

app.use(cors({
    origin: "http://localhost:3000"
}));

app.post('/users', async (req, res) => {
    try {
        // Password hasting
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(req.body.password, salt);
        let rehash = await bcrypt.hash(req.body.rePassword, salt)
        req.body.password = hash
        req.body.rePassword = rehash

        // Normal Method
        let connection = await mongoClient.connect(url);
        let db = connection.db("market");
        let user = await db.collection('user').findOne({ email: req.body.email })
        if (user) {
            res.json({ message: "already have" })
        } else {
            if (req.body.password == req.body.rePassword) {
                let collection = await db.collection('user').insertOne(req.body)
            }
        }
        let close = await connection.close()
        res.json(req.body)
    } catch (error) {
        console.log(error)
    }
})


app.post('/login', async (req, res) => {
    let connection = await mongoClient.connect(url);
    let db = connection.db('market');
    let user = await db.collection('user').findOne({ email: req.body.email })
    if (user) {
        let login = await bcrypt.compare(req.body.password, user.password)
        if (login) {
            let token = jwt.sign({ userid: user._id }, secret, { expiresIn: '30m' })

            res.json({ message: "correct", user, token })

        } else {
            res.json({ message: "Id and password not match" })
        }

    } else {
        res.json({ message: "No user is found" })
    }
})

app.post('/useraddress', async (req, res) => {
    let connection = await mongoClient.connect(url);
    let db = connection.db('market');
    let user = await db.collection('user_address').insertOne(req.body)
    let cut = await connection.close()
    res.json(user)
})

app.get('/full-users', async (req, res) => {
    let connection = await mongoClient.connect(url);
    let db = connection.db('market');
    let user = await db.collection('user').find({}).toArray()
    let cut = await connection.close()
    res.json(user)
})

app.put('/profile-edit', async (req, res) => {
    let connection = await mongoClient.connect(url);
    let db = connection.db('market');
    let collection = await db.collection("user").findOne({ email: req.body.email });
    console.log(collection)
    let password = collection.password
    let user = await bcrypt.compare(req.body.currentpassword, password)
    console.log(user)
    if (collection) {
        if (user) {
            let edit = await db.collection('user').updateOne({ email: req.body.email }, { $set: req.body })
            res.json({ message: "edited" })
        } else {
            res.json({ message: "password not matched" })
        }
    } else {
        res.json({ message: "no user is found" })
    }
    let close = await connection.close()
})

app.put('/changepassword', async (req, res) => {
    let connection = await mongoClient.connect(url);
    let db = connection.db('market');
    let collection = await db.collection("user").findOne({ email: req.body.email });

    if (collection) {
        let firstpassword = collection.password
        let changing = await bcrypt.compare(req.body.Oldpassword, firstpassword)
        if (changing) {
            let salt = await bcrypt.genSalt(10)
            let hash = await bcrypt.hash(req.body.password, salt)
            req.body.password = hash

            let edit = await db.collection('user').updateOne({ email: req.body.email }, { $set: req.body })
            res.json({ message: "edited" })

        } else {
            res.json({ message: "not matched" })
        }
    } else {
        res.json({ message: "no user is found" })
    }
    let close = await connection.close()
})




app.post('/deleteuser', async (req, res) => {
    let connection = await mongoClient.connect(url);
    let db = connection.db('market');
    let user = await db.collection('user').findOne({ email: req.body.email })
    console.log(user, 'user')
    if (user) {
        const deleteUser = await bcrypt.compare(req.body.password, user.password)
        console.log(deleteUser, "okk")
        if (deleteUser) {
            let finished = await db.collection('user').deleteOne({ email: req.body.email })
            res.json({ message: "deleted" })
            console.log(finished, 'finish')
        } else {
            res.json({ message: "Wrong Password" })
        }
    } else {
        res.json({ message: "no user is found" })
    }
    let close = await connection.close();
})






app.listen(process.env.PORT || 4008, () => {
    console.log("server is starting in 4008")
})