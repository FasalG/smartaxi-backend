import express from 'express';
import {
    getCategories, createCategory, updateCategory, deleteCategory, createBulkCategories
} from '../controllers/categoryController.js';

const router = express.Router();

router.route('/bulk').post(createBulkCategories);

router.route('/')
    .get(getCategories)
    .post(createCategory);

router.route('/:id')
    .put(updateCategory)
    .delete(deleteCategory);

export default router;
