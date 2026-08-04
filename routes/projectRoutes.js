const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.get('/', projectController.list);
router.post('/create', projectController.create);
router.get('/:id', projectController.detail);
router.post('/:id/update', projectController.update);
router.post('/:id/delete', projectController.delete);

module.exports = router;
