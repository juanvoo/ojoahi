const express = require('express');
const router = express.Router();

router.get('/opinions', (req, res) => {
  res.render('opinions', { title: 'Opiniones sobre OjoAhi' });
});

module.exports = router;