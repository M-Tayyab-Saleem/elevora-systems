require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./models/companySchema');
const User = require('./models/userSchema');

async function createCompanyAndAssign() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Create the company if it doesn't exist
    let company = await Company.findOne({ companyName: /Abidi solution/i });
    if (!company) {
      company = await Company.create({
        companyName: "Abidi Solutions",
        companyOwner: "Admin",
        contactNo: "1234567890",
        companyEmail: "info@abidisolutions.com",
        website: "https://abidisolutions.com",
        address: "Karachi, Pakistan",
        noOfEmployees: 50,
        companyType: "Tech"
      });
      console.log(`Created company: ${company.companyName} (${company._id})`);
    } else {
      console.log(`Found existing company: ${company.companyName} (${company._id})`);
    }

    // Assign to all users
    const result = await User.updateMany(
      { $or: [{ company: { $exists: false } }, { company: null }] },
      { $set: { company: company._id } }
    );

    console.log(`Updated ${result.modifiedCount} users to have company ${company.companyName}`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

createCompanyAndAssign();
