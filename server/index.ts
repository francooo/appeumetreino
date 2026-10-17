import "./load-env";
import { createApp } from "./app";

(async () => {
  const { server } = await createApp();

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      console.log(`express server serving on port ${port}`);
    },
  );
})();
