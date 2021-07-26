import Express, { json } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Messages from './dbMessage.js'
import Pusher from 'pusher'
const port = process.env.PORT || 9000

const app = Express();
app.use(cors())


/* i have cors i dont need it */
// app.use((req,res,next)=>{
//     res.setHeader("Access-Content-Allow-Origin","*")
//     res.setHeader("Access-Content-Allow-Headres","*")
//     next();

// })
/* password: 3RAw3eZsyWpqtcp */
const con = "mongodb+srv://Itzhak:3RAw3eZsyWpqtcp@cluster0.62xft.mongodb.net/whtsappDataBase?retryWrites=true&w=majority"
mongoose.connect(con, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,

});


/* {
  _id: {
    _data: '8260FDB113000000012B022C0100296E5A1004D0B8AF1864214727ABB84380C44AA59246645F6964006460FDB1142489F31958E221C60004'
  },
  operationType: 'insert',
  clusterTime: Timestamp { _bsontype: 'Timestamp', low_: 1, high_: 1627238675 },
  fullDocument: {
    _id: 60fdb1142489f31958e221c6,
    message: 'hello itzhak',
    name: 'avraham ',
    received: false,
    __v: 0
  },
  ns: { db: 'whtsappDataBase', coll: 'messagecontents' },
  documentKey: { _id: 60fdb1142489f31958e221c6 }
}
 */


const db = mongoose.connection
db.once("open", () => { 
    console.log("DB is working"); 
    
    const msgCollection = db.collection("messagecontents")
    const changeStream = msgCollection.watch();
    changeStream.on("change",(change) =>{
        console.log(change);

        if (change.operationType === "insert") {
            const messageDetails = change.fullDocument;
            pusher.trigger("message","inserted",
            
            {
                name:messageDetails.name,
                message: messageDetails.message,
                message: messageDetails.timestamp,
                message: messageDetails.received

            }
            )
        }
        else{
            console.log("Error triggering Pusher");
        }
    })
})



const pusher = new Pusher({
    appId: "1240351",
    key: "06f922f37e86451894e4",
    secret: "a1e1e5f35e9981f5169e",
    cluster: "ap2",
    useTLS: true
});
app.use(Express.json())

app.get('/', (req, res) => {
    res.status(200).send("hello kasie!");
})

app.get('/messages/synce', (req, res) => {
    const dbmessage = req.body

    Messages.find(dbmessage, (err, data) => {
        if (err) {
            res.status(500).send(err)
        }
        else {
            res.status(200).send(data)
        }
    })
})

app.post('/messages/new', (req, res) => {
    const dbmessage = req.body

    Messages.create(dbmessage, (err, data) => {
        if (err) {
            res.status(500).send(err)
        }
        else {
            res.status(201).send(data)
        }
    })
})

app.listen(port, () => { console.log(`listening on localhost ${port}`); })