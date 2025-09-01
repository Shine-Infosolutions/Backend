const Menu = require("../models/BanquetMenu"); // adjust path as needed

// Get all menus
// exports.getAllMenus = async (req, res) => {
//   try {
//     const menus = await Menu.find().populate("bookingRef"); // populate if you need booking info
//     res.status(200).json({ success: true, data: menus });
//   } catch (error) {
//     console.error("Error fetching menus:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };




// Get a menu by bookingRef ID
const Booking = require("../models/banquetBooking");


exports.getMenuByCustomerRef = async (req, res) => {
  try {
    let { customerRef } = req.params;
    if (Array.isArray(customerRef)) {
      customerRef = customerRef[0];
    }
    if (typeof customerRef !== 'string' || !customerRef) {
      return res.status(400).json({ message: "Invalid customerRef" });
    }
    // 1. Find booking by customerRef
    const booking = await Booking.findOne({customerRef });
    // 2. Find menu by customerRef
    const menu = await Menu.findOne({customerRef });
    if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      if (!menu) {
        return res.status(404).json({ message: "Menu not found" });
      }
  
      res.status(200).json({
        message: "Menu fetched successfully",
        menu,
        booking
      });
  } catch (err) {
    console.error("Error fetching menu by customerRef:", err.message);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.getMenuByBookingId = async (req, res) => {
  const { bookingId } = req.params;
// console.log("Fetching menu for booking ID:", bookingId);
  try {
    const menu = await Menu.findOne({ bookingRef: bookingId }).populate("bookingRef");
    
    if (!menu) {
      return res.status(404).json({ success: false, message: "Menu not found" });
    }

    res.status(200).json({ success: true, data: menu });
  } catch (error) {
    console.error("Error fetching menu by booking ID:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateMenuByCustomerRef = async (req, res) => {
  try {
    let { customerRef } = req.params;
    if (Array.isArray(customerRef)) {
      customerRef = customerRef[0];
    }
    if (typeof customerRef !== 'string' || !customerRef) {
      return res.status(400).json({ message: "Invalid customerRef" });
    }
    const categorizedMenu = req.body.categorizedMenu;

    if (!categorizedMenu || typeof categorizedMenu !== "object") {
      return res.status(400).json({ message: "Invalid or missing categorizedMenu" });
    }

    // 1. Find booking by customerRef
    const booking = await Booking.findOne({ customerRef });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 2. Find associated menu
    let menu = await Menu.findOne({ bookingRef: booking._id });

    // 3. Clean the menu input
    const validCategories = Object.keys(Menu.schema.paths).filter(
      key => !["id", "_v", "createdAt", "updatedAt", "bookingRef", "customerRef"].includes(key)
    );

    const cleanedMenu = {};
    validCategories.forEach(cat => {
      cleanedMenu[cat] = Array.isArray(categorizedMenu[cat])
        ? categorizedMenu[cat]
        : [];
    });

    if (menu) {
      // 4a. Update existing menu
      validCategories.forEach(cat => {
        menu[cat] = cleanedMenu[cat];
      });
      // Ensure customerRef is always set and correct
      menu.customerRef = booking.customerRef;
      await menu.save();
    } else {
      // 4b. Create new menu if not found
      menu = new Menu({
        ...cleanedMenu,
        bookingRef: booking._id,
        customerRef: booking.customerRef // <-- ensure this is a string
      });
      await menu.save();
    }

    res.status(200).json({
      message: "Menu updated successfully",
      menu,
    });
  } catch (err) {
    console.error("Menu update error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
