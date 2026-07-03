const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const User = require('../models/userSchema');
const Company = require('../models/companySchema'); // Assuming companySchema exists

async function migrateUsers() {
  try {

    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });


    let company = await Company.findOne({ companyName: "Elevora Systems" });
    if (!company) {

      company = new Company({
        companyName: "Elevora Systems",
        companyEmail: "contact@elevora-systems-demo.com",
        contactNo: "0000000000",
        companyType: "Tech",
        noOfEmployees: 10,
        website: "https://elevora-systems-demo.com",
        address: "123 Main St",
        companyOwner: "Admin"
      });
      await company.save();
    }
    



    const result = await User.updateMany({}, { $set: { company: company._id } });
    

    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrateUsers();
