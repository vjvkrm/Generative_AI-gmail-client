import express from "express";
import path from "path";
import gmailRoutes from "./routes/gmailRoutes";

const app = express();
const port = process.env.PORT || 3000;

app.disable("x-powered-by");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/", gmailRoutes);

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  }
);

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});

export default app;
