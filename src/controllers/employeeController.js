// const Employee = require("../models/employee");

// // ✅ Helper to generate new employee_id
// const generateEmployeeID = async () => {
//   const count = await Employee.countDocuments();
//   return `HA-${(count + 1).toString().padStart(3, "0")}`;
// };

// // ✅ CREATE
// exports.createEmployee = async (req, res) => {
//   try {
//     const id = await generateEmployeeID();
//     const employee = new Employee({ employee_id: id, ...req.body });
//     await employee.save();
//     res.status(201).json(employee);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ GET ALL (with search, pagination, filter, stats)
// exports.getAllEmployees = async (req, res) => {
//   try {
//     const { search, department, current, page = 1, limit = 10 } = req.query;

//     const query = {};
//     if (search) {
//       query.$or = [
//         { name: new RegExp(search, "i") },
//         { email: new RegExp(search, "i") },
//         { phone: new RegExp(search, "i") }
//       ];
//     }
//     if (department) query.department = department;
//     if (current) query.is_current_employee = current === "true";

//     const total = await Employee.countDocuments(query);
//     const employees = await Employee.find(query)
//       .populate("department")
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit))
//       .sort({ createdAt: -1 });

//     res.json({
//       total,
//       page: Number(page),
//       pages: Math.ceil(total / limit),
//       employees
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ GET BY ID
// exports.getEmployeeById = async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id).populate("department");
//     if (!employee) return res.status(404).json({ error: "Not found" });
//     res.json(employee);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ UPDATE
// exports.updateEmployee = async (req, res) => {
//   try {
//     const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
//       new: true
//     });
//     res.json(employee);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ DELETE / ARCHIVE
// exports.deleteEmployee = async (req, res) => {
//   try {
//     await Employee.findByIdAndUpdate(req.params.id, { is_archived: true });
//     res.json({ message: "Archived successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ APPLY LEAVE
// exports.applyLeave = async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id);
//     employee.leaves.push(req.body);
//     await employee.save();
//     res.json(employee.leaves);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ UPDATE LEAVE STATUS
// exports.updateLeaveStatus = async (req, res) => {
//   try {
//     const { status } = req.body;
//     const employee = await Employee.findById(req.params.id);
//     const leave = employee.leaves.id(req.params.lid);
//     if (!leave) return res.status(404).json({ error: "Leave not found" });
//     leave.status = status;
//     await employee.save();
//     res.json(leave);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ MARK ATTENDANCE
// exports.markAttendance = async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id);
//     employee.attendance.push(req.body);
//     await employee.save();
//     res.json(employee.attendance);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ GET ATTENDANCE
// exports.getAttendance = async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id);
//     res.json(employee.attendance);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ DUTY CHANGE
// exports.changeDutyShift = async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id);
//     employee.duty_changes.push(req.body);
//     await employee.save();
//     res.json(employee.duty_changes);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ GET DUTY CHANGES
// exports.getDutyChanges = async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id);
//     res.json(employee.duty_changes);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ GENERATE PAYSLIP
// exports.generatePayslip = async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id);
//     employee.salary.payslips.push(req.body);
//     await employee.save();
//     res.json(employee.salary.payslips);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ GET PAYSLIPS
// exports.getPayslips = async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id);
//     res.json(employee.salary.payslips);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ REQUEST LOAN
// exports.requestLoan = async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id);
//     employee.loan = req.body;
//     await employee.save();
//     res.json(employee.loan);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ UPDATE LOAN STATUS
// exports.updateLoanStatus = async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id);
//     employee.loan.status = req.body.status;
//     await employee.save();
//     res.json(employee.loan);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ ADD APPRAISAL
// exports.addAppraisal = async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id);
//     employee.performance_reviews.push(req.body);
//     await employee.save();
//     res.json(employee.performance_reviews);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ GET APPRAISALS
// exports.getAppraisals = async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id);
//     res.json(employee.performance_reviews);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ GENERATE CONTRACT
// exports.generateContract = async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id);
//     employee.contract_agreement = req.body;
//     await employee.save();
//     res.json(employee.contract_agreement);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ ACCEPT CONTRACT
// exports.acceptContract = async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id);
//     employee.contract_agreement.accepted = true;
//     employee.contract_agreement.signed_on = new Date();
//     await employee.save();
//     res.json(employee.contract_agreement);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ MARK EXIT
// exports.markExit = async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id);
//     employee.is_current_employee = false;
//     employee.exit_reason = req.body.exit_reason;
//     employee.exit_date = req.body.exit_date || new Date();
//     await employee.save();
//     res.json({ message: "Employee marked as exited." });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
