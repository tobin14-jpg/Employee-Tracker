  
const sequelize = require('./config/connection');
const inquirer = require('inquirer');
const mysql = require('mysql2');


// Connect to db
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    console.log("Successfully connected to employee_db database")
);