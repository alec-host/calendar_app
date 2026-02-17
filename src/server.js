const timeout = require('connect-timeout');

const app = require('./app');

app.use(timeout('15s'));

function haltOnTimeout(req, res, next){
   if (!req.timedout) next();
}

app.use(haltOnTimeout);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
