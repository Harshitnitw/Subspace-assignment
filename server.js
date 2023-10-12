const express = require('express');
const request = require('request-promise');
const _ = require('lodash');
const memoize = require('lodash.memoize');

const app = express();

const BLOG_URL = 'https://intent-kit-16.hasura.app/api/rest/blogs';
const SECRET = '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6';

const fetchBlogData = memoize(async () => {
  try {
    const options = {
      uri: BLOG_URL,
      headers: {
        'x-hasura-admin-secret': SECRET
      },
      json: true
    };
    const data = await request(options);
    return data;
  } catch (err) {
    console.error(err);
    throw new Error('Could not fetch blog data');
  }
});

app.get('/api/blog-stats', async (req, res) => {
    try {
      const data = await fetchBlogData();
      const blogs = data.blogs;
      const totalBlogs = blogs.length;
      const longestTitleBlog = _.maxBy(blogs, blog => blog.title.length);
      const privacyBlogs = _.filter(blogs, (blog) => _.includes(_.toLower(blog.title), 'privacy')).length;
      const uniqueTitles = _.uniqBy(blogs, 'title');
  
      res.json({
        totalBlogs,
        longestTitleBlog: longestTitleBlog.title,
        privacyBlogs,
        uniqueTitles: uniqueTitles.map(blog => blog.title)
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get('/api/blog-search', async (req, res) => {
    try {
      const query = _.toLower(req.query.query);
      const data = await fetchBlogData();
      const blogs = data.blogs;
      const results = _.filter(blogs, (blog) => _.includes(_.toLower(blog.title), query));
  
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
app.listen(3000, () => console.log('Server running on port 3000'));