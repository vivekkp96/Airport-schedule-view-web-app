const mysql = require('mysql');

// create database connection
const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'Airports'
});


db.connect((err)=>{
    if(err)
    console.log('Unable to connect to database');
});

module.exports = db;