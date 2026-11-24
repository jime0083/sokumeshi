const fs = require('fs');
const path = require('path');
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require('@firebase/rules-unit-testing');
require('firebase/compat/app');
require('firebase/compat/firestore');
const firebaseCompat = require('firebase/compat/app').default;

const serverTimestamp = () => firebaseCompat.firestore.FieldValue.serverTimestamp();

let testEnv;

const OWNER_UID = 'owner-uid-0001';
const OTHER_UID = 'other-uid-0002';

// v1.03 が実際に送る形(git show f4c0c2e5:src/services/storage.ts, app/preview.tsx で確認)。
// portfolioLinks を含まず、personalInfo.profileImage を含み、画像は PNG data URL。
function buildV103Card(overrides = {}) {
  return {
    userId: OWNER_UID,
    cardId: OWNER_UID,
    cardName: 'My Card',
    templateId: 'template_01',
    orientation: 'vertical',
    frontImageUrl: 'data:image/png;base64,AAAA',
    backImageUrl: 'data:image/png;base64,BBBB',
    shortUrl: `https://sokumeshi-58f06.web.app/c/${OWNER_UID}`,
    qrCodeData: `https://sokumeshi-58f06.web.app/c/${OWNER_UID}`,
    personalInfo: {
      profileImage: 'file:///var/mobile/Containers/Data/Application/xxx/profile.jpg',
      nameJa: '山田太郎',
      nameEn: 'Taro Yamada',
      jobTitle: 'Engineer',
    },
    socialLinks: { twitter: 'https://twitter.com/example' },
    techStack: { languages: ['TypeScript'], frameworks: ['React'] },
    careerPortfolio: '経歴1行目\n経歴2行目\n経歴3行目',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

// v1.04 以降の形: personalInfo.profileImage を送らず、portfolioLinks を送る。画像は JPEG data URL。
function buildV104Card(overrides = {}) {
  return {
    userId: OWNER_UID,
    cardId: OWNER_UID,
    cardName: 'My Card',
    templateId: 'template_02',
    orientation: 'horizontal',
    frontImageUrl: 'data:image/jpeg;base64,CCCC',
    backImageUrl: 'data:image/jpeg;base64,DDDD',
    shortUrl: `https://sokumeshi-58f06.web.app/c/${OWNER_UID}`,
    qrCodeData: `https://sokumeshi-58f06.web.app/c/${OWNER_UID}`,
    personalInfo: {
      nameJa: '山田太郎',
      nameEn: 'Taro Yamada',
      jobTitle: 'Individual Developer',
    },
    socialLinks: { github: 'https://github.com/example' },
    techStack: { languages: ['TypeScript'], frameworks: ['React Native'] },
    careerPortfolio: '経歴1行目\n経歴2行目\n経歴3行目',
    portfolioLinks: ['https://portfolio.example.com', ''],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

async function seedCard(cardId, data) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().collection('cards').doc(cardId).set(data);
  });
}

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

afterEach(async () => {
  await testEnv.clearFirestore();
});

describe('get / list', () => {
  test('未認証で存在するカードの get は許可される', async () => {
    await seedCard(OWNER_UID, buildV103Card());
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(unauthedDb.collection('cards').doc(OWNER_UID).get());
  });

  test('未認証で存在しないカードの get は許可される(not found)', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const snap = await assertSucceeds(unauthedDb.collection('cards').doc('no-such-card').get());
    expect(snap.exists).toBe(false);
  });

  test('未認証の list は拒否される', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(unauthedDb.collection('cards').get());
  });

  test('認証済みでも list は拒否される', async () => {
    const authedDb = testEnv.authenticatedContext(OWNER_UID).firestore();
    await assertFails(authedDb.collection('cards').get());
  });
});

