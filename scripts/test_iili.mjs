const testUrls = [
  "https://iili.io/CPg9krJ.jpg",
  "https://iili.io/CPUyriu.jpg",
  "https://iili.io/CPUp9hF.jpg",
  "https://iili.io/C48dMIs.jpg",
  "https://iili.io/C4xqgXs.jpg",
  "https://iili.io/C4xfxta.jpg",
  "https://iili.io/C4o5hoN.jpg",
  "https://iili.io/Crglw2n.jpg"
];

async function test() {
  for (const url of testUrls) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`URL: ${url} -> Status: ${res.status}`);
    } catch (err) {
      console.log(`URL: ${url} -> ERROR: ${err.message}`);
    }
  }
}

test();
