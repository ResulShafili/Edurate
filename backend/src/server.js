const app = require('./app');
const { pool } = require('./config/db');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`EduRate API running on port ${PORT}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Closing server...`);

  server.close(async () => {
    await pool.end();
    console.log('Server closed.');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
