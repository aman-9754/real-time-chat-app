import mongoose from "mongoose";

// Function to connect to the MongoDB database

export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Database connected"),
    );
    await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);
  } catch (error) {
    console.error("Error connecting to MongoDB: ", error);
  }
};
