// It contains id_of_sender, content_of_message and ref_of_chat_to_whom_it_belogedto

const mongoose = require("mongoose");

const messagemodel = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      trim: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messagemodel);

module.exports = Message;
