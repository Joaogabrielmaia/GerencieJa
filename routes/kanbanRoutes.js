const express = require('express');
const router = express.Router();
const kanbanController = require('../controllers/kanbanController');

router.get('/', kanbanController.index);
router.post('/move', kanbanController.moveTask);
router.post('/create', kanbanController.createTask);
router.post('/:id/update', kanbanController.updateTask);
router.post('/:id/delete', kanbanController.deleteTask);

module.exports = router;
