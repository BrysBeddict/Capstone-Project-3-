const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const morgan = require('morgan');
const apiRouter = require('./api/mainApi.js');
const cors = require('cors');

// Code for setting up the server.
// I do not pass 7 tests. Sometimes i do not pass 5 tests, sometimes 10.
// The tests like 'befpre each hook' or 'can not delete menu which have menuitems'.
// gave me alot of headache.
// Thanks for the expirience CodeAcademy!!


const PORT = process.env.PORT || 4000;


app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());
app.use('/api', apiRouter);
app.use(errorHandler());

app.listen(PORT, () =>{
  console.log(`The server is listening on ${PORT}....`);
});

module.exports = app;
