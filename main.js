const axios = require("axios");

let apis = [];

for (i = 0; i < 50; i++) {
  endpoint = "https://jsonplaceholder.typicode.com/todos/" + i.toString();
  apis.push(endpoint);
}

start = Date.now();
makecalls = (api) => {
  axios
    .get(api)
    .then((response) => {
      console.log("Done");
    })
    .catch((err) => {
      console.log("Error");
    });
};

for (items of apis) {
  makecalls(items);
}

end = Date.now();
timeTaken = end - start;
console.log(timeTaken);
