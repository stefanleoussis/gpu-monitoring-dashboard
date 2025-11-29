import express, { Request, Response } from "express";
import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://gpu-monitoring-dashboard-teal.vercel.app",
      "https://gpu-dashboard.com",
    ],
    credentials: true,
  })
);
let db: Db;

async function connectDB() {
  const mongoUri = process.env.DB;
  if (!mongoUri) {
    throw new Error("MONGODB URI not set");
  }

  const client = new MongoClient(mongoUri);
  await client.connect();
  db = client.db("gpu_monitoring");
  console.log("Connected to MongoDB");
}

app.get("/api/metrics/current", async (req: Request, res: Response) => {
  try {
    const latest = await db
      .collection("metrics")
      .find()
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    res.json(latest[0] || null);
  } catch (error) {
    console.error("Error fetching current metrics:", error);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

app.get("/api/metrics/history", async (req: Request, res: Response) => {
  try {
    const range = (req.query.range as string) || "1h";

    const latestRecord = await db
      .collection("metrics")
      .find()
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    if (latestRecord.length === 0) {
      return res.json([]);
    }

    const latestTime = new Date(latestRecord[0].timestamp);
    let cutoffTime: Date;

    switch (range) {
      case "1h":
        cutoffTime = new Date(latestTime.getTime() - 60 * 60 * 1000);
        break;
      case "24h":
        cutoffTime = new Date(latestTime.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        cutoffTime = new Date(latestTime.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffTime = new Date(latestTime.getTime() - 60 * 60 * 1000);
    }

    const history = await db
      .collection("metrics")
      .find({
        timestamp: { $gte: cutoffTime.toISOString() },
      })
      .sort({ timestamp: 1 })
      .toArray();

    res.json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

app.get("/api/metrics/stats", async (req: Request, res: Response) => {
  try {
    const stats = await db
      .collection("metrics")
      .aggregate([
        { $sort: { timestamp: -1 } },
        { $limit: 100 },
        {
          $group: {
            _id: null,
            avgUtilization: { $avg: "$utilization" },
            maxUtilization: { $max: "$utilization" },
            avgTemperature: { $avg: "$temperature" },
            maxTemperature: { $max: "$temperature" },
            avgPower: { $avg: "$power_draw" },
          },
        },
      ])
      .toArray();

    res.json(stats[0] || {});
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.post("/api/workload/start", async (req: Request, res: Response) => {
  try {
    const flaskUrl = process.env.FLASK_API_URL;
    if (!flaskUrl) {
      throw new Error("FLASK_API_URL not configured");
    }

    const response = await fetch(`${flaskUrl}/workload/start`, {
      method: "POST",
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error starting workload:", error);
    res.status(500).json({ error: "Failed to start workload" });
  }
});

app.post("/api/workload/stop", async (req: Request, res: Response) => {
  try {
    const flaskUrl = process.env.FLASK_API_URL;
    if (!flaskUrl) {
      throw new Error("FLASK_API_URL not configured");
    }

    const response = await fetch(`${flaskUrl}/workload/stop`, {
      method: "POST",
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error stopping workload:", error);
    res.status(500).json({ error: "Failed to stop workload" });
  }
});

app.get("/api/workload/status", async (req: Request, res: Response) => {
  try {
    const flaskUrl = process.env.FLASK_API_URL;
    if (!flaskUrl) {
      throw new Error("FLASK_API_URL not configured");
    }

    const response = await fetch(`${flaskUrl}/workload/status`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching status:", error);
    res.status(500).json({ error: "Failed to fetch status" });
  }
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK" });
});

async function start() {
  try {
    await connectDB();
  } catch (error) {
    console.error("Database failed to connect");
  }
  app.listen(PORT, () => {
    console.log(`Node.js API server running on port ${PORT}`);
  });
}

start();
