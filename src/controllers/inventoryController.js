import RentalItem from '../models/RentalItem.js';

// @desc    Get all items
// @route   GET /api/items
export const getItems = async (req, res) => {
    try {
        const items = await RentalItem.find({ user: req.user._id }).populate('category');
        res.status(200).json({ success: true, data: items, message: null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create an item
// @route   POST /api/items
export const createItem = async (req, res) => {
    try {
        const newItem = new RentalItem({
            ...req.body,
            user: req.user._id
        });
        const item = await newItem.save();
        res.status(201).json({ success: true, data: item, message: 'Item created successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Create multiple items (with upsert for duplicates)
// @route   POST /api/items/bulk
export const createBulkItems = async (req, res) => {
    try {
        const items = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Request body must be a non-empty array of items' });
        }

        const operations = items.map(item => {
            const itemObj = { ...item };
            delete itemObj._id;

            return {
                updateOne: {
                    filter: { sku: item.sku, user: req.user._id },
                    update: { $set: { ...itemObj, user: req.user._id } },
                    upsert: true
                }
            };
        });

        const result = await RentalItem.bulkWrite(operations);
        const itemSkus = items.map(i => i.sku);
        const insertedItems = await RentalItem.find({
            user: req.user._id,
            sku: { $in: itemSkus }
        }).populate('category');

        res.status(201).json({ success: true, data: insertedItems, message: 'Items imported successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update an item
// @route   PUT /api/items/:id
export const updateItem = async (req, res) => {
    try {
        const item = await RentalItem.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!item) return res.status(404).json({ success: false, message: 'Item not found or unauthorized' });
        res.status(200).json({ success: true, data: item, message: 'Item updated successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
export const deleteItem = async (req, res) => {
    try {
        const item = await RentalItem.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!item) return res.status(404).json({ success: false, message: 'Item not found or unauthorized' });
        res.status(200).json({ success: true, data: item, message: 'Item deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
