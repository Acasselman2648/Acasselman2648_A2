const express = require('express');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
const PORT = 3000;

app.use(express.json());

// Open the SQLite database
let db;
(async () => {
  db = await sqlite.open({
    filename: './data/database.db',
    driver: sqlite3.Database,
  });

  // Create the 'greetings' table if not exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS greetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timeOfDay TEXT NOT NULL,
      language TEXT NOT NULL,
      greetingMessage TEXT NOT NULL,
      tone TEXT NOT NULL
    )
  `);

  // Seed the database with initial data if empty
  const existingCount = await db.get('SELECT COUNT(*) as count FROM greetings');
  if (existingCount.count === 0) {
    const seedData = [
      { timeOfDay: 'Morning', language: 'English', greetingMessage: 'Good Morning', tone: 'Formal' },
      { timeOfDay: 'Morning', language: 'English', greetingMessage: 'Morning!', tone: 'Casual' },
      { timeOfDay: 'Afternoon', language: 'English', greetingMessage: 'Good Afternoon', tone: 'Formal' },
      { timeOfDay: 'Afternoon', language: 'English', greetingMessage: 'Afternoon!', tone: 'Casual' },
      { timeOfDay: 'Evening', language: 'English', greetingMessage: 'Good Night', tone: 'Formal' },
      { timeOfDay: 'Evening', language: 'English', greetingMessage: 'Night!', tone: 'Casual' },

      { timeOfDay: 'Morning', language: 'Swedish', greetingMessage: 'God Morgon', tone: 'Formal' },
      { timeOfDay: 'Morning', language: 'Swedish', greetingMessage: 'Morgon!', tone: 'Casual' },
      { timeOfDay: 'Afternoon', language: 'Swedish', greetingMessage: 'God Eftermiddag', tone: 'Formal' },
      { timeOfDay: 'Afternoon', language: 'Swedish', greetingMessage: 'Eftermiddag!', tone: 'Casual' },
      { timeOfDay: 'Evening', language: 'Swedish', greetingMessage: 'God Afton', tone: 'Formal' },
      { timeOfDay: 'Evening', language: 'Swedish', greetingMessage: 'Afton!', tone: 'Casual' },

      { timeOfDay: 'Morning', language: 'Spanish', greetingMessage: 'Buen Día', tone: 'Formal' },
      { timeOfDay: 'Morning', language: 'Spanish', greetingMessage: 'Buenos Días!', tone: 'Casual' },
      { timeOfDay: 'Afternoon', language: 'Spanish', greetingMessage: 'Buenas tardes', tone: 'Formal' },
      { timeOfDay: 'Afternoon', language: 'Spanish', greetingMessage: 'Tarde!', tone: 'Casual' },
      { timeOfDay: 'Evening', language: 'Spanish', greetingMessage: 'Buenas Noches', tone: 'Formal' },
      { timeOfDay: 'Evening', language: 'Spanish', greetingMessage: 'Hola por la noche!', tone: 'Casual' },
    ];

    for (const { timeOfDay, language, greetingMessage, tone } of seedData) {
      await db.run(
        'INSERT INTO greetings (timeOfDay, language, greetingMessage, tone) VALUES (?, ?, ?, ?)',
        [timeOfDay, language, greetingMessage, tone]
      );
    }
  }
})();

// Greet: POST /api/greet
app.post('/api/greet', async (req, res) => {
  const { timeOfDay, language, tone } = req.body;

  if (!timeOfDay || !language || !tone) {
    return res.status(400).json({ error: 'timeOfDay, language, and tone are required' });
  }

  try {
    const greeting = await db.get(
      'SELECT greetingMessage FROM greetings WHERE timeOfDay = ? AND language = ? AND tone = ?',
      [timeOfDay, language, tone]
    );

    if (!greeting) {
      return res.status(404).json({ error: 'Greeting not found for the specified criteria' });
    }

    res.json({ greetingMessage: greeting.greetingMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GetAllTimesOfDay: GET /api/times-of-day
app.get('/api/times-of-day', async (req, res) => {
  try {
    const timesOfDay = await db.all('SELECT DISTINCT timeOfDay FROM greetings');
    res.json({ timesOfDay: timesOfDay.map((row) => row.timeOfDay) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GetSupportedLanguages: GET /api/languages
app.get('/api/languages', async (req, res) => {
  try {
    const languages = await db.all('SELECT DISTINCT language FROM greetings');
    res.json({ languages: languages.map((row) => row.language) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});