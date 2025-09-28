/**
 * 環境設定 (DEV / PROD を手動で切り替え)
 * CURRENT_ENV の値を変更して使用します。
 */
const CRUTO_ENVIRONMENTS = Object.freeze({
  DEV: Object.freeze({
    SPREADSHEET_ID: '14tWh6likEQcFxTFmpMhCwmap1p5qub-MG5Oxff6YJY0',
    SHEETS: Object.freeze({
      LOG: 'Log',
      ACCIDENT: '事故報告',
      HOSPITAL: '入退院管理',
      USERS: '利用者管理',
      HOSPITAL_MASTER: '医療マスタ',
      SALES: '営業データ'
    }),
    LINE_WORKS: Object.freeze({
      CLIENT_ID: 'aq99AxovXKTKZKc0oj06',
      CLIENT_SECRET: 'mzYq8vAkhM',
      SERVICE_ACCOUNT: 'c5amh.serviceaccount@works-87651',
      DOMAIN_ID: '10314671',
      PRIVATE_KEY_FILE: 'private_20250720123804.key'
    }),
    ACCIDENT: Object.freeze({
      BOT_ID: '10724480',
      CHANNEL_ID: '76a979bb-5f37-10eb-41c7-f9e7222643c7',
      SPREADSHEET_URL: 'https://docs.google.com/spreadsheets/d/14tWh6likEQcFxTFmpMhCwmap1p5qub-MG5Oxff6YJY0/edit?gid=1986088926#gid=1986088926'
    }),
    HOSPITAL: Object.freeze({
      BOT_ID: '9946034'
    }),
    PHOTO_FOLDER_ID: '11r9PGtZKBuX22TnA6cIRHru6zlNYD9T_'
  }),
  PROD: Object.freeze({
    // TODO: 本番用の値に置き換えてください
    SPREADSHEET_ID: '14tWh6likEQcFxTFmpMhCwmap1p5qub-MG5Oxff6YJY0',
    SHEETS: Object.freeze({
      LOG: 'Log',
      ACCIDENT: '事故報告',
      HOSPITAL: '入退院管理',
      USERS: '利用者管理',
      HOSPITAL_MASTER: '医療マスタ',
      SALES: '営業データ'
    }),
    LINE_WORKS: Object.freeze({
      CLIENT_ID: 'aq99AxovXKTKZKc0oj06',
      CLIENT_SECRET: 'mzYq8vAkhM',
      SERVICE_ACCOUNT: 'c5amh.serviceaccount@works-87651',
      DOMAIN_ID: '10314671',
      PRIVATE_KEY_FILE: 'private_20250720123804.key'
    }),
    ACCIDENT: Object.freeze({
      BOT_ID: '10724480',
      CHANNEL_ID: '76a979bb-5f37-10eb-41c7-f9e7222643c7',
      SPREADSHEET_URL: 'https://docs.google.com/spreadsheets/d/14tWh6likEQcFxTFmpMhCwmap1p5qub-MG5Oxff6YJY0/edit?gid=1986088926#gid=1986088926'
    }),
    HOSPITAL: Object.freeze({
      BOT_ID: '9946034'
    }),
    PHOTO_FOLDER_ID: '11r9PGtZKBuX22TnA6cIRHru6zlNYD9T_'
  })
});

/**
 * ✏️ 手動切り替え箇所: 'DEV' または 'PROD'
 */
const CURRENT_ENV = 'DEV';

/**
 * アプリ全体で参照する環境定義
 */
const ENV = Object.freeze(CRUTO_ENVIRONMENTS[CURRENT_ENV]);

if (!ENV) {
  throw new Error('選択された CURRENT_ENV に対応する設定が見つかりません: ' + CURRENT_ENV);
}
