import jwt from "jsonwebtoken";

// Function to generate a JWT token for user

export const generateToken = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return token;
};
