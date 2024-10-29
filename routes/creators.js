// routes/creators.js
const express = require('express');
const router = express.Router();

router.get('/creators', (req, res) => {
  res.render('creators', { title: 'Creadores de OjoAhi' });
});

module.exports = router;