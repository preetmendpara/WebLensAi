import "dotenv/config";
import { app } from "./app.js";
import { dbEnabled } from "./services/db.js";
import { PROVIDER_CHAIN } from "./services/ai/providers.js";

const port = process.env.PORT || 5174;

app.listen(port, () => {
  const configured = PROVIDER_CHAIN.filter((p) => p.key).map((p) => p.name);
  console.log(`WebLens API on http://localhost:${port}`);
  console.log(`  database: ${dbEnabled ? "supabase" : "NOT CONFIGURED"}`);
  console.log(`  ai chain: ${configured.join(" -> ") || "none configured"}`);
});
