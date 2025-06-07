import { createServer } from "./server";
import config from "./config";

const server = createServer();

server.listen(config.port, () => {
  console.log(`API is running on http://localhost:${config.port}`);
});
