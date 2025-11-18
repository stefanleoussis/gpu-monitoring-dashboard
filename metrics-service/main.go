package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
    "github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Metric struct {
    Timestamp    string  `json:"timestamp" bson:"timestamp"`
    GPUID        string  `json:"gpu_id" bson:"gpu_id"`
    GPUType      string  `json:"gpu_type" bson:"gpu_type"`
    Model        string  `json:"model" bson:"model"`
    Utilization  int     `json:"utilization" bson:"utilization"`
    MemoryUsed   int     `json:"memory_used" bson:"memory_used"`
    MemoryTotal  int     `json:"memory_total" bson:"memory_total"`
    Temperature  int     `json:"temperature" bson:"temperature"`
    PowerDraw    float64 `json:"power_draw" bson:"power_draw"`
}

var metricsCollection *mongo.Collection

func main() {
    if err := godotenv.Load(); err != nil {
       log.Println("No .env file found")
    }

    mongoURI := os.Getenv("DB")
    if mongoURI == "" {
        log.Fatal("MONGODB URI environment variable not set")
    }

    client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(mongoURI))
    if err != nil {
        log.Fatal("Failed to connect to MongoDB:", err)
    }
    defer client.Disconnect(context.Background())

    metricsCollection = client.Database("gpu_monitoring").Collection("metrics")
    log.Println("Connected to MongoDB")

    http.HandleFunc("/metrics/ingest", ingestMetrics)
    http.HandleFunc("/health", healthCheck)

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    log.Printf("Go metrics service listening on port %s\n", port)
    log.Fatal(http.ListenAndServe(":"+port, nil))
}

func ingestMetrics(w http.ResponseWriter, r *http.Request) {
    if r.Method != "POST" {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    var metric Metric
    if err := json.NewDecoder(r.Body).Decode(&metric); err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    }

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    _, err := metricsCollection.InsertOne(ctx, metric)
    if err != nil {
        log.Printf("Failed to insert metric: %v", err)
        http.Error(w, "Database error", http.StatusInternalServerError)
        return
    }

    log.Printf("Inserted metric: GPU %s, Utilization: %d%%", metric.GPUID, metric.Utilization)
    
    w.WriteHeader(http.StatusAccepted)
    json.NewEncoder(w).Encode(map[string]string{"status": "accepted"})
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
}