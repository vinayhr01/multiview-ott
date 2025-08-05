const jobId = "68919bbdc77185fb9ed98f66"; // replace with actual jobId
const es = new EventSource(`http://localhost:3000/api/updates/${jobId}`);

es.onmessage = (event) => {
  console.log("Update received:", JSON.parse(event.data));
};

es.onerror = (err) => {
  console.error("SSE Error:", err);
};
