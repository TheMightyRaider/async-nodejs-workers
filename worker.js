const { parentPort, workerData } = require("worker_threads");
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
        console.log(err, "Error");
      })
  )
).then((_) => {
  // Sending the data back to the parent thread
  parentPort.postMessage(data);
});
