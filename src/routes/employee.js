// // routes/employeeRoutes.js

// const express = require("express");
// const router = express.Router();

// const {
//   createEmployee,
//   getAllEmployees,
//   getEmployeeById,
//   updateEmployee,
//   deleteEmployee,
//   applyLeave,
//   updateLeaveStatus,
//   markAttendance,
//   getAttendance,
//   changeDutyShift,
//   getDutyChanges,
//   generatePayslip,
//   getPayslips,
//   requestLoan,
//   updateLoanStatus,
//   addAppraisal,
//   getAppraisals,
//   generateContract,
//   acceptContract,
//   markExit
// } = require("../controllers/employeeController");

// // Basic CRUD
// router.post("/employees", createEmployee);
// router.get("/employees", getAllEmployees);
// router.get("/employees/:id", getEmployeeById);
// router.put("/employees/:id", updateEmployee);
// router.delete("/employees/:id", deleteEmployee);

// // Leave
// router.post("/employees/:id/leave", applyLeave);
// router.put("/employees/:id/leave/:lid", updateLeaveStatus);

// // Attendance
// router.post("/employees/:id/attendance", markAttendance);
// router.get("/employees/:id/attendance", getAttendance);

// // Duty Changes
// router.post("/employees/:id/duty-change", changeDutyShift);
// router.get("/employees/:id/duty-changes", getDutyChanges);

// // Payslips
// router.post("/employees/:id/payslip", generatePayslip);
// router.get("/employees/:id/payslips", getPayslips);

// // Loan
// router.post("/employees/:id/loan", requestLoan);
// router.put("/employees/:id/loan", updateLoanStatus);

// // Appraisal
// router.post("/employees/:id/appraisal", addAppraisal);
// router.get("/employees/:id/appraisals", getAppraisals);

// // Contract
// router.post("/employees/:id/contract", generateContract);
// router.put("/employees/:id/contract/accept", acceptContract);

// // Exit
// router.put("/employees/:id/exit", markExit);

// module.exports = router;
