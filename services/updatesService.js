const clients = {}; // jobId -> [res1, res2, ...]

exports.addClient = (jobId, res) => {
  if (!clients[jobId]) {
    clients[jobId] = [];
  }
  clients[jobId].push(res);
};

exports.removeClient = (jobId, res) => {
  if (clients[jobId]) {
    clients[jobId] = clients[jobId].filter(client => client !== res);
    if (clients[jobId].length === 0) {
      delete clients[jobId];
    }
  }
};

exports.sendUpdate = (jobId, data) => {
  if (clients[jobId]) {
    clients[jobId].forEach(res => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }
};
