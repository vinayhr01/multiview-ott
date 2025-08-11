const jobId = "6899b4a4bedcc774dc6eb90c"; // replace with actual jobId
const es = new EventSource(`http://13.212.112.213:3000/api/updates/${jobId}`);

es.onmessage = (event) => {
  console.log("Update received:", JSON.parse(event.data));
};

es.onerror = (err) => {
  console.error("SSE Error:", err);
};
(err) => {
  console.error("SSE Error:", err);
};
