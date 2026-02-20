import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import uploadRoutes from "./routes/upload.routes.js";


dotenv.config();

const app = express();

const startServer = async () => {
  await connectDB();

  app.use(express.json());
  app.use("/api/auth",authRoutes );
  app.use("/api/upload", uploadRoutes);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
