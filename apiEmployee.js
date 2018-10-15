const {findLastIdEmployeeTimesheet, findLastIdEmployee} = require('./findFunctions');
const express = require('express');
const employeeRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


// In this file every 'employeeRoute' is given.
// Two functions are in the file findFunctions.js to find always the lastId.

// Router to always check for a valid id
employeeRouter.param('employeeId', (req, res, next, employeeId) => {
  const sql = 'SELECT * FROM Employee WHERE Employee.id = $employee_id';
  const values = {$employee_id: employeeId};
  db.get(sql, values, (error, employee) => {
    if (error) {
      next(error);
    } else if (employee) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});
employeeRouter.param('timesheetId', (req, res, next, timesheetId) => {
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheet_id';
  const values = {$timesheet_id: timesheetId};
  db.get(sql, values, (error, timesheet) => {
    if (error) {
      next(error);
    } else if (timesheet) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});



// Get routes to the different urls.

employeeRouter.get('/', (req,res,next) => {
    db.all('SELECT * FROM Employee WHERE Employee.is_current_employee = 1',
    (err,employees) =>{
    if (err) {
        next(err);
      } else {
        res.status(200).json({employees: employees});
      }
    });
});
employeeRouter.get('/:employeeId', (req,res,next) => {
    db.get('SELECT * FROM Employee WHERE Employee.id = $id', {
      $id: req.params.employeeId
    }, (err,employee) =>{
        if (err){
          next(err);
      }  else {
          res.status(200).json({employee: employee});
      }
    });
});
employeeRouter.get('/:employeeId/timesheets', (req,res,next) => {
  db.all('SELECT * FROM Employee,Timesheet WHERE Employee.id = $id AND Timesheet.employee_id = $id',{
    $id: req.params.employeeId
  },  (err, timesheets) => {
    if (err) {
      next(err);
    } else  {
        res.status(200).json({timesheets: timesheets});
    }

  });
});


// Post routes to the employee and timesheet.
employeeRouter.post('/', (req,res,next) => {
  const id = findLastIdEmployee(),
        name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage,
        is_current_employee = req.body.employee.is_current_employee === 0 ? 0 : 1;
  if (!name || !position || ! wage) {
    return res.sendStatus(400);
  };

  const sql = 'INSERT INTO Employee (id, name, position, wage, is_current_employee)' +
      'VALUES ($id, $name, $position, $wage, $is_current_employee)';
  const values = {
    $id: id,
    $name: name,
    $position: position,
    $wage: wage,
    $is_current_employee: is_current_employee
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
        (error, employee) => {
          res.status(201).json({employee: employee});
        });
      } });
    });
employeeRouter.post('/:employeeId/timesheets', (req,res,next) => {
    const id = findLastIdEmployeeTimesheet(),
        hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        employee_id = req.params.employeeId;
        if (!hours || !rate || !date) {
          return res.sendStatus(400);
        };


        const sql = 'INSERT INTO Timesheet (id, hours, rate, date, employee_id)' +
      'VALUES ($id, $hours, $rate, $date, $employee_id)';
      const values = {
    $id: id,
    $hours: hours,
    $rate: rate,
    $date: date,
    $employee_id: employee_id
    };

    db.run(sql, values, function(error) {
      if (error) {
        next(error);
      } else {
        db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
          (error, timesheet) => {
            res.status(201).json({timesheet: timesheet});
          });
        } });
      });



// Put routes to employee and timesheet.
employeeRouter.put('/:employeeId', (req, res, next) => {
    const name = req.body.employee.name,
          position = req.body.employee.position,
          wage = req.body.employee.wage,
          is_current_employee = req.body.employee.is_current_employee === 0 ? 0 : 1;
    if (!name || !position || !wage) {
        return res.sendStatus(400);
      }

    const sql = 'UPDATE Employee SET name = $name, position = $position, ' +
              'wage = $wage, is_current_employee = $is_current_employee ' +
              'WHERE Employee.id = $employee_id';
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $is_current_employee: is_current_employee,
        $employee_id: req.params.employeeId
      };

    db.run(sql, values, (error) => {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT *,id FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
            (error, employee, id) => {

            if (employee) {
              res.status(200).json({employee: employee});
            }


            });
        }
      });
    });
employeeRouter.put('/:employeeId/timesheets/:timesheetId', (req, res, next) => {
    const hours = req.body.timesheet.hours,
          rate = req.body.timesheet.rate,
          date = req.body.timesheet.date

    if (!hours || !rate || !date) {
        return res.sendStatus(400);
      }

    const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date ' +
          'WHERE Timesheet.employee_id = $employee_id AND Timesheet.id = $id';
    const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $id: req.params.timesheetId,
        $employee_id: req.params.employeeId
      };

    db.run(sql, values, (error) => {
        if (error) {

          next(error);
        } else {
          db.get(`SELECT * FROM Timesheet WHERE Timesheet.employee_id = ${req.params.employeeId} AND Timesheet.id = ${req.params.timesheetId}`,
            (error, timesheet) => {
              if (timesheet){
                res.status(200).json({timesheet: timesheet});
              }
            });
        }
      });
    });



// Delete routes to employee.

employeeRouter.delete('/:employeeId', (req, res, next) => {
  const sql = 'UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $employee_id';
  const values = {$employee_id: req.params.employeeId};

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
        (error, employee) => {
          res.status(200).json({employee: employee});
        });
      }
    });
    });
employeeRouter.delete('/:employeeId/timesheets/:timesheetId', (req, res, next) => {
  const sql = 'DELETE FROM Timesheet WHERE Timesheet.id = $id';
  const values = {$id: req.params.timesheetId};

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
    });
  });

module.exports = employeeRouter;
