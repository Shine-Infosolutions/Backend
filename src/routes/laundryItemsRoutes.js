const express = require("express");
const router = express.Router();
const controller = require("../controllers/laundryItemController");

router.post("/add", controller.createLaundryItem);
router.get("/all", controller.getAllLaundryItems);
router.get("/get/:id", controller.getLaundryItemById);
router.put("/edit/:id", controller.updateLaundryItem);
router.delete("/delete/:id", controller.deleteLaundryItem);

module.exports = router;
