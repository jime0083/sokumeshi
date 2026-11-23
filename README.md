# ソクメイシ

エンジニア・個人開発者向けに、約10分でデジタル名刺を作成し QR コードで共有できる iOS アプリ(Expo / Firebase)。

## 前提

- Node.js
- Xcode 26
- CocoaPods

## セットアップ

```bash
npm install
cd ios && pod install
```

## 起動

```bash
npx expo run:ios
```

シミュレータでビルド・起動する。Firebase Emulator に接続する場合は `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=1` を付けて実行する。

## ビルド

ローカルの Xcode で `ios/sokumeishi.xcworkspace` を開き、Archive する(`expo prebuild` で `ios/` を再生成しない)。

## テスト

Phase 1 で追加予定(`npm run typecheck` / `npm run lint` / `npm test` / `npm run test:rules` など)。

## ドキュメント

- `requirements.md`: 仕様の唯一の正
- `CLAUDE.md`: プロジェクトルール
- `progress.txt`: 実装タスクの進捗
- `manual-work.txt`: 手動作業タスク
- `problem.txt`: 問題管理
