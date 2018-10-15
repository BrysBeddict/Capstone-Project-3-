const express = require('express');
const apiRouter = express.Router();
const menuRouter = require('./apiMenu.js');
const employeeRouter = require('./apiEmployee.js');


apiRouter.use('/menus', menuRouter);
apiRouter.use('/employees', employeeRouter);




module.exports = apiRouter;
