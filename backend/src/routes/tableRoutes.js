const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');

router.post('/', tableController.createTable);
router.get('/', tableController.getTables);
router.post('/:id/regenerate', tableController.regenerateQR);
router.post('/verify', tableController.verifyQR); // Thêm dòng này
router.patch('/:id/status', tableController.updateTableStatus); // [MỚI] Dùng method PATCHnpm
router.put('/:id', tableController.updateTable); // Thêm dòng này (PUT)
router.get('/download-zip', tableController.downloadAllQRs);
router.post('/regenerate-all', tableController.regenerateAllQRs);


module.exports = router;