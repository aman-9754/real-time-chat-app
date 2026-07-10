import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// Get all users except the logged-in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id; // Get the logged-in user's ID from the request object
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password",
    );

    // Count the number of unseen messages for each user

    const unseenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });

      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });

    await Promise.all(promises);

    return res.json({
      success: true,
      users: filteredUsers,
      unseenMessages,
      //   message: "Users fetched successfully",
    });
  } catch (error) {
    console.log("Error occurred while fetching users for sidebar:", error); // use error.message instead of error
    return res.json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Get all messages between the logged-in user and another user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params; // Get the selected user's ID from the request parameters
    const loggedInUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderID: loggedInUserId, receiverID: selectedUserId },
        { senderID: selectedUserId, receiverID: loggedInUserId },
      ],
    });

    await Message.updateMany(
      {
        senderId: selectedUserId,
        receiverId: loggedInUserId,
        // seen: false,
      },
      { $set: { seen: true } },
    );

    return res.json({
      success: true,
      messages,
      //   message: "Messages fetched successfully",
    });
  } catch (error) {
    console.log("Error occurred while fetching messages:", error); // use error.message
    return res.json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Mark a message as seen using the message ID
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params; // Get the message ID from the request parameters

    const message = await Message.findByIdAndUpdate(
      id,
      { seen: true },
      { new: true },
    ); // its findByIdAndUpdate so need ot {_id : id}

    // if (!message) { // by gpt
    //   return res.json({
    //     success: false,
    //     message: "Message not found",
    //   });
    // }

    return res.json({
      success: true,
      // message: "Message marked as seen successfully",
    });
  } catch (error) {
    console.log("Error occurred while marking message as seen:", error); // use error.message
    return res.json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Send message from the logged-in user to another selected user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image);
      imageUrl = uploadRes.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    // Emit the new message to the receiver's socket
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.json({
      success: true,
      newMessage,
      // message: "Message sent successfully",
    });
  } catch (error) {
    console.log("Error occurred while sending message:", error); // use error.message
    return res.json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
