import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// middleware to protext routes that require authentication

export const protectRoute = async (req, res, next) => { // this is the 'verifyJWT' function
  try {
    const token = req.headers.token;

    if (!token) {
      return res.json({ success: false, message: "Invalid Token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password"); // Exclude the password field from the user object

    if (!user) {
      return res.json({
        success: false,
        message: "Unauthorized request (User not found)",
      });
    }
    
    req.user = user; // Attach the user object to the request for further use
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.log("Error occurred while verifying JWT:", error); // use error.message instead of error
    return res.json({
      success: false,
      message: error.message || "Invalid Token",
    });
  }
};
