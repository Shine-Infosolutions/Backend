const express = require("express");
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  searchBooking,
 getAllPagination,
  deleteBooking,
  updateBooking
} = require("../controllers/banquetbookingController");

router.post("/create", createBooking);
router.get("/", getBookings);
router.get("/pg", getAllPagination);
router.get('/search',searchBooking)
router.get("/:id", getBookingById);
router.delete("/:id", deleteBooking);
router.put("/:id", updateBooking);

module.exports = router;
