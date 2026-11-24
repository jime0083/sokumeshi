const fs = require('fs');
const path = require('path');
const { initializeTestEnvironment, assertFails } = require('@firebase/rules-unit-testing');

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-sokumeishi',
    firestore: {
      rules: fs.readFileSync(path.resolve(__dirname, '../../firestore.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

test('未認証の get は拒否される(仮ルール)', async () => {
  const unauthedDb = testEnv.unauthenticatedContext().firestore();
  await assertFails(unauthedDb.collection('cards').doc('someCardId').get());
});
