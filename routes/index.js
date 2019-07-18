var express = require('express');
var router = express.Router();

const about = require('./controllers/about.js');
const contact = require('./controllers/contact.js');
const apiPost = require('./apis/v1/post');
const apiPosts = require('./apis/v1/posts');
const home = require('./controllers/home.js');
const postView = require('./controllers/post-view.js');

router.get('/about', about);
router.get('/contact', contact);

router.route('/api/v1/post')
  .get(apiPost.get);

router.route('/api/v1/posts')
  .get(apiPosts.get);

router.get(['/', '/home'], home);
router.get('/post', postView);

module.exports = router;
