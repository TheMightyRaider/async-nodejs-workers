const { Worker, parentPort, workerData } = require("worker_threads");
const axios = require("axios");

// Array of apis for fetching
const apis = workerData;

let data = [];

Promise.all(
  apis.map((api) =>
    axios
      .get(api)
      .then((response) => {
        data.push(response.data);
      })
      .catch((err) => {
        console.log("Error");
      })
  )
).then((_) => {
  parentPort.postMessage(data);
});
