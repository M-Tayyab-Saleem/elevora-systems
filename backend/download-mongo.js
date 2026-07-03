const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  try {

    const mongod = await MongoMemoryServer.create();

    await mongod.stop();

  } catch (error) {
    console.error('Failed to start MongoMemoryServer:', error);
  }
})();
