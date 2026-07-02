// Run this once to generate a real bcrypt hash for your seller/admin password
// Usage: node generateHash.js yourpassword
import bcrypt from "bcryptjs";

const password = process.argv[2] || "admin123";

bcrypt.hash(password, 10).then((hash) => {
  console.log("\nPassword:", password);
  console.log("Bcrypt Hash:", hash);
  console.log("\nUse this in sql/schema.sql if you want a properly hashed seller password.");
  console.log("(Note: seller login in this project compares plaintext SELLER_PASSWORD from .env directly,");
  console.log(" so the sellers table hash is only needed if you extend it to check the DB instead.)\n");
});
