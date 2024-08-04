import express from "express";
import cors from "cors";
import http from "http";
import os from "node:os";
import dns from "node:dns";

import dotenv from "dotenv";
import { ListenOptions } from "node:net";
import homeRoutes from "./routes/homeRoute";
import userRoutes from "./routes/userRoute";
import { initElastic } from "./configs/elasticsearchConfig";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/", [homeRoutes]);
app.use("/api/", [userRoutes]);
app.set("init", async () => {
  await initElastic();
});

const server = http.createServer(app);

const OPTIONS: ListenOptions = {
  port: parseInt(process.env.PORT || "8000"),
};



const app_init = app.get("init");

function initialElastic() {
  let attempts = 0;
  const maxAttempts = 10;
  const interval = 5000; // 5 seconds

  const intervalId = setInterval(async () => {
    attempts++;
    if (attempts >= maxAttempts) {
      clearInterval(intervalId);
        if (app_init) {
          console.info(`
             > Please Wait until ElasticSearch finish initializing
             > Initializing Elasticsearch...
            `);
          app_init();
      } else {
        console.log("Max attempts reached without connecting to database.");
      }
    }
  }, interval);
}

initialElastic();

server.listen(OPTIONS, () => {
  console.info(`> Local Api Server :  http://localhost:${OPTIONS.port}`);
  dns.lookup(os.hostname(), { family: 4 }, (err, addr) => {
    if (!err) {
      console.info(`> Network Api Server :  http://${addr}:${OPTIONS.port}`);
    }
  });
});

export default server;
