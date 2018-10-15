const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

/* This file give us the functions to find the last id of each table. I couldnt
find out the way to write one function and use placeholders. Instead i had to
write 4 times actually the same code with different tables....  */

const findLastIdEmployeeTimesheet = () => {}
  db.all('SELECT * FROM Timesheet', (err,counted) =>{
    let lastId = 0 ;
    counted.forEach(function(id) {
    lastId +=1;
    });
    return lastId++;
  });
const findLastIdEmployee = () => {
  db.all('SELECT * FROM Employee', (err,counted) =>{
    let lastId = 0 ;
    counted.forEach(function(id) {
      lastId +=1;
    });
    return lastId++;
  })
  };
const findLastIdMenu = () => {
  db.all('SELECT * FROM Menu', (err,counted) =>{
    let lastId = 0 ;
    counted.forEach(function(id) {
      lastId +=1;
    });
    return lastId++;
  });
};

const findLastIdMenuItem = () => {
  db.all('SELECT * FROM MenuItem', (err,counted) =>{
    let lastId = 0 ;
    counted.forEach(function(id) {
      lastId +=1;
    });
    return lastId++;
  });
  };





module.exports = {
  findLastIdEmployeeTimesheet,
  findLastIdEmployee,
  findLastIdMenu,
  findLastIdMenuItem
};
