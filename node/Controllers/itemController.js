const { default: mongoose } = require('mongoose');

module.exports = function (app) {
    const db = require('../Model/db')

    const itemController = {};

    // itemController.create = async (req, res) => {
    //     try {
    //         console.log(req.body, req.files, "sssssssssssssssssssssss");
    //         const { itemName, subCategory, stock, itemLimit, sortNO, price, approvalStatus, isOffer, itemStatus } = req.body
    //         if (!req.files) {
    //             return res.status(400).json({ status: false, message: "No file uploaded" });
    //         }

    //         const addData = await db.item.create({

    //             itemStatus: itemStatus == 'on' ? true : false,
    //             // itemCartLimit,
    //             // tax,
    //             isOffer: isOffer == 'yes' ? true : false,
    //             approvalStatus: approvalStatus == 'yes' ? true : false,
    //             sortNo: sortNO,
    //             itemPrice: price,
    //             itemLimitLevel: itemLimit,
    //             itemStock: stock,
    //             subCategoryName: subCategory,
    //             itemName: itemName,



    //             itemImage: req.files[0].destination + req.files[0].filename, // Save filename in the DB
    //         });

    //         // console.log("API works");
    //         res.status(200).json({ status: true, message: "Item Created Successfully", data: addData });
    //     } catch (err) {
    //         console.error("Error in controller", err);
    //         res.status(500).json({ status: false, message: "Internal Server Error" });
    //     }
    // };



    itemController.create = async (req, res) => {
        try {
            console.log(req.body, req.files, "sssssssssssssssssssssss");

            const { id, itemName, subCategory, stock, itemLimit, sortNO, price, approvalStatus, isOffer, itemStatus } = req.body;

            if (!req.files) {
                return res.status(400).json({ status: false, message: "No file uploaded" });
            }

            if (id) {
                // Update existing item

                var updateData = {
                    itemStatus: itemStatus === 'on',
                    isOffer: isOffer === 'yes',
                    approvalStatus: approvalStatus === 'yes',
                    sortNo: sortNO,
                    itemPrice: price,
                    itemLimitLevel: itemLimit,
                    itemStock: stock,
                    subCategoryName: subCategory,
                    itemName: itemName,

                }

                if (req.files && req.files.length > 0) {
                    updateData.itemImage = req.files[0].destination + "/" + req.files[0].filename
                }
                // itemImage: req.files[0].destination + "/" + req.files[0].filename,

                const updatedItem = await db.item.findOneAndUpdate(
                    { _id: new mongoose.Types.ObjectId(id) },
                    updateData,
                    { new: true }
                );

                if (!updatedItem) {
                    return res.status(404).json({ status: false, message: "Item not found" });
                }

                return res.status(200).json({ status: true, message: "Item Updated Successfully", data: updatedItem });
            } else {
                // Generate new `item_id`
                const lastItem = await db.item.findOne().sort({ item_id: -1 });
                const newItemId = lastItem ? lastItem.item_id + 1 : 100;

                // Insert new item
                const addData = await db.item.create({
                    item_id: newItemId,
                    itemStatus: itemStatus === 'on',
                    isOffer: isOffer === 'yes',
                    approvalStatus: approvalStatus === 'yes',
                    sortNo: sortNO,
                    itemPrice: price,
                    itemLimitLevel: itemLimit,
                    itemStock: stock,
                    subCategoryName: subCategory,
                    itemName: itemName,
                    itemImage: req.files[0].destination + "/" + req.files[0].filename, // Save filename in the DB
                });

                return res.status(200).json({ status: true, message: "Item Created Successfully", data: addData });
            }
        } catch (err) {
            console.error("Error in controller", err);
            return res.status(500).json({ status: false, message: "Internal Server Error" });
        }
    };



    itemController.listItems = async (req, res) => {
        try {
            const { sort = "asc", itemStatus, skip, limit } = req.query; // Get search & sort from query params
            const { sortField, sortno ,search,subCategoryName} = req.body
            // const items = await db.item.find({
            //     itemName: { $regex: search, $options: "i" } // Case-insensitive search
            // }).sort({ sortNo: sort === "desc" ? -1 : 1 });


            const matchCondition = {}
            if (subCategoryName) {
                matchCondition['subCategoryName'] = parseInt(subCategoryName); // Ensure it's a number
            }
            if (itemStatus) {
                matchCondition['itemStatus'] = itemStatus
            }
            if (search) {

                matchCondition['itemName'] = { $regex: search, $options: "i" }

            }
            // if (sort == 'desc') {

            //     matchCondition['sortNo'] = -1

            // } else {
            //     matchCondition['sortNo'] = 1
            // }


            let itemPipeLine = [
                {
                    $match: matchCondition
                },


            ]
            console.log("sortField", sortField)
            if (sortField && sortField == 'item_id' && sortField != '') {

                itemPipeLine.push({ $sort: { item_id: sortno } })

            }
            if (sortField && sortField == 'sortNo' && sortField != '') {

                itemPipeLine.push({ $sort: { sortNo: sortno } })

            }

            itemPipeLine.push(

                {
                    $skip: skip ? skip : 0
                },
                {
                    $limit: limit ? limit : 10
                },
            )


            console.log("itemPipeLine", itemPipeLine)
            const items = await db.item.aggregate(itemPipeLine)



            res.status(200).json({ status: true, data: items });
        } catch (err) {
            console.error("Error fetching items:", err);
            res.status(500).json({ status: false, message: "Internal Server Error" });
        }
    };

    // Delete Single Item
    itemController.deleteItem = async (req, res) => {
        try {
            const { id } = req.body;
            const deletedItem = await db.item.deleteOne({ _id: id });

            if (!deletedItem) {
                return res.status(404).json({ status: false, message: "Item not found" });
            }

            res.status(200).json({ status: true, message: "Item Deleted Successfully" });
        } catch (err) {
            console.error("Error deleting item:", err);
            res.status(500).json({ status: false, message: "Internal Server Error" });
        }
    };

    // Delete Multiple Items
    itemController.deleteManyItems = async (req, res) => {
        try {
            const { ids } = req.body; // Array of item _ids

            if (!ids || !Array.isArray(ids)) {
                return res.status(400).json({ status: false, message: "Invalid request format" });
            }

            const result = await db.item.deleteMany({ _id: { $in: ids } });

            if (result.deletedCount === 0) {
                return res.status(404).json({ status: false, message: "No items found to delete" });
            }

            res.status(200).json({ status: true, message: `${result.deletedCount} Items Deleted Successfully` });
        } catch (err) {
            console.error("Error deleting multiple items:", err);
            res.status(500).json({ status: false, message: "Internal Server Error" });
        }
    };

    itemController.getItem = async (req, res) => {
        try {
            const { id } = req.body;

            // Find the item by ID
            const item = await db.item.findOne({ _id: id });

            if (!item) {
                return res.status(404).json({ status: false, message: "Item not found" });
            }

            res.status(200).json({ status: true, message: "Item found", data: item });
        } catch (err) {
            console.error("Error fetching item:", err);
            res.status(500).json({ status: false, message: "Internal Server Error" });
        }
    };


    itemController.updateStocks = async (req, res) => {
        try {
            const { id, stock } = req.body; // `id` is the item's _id

            if (!id || stock === undefined) {
                return res.status(400).json({ status: false, message: "Item ID and stock are required" });
            }

            // Update stock for the given item ID
            const result = await db.item.updateOne(
                { _id: id },
                { $set: { itemStock: stock } }
            );

            if (result.modifiedCount > 0) {
                return res.status(200).json({ status: true, message: "Stock Updated Successfully" });
            } else {
                return res.status(404).json({ status: false, message: "Item Not Found or Stock Not Changed" });
            }
        } catch (err) {
            console.error("Error in updateStocks:", err);
            return res.status(500).json({ status: false, message: "Internal Server Error" });
        }
    };


    itemController.updateStatus = async (req, res) => {
        try {
            const { selectedItems, status } = req.body; // Expecting an array of IDs and status
            console.log(status, "status");

            if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
                return res.status(400).json({ status: false, message: "No items selected" });
            }

            // Convert status to boolean
            const statusValue = status === 'active' ? true : false;

            // Update multiple items
            const updateResult = await db.item.updateMany(
                { _id: { $in: selectedItems } }, // Match selected items
                { $set: { itemStatus: statusValue } } // Update status
            );

            if (updateResult.modifiedCount > 0) {
                return res.status(200).json({ status: true, message: "Items updated successfully" });
            } else {
                return res.status(400).json({ status: false, message: "No items were updated" });
            }
        } catch (err) {
            console.error("Error updating status", err);
            return res.status(500).json({ status: false, message: "Internal Server Error" });
        }
    };


    return itemController;
};
