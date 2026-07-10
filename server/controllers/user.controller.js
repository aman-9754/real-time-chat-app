import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

// Singup a new user
export const singup = async (req, res) => {
  try {
    const { fullName, email, password, bio } = req.body;
    if (!fullName || !email || !password || !bio) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.json({ success: false, message: "Account already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);

    return res.json({
      success: true,
      userData: newUser,
      message: "Account created successfully",
      token,
    });
  } catch (error) {
    console.log("Error occurred while signing up user:", error); // use error.message instead of error
    return res.json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Login an existing user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Account does not exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      userData: user,
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.log("Error occurred while logging in user:", error); // use error.message instead of error
    return res.json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// controller to check if the user is authenticated
export const checkAuth = async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
    // message: "User is authenticated",
  });
};

// Controller to updated user profile details
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;

    let updatedUser;

    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName },
        { returnDocument: "after" },
      );
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: upload.secure_url, bio, fullName },
        { returnDocument: "after" },
      );
    }

    return res.json({
      success: true,
      user: updatedUser,
      // message: "Profile updated successfully",
    });
  } catch (error) {
    console.log("Error occurred while updating user profile:", error); // use error.message instead of error
    return res.json({
      success: false,
      message: error.message || "Error while updating profile",
    });
  }
};
