const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const yaml = require('js-yaml');
const express = require('express');
const b2cRouter = require('./routers/router.b2c');
const b2bRouter = require('./routers/router.b2b');
const adminRouter = require('./routers/router.admin');
const mongoController = require('./controllers/controller.db');

const app = express();

const port = 3000;

app.use(express.json());

// Loading Swagger YAML
const swaggerSpec = yaml.load(fs.readFileSync('./swagger.yaml', 'utf8'));
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

app.use('/b2c', b2cRouter);
app.use('/b2b', b2bRouter);
app.use('/admin', adminRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
