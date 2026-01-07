const knex = require('knex');
const knexConfig = require('../../knexfile');
const config = require('./index');

// Chọn cấu hình tương ứng với môi trường (development/staging/production)
const environment = config.env;
const db = knex(knexConfig[environment]);

// Kiểm tra kết nối thử khi khởi động
db.raw('SELECT 1')
  .then(() => {
    console.log(`✅ Kết nối PostgreSQL (${environment}) thành công!`);
  })
  .catch((err) => {
    console.error('❌ Lỗi kết nối Database:', err.message);
    process.exit(1); // Dừng app nếu không kết nối được DB
  });

module.exports = db;