require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./models/companySchema');
const User = require('./models/userSchema');

async function createCompanyAndAssign() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Create the company if it doesn't exist
    let company = await Company.findOne({ companyName: /Elevora/i });
    if (!company) {
      company = await Company.create({
        companyName: "Elevora Systems",
        companyOwner: "Admin",
        contactNo: "1234567890",
        companyEmail: "contact@elevora-systems-demo.com",
        website: "https://elevora-systems-demo.com",
        address: "New York, USA",
        noOfEmployees: 50,
        companyType: "Tech"
      });

    } else {

    }

    // Assign to all users
    const result = await User.updateMany(
      { $or: [{ company: { $exists: false } }, { company: null }] },
      { $set: { company: company._id } }
    );


    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

createCompanyAndAssign();
