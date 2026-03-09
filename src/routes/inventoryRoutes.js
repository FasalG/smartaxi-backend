import express from 'express';
import {
    getItems, createItem, updateItem, deleteItem, createBulkItems
} from '../controllers/inventoryController.js';

const router = express.Router();

router.route('/bulk')
    .post(createBulkItems);

router.route('/')
    .get(getItems)
    .post(createItem);

router.route('/:id')
    .put(updateItem)
    .delete(deleteItem);

export default router;
