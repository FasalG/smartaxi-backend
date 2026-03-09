import Category from '../models/Category.js';

// @desc    Get all categories
// @route   GET /api/categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ user: req.user._id });
        res.status(200).json({ success: true, data: categories, message: null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a category
// @route   POST /api/categories
export const createCategory = async (req, res) => {
    try {
        const newCategory = new Category({
            ...req.body,
            user: req.user._id
        });
        const category = await newCategory.save();
        res.status(201).json({ success: true, data: category, message: 'Category created successfully.' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Create multiple categories (with upsert for duplicates)
// @route   POST /api/categories/bulk
export const createBulkCategories = async (req, res) => {
    try {
        const categories = req.body;
        if (!Array.isArray(categories) || categories.length === 0) {
            return res.status(400).json({ success: false, message: 'Request body must be a non-empty array of categories' });
        }

        const operations = categories.map(category => ({
            updateOne: {
                filter: { name: category.name, user: req.user._id },
                update: { $set: { ...category, user: req.user._id } },
                upsert: true
            }
        }));

        const result = await Category.bulkWrite(operations);

        // Fetch and return the updated/inserted categories
        const categoryNames = categories.map(c => c.name);
        const insertedCategories = await Category.find({
            user: req.user._id,
            name: { $in: categoryNames }
        });

        res.status(201).json({ success: true, data: insertedCategories, message: 'Categories imported successfully.' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!category) return res.status(404).json({ success: false, message: 'Category not found or unauthorized' });
        res.status(200).json({ success: true, data: category, message: 'Category updated successfully.' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!category) return res.status(404).json({ success: false, message: 'Category not found or unauthorized' });
        res.status(200).json({ success: true, data: category, message: 'Category deleted successfully.' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
