import jwt from "jsonwebtoken";
import { adminSecretKey } from "../app.js";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies["chat-token"];

    if (!token) {
      return res.status(401).json({ message: "Please login to access this route" });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedData._id;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const adminOnly = async (req, res, next) => {
  try {
    const token = req.cookies["chat-admin-token"];

    if (!token) {
      return res.status(401).json({ message: "Only Admin can access this route" });
    }

    const adminID = jwt.verify(token, process.env.JWT_SECRET);

    const isMatched = adminID === adminSecretKey;

    if (!isMatched) return next(new Error("Invalid Admin Key", 401));

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export { isAuthenticated , adminOnly };
