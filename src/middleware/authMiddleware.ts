import { type Request, type Response, type NextFunction } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization header missing or invalid" });
    }
    const token = authHeader.split(" ")[1];
    if (token !== process.env.AUTH_TOKEN) {
      return res.status(403).json({ message: "Invalid token" });
    }
  
    next(); 
  };