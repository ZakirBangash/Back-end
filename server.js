import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
// import Messages from './dbMessages.js'
import {users, dbmessages} from './dbMessages.js'
import Pusher from 'pusher';

// app config
const app = express();
const port = process.env.PORT || 8000;

const pusher = new Pusher({
  appId: "1184836",
  key: "03f08f5ad649d4e76547",
  secret: "81b5e37923b9c7d04eb1",
  cluster: "ap2",
  useTLS: true
});


// middleware
app.use(express.json());
app.use(cors());


// db config
const connectionURL = 'mongodb+srv://admin:NVKd6upriTAKsymd@cluster0.08gdo.mongodb.net/watsapp?retryWrites=true&w=majority';
mongoose.connect(connectionURL,{
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;



// for checking that database is connected or not
db.once('open', () => {
    console.log('Database is connected')
    const msgCollection = db.collection('messagecontents');
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change) => {
        console.log(change)

        if(change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            // below messages  parameter is pusher channel
            pusher.trigger('messages', "inserted", { 
                name: messageDetails.user,
                message: messageDetails.message,
                received: messageDetails.received
            });
        } else {
            console.log('Error triggering pusher')
        }
    })
})


// api routes
app.get('/', (req, res) => {
        res.status(200).send("Hello World");
})



app.post('/message', (req, res) => {
    const dbMessage = req.body; 
    Messages.create(dbMessage, (err, data) => {
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
    })
})

app.post("/user", (req, res) => {
    const dbUser = req.body;
    users.create(dbUser, (err, user) => {
        if(err) {
            res.status(500).send(err);
        }else {
            res.status(201).send(user);
        }
    })
});


app.post("/:userId/extra", async (req, res)=> {
    const user = await users.findOne({_id: req.params.userId});
    
    
        const msg = new dbmessages();
        msg.name = req.body.name;
        msg.message = req.body.message;
        msg.timestamp = req.body.timestamp;
        msg.msgto = user._id;

        await msg.save();

    // dbmessages.create(msg , (err, data) => {
    //     if(err) {
    //         res.status(500).send(err);
    //     }else {
    //         res.status(201).send(user);
    //     }
    // })

    user.messages.push(msg._id);
    await user.save();
    res.send(msg);
})



app.get('/sync', (req, res) => {

    users.find((err, data) => {
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})


// listen
app.listen(port, () => console.log(`Listening on local host ${port}`));

