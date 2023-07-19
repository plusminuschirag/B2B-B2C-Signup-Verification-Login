const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const yaml = require('js-yaml');
const express = require('express');
const authenticationRouter = require('./routers/router.authentication');
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

app.use('/authentication', authenticationRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
