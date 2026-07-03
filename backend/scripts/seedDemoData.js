const mongoose = require('mongoose');
const User = require('../models/userSchema');
const Company = require('../models/companySchema');
const Department = require('../models/department');
const Expense = require('../models/Expense');
const Ticket = require('../models/ticketManagementSchema');
const LeaveRequest = require('../models/leaveRequestSchema');
const TimeLog = require('../models/timeLogsSchema');
const Timesheet = require('../models/timesheetSchema');
const Project = require('../models/projectSchema');
const Task = require('../models/taskSchema');
const Holiday = require('../models/holidaySchema');
require('dotenv').config({ path: __dirname + '/../.env' });

const seedDemoData = async () => {
  try {

    await mongoose.connect(process.env.MONGODB_URI);



    await Company.deleteMany({});
    await Department.deleteMany({});
    await User.deleteMany({});
    await Expense.deleteMany({});
    await Ticket.deleteMany({});
    await LeaveRequest.deleteMany({});
    await TimeLog.deleteMany({});
    await Timesheet.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Holiday.deleteMany({});

    // 1. Create Company
    const company = await Company.create({
      companyName: 'Elevora Systems',
      companyOwner: 'Jane Director',
      contactNo: '+1-555-0199',
      companyEmail: 'contact@elevora-systems-demo.com',
      website: 'https://elevora-systems-demo.com',
      address: '123 Innovation Drive, Tech City',
      noOfEmployees: 50,
      companyType: 'Tech',
      branches: 'Headquarters',
      departments: 'Engineering, HR, Sales, IT'
    });



    // 2. Create Departments
    const engDept = await Department.create({ name: 'Engineering', company: company._id, description: 'Software and product engineering' });
    const hrDept = await Department.create({ name: 'Human Resources', company: company._id, description: 'HR and Recruitment' });
    const itDept = await Department.create({ name: 'IT Support', company: company._id, description: 'Internal IT & Technical Support' });



    // 3. Create Users with hierarchy
    const superAdmin = await User.create({ name: "Jane Director", email: "jane.director@elevora-systems-demo.com", role: "Super Admin", empStatus: "Active", company: company._id });
    
    const engManager = await User.create({ name: "David Miller", email: "david.miller@elevora-systems-demo.com", role: "Manager", department: engDept._id, reportsTo: superAdmin._id, empStatus: "Active", company: company._id });
    const hrManager = await User.create({ name: "Sarah Jenkins", email: "sarah.hr@elevora-systems-demo.com", role: "HR", department: hrDept._id, reportsTo: superAdmin._id, empStatus: "Active", company: company._id });
    
    const employee1 = await User.create({ name: "Emily Davis", email: "emily.employee@elevora-systems-demo.com", role: "Employee", department: engDept._id, reportsTo: engManager._id, empStatus: "Active", company: company._id });
    const employee2 = await User.create({ name: "James Wilson", email: "james.employee@elevora-systems-demo.com", role: "Employee", department: engDept._id, reportsTo: engManager._id, empStatus: "Active", company: company._id });
    
    const itTech = await User.create({ name: "William Thomas", email: "william.technician@elevora-systems-demo.com", role: "Technician", isTechnician: true, department: itDept._id, reportsTo: superAdmin._id, empStatus: "Active", company: company._id });

    // Update department managers
    await Department.findByIdAndUpdate(engDept._id, { manager: engManager._id, $push: { members: { $each: [engManager._id, employee1._id, employee2._id] } } });
    await Department.findByIdAndUpdate(hrDept._id, { manager: hrManager._id, $push: { members: hrManager._id } });
    await Department.findByIdAndUpdate(itDept._id, { manager: itTech._id, $push: { members: itTech._id } });



    // 4. Create Projects & Tasks
    const project = await Project.create({
      projectID: 'PR-01',
      title: 'Elevora Dashboard V2',
      description: 'Revamping the main employee dashboard UI.',
      status: 'In Progress',
      owner: engManager._id,
      team: [engManager._id, employee1._id, employee2._id],
      company: company._id,
      department: engDept._id,
      startDate: new Date(),
      dueDate: new Date(Date.now() + 86400000 * 30)
    });

    await Task.insertMany([
      { taskID: 'TSK-001', title: 'Design Mockups', description: 'Create Figma mockups', company: company._id, project: project._id, team: [employee1._id], priority: 'High', status: 'Done', completionPercent: 100 },
      { taskID: 'TSK-002', title: 'Frontend Integration', description: 'Implement React components', company: company._id, project: project._id, team: [employee1._id, employee2._id], priority: 'High', status: 'In Progress', completionPercent: 40 },
      { taskID: 'TSK-003', title: 'API Endpoints', description: 'Build Node.js endpoints', company: company._id, project: project._id, team: [engManager._id], priority: 'Medium', status: 'Todo', completionPercent: 0 }
    ]);


    // 5. Create Expenses
    const expensesData = [
      { title: 'Client Dinner', amount: 125.50, category: 'food', receiptUrl: 'https://placehold.co/600x400/png', submittedBy: employee1._id, company: company._id, submittedByName: employee1.name, status: 'approved', approvedBy: engManager._id, approvedByName: engManager.name },
      { title: 'New Keyboard', amount: 89.99, category: 'equipment', receiptUrl: 'https://placehold.co/600x400/png', submittedBy: employee2._id, company: company._id, submittedByName: employee2.name, status: 'pending' },
      { title: 'Server Hosting', amount: 450.00, category: 'other', receiptUrl: 'https://placehold.co/600x400/png', submittedBy: engManager._id, company: company._id, submittedByName: engManager.name, status: 'pending' }
    ];
    await Expense.insertMany(expensesData);


    // 6. Create Tickets
    const ticketsData = [
      { ticketID: 'TKT-1000', emailAddress: employee1.email, user: employee1._id, company: company._id, subject: 'Laptop not connecting to WiFi', description: 'My laptop randomly disconnects from the office network.', status: 'Open', priority: 'High', assignedTo: itTech._id },
      { ticketID: 'TKT-1001', emailAddress: hrManager.email, user: hrManager._id, company: company._id, subject: 'Need access to new HR software', description: 'Please provision my account for the new payroll system.', status: 'In Progress', priority: 'Medium', assignedTo: itTech._id },
      { ticketID: 'TKT-1002', emailAddress: engManager.email, user: engManager._id, company: company._id, subject: 'Monitor replacement', description: 'My secondary monitor is flickering.', status: 'Closed', priority: 'Low', closedBy: superAdmin._id }
    ];
    await Ticket.insertMany(ticketsData);


    // 7. Create Leave Requests & Holidays
    const thxgiving = new Date(new Date().getFullYear(), 10, 26);
    await Holiday.create({ holidayName: 'Thanksgiving', date: thxgiving, day: 'Thursday', holidayType: 'National', company: company._id });
    
    const leavesData = [
      { employeeName: employee1.name, employee: employee1._id, company: company._id, email: employee1.email, leaveType: 'PTO', startDate: new Date(Date.now() + 86400000 * 5), endDate: new Date(Date.now() + 86400000 * 7), reason: 'Family vacation', status: 'Approved', approvedBy: engManager._id },
      { employeeName: employee2.name, employee: employee2._id, company: company._id, email: employee2.email, leaveType: 'Sick', startDate: new Date(), endDate: new Date(Date.now() + 86400000), reason: 'Feeling unwell', status: 'Pending' }
    ];
    await LeaveRequest.insertMany(leavesData);


    // 8. Create TimeLogs & Timesheets
    const date = new Date();
    const timeLog1 = await TimeLog.create({ employee: employee1._id, job: 'Frontend Development', company: company._id, date: date, description: 'Worked on React components', hours: 8, isAddedToTimesheet: true });
    const timeLog2 = await TimeLog.create({ employee: employee1._id, job: 'Meetings', company: company._id, date: new Date(date.getTime() - 86400000), description: 'Sprint planning and daily standup', hours: 6, isAddedToTimesheet: true });

    await Timesheet.create({
      name: 'Week 42 Timesheet',
      description: 'Regular work week',
      employee: employee1._id,
      employeeName: employee1.name,
      company: company._id,
      date: date,
      submittedHours: 14,
      status: 'Pending',
      timeLogs: [timeLog1._id, timeLog2._id]
    });



    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedDemoData();
