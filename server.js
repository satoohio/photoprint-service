const { startApp } = require('./app');

async function main() {
  const app = await startApp();
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`PhotoPrint service running on http://localhost:${port}`);
  });
}

main().catch((error) => {
  console.error('Failed to start server. Check Netlify Database configuration.');
  process.exit(1);
});
