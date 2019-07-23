const express = require('express');
const bodyParser = require('body-parser');
const db = require('../models/dbconnect');


const router = express.Router();

router.use( bodyParser.json() );
router.use(bodyParser.urlencoded( {extended:true} ));



let dateid = '';
let terminalid = '';
let date = '';
router.post('/addplain/:date/:id',(req, res)=>{
    terminalid = req.params.id;
    date = req.params.date;
    let sql = `SELECT id FROM datetable WHERE date = '${date}' AND terminalid = ${terminalid}`;
    db.query(sql, (err, rows)=>{
        if(err){
            res.render("notification",{ msg:"Unable to fetch id from table", redirect:'/airport'});
        }else{
            dateid = rows[0].id;
        }
    });
    res.render( 'addplain' );
});

router.post('/plainadd',(req,res)=>{
    let name = req.body.name;
    let arrive = req.body.arrive;
    let depart = req.body.depart;

    let sql = `SELECT depart, arrive FROM plaintable WHERE terminalid = '${terminalid}' AND dateid = ${dateid} `;
    db.query(sql, (err, rows)=>{
        if(err){
            res.render("notification",{ msg:"Unable to fetch details from database ", redirect:'/airport'});
        }else{
            let status = true;
            for( var i=0; i < Object.keys(rows).length; i++ ){
                if( rows[i].depart == depart || rows[i].arrive == arrive ){
                    status = false;
                    res.render( 'notification', {msg:'Time is already scheduled', redirect:'/airport' } );
                    break;
                }
            }
            if( status ){
                //now ready to add plain details
                let sql = `INSERT INTO plaintable( name, arrive, depart, dateid, terminalid) VALUES( '${name}', '${arrive}', ' ${depart}', ${dateid}, ${terminalid} )`;
                db.query(sql, (err, result)=>{
                    if(err){
                        res.render("notification",{ msg:"Details not added", redirect:'/airport'});
                    }else{
                        //dateoption.ejs pass id and date
                        res.render('dateoptions', { date:date, terminalid:terminalid } );
                    }
                });
            }
        }
    });
});


router.post('/plaindetails/:date/:terminalid', (req, res)=>{
    terminalid = req.params.terminalid;
    date = req.params.date;
    dateid = '';
    let sql = `SELECT id FROM datetable WHERE date = '${date}' AND terminalid = ${terminalid}`;
    db.query(sql, (err, rows)=>{
        if(err){
            res.render("notification",{ msg:"Unable to fetch id from table", redirect:'/airport'});
        }else{
                dateid = rows[0].id;
                let sql = `SELECT * FROM plaintable WHERE terminalid = ${terminalid} AND dateid = ${dateid} `;
                db.query(sql, (err, rows)=>{
                    if(err){
                        res.render("notification",{ msg:"Unable to fetch details from database ", redirect:'/airport'});
                    }else{
                        res.render('plaindetails', { rows:rows } );
                    }
                });
            }
    });

    
});


router.post("/passengers/:plainid", (req, res)=>{
    let plainid = req.params.plainid;
    let sql = `SELECT * FROM passengers WHERE plainid= ${plainid}`;
    db.query(sql, (err, rows)=>{
        if( err ){
            res.render("notification",{ msg:"Unable to fetch details of passengers", redirect:'/airport'});
        }else{
            res.render("showpassengers", { rows:rows, plainid:plainid } );
        }
    })
});


router.post("/savepas/:plainid", (req, res)=>{
    let name = req.body.name;
    let arrive = req.body.arrive;
    let plainid = req.params.plainid;
    let sql = `INSERT INTO  passengers( name, arrive, plainid) VALUES( '${name}', '${arrive}', ${plainid} )`;
    db.query(sql, (err, rows)=>{
        if( err ){
            res.render('notification', {msg:"passengers details not added",redirect:"/airport"});
        }else{
            res.render('notification', {msg:"passengers details added",redirect:"/airport"});
        }
    });

});

module.exports = router;