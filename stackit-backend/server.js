require("dotenv").config();            
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


const authRoutes     = require("./routes/auth");
const questionRoutes = require("./routes/questions");
const answerRoutes   = require("./routes/answers");
const notificationRoutes = require("./routes/notifications");

const app = express();


app.use(cors());                        // Enable CORS for all origins
app.use(express.json());                // Parse incoming JSON bodies



app.use("/api/auth",     authRoutes);      // /api/auth/register, /api/auth/login
app.use("/api/questions",questionRoutes);  // /api/questions/...
app.use("/api/answers",  answerRoutes);    // /api/answers/...
app.use("/api/notifications", notificationRoutes); // /api/notifications

app.get("/", (req, res) => res.send("StackIt API is running."));


mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`✅ Server listening on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
