# ソクメイシ 改修要件定義書

作成日: 2026-11-23
この文書が仕様の唯一の正。仕様変更は確定した時点でこの文書を先に更新し、決定日を併記する。

## 0. 改修の前提条件(2026-11-23 決定・変更不可)

1. **UI/UX の変更は一切行わない**(画面構成・レイアウト・色・遷移・操作は現状のまま)。
   例外はユーザーが承認した次の3点のみ:
   - 英語表示時に日本語のまま残っている文言の英訳(日本語表示時の文言は1文字も変えない)(§3.3)
   - Web 名刺ページの「アプリがインストールされていれば自動的に起動します。」の1行削除(§3.2)
   - iOS 権限ダイアログ文言(OS 表示)の変更(§7.3)
2. **対象は iOS のみ**(Android・Web アプリ版は対象外。Android 関連ファイルは削除する)
3. **新機能は実装しない**。対象は「名刺を作成し、QR コードで相手に共有する」既存機能の不具合修正・安全性・品質改善のみ

## 1. サービス概要
- 目的: エンジニア・個人開発者が約10分でデジタル名刺を作り、QR コードで相手に共有できる
- 利用者: 一般公開(App Store 公開済み。現行 v1.03)
- 改修版の公開: 全 Phase 完了後に v1.04 として App Store に提出
- 想定規模: 1ユーザー1枚の名刺(Firestore `cards/{uid}`)。規模の変更なし

## 2. ユーザー種別
| 種別 | できること | ログイン |
|------|-----------|---------|
| 名刺作成者(アプリ利用者) | 自分の名刺の作成・更新・カメラロール保存・QR 表示 | Firebase 匿名認証(自動) |
| 名刺受取者 | QR を読んで Web ページで名刺画像(表・裏)を見る | 不要 |

## 3. 画面仕様(現状維持。見た目の変更なし)

### 3.1 アプリ画面

| 画面 | 表示項目・入力部品 | 初期状態 | エラー表示 | 戻る |
|---|---|---|---|---|
| 起動 `index` | 黒背景＋ローディング GIF | 保存済み名刺(shortUrl あり)→preview / なし→templates へ自動遷移 | なし | なし |
| テンプレート `templates` | 6種のテンプレート一覧(縦3・横3)、Language ボタン→日本語/English モーダル | — | なし | ヘッダー戻る |
| 表面 `front` | プロフィール写真(ライブラリから選択)、氏名(日)、氏名(英)、職業(モーダル: エンジニア/個人開発者)、SNS・連絡先×4(サービス選択モーダル＋URL) | 下書き(zustand 永続化)を復元 | 氏名(日/英)どちらか空で「名前が入力されていません」アラート | templates |
| 裏面 `back` | 言語・スキル、FW、経歴3行(各30字で切り詰め)、ポートフォリオ URL×2 | 下書きを復元 | なし | front |
| プレビュー `preview` | 名刺 QR(保存前はグレー枠)、編集ボタン(→templates へ replace)、表面・裏面プレビュー、保存ボタン、画像にしてスマホに保存ボタン | 保存済みなら QR 表示 | 保存失敗・キャプチャ失敗・写真権限なし・画像サイズ超過(§4.3)をアラート | ヘッダー戻る |

- ヘッダータイトル(Templates / Front / Back / Preview)は現状どおり英語固定(対象外)
- 最小端末での収まり・レイアウトは現状から変えない

### 3.2 Web 名刺ページ `https://sokumeshi-58f06.web.app/c/{cardId}`
- 表示: 見出し「名刺を表示しています」、表面画像、裏面画像(現状どおり)
- **変更(2026-11-23 決定)**: アプリ起動の試行(`sokumeishi://card/{id}`)を削除し、Web 表示に一本化する。
  ページ表示と同時に Firestore から取得して表示する(800ms 待機を廃止)
- **変更(2026-11-23 決定)**: 「アプリがインストールされていれば自動的に起動します。」の1行を削除
- 名刺が存在しない場合: 「名刺が見つかりませんでした。」(現状どおり)
- 画像形式: `data:image/png;base64,...`(既存データ)と `data:image/jpeg;base64,...`(v1.04以降)の両方を表示できること
- 開発時(hostname が localhost / 127.0.0.1)は Firestore Emulator に接続する
- Universal Links / AASA は使わない。`/.well-known/apple-app-site-association` は公開しない
- Hosting トップページ `/` は**対象外**。デプロイ後も現在と同じ内容(Firebase 初期ページ)が表示されること

