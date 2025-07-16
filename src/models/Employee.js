// const mongoose = require("mongoose");

// const employeeSchema = new mongoose.Schema({
//   employee_id: {
//     type: String,
//     required: true,
//     unique: true 
//   },

//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },

//   email: {
//     type: String,
//     trim: true
//   },

//   phone: {
//     type: String,
//     required: true
//   },

//   address: {
//     type: String
//   },

//   department: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Department"
//   },

//   shift: {
//     type: String,
//     enum: ["Morning", "Evening", "Night", "Rotational"],
//     default: "Morning"
//   },

//   joining_date: {
//     type: Date,
//     default: Date.now
//   },

//   is_current_employee: {
//     type: Boolean,
//     default: true
//   },

//   salary: {
//     monthly: {
//       type: Number,
//       required: true
//     },
//     currency: {
//       type: String,
//       default: "₹"
//     },
//     pay_cycle: {
//       type: String,
//       enum: ["Monthly", "Weekly"],
//       default: "Monthly"
//     },
//     // payslips: [
//     //   {
//     //     month: String,
//     //     file_url: String,
//     //     generated_on: Date
//     //   }
//     // ]
//   },

//   // documents: {
//   //   aadhaar: String,
//   //   pan: String,
//   //   resume: String,
//   //   offer_letter: String,
//   //   joining_letter: String,
//   //   others: [String]
//   // },

//   // leaves: [
//   //   {
//   //     from: Date,
//   //     to: Date,
//   //     reason: String,
//   //     status: {
//   //       type: String,
//   //       enum: ["Pending", "Approved", "Rejected"],
//   //       default: "Pending"
//   //     }
//   //   }
//   // ],

//   // attendance: [
//   //   {
//   //     date: Date,
//   //     check_in: String,
//   //     check_out: String,
//   //     status: {
//   //       type: String,
//   //       enum: ["Present", "Absent", "Leave"],
//   //       default: "Present"
//   //     }
//   //   }
//   // ],

//   // duty_changes: [
//   //   {
//   //     date: Date,
//   //     old_shift: String,
//   //     new_shift: String,
//   //     reason: String
//   //   }
//   // ],

//   // loan: {
//   //   amount: Number,
//   //   reason: String,
//   //   issue_date: Date,
//   //   status: {
//   //     type: String,
//   //     enum: ["Pending", "Approved", "Paid"],
//   //     default: "Pending"
//   //   }
//   // },

//   // performance_reviews: [
//   //   {
//   //     review_date: Date,
//   //     rating: Number,
//   //     feedback: String,
//   //     reviewed_by: String
//   //   }
//   // ],

//   // contract_agreement: {
//   //   html: String,
//   //   pdf_url: String,
//   //   accepted: Boolean,
//   //   signed_on: Date
//   // },

//   exit_reason: String,
//   exit_date: Date,

//   is_archived: {
//     type: Boolean,
//     default: false
//   }

// }, {
//   timestamps: true
// });

// module.exports = mongoose.model("Employee", employeeSchema);
