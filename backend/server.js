import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { config } from './src/config/env.js';

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(config.port, () => {
      console.log(`[Server]: VaultDrop active in ${config.env} mode on port ${config.port}`);
      console.log(`[Health]: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    console.error(`[Fatal]: Server failed to boot: ${error.message}`);
    process.exit(1); 
  }
};

startServer();