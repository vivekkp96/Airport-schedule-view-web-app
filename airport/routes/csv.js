const express = require('express');
const db = require('../models/dbconnect');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;  


const router = express.Router();


router.get("/terminalcsv", (req, res)=>{
    let sql = `SELECT t.id tId, t.name tName, t.airportid, d.id dId, d.date date, pl.id plId, pl.name plName, pl.arrive as plArrive, pl.depart plDepart, p.id as pId, p.name as pName, p.arrive as pArrive FROM
    terminal as t LEFT OUTER JOIN datetable as d  ON
    ( t.airportid=1 and d.terminalid = t.id ) LEFT OUTER JOIN plaintable pl ON ( d.id = pl.dateid ) LEFT OUTER JOIN passengers p ON ( p.plainid = pl.id )` ; 
    db.query(sql, (err, rows, fields)=>{
        //create  csv file
        if(err){
            res.render('notification', {msg:"failed to create csv file", redirect:'#' } );
        }else{

          let details = [];
          for( var i = 0;i< Object.keys( rows).length;i++){
            details.push( rows[i] );
          }
            const csvWriter = createCsvWriter({  
              path: 'terminaldetails.csv',
              header: [
                {id: 'tId', title: 'tId'},
                {id: 'tName', title: 'tName'},
                {id: 'airportid', title: 'airportid'},
                {id: 'dId' , title: 'dId' },
                {id: 'date' , title: 'date' },
                {id: 'plId' , title: 'plId' },
                {id: 'plName' , title: 'plName' },
                {id:'plArrive' , title:'plArrive' },
                {id:'plDepart' , title:'plDepart' },
                {id:'pId' , title:'pId' },
                {id:'pName' , title:'pName' },
                {id:'pArrive' , title:'pArrive' }
              ]
            });
            
            const data = details;
            
            csvWriter  
              .writeRecords(data)
              .then(()=> {console.log('The CSV file was written successfully');
              res.send('The CSV file was written successfully');
            });
        }
    });
});


module.exports = router;