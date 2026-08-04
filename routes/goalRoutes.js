const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');

router.get('/', goalController.list);
router.post('/create', goalController.create);
router.post('/:id/update', goalController.update);
router.post('/:id/delete', goalController.delete);

module.exports = router;
