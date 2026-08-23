import {
  FastifyInstance
} from "fastify";

import multipart from
  "@fastify/multipart";

import { parseCsv }
  from "../services/csv.service.js";

import {
  analyzeDataset
} from "../services/analysis.service.js";

export async function analysisRoutes(
  app: FastifyInstance
) {

  await app.register(
    multipart
  );

  app.post(
    "/api/analyze",
    async (
      request,
      reply
    ) => {

      const file =
        await request.file();

      if (!file) {

        return reply
          .code(400)
          .send({
            error:
              "Debes enviar un archivo CSV."
          });
      }

      const buffer =
        await file.toBuffer();

      const csv =
        buffer.toString(
          "utf-8"
        );

      try {

        const dataset =
          parseCsv(csv);

        const analysis =
          analyzeDataset(
            dataset
          );

        return {
          success: true,
          file:
            file.filename,
          analysis
        };

      } catch (error) {

        return reply
          .code(400)
          .send({
            error:
              error instanceof Error
                ? error.message
                : "Error procesando CSV."
          });
      }
    }
  );
}
