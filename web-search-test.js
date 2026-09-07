const axios = require("axios");

async function webSearch(query) {
  const url = "https://www.google.com/search";
  const response = await axios.get(url, {
    params: { q: query },
    headers: {
      "User-Agent": "Mozilla/5.0"
    },
    timeout: 10000
  });

  console.log("✅ Web Search Connected");
  console.log("Query:", query);
  console.log("Response:", response.status);
  console.log("Data:", response.data.length, "bytes");
}

webSearch("today gold rate Chennai 22K")
  .catch(error => console.log("❌ Search Error:", error.message));
