import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getExpenses,
    createExpense,
    getExpenseTypes,
    addExpenseType,
    deleteExpenseType,
    updateExpense,
    deleteExpense
} from '../controllers/expenseController.js';

const router = express.Router();

// General expenses
router.route('/')
    .get(protect, getExpenses)
    .post(protect, createExpense);

router.route('/:id')
    .put(protect, updateExpense)
    .delete(protect, deleteExpense);

// Expense categories/types
router.route('/types')
    .get(protect, getExpenseTypes)
    .post(protect, addExpenseType);

router.route('/types/:type')
    .delete(protect, deleteExpenseType);

export default router;
