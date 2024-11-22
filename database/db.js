import dotenv from 'dotenv';
import mariadb from 'mariadb';

dotenv.config();

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: 5,
});

export const query = async (sql, params) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const res = await conn.query(sql, params);
        return res;
    } finally {
        if (conn) conn.release();
    }
};