### 3.3 文言の英訳(2026-11-23 決定)
- 日本語表示時: 現在の文言のまま(1文字も変えない)
- 英語表示時: 下表の英訳を表示する。キーは `src/i18n/locales/{ja,en}.json` に追加する
- 選択言語は AsyncStorage に保存し、再起動後も保持する(未保存時は端末の言語: ja で始まれば ja、それ以外は en)

| 場所 | 日本語(現状) | 英語 |
|---|---|---|
| front 職業未選択 | 選択してください | Please select |
| front 見出し | SNS・連絡先 | SNS / Contact |
| front サービス未選択 | サービスを選択 | Select a service |
| front アラート | 名前が入力されていません | Please enter your name |
| front ボタン | 裏面へ進む | Go to back side |
| front 職業モーダル | エンジニア / 個人開発者 | Engineer / Individual Developer |
| back 経歴 placeholder | 30文字程度 | Up to 30 characters |
| back 見出し | ポートフォリオ | Portfolio |
| templates 名称 | テンプレート1〜6 | Template 1〜6 |
| preview QR 説明 | 名刺QRコード(QRコードは保存ボタンタップ後に生成されます) | Card QR code (generated after you tap Save) |
| preview ボタン | 保存 / 保存中... | Save / Saving... |
| preview ボタン | 画像にしてスマホに保存 | Save as image to phone |
| preview アラート題 | エラー | Error |
| preview アラート | テンプレートが選択されていません | No template selected |
| preview アラート | 画像のキャプチャに失敗しました(。) | Failed to capture the image. |
| preview アラート | 保存完了 / Firebaseにアップロードしました | Saved / Uploaded to Firebase |
| preview アラート | 権限エラー / 設定アプリから写真へのアクセスを許可してください。 | Permission error / Please allow photo access in the Settings app. |
| preview アラート | 保存しました / 名刺画像をカメラロールに保存しました。 | Saved / Saved the card images to your camera roll. |
| preview アラート | 画像の保存に失敗しました。 | Failed to save the images. |
| preview アラート(新規・§4.3) | 画像サイズが大きすぎるため保存できませんでした | The image is too large to save. |
| 名刺見出し(テンプレート1〜6) | 言語・スキル | Skills |
| 名刺見出し(テンプレート1〜6) | FW(フレームワーク) | Frameworks |
| 名刺見出し(テンプレート1〜6) | 経歴 | Career |
| 名刺見出し(テンプレート1〜6) | ポートフォリオ | Portfolio |

- 職業の保存値(`Engineer` / `Individual Developer`)は現状どおり変えない(名刺に印字される値も現状どおり)
- 言語モーダルの「日本語」「English」、「Language ▾」は現状どおり
- 名刺見出しの英訳は、英語表示時に6テンプレートすべてではみ出し・重なりがないこと

## 4. データモデル

### 4.1 Firestore `cards/{cardId}`(cardId = 匿名認証 uid。1ユーザー1枚)
| 項目 | 型 | 必須 | 説明 |
|---|---|---|---|
| userId | string | ○ | uid(= cardId) |
| cardId | string | ○ | uid |
| cardName | string | - | 'My Card' |
| templateId | string | ○ | 'template_01'〜'template_06' |
| orientation | string | ○ | 'vertical' / 'horizontal' |
| frontImageUrl / backImageUrl | string | ○ | data URL(PNG: 既存 / JPEG: v1.04以降) |
| shortUrl / qrCodeData | string | ○ | `https://sokumeshi-58f06.web.app/c/{uid}`(**形式変更禁止**。配布済み QR が使えなくなるため) |
| personalInfo | map | ○ | nameJa, nameEn, jobTitle。v1.04 以降 profileImage は送らない(端末内パスで無意味なため) |
| socialLinks | map | ○ | サービス名→URL |
| techStack | map | ○ | languages[], frameworks[] |
| careerPortfolio | string | - | 経歴(改行区切り3行) |
| portfolioLinks | array | - | v1.04 以降保存する(現状は保存漏れ) |
| createdAt / updatedAt | timestamp | ○ | serverTimestamp |

