const { Worker } = require("worker_threads");
const path = require("path");

const workerCount = 16;

const workerPath = path.resolve("worker.js");

// Sample API
let apis = [];

for (i = 0; i < 50; i++) {
  endpoint = "https://jsonplaceholder.typicode.com/todos/" + i.toString();
  apis.push(endpoint);
}

const fetchData = (apis) => {
  let startTime = Date.now();
  return new Promise(async (mainresolve, mainreject) => {
    // Calculating the data load for each worker depending on the worker count
    let threadLoad = Math.ceil(apis.length / workerCount);

    // Contains the data load for each worker
    let segments = [];

    let totalCapacity = threadLoad * workerCount;

    // Checking if there is any worker with no load
    let unUsedWorker =
      apis.length < totalCapacity
        ? (totalCapacity - apis.length) / threadLoad
        : 0;

    // Segregating the data load for each worker.
    for (i = 0; i < workerCount; i++) {
      start = i * threadLoad;
      end = start + threadLoad;
      if (i != 0 && end == apis.length) {
        break;
      }
      const segment = apis.slice(start, end);
      segments.push(segment);
    }

    // When there is a worker greater than the load, we split the existing worker load into the extra worker.
    if (unUsedWorker) {
      let unUsedWorkerLoad = Math.floor(threadLoad / 2);
      for (segmentIndex = 0; segmentIndex < unUsedWorker; segmentIndex++) {
        let updatedSegment = segments[segmentIndex];
        let newSegment = updatedSegment.splice(0, unUsedWorkerLoad);
        segments.push(newSegment);
      }
    }

    // We generate a thread for each segment and wait till all the thread complete their work
    const results = await Promise.all(
      segments.map(
        (segment) =>
          new Promise((resolve, reject) => {
            const worker = new Worker(workerPath, {
              workerData: segment,
            });
            worker.on("message", resolve);
            worker.on("error", reject);
            worker.on("exit", (code) => {
              if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
            });
          })
      )
    );

    let finalResult = [];

    // Once all the thread returns the result,we concatenate the results into a single array.
    results.forEach((item) => {
      finalResult = finalResult.concat(item);
    });
    let endTime = Date.now();
    let diff = endTime - startTime;
    console.log(finalResult);
    console.log(endTime, startTime, diff);
    mainresolve(finalResult);
  });
};

fetchData(apis);
