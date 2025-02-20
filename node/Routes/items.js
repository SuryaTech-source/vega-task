module.exports = function (app) {
    const itemController = require('../Controllers/itemController')(app);
    const middleware = require('../middleware/upload'); // Import upload middleware

    // Add Multer middleware before the controller function
    app.post('/create', middleware.commonUpload('./Uploads').any(), itemController.create);

    app.post('/list', itemController.listItems);
    app.post('/updatestock', itemController.updateStocks);
    app.put('/items/update-status', itemController.updateStatus);
    app.post('/getitems', itemController.getItem);

    // Delete Single Item
    app.post('/delete', itemController.deleteItem);

    // Delete Multiple Items
    app.post('/delete-many', itemController.deleteManyItems);
};
