import express from "express";
import { createServer as createHttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const httpServer = createHttpServer(app);
  const PORT = 3000;

  // WebSocket Server for Live Scores
  const wss = new WebSocketServer({ server: httpServer });

  const sports = ["Football", "Boxing", "Cricket", "Basketball"];
  const zambianTeams = ["ZESCO United", "Nkana FC", "Green Buffaloes", "Power Dynamos", "Zambia (Chipolopolo)"];
  const boxers = ["Catherine Phiri", "Esther Phiri", "Lola Anyango", "Charles Manyuchi", "Alfred Muwowo"];

  function generateLiveScore() {
    const type = Math.random() > 0.5 ? "Football" : "Boxing";
    if (type === "Football") {
      const teamA = zambianTeams[Math.floor(Math.random() * zambianTeams.length)];
      let teamB = zambianTeams[Math.floor(Math.random() * zambianTeams.length)];
      while (teamA === teamB) teamB = zambianTeams[Math.floor(Math.random() * zambianTeams.length)];
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        type: "Football",
        match: `${teamA} vs ${teamB}`,
        score: `${Math.floor(Math.random() * 4)} - ${Math.floor(Math.random() * 4)}`,
        status: "LIVE",
        time: `${Math.floor(Math.random() * 90)}'`,
        isZambian: true
      };
    } else {
      const boxerA = boxers[Math.floor(Math.random() * boxers.length)];
      let boxerB = boxers[Math.floor(Math.random() * boxers.length)];
      while (boxerA === boxerB) boxerB = boxers[Math.floor(Math.random() * boxers.length)];

      return {
        id: Math.random().toString(36).substr(2, 9),
        type: "Boxing",
        match: `${boxerA} vs ${boxerB}`,
        score: `Round ${Math.floor(Math.random() * 12) + 1}`,
        status: "LIVE",
        time: "In Progress",
        isZambian: true,
        details: "KK Boxing Promotion"
      };
    }
  }

  // Broadcast scores every 5 seconds
  setInterval(() => {
    const scores = Array.from({ length: 3 }, generateLiveScore);
    const message = JSON.stringify({ type: "SCORE_UPDATE", data: scores });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }, 5000);

  wss.on("connection", (ws) => {
    console.log("Client connected to Live Scores");
    const initialScores = Array.from({ length: 3 }, generateLiveScore);
    ws.send(JSON.stringify({ type: "SCORE_UPDATE", data: initialScores }));
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
