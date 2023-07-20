const csv = require('csv-parser');
const fs = require('fs');
const logger = require('./controller.logger.js');

const __readCsvFile = async (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

const getDataFromCsv = async (filePath) => {
  try {
    const csvData = await __readCsvFile(filePath);
    logger.info(JSON.stringify(csvData));
    return csvData;
  } catch (error) {
    logger.error('Error reading csv file : ', error.stack.toString());
  }
};

module.exports = { getDataFromCsv };