describe('create / update / delete の権限', () => {
  test('本人の create は許可される', async () => {
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();
    await assertSucceeds(ownerDb.collection('cards').doc(OWNER_UID).set(buildV103Card()));
  });

  test('本人の update は許可される', async () => {
    await seedCard(OWNER_UID, buildV103Card());
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();
    await assertSucceeds(
      ownerDb.collection('cards').doc(OWNER_UID).set(buildV103Card({ cardName: 'Updated Card' }))
    );
  });

  test('本人の delete は許可される', async () => {
    await seedCard(OWNER_UID, buildV103Card());
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();
    await assertSucceeds(ownerDb.collection('cards').doc(OWNER_UID).delete());
  });

  test('他人の create は拒否される', async () => {
    const otherDb = testEnv.authenticatedContext(OTHER_UID).firestore();
    await assertFails(otherDb.collection('cards').doc(OWNER_UID).set(buildV103Card()));
  });

  test('他人の update は拒否される', async () => {
    await seedCard(OWNER_UID, buildV103Card());
    const otherDb = testEnv.authenticatedContext(OTHER_UID).firestore();
    await assertFails(
      otherDb.collection('cards').doc(OWNER_UID).set(buildV103Card({ cardName: 'Hacked' }))
    );
  });

  test('他人の delete は拒否される', async () => {
    await seedCard(OWNER_UID, buildV103Card());
    const otherDb = testEnv.authenticatedContext(OTHER_UID).firestore();
    await assertFails(otherDb.collection('cards').doc(OWNER_UID).delete());
  });

  test('未認証の書き込みは拒否される', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(unauthedDb.collection('cards').doc(OWNER_UID).set(buildV103Card()));
  });

  test('userId を偽った書き込みは拒否される', async () => {
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();
    await assertFails(
      ownerDb.collection('cards').doc(OWNER_UID).set(buildV103Card({ userId: OTHER_UID }))
    );
  });

  test('cardId を偽った書き込みは拒否される', async () => {
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();
    await assertFails(
      ownerDb.collection('cards').doc(OWNER_UID).set(buildV103Card({ cardId: OTHER_UID }))
    );
  });
});

describe('スキーマ検証', () => {
  test('許可キー外のフィールドを含む書き込みは拒否される', async () => {
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();
    await assertFails(
      ownerDb.collection('cards').doc(OWNER_UID).set(buildV103Card({ extraField: 'not allowed' }))
    );
  });

  test('orientation が不正な値だと拒否される', async () => {
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();
    await assertFails(
      ownerDb.collection('cards').doc(OWNER_UID).set(buildV103Card({ orientation: 'diagonal' }))
    );
  });

  test('必須キーが欠けていると拒否される', async () => {
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();
    const card = buildV103Card();
    delete card.techStack;
    await assertFails(ownerDb.collection('cards').doc(OWNER_UID).set(card));
  });
});

describe('v1.03 / v1.04 互換', () => {
  test('v1.03 形式(PNG data URL・profileImage あり・portfolioLinks なし)の本人 create は許可される', async () => {
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();
    await assertSucceeds(ownerDb.collection('cards').doc(OWNER_UID).set(buildV103Card()));
  });

  test('v1.03 形式の本人 update は許可される', async () => {
    await seedCard(OWNER_UID, buildV103Card());
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();
    await assertSucceeds(
      ownerDb
        .collection('cards')
        .doc(OWNER_UID)
        .set(buildV103Card({ careerPortfolio: '更新後の経歴' }))
    );
  });

  test('v1.04 形式(JPEG data URL・profileImage なし・portfolioLinks あり)の本人 create は許可される', async () => {
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();
    await assertSucceeds(ownerDb.collection('cards').doc(OWNER_UID).set(buildV104Card()));
  });

  test('v1.04 形式の本人 update は許可される', async () => {
    await seedCard(OWNER_UID, buildV104Card());
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();
    await assertSucceeds(
      ownerDb
        .collection('cards')
        .doc(OWNER_UID)
        .set(buildV104Card({ cardName: 'Updated' }))
    );
  });
});

describe('cards 以外のコレクション', () => {
  test('cards 以外のコレクションへの読み取りは拒否される', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('users').doc('u1').set({ foo: 'bar' });
    });
    const authedDb = testEnv.authenticatedContext(OWNER_UID).firestore();
    await assertFails(authedDb.collection('users').doc('u1').get());
  });

  test('cards 以外のコレクションへの書き込みは拒否される', async () => {
    const authedDb = testEnv.authenticatedContext(OWNER_UID).firestore();
    await assertFails(authedDb.collection('users').doc('u1').set({ foo: 'bar' }));
  });
});
