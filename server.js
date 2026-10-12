const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const aiBriefingRoutes = require("./routes/aiBriefing");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/reminders", require("./routes/reminders"));
app.use("/api/documents", require("./routes/documents"));
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/medicines", require("./routes/medicines"));
app.use("/api/ai-briefing", aiBriefingRoutes);
app.use("/api/life-score", require("./routes/lifeScore"));
app.use("/api/ai-assistant", require("./routes/aiAssistant"));

app.get("/", (req, res) => {
res.json({
message: "LifeOS AI Backend is running successfully 🚀"
});
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
console.log("MongoDB connected successfully ✅");

    app.listen(process.env.PORT || 5000, () => {
        console.log(
            `Server running on http://localhost:${process.env.PORT || 5000}`
        );
    });
})
.catch((error) => {
    console.error("MongoDB connection failed ❌");
    console.error(error.message);
});