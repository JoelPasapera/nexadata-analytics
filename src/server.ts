import Fastify from "fastify";
import cors from "@fastify/cors";

import {
  analysisRoutes
} from "./routes/analysis.routes.js";

const app =
  Fastify({
    logger: true
  });

await app.register(
  cors,
  {
    origin: true
  }
);

app.get(
  "/",
  async () => {

    return {
      application:
        "DataPulse Analytics",

      version:
        "1.0.0",

      status:
        "online"
    };
  }
);

await app.register(
  analysisRoutes
);

const PORT =
  Number(
    process.env.PORT
  ) || 3000;

try {

  await app.listen({
    port: PORT,
    host: "0.0.0.0"
  });

  console.log(
    `DataPulse ejecutándose en http://localhost:${PORT}`
  );

} catch (error) {

  app.log.error(
    error
  );

  process.exit(1);
}
