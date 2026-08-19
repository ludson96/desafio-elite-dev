import { app } from "./app.js";
import { env } from "./config/env.js";

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
  console.log(`📡 Modo: ${env.NODE_ENV}`);
  console.log(`📡 Healthcheck disponível em: http://localhost:${PORT}/health`);
});
