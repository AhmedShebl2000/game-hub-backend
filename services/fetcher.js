const axios = require("axios");
const fs = require("fs");
const path = require("path");

const apiKey = "cc5fbcfd2dd64fba9afdf7aa1fca9678";
const filePath = path.join(__dirname, "games.json"); // Ensure this line is placed here

async function fetchAndSaveAllGames() {
  let allGames = [];

  // If file exists and has some data, load it
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, "utf-8");
    if (fileData) {
      allGames = JSON.parse(fileData);
      console.log(`🔵 Loaded ${allGames.length} games from existing file.`);
    }
  }

  let nextPage = `https://api.rawg.io/api/games?page_size=40&key=${apiKey}`;

  try {
    while (nextPage) {
      const response = await axios.get(nextPage);
      const data = response.data;

      allGames.push(...data.results);

      // Save after each fetch
      fs.writeFileSync(filePath, JSON.stringify(allGames, null, 2));
      console.log(`✅ Saved ${allGames.length} games so far...`);

      if (data.next) {
        if (data.next.includes("key=")) {
          nextPage = data.next;
        } else {
          nextPage = `${data.next}&key=${apiKey}`;
        }
      } else {
        nextPage = null;
        console.log("🎉 Finished fetching all games!");
      }
    }
  } catch (error) {
    console.error("❌ Error fetching games:", error.message);
  }
}

fetchAndSaveAllGames();
