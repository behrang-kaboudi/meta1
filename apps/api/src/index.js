process.env.mainDir = __dirname;
process.env.TemplateNumber = "25";
// require('events').EventEmitter.prototype._maxListeners = 100;
process.setMaxListeners(2000);

require("events").EventEmitter.prototype._maxListeners = 100;
(async () => {
  try {
    const server = require("./routes/server/server");
    await server.main();
  } catch (err) {
    console.error("Fatal start error:", err);
    process.exit(1);
  }
})();

// برای لاگ بهترِ خطاهای ناگرفته — اختیاری
process.on("unhandledRejection", (err) => {
  console.error("unhandledRejection:", err);
});
process.on("uncaughtException", (err) => {
  console.error("uncaughtException:", err);
  process.exit(1);
});
