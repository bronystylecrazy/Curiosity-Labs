var express = require("express");
var router = express.Router();

let subscribers = [];
let clients = {};
let history = [];

function subscribe(cb) {
  subscribers.push(cb);
}

function flush() {
  for (const subscriber of subscribers) {
    subscriber();
  }
  subscribers = [];
}

router.get("/", function (req, res, next) {
  const { id } = req.query;
  if (!id) return res.send("No id");
  if (!clients[id]) {
    clients[id] = 1 % (Number.MAX_SAFE_INTEGER - 1);
    console.log(`Total subscriber ` + Object.keys(clients).length);
    return res.json(history);
  }
  clients[id]++;

  subscribe(() => {
    res.json(history);
  });
});

router.delete("/", (req, res, next) => {
  const { id } = req.query;
  if (!id) return res.send("unsuccessful");
  return res.send("deleted success!");
});

router.get("/message", (req, res) => {
  return res.json(history);
});

router.post("/message", (req, res) => {
  const { id, message } = req.query;
  if (id && message) history.push({ id: Date.now(), from: id, message });
  flush();
  return res.send("success!");
});

router.delete("/message/:id", (req, res) => {
  const { id } = req.params;
  history = history.filter((item) => parseInt(item.id) !== parseInt(id));
  console.log(history);
  flush();
  return res.json(history);
});

module.exports = router;
