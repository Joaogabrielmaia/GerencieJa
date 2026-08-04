const express = require('express');
const router = express.Router();
const sprintController = require('../controllers/sprintController');

router.get('/', sprintController.list);
router.post('/create', sprintController.create);
router.post('/:id/update', sprintController.update);
router.post('/:id/finish', sprintController.finish);
router.post('/:id/delete', sprintController.delete);

module.exports = router;
