import { app } from "./app.js";
import "dotenv/config";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
  console.log(`📡 Healthcheck disponível em: http://localhost:${PORT}/health`);
});
