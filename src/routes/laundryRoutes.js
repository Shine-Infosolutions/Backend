const express = require("express");
const router = express.Router();
const laundryController = require("../controllers/laundryController");
const authMiddleware = require("../middleware/authMiddleware");

// — Create
router.post(
  "/",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.createLaundryOrder
);

// — Read all (with optional ?urgent=true)
router.get(
  "/",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.getAllLaundryOrders
);

// — Search / filter / paginate / sort
router.get(
  "/search",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.searchLaundryOrders
);

// — Read single by ID
router.get(
  "/:id",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.getLaundryById
);

// — Read by GRC No
router.get(
  "/grc/:grcNo",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.getLaundryByGRC
);

// — Read by Room Number
router.get(
  "/room/:roomNumber",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.getLaundryByRoom
);

// — Update entire order
router.put(
  "/:id",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.updateLaundryOrder
);

// — Add items into existing order
router.patch(
  "/add-items/:id",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.addItemsToLaundryOrder
);

// — Update single item status/notes
router.patch(
  "/item/:laundryId/:itemName",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.updateLaundryItemStatus
);

// — Cancel order
router.patch(
  "/cancel/:id",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.cancelLaundryOrder
);

// — Mark returned
router.patch(
  "/return/:id",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.markLaundryReturned
);

// — Report damage or loss
router.post(
  "/loss/:id",
  authMiddleware(["admin", "staff"], ["laundry"]),
  laundryController.reportDamageOrLoss
);

// — Delete order
router.delete(
  "/:id",
  authMiddleware(["admin"], ["laundry"]),
  laundryController.deleteLaundry
);

module.exports = router;
