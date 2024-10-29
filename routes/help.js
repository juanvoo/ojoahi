const express = require('express');
const router = express.Router();

router.get('/help', (req, res) => {
  res.render('help', { title: 'Centro de ayudas de OjoAhi' });
});

module.exports = router;