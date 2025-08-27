const express = require("express");
const router = express.Router();
const laundryController = require("../controllers/laundryController");
const authMiddleware = require("../middleware/authMiddleware");

// Create laundry order
router.post("/order", laundryController.createLaundryOrder);

// Get all laundry orders (optional filter: ?urgent=true)
router.get("/all", laundryController.getAllLaundryOrders);

// by grc or room no (using query parameters)
router.get('/by-grc-or-room', laundryController.getLaundryByGRCOrRoom);

router.get("/filter-by-date", laundryController.filterLaundryByDate);

// Get laundry order by ID (placed after specific routes to avoid conflicts)
router.get("/:id", laundryController.getLaundryById);

// Update entire laundry order
router.put("/:id", laundryController.updateLaundryOrder);

// Add items into existing order
router.patch("/add-items/:id", laundryController.addItemsToLaundryOrder);

// upd item route 
router.patch("/item/:laundryId/:itemId", laundryController.updateLaundryItemStatus);

// Cancel laundry order
router.patch("/cancel/:id", laundryController.cancelLaundryOrder);

// Mark laundry returned
router.patch("/return/:id", laundryController.markLaundryReturned);

// Report damage or loss
router.post("/loss/:id", laundryController.reportDamageOrLoss);

// Delete laundry order
router.delete("/:id", authMiddleware(["admin"], ["laundry"]), laundryController.deleteLaundry);

module.exports = router;
