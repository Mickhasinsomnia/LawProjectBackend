import app from './index.js';

const PORT = process.env.PORT || 5050;
const server = app.listen(PORT, () => {
  console.log("Server running in", process.env.NODE_ENV, "mode on port", PORT);
});

process.on("unhandledRejection", (err:any, promise) => {
  console.log(`Error: ${err.message}`);

  server.close(() => process.exit(1));
});
