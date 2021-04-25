import mongoose from "mongoose";

const whatsAppSchema = mongoose.Schema({
  name: String,
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "dbmessages"
  }]
});

const messageSchema = mongoose.Schema({
  name: String,
  message: String,
  timestamp: String,
  msgto:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'users'
  }
});


const users = mongoose.model("users", whatsAppSchema);

const dbmessages = mongoose.model("dbmessages", messageSchema);

export  {users, dbmessages};

