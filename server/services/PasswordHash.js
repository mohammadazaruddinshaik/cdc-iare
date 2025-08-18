const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Faculty=require('../models/faculty');
const saltRounds = 10;


// 3. Migration function
async function HandleAllPasswordsHashing() {
  try {
    const users = await Faculty.find();

    for (let user of users) {
     
      // Hash password
      const hashed = await bcrypt.hash(user.password, saltRounds);
      user.password = hashed;

      await user.save();
      console.log(`Updated password for ${user.facultyid}`);
    }

    console.log("✅ Password migration complete!");
    process.exit();
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

async function HandleOnePasswordHashing(plainPassword) {
  const hashed = await bcrypt.hash(plainPassword, saltRounds);
  return hashed;
}

module.exports={
    HandleAllPasswordsHashing,
    HandleOnePasswordHashing
}
