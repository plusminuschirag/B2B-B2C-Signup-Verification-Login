const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const yaml = require('js-yaml');
const express = require('express');
const b2cAuthenticationRouter = require('./routers/router.B2C.Authentication');
const b2bAuthenticationRouter = require('./routers/router.B2B.Authentication');
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

app.use('/b2c-authentication', b2cAuthenticationRouter);
app.use('/b2b-authentication', b2bAuthenticationRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
