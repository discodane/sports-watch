const express = require('express');
const app = express();
const querier = require('./quickstart');

var cors = require('cors');

app.use(cors());

app.get('/', async (req, res) => {
  const result = await querier.getStarted("disco");
  res.send(result);
})


app.listen(3000, () => {
  
});
