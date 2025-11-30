// validators.js

// Validate Mobile Number
const validateMobile = (mob_num) => {
  if (!mob_num) return null;
  // Remove +91 or leading 0
  let cleaned = mob_num.replace(/^\+91|^0/, '');
  if (!/^\d{10}$/.test(cleaned)) return null;
  return cleaned;
};

// Validate PAN Number
const validatePan = (pan) => {
  if (!pan) return null;
  const panUpper = pan.toUpperCase();
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panUpper)) return null;
  return panUpper;
};

// Middleware to check required fields
const checkRequiredFields = (fields) => {
  return (req, res, next) => {
    for (let field of fields) {
      if (!req.body[field]) {
        return res.status(400).send({ error: `Missing required field: ${field}` });
      }
    }
    next();
  };
};

// Validate Manager exists and active
const isManagerActive = async (db, manager_id) => {
  if (!manager_id) return true; // optional
  const manager = await db.get(`SELECT * FROM managers WHERE manager_id=? AND is_active=1`, [manager_id]);
  return !!manager;
};

module.exports = {
  validateMobile,
  validatePan,
  checkRequiredFields,
  isManagerActive,
};
