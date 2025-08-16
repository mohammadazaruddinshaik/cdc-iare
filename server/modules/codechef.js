const axios = require("axios");
const cheerio = require("cheerio");

async function fetchCodeChefStats(username) {
  try {
    const res = await axios.get(`https://www.codechef.com/users/${username}`);
    const $ = cheerio.load(res.data);

    const rating = parseInt($('.rating-number').first().text()) || 0;

    // Extract problems solved
    let totalSolved = 0;

    $('section.problems-solved h5').each((i, elem) => {
      const text = $(elem).text();
      const match = text.match(/\d+/); // Extract first number
      if (match) {
        totalSolved += parseInt(match[0]);
      }
    });

    return {
      rating,
      problemsSolved: totalSolved
    };

  } catch (err) {
    console.error("Error fetching CodeChef stats:", err.message);
    return {
      rating: 0,
      problemsSolved: 0
    };
  }
}

module.exports = fetchCodeChefStats;
