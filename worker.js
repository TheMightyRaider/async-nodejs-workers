const { Worker, parentPort, workerData } = require("worker_threads");
const axios = require("axios");

// Array of apis for fetching
const apis = workerData;

const results = [];

for (api of apis) {
  axios
    .get(api)
    .then((response) => {
      results.push(response);
    })
    .catch((err) => {
      console.log("Error");
    });
}

// Return results
parentPort.postMessage(results);
