const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

router.get('/', teamController.list);
router.post('/create', teamController.create);
router.post('/:id/update', teamController.update);
router.post('/:id/delete', teamController.delete);

module.exports = router;