- 既存データ(過去の名刺・userId なしのレガシー名刺・不要な匿名ユーザー)は**そのまま残す**(2026-11-23 決定)

### 4.2 アクセス権限方針(firestore.rules。2026-11-23 決定)
- `cards/{cardId}`
  - get: 誰でも可(受取者が Web で閲覧するため。cardId は推測困難な uid)
  - list: **全面禁止**
  - create / update: `request.auth.uid == cardId` かつ `userId == uid` かつ `cardId == uid`、許可キー(上表)以外を含まない、
    orientation が 'vertical'/'horizontal'
  - delete: `request.auth.uid == cardId` のみ
- 上記以外のパス: 全面禁止(W1 で他コレクションの存在を確認し、あれば仕様を決めてから進める)
- **現行 v1.03 アプリとの互換**: v1.03 が送る形式(PNG data URL、personalInfo.profileImage あり、portfolioLinks なし)の
  本人書き込みが拒否されないこと。v1.03 の全件取得・他人削除はルールで拒否され、v1.03 側は try/catch で保存を続行する

### 4.3 画像
- アップロード用: ViewShot で JPEG キャプチャ。形式・品質・幅は検証タスク 3-2 の計測で決め、ここに追記する
  - 条件: 写真ありの最悪ケースで表裏の base64 合計 800,000 文字以下、Web 表示で文字が読める画質
  - 決定値: (3-2 完了時に追記)
- 保存前ガード: 表裏 base64 合計が 900,000 文字を超えたらアップロードせず、既存のエラーアラートに §3.3 の文言を表示
- カメラロール保存用: 現状どおり PNG・quality 1
- プロフィール写真: 選択時に `documentDirectory/profile/` へコピーし、ストアには**ファイル名(相対)**を保存して表示時に絶対パスへ解決する
  (iOS はアプリ更新でコンテナパスが変わるため)。既存ユーザーの絶対パス(キャッシュ)は起動時にファイルが存在すればコピーして移行、
  存在しなければ変更しない

### 4.4 認証
- 起動後の初回保存でも、`auth.authStateReady()` で永続化された匿名ユーザーの復元を待ってから uid を確定する
  (復元前に新規匿名ユーザーを作り、名刺 URL が変わる不具合の修正)
- デバッグ用の `accounts:signUp` 直接呼び出しは削除する(保存のたびに不要な匿名ユーザーが作られていた)

## 5. 外部サービス・API
| サービス | 用途 | 料金(確認日・出典) | 制約 | 秘密情報 |
|---|---|---|---|---|
| Firebase Authentication(匿名) | uid 発行 | 現行の Blaze プランのまま(2026-11-25 確認) | — | なし(Firebase の Web API キーは秘密情報ではない) |
| Cloud Firestore | 名刺データ・画像 | 現行の Blaze プランのまま | 1ドキュメント最大 1MiB | — |
| Firebase Hosting | Web 名刺ページ | 現行の Blaze プランのまま | — | — |
| App Store | 配布 | — | 2026-04-28 以降は Xcode 26 / iOS 26 SDK でのビルドが必須(確認日 2026-11-23、[Apple](https://developer.apple.com/news/upcoming-requirements/?id=04282026a))。Expo SDK 54 は Xcode 26 に対応([Expo](https://expo.dev/changelog/sdk-54)) | — |

- Firebase Storage へは移行しない(2026-11-23 決定)

## 6. 技術スタック(確定。変更にはユーザー承認必須)
- Expo SDK 54(据え置き)/ React Native 0.81 / React 19.1 / expo-router 6 / TypeScript 5.9
- 状態管理: zustand(AsyncStorage 永続化)/ i18n: i18next + react-i18next
- Firebase JS SDK 12(Auth 匿名・Firestore)/ Firebase Hosting
- ビルド: **ローカル Xcode 26 で Archive**(`ios/` が正。Info.plist 等の変更は `ios/` と `app.json` の両方を揃える)
- New Architecture: 有効(Info.plist の現状に合わせ app.json を `newArchEnabled: true` に揃える)
- テスト: Jest 29(jest-expo ~54.0.18)、@testing-library/react-native 13.3.3(14.x は expo-router 6 非対応)、
  react-test-renderer 19.1.0、expo-router/testing-library(renderRouter)、
  Firebase Emulator(firebase-tools 15 / Firestore 8080・Hosting 5002)+ @firebase/rules-unit-testing 5.0.1(firebase 12 対応版)。
  ルールテストは CommonJS の .js を node 環境の Jest で実行(2026-11-24 決定。1-6・1-9 の検証結果)

## 7. 非機能要件
### 7.1 費用
- 追加費用なし(Firebase の現行プランのまま。2026-11-25 W1 で現行プランが Blaze(従量制)であることを確認。今回の改修で使う機能・量は増やさない)

### 7.2 セキュリティ
- §4.2 のルールをリポジトリで管理し、Emulator テストで検証する
- 他人のデータを取得・削除するクライアント処理を持たない
- 本番ビルドで console 出力をしない。`LogBox.ignoreAllLogs()` は削除

### 7.3 iOS 設定(2026-11-23 決定)
- `NSAllowsArbitraryLoads` と HTTP 例外ドメイン設定を削除(全通信 HTTPS)
- 未使用の `NSCameraUsageDescription` / `NSMicrophoneUsageDescription` を削除
- 権限文言(InfoPlist.strings で日英):
  - NSPhotoLibraryUsageDescription: ja「名刺に載せるプロフィール写真を選ぶために写真ライブラリにアクセスします。」/ en「Used to choose a profile photo for your business card.」
  - NSPhotoLibraryAddUsageDescription: ja「作成した名刺画像を写真ライブラリに保存するために使用します。」/ en「Used to save your business card images to your photo library.」
- PrivacyInfo.xcprivacy の収集データを実態に合わせる: 氏名(Name)、写真(Photos or Videos。名刺画像に含まれる)、
  その他のユーザーコンテンツ(Other User Content)、ユーザー ID(User ID。匿名 uid)。いずれも用途 App Functionality、トラッキングなし
- app.json から android / web 設定を削除

### 7.4 対応端末
- iPhone(iOS。現状の対応範囲を維持)

### 7.5 リポジトリ
- node_modules・ios/Pods・ios/build・.expo・*.ipa・*.keystore・.DS_Store 等は git 追跡しない(履歴は書き換えない。2026-11-23 決定)
- android_backup / ios_backup / Xcode 書き出しフォルダ / 未使用画面(qr.tsx, modal.tsx)/ dynamicLinks.ts / Expo テンプレートの残骸を削除

## 8. 開発プロセス(ハーネス)
- 各タスクは **sokumeishi-impl**(実装担当)が実装し、**sokumeishi-review**(レビュー担当)が
  Jest(ユニット・renderRouter 画面テスト)・Firebase Emulator テスト・iOS シミュレータでのビルド/起動確認で検証する
- 認証・Firestore ルール・データ送信に関わるタスクは **sokumeishi-security**(セキュリティ担当)の確認も必須
- **sokumeishi-review の合格をもってタスク完了とする**(詳細は CLAUDE.md)
- テストは本番データを汚さない環境(Firebase Emulator・demo プロジェクト ID)で行う。本番確認は読み取りのみ
- タスク一覧は progress.txt、手動作業は manual-work.txt、問題は problem.txt で管理する

## 9. フェーズ計画
| Phase | 内容 |
|-------|------|
| 1 | 開発基盤とリポジトリ整理(git 追跡整理・不要物削除・型エラー解消・Jest / Emulator 基盤) |
| 2 | セキュリティ修正(危険なクライアント処理の削除・Firestore ルール・本番反映確認) |
| 3 | 不具合修正(認証復元・JPEG 化・写真永続化・ポートフォリオ保存・Web 一本化・英訳) |
| 4 | iOS 設定・プライバシー・品質(Info.plist・PrivacyInfo・console 削除・総合確認) |
| 5 | リリース(v1.04 バージョン更新 → 手動で Archive・提出) |
