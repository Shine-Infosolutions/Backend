// const Department = require("../models/department");

// exports.createDepartment = async (req, res) => {
//   try {
//     const newDept = new Department(req.body);
//     await newDept.save();
//     res.status(201).json(newDept);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getAllDepartments = async (req, res) => {
//   try {
//     const { search = "", status, page = 1, limit = 10 } = req.query;

//     const query = {};
//     if (search) {
//       query.name = { $regex: search, $options: "i" };
//     }
//     if (status) {
//       query.status = status;
//     }

//     const total = await Department.countDocuments(query);
//     const departments = await Department.find(query)
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit))
//       .sort({ createdAt: -1 });

//     const stats = await Department.aggregate([
//       { $group: { _id: "$status", count: { $sum: 1 } } }
//     ]);

//     res.json({
//       total,
//       page: Number(page),
//       pages: Math.ceil(total / limit),
//       departments,
//       stats
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.updateDepartment = async (req, res) => {
//   try {
//     const dept = await Department.findByIdAndUpdate(req.params.id, req.body, {
//       new: true
//     });
//     res.json(dept);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.deleteDepartment = async (req, res) => {
//   try {
//     await Department.findByIdAndDelete(req.params.id);
//     res.json({ message: "Department deleted" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
