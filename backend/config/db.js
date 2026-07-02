import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "veggie_store",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

export const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL Database connected:", process.env.DB_NAME);
    connection.release();
  } catch (error) {
    console.error("❌ MySQL connection failed:", error.message);
    console.error("   Check your .env DB_HOST / DB_USER / DB_PASSWORD / DB_NAME");
    process.exit(1);
  }
};

export default pool;
