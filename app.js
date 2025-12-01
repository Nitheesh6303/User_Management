const express = require('express');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const {
  validateMobile,
  validatePan,
  checkRequiredFields,
  isManagerActive,
} = require('./validators');


const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, 'user1.db');
let db = null;

// Initialize Database
const initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Create tables if not exist
    await db.run(`
      CREATE TABLE IF NOT EXISTS managers (
        manager_id TEXT PRIMARY KEY,
        is_active INTEGER DEFAULT 1
      );
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        mob_num TEXT NOT NULL,
        pan_num TEXT NOT NULL,
        manager_id TEXT,
        created_at TEXT,
        updated_at TEXT,
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY(manager_id) REFERENCES managers(manager_id)
      );
    `);

    // Insert sample managers if empty
    const managers = await db.all(`SELECT * FROM managers;`);
    if (managers.length === 0) {
      await db.run(`INSERT INTO managers(manager_id, is_active) VALUES (?,?)`, [uuidv4(), 1]);
      await db.run(`INSERT INTO managers(manager_id, is_active) VALUES (?,?)`, [uuidv4(), 1]);
    }

    app.listen(3001, () => {
      console.log('Server started at port 3001');
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDb();

// ----------------- API Endpoints -----------------

// 1️ Create User
app.post(
  '/create_user',
  checkRequiredFields(['full_name', 'mob_num', 'pan_num', 'manager_id']),
  async (req, res) => {
    try {
      const { full_name, mob_num, pan_num, manager_id } = req.body;

      // Validate
      const validMob = validateMobile(mob_num);
      const validPan = validatePan(pan_num);
      const managerValid = await isManagerActive(db, manager_id);

      if (!validMob) return res.status(400).send({ error: 'Invalid mobile number' });
      if (!validPan) return res.status(400).send({ error: 'Invalid PAN number' });
      if (!managerValid) return res.status(400).send({ error: 'Invalid or inactive manager_id' });

      const user_id = uuidv4();
      const timestamp = new Date().toISOString();

      await db.run(
        `INSERT INTO users(user_id, full_name, mob_num, pan_num, manager_id, created_at, updated_at, is_active)
         VALUES (?,?,?,?,?,?,?,1)`,
        [user_id, full_name, validMob, validPan, manager_id, timestamp, timestamp]
      );

      res.send({ message: 'User created successfully', user_id });
    } catch (e) {
      console.log(`Error in /create_user: ${e.message}`);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  }
);

// 2️ Get Users
app.post('/get_users', async (req, res) => {
  try {
    const { user_id, mob_num, manager_id } = req.body;

    let query = `SELECT * FROM users WHERE is_active=1`;
    let params = [];

    if (user_id) {
      query += ` AND user_id=?`;
      params.push(user_id);
    } else if (mob_num) {
      const validMob = validateMobile(mob_num);
      query += ` AND mob_num=?`;
      params.push(validMob);
    } else if (manager_id) {
      query += ` AND manager_id=?`;
      params.push(manager_id);
    }

    const users = await db.all(query, params);
    res.send({ users });
  } catch (e) {
    console.log(`Error in /get_users: ${e.message}`);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// 3️ Delete User
app.post('/delete_user', async (req, res) => {
  try {
    const { user_id, mob_num } = req.body;

    if (!user_id && !mob_num) {
      return res.status(400).send({ error: 'Provide user_id or mob_num' });
    }

    let user;
    if (user_id) {
      user = await db.get(`SELECT * FROM users WHERE user_id=?`, [user_id]);
    } else if (mob_num) {
      const validMob = validateMobile(mob_num);
      user = await db.get(`SELECT * FROM users WHERE mob_num=?`, [validMob]);
    }

    if (!user) return res.status(404).send({ error: 'User not found' });

    await db.run(`DELETE FROM users WHERE user_id=?`, [user.user_id]);
    res.send({ message: 'User deleted successfully' });
  } catch (e) {
    console.log(`Error in /delete_user: ${e.message}`);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// 4️ Update User
app.post('/update_user', async (req, res) => {
  try {
    const { user_ids, update_data } = req.body;

    if (!user_ids || !update_data) {
      return res.status(400).send({ error: 'Missing user_ids or update_data' });
    }

    for (const id of user_ids) {
      const user = await db.get(`SELECT * FROM users WHERE user_id=? AND is_active=1`, [id]);
      if (!user) continue;

      let { full_name, mob_num, pan_num, manager_id } = update_data;

      // Validate
      if (mob_num) mob_num = validateMobile(mob_num);
      if (pan_num) pan_num = validatePan(pan_num);
      if (manager_id) {
        const managerValid = await isManagerActive(db, manager_id);
        if (!managerValid) return res.status(400).send({ error: 'Invalid manager_id' });

        if (user.manager_id && user.manager_id !== manager_id) {
          // Deactivate old entry and insert new with updated manager
          await db.run(`UPDATE users SET is_active=0 WHERE user_id=?`, [id]);
          const newUserId = uuidv4();
          await db.run(
            `INSERT INTO users(user_id, full_name, mob_num, pan_num, manager_id, created_at, updated_at, is_active)
             VALUES (?,?,?,?,?,?,?,1)`,
            [
              newUserId,
              full_name || user.full_name,
              mob_num || user.mob_num,
              pan_num || user.pan_num,
              manager_id,
              new Date().toISOString(),
              new Date().toISOString(),
            ]
          );
          continue; // skip normal update
        }
      }

      // Update normally
      await db.run(
        `UPDATE users SET full_name=?, mob_num=?, pan_num=?, manager_id=?, updated_at=? WHERE user_id=?`,
        [
          full_name || user.full_name,
          mob_num || user.mob_num,
          pan_num || user.pan_num,
          manager_id || user.manager_id,
          new Date().toISOString(),
          id,
        ]
      );
    }

    res.send({ message: 'User(s) updated successfully' });
  } catch (e) {
    console.log(`Error in /update_user: ${e.message}`);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

app.get("/get_users", async (req, res) => {
  const users = await db.all(`SELECT * FROM users WHERE is_active=1`);
  res.send(users);
});
