/**
 * 営業支援Bot用 環境設定
 * CURRENT_ENV を 'DEV' / 'PROD' に書き換えるだけで切り替え可能。
 */
const SALES_ENVIRONMENTS = Object.freeze({
  DEV: Object.freeze({
    SPREADSHEET_ID: '1nJaGTKQfYs6BVK0hQKQUBya_gS7CeUWUKv3adhehgt4',
    SHEETS: Object.freeze({
      MEDICAL: '医療機関',
      HOME: '居宅',
      FACILITY: '施設',
      COUNSEL: '相談支援事業所',
      HOSPITAL_TRENDS: '入院動向',
      YEARLY_TRENDS: '年間動向',
      LOG: 'Log'
    }),
    LINE_WORKS: Object.freeze({
      CLIENT_ID: 'aq99AxovXKTKZKc0oj06',
      CLIENT_SECRET: 'mzYq8vAkhM',
      SERVICE_ACCOUNT: 'c5amh.serviceaccount@works-87651',
      DOMAIN_ID: '10314671',
      PRIVATE_KEY_FILE: 'private_20250720123804.key'
    }),
    SALES_BOT: Object.freeze({
      BOT_ID: '10834470',
      CALLBACK_URL: 'https://script.google.com/macros/s/AKfycbyOPk9BoPSZRkx_PmqeNIBjvuhvwF90PYiz4LkZ69h11P-ArDrnMUKg4Auhjr96dd1YvQ/exec'
    }),
    GEO: Object.freeze({
      USE_GOOGLE: true,
      GOOGLE_MAPS_API_KEY: '' // 必要に応じて設定
    })
  }),
  PROD: Object.freeze({
    // TODO: 本番の値を設定
    SPREADSHEET_ID: '1nJaGTKQfYs6BVK0hQKQUBya_gS7CeUWUKv3adhehgt4',
    SHEETS: Object.freeze({
      MEDICAL: '医療機関',
      HOME: '居宅',
      FACILITY: '施設',
      COUNSEL: '相談支援事業所',
      HOSPITAL_TRENDS: '入院動向',
      YEARLY_TRENDS: '年間動向',
      LOG: 'Log'
    }),
    LINE_WORKS: Object.freeze({
      CLIENT_ID: 'aq99AxovXKTKZKc0oj06',
      CLIENT_SECRET: 'mzYq8vAkhM',
      SERVICE_ACCOUNT: 'c5amh.serviceaccount@works-87651',
      DOMAIN_ID: '10314671',
      PRIVATE_KEY_FILE: 'private_20250720123804.key'
    }),
    SALES_BOT: Object.freeze({
      BOT_ID: '10834470',
      CALLBACK_URL: 'https://script.google.com/macros/s/AKfycbyOPk9BoPSZRkx_PmqeNIBjvuhvwF90PYiz4LkZ69h11P-ArDrnMUKg4Auhjr96dd1YvQ/exec'
    }),
    GEO: Object.freeze({
      USE_GOOGLE: true,
      GOOGLE_MAPS_API_KEY: ''
    })
  })
});

/**
 * ✏️ 手動切り替え ('DEV' / 'PROD')
 */
const CURRENT_ENV = 'DEV';

/**
 * アプリ全体で参照する環境変数
 */
const ENV = Object.freeze(SALES_ENVIRONMENTS[CURRENT_ENV]);

if (!ENV) {
  throw new Error('選択された CURRENT_ENV に対応する環境定義が見つかりません: ' + CURRENT_ENV);
}
