const { Worker } = require("worker_threads");
const path = require("path");

const workerCount = 16;

const workerPath = path.resolve("worker.js");

let apis = [];

for (i = 0; i < 50; i++) {
  endpoint = "https://jsonplaceholder.typicode.com/todos/" + i.toString();
  apis.push(endpoint);
}

const fetchData = (apis) => {
  let startTime = Date.now();
  return new Promise(async (mainresolve, mainreject) => {
    let threadLoad = Math.ceil(apis.length / workerCount);
    let segments = [];

    let totalCapacity = threadLoad * workerCount;
    let unUsedProcess =
      apis.length < totalCapacity
        ? (totalCapacity - apis.length) / threadLoad
        : 0;

    for (i = 0; i < workerCount; i++) {
      start = i * threadLoad;
      end = start + threadLoad;
      if (i != 0 && end == apis.length) {
        break;
      }
      const segment = apis.slice(start, end);
      segments.push(segment);
    }

    if (unUsedProcess) {
      let unUsedProcessLoad = Math.floor(threadLoad / 2);
      for (segmentIndex = 0; segmentIndex < unUsedProcess; segmentIndex++) {
        let updatedSegment = segments[segmentIndex];
        let newSegment = updatedSegment.splice(0, unUsedProcessLoad);
        segments.push(newSegment);
      }
    }

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
