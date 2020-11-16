const { Worker } = require("worker_threads");
const path = require("path");

const CPUCount = 16;

const workerPath = path.resolve("worker.js");

let apis = [];

for (i = 0; i < 50; i++) {
  endpoint = "https://jsonplaceholder.typicode.com/todos/" + i.toString();
  apis.push(endpoint);
}

const fetchData = (apis) => {
  let startTime = Date.now();
  return new Promise(async (mainresolve, mainreject) => {
    let threadLoad = Math.ceil(apis.length / CPUCount);
    let segments = [];

    for (i = 0; i < CPUCount; i++) {
      start = i * threadLoad;
      end = start + threadLoad;
      if (i != 0 && end == apis.length) {
        break;
      }
      const segment = apis.slice(start, end);
      segments.push(segment);
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
