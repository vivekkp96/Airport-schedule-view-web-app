const express = require('express');
const bodyParser = require('body-parser');
const db = require('../models/dbconnect');

const router = express.Router();



router.use( bodyParser.json() );
router.use(bodyParser.urlencoded( {extended:true} ));




const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

router.get('/airport', ensureAuthenticated, (req, res)=>{
    let sql = 'SELECT * FROM airports';
    let querry = db.query(sql, (err, rows, fields)=>{
        if(err){
            res.render('notification', {msg:'unable to connect to the database',
            redirect:'/'});
        }else{
            if( Object.keys(rows).length === 0 )
            res.render('addairport', {name:''});
            else{
                res.render('airportdetails', { name:rows[0].name });
            }
        }           
    });
});


router.post('/editairport/:name', (req, res)=>{
    res.render('addairport', {name:req.params.name});
})


router.post('/addairport', (req, res)=>{
    let name = req.body.name;
    let sql = 'SELECT * FROM airports';
    let querry = db.query(sql, (err, rows, fields)=>{
        if( !err ){
            if( Object.keys(rows).length === 0 ){
                let sql = `INSERT INTO airports(id, name) VALUES(1, "${name}" )`;
                db.query(sql, (err, result)=>{
                    if(err){
                        res.render('notification', {msg:'Detils not added',
                        redirect:'/airport'});
                    }else{
                        res.render('notification', {msg:'Detils added successfully',
                    redirect:'/airport'});
                    }
                });
            }else{
                let sql = `UPDATE airports SET name = '${name}' WHERE id = 1`;
                db.query(sql, (err)=>{
                    if(err){
                        res.render('notification', {msg:'Detils not updated',
                    redirect:'/airport'});
                    }else{
                        res.render('notification', {msg:'Detils updated successfully',
                    redirect:'/airport'});

                    }                    
                });
            }
        }
    });
});


router.post('/terminal', (req, res)=>{
    let sql = `SELECT * FROM terminal WHERE airportid = 1`;
    db.query(sql, (err, rows, fields)=>{
        if(err){
            res.render('notification', {msg:'Unable to fetch terminal details',
            redirect:'/airport'});
        }else{
            if( Object.keys(rows) === 0 ){
                res.render('displayterminal',{ result:'' });
            }else{
                res.render('displayterminal', { result:rows });
            }
        }
    });
});

router.post('/addterminal', (req,res)=>{
    let name= req.body.name;
    let status = true;
    if( !name ){
        res.render('notification',{msg:'please enter a valid name', redirect:'/airport'})
    }else{
        let sql = `SELECT name FROM terminal WHERE airportid = 1`;
        db.query(sql,(err, rows)=>{
            if(err){
                res.render('notification',{msg:'terminal not added',
                redirect:'/airport'});
            }else{
                for(var i=0; i < Object.keys(rows).length; i++){
                    if( rows[i].name === name){
                        status = false;
                    }
                }
                if(status){
                    let sql = `INSERT INTO terminal(name, airportid) VALUES( '${name}',1 )`;
                    db.query(sql, (err)=>{
                    if(err){
                    res.render('notification',{msg:'terminal not added',
                    redirect:'/airport'});
                    }else{
                    res.render('notification',{msg:'terminal details added',
                    redirect:'/airport'
                });
                }
            });
                }else{
                    res.render('notification',{msg:'Name already exist',
                    redirect:'/airport'
                });
                }
                       
            }
        });
        
}
});

router.post('/selectterminal/:name/:id',(req, res)=>{
res.render('selectterminal',{ name:req.params.name, terminalid:req.params.id });
});


router.post('/selectdate/:terminalid', (req, res)=>{
    let date = req.body.date;
    let terminalid = req.params.terminalid;
    let status = true;
    let sql = `SELECT id FROM datetable WHERE date='${date}' AND terminalid=${terminalid}`;
    db.query(sql, (err, rows)=>{
        if(err){
            res.render('notification',{msg:'Unable to fetch date details',
            redirect:'/airport'
        });
        }else{
            if(Object.keys( rows ).length === 0){
                let sql = `INSERT INTO datetable(date, terminalid) VALUES( '${date}', ${terminalid})`;
                db.query(sql, (err,result)=>{
                    if(err){
                        res.render('notification',{msg:'Unable to add date',redirect:'/airport'});
                        status = false;           
                    }
                });
            }
            if(status){
                res.render('dateoptions',{date:date,terminalid:terminalid});
            }
        }
    });
});


module.exports = router;