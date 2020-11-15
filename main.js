const { Worker, workerData } = require("worker_threads");
const path = require("path");
const os = require("os");

// const filepath = path.resolve(worker.js);

// const worker = new Worker(filepath, {
//   workerData: script,
// });

const CPUCount = os.cpus().length;

let apis = [];

for (i = 0; i < 50; i++) {
  endpoint = "https://jsonplaceholder.typicode.com/todos/" + i.toString();
  apis.push(endpoint);
}

let threadLoad = Math.ceil(apis.length / CPUCount);
let totalCapacity = threadLoad * CPUCount;
let unUsedProcess =
  apis.length < totalCapacity ? (totalCapacity - apis.length) / threadLoad : 0;
let segments = [];

for (i = 0; i < CPUCount; i++) {
  start = i * threadLoad;
  end = start + threadLoad;
  if (end == apis.length) {
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

console.log(segments);
