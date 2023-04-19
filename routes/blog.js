const express = require("express");

const router = express.Router();

const db = require("../data/database");

router.get("/", function (req, res) {
  res.redirect("/posts");
});

router.get("/posts", async function (req, res) {
  const query = `SELECT blog.posts.* ,blog.authors.name as a_name 
  from blog.posts 
  INNER JOIN blog.authors 
  ON blog.posts.author_id= blog.authors.id`;
  const [posts] = await db.query(query);
  res.render("posts-list", { posts: posts });
});

router.get("/new-post", async function (req, res) {
  const [authors] = await db.query("Select * from blog.authors");
  res.render("create-post", { authors: authors });
});

router.post("/posts", async function (req, res) {
  const data = [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.body.author,
  ];
  await db.query(
    "Insert into blog.posts (title,summary,body,author_id) values(?)",
    [data]
  );
  res.redirect("/posts");
});

router.get("/posts/:id", async function (req, res) {
  const query = `
  SELECT blog.posts.*, blog.authors.name as a_name, blog.authors.email as a_email
  FROM blog.posts
  INNER JOIN blog.authors
  ON blog.posts.author_id= blog.authors.id
  WHERE blog.posts.id=?`;
  const [posts] = await db.query(query, [req.params.id]);

  if (!posts || posts.length === 0) {
    return res.status(404).render("404");
  }

  const postData = {
    ...posts[0],
    date: posts[0].date.toISOString(),
    humanReadableDate: posts[0].date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };

  res.render("post-detail", { post: postData });
});

router.get("/posts/:id/edit", async function (req, res) {
  const query = `
    SELECT * FROM blog.posts WHERE blog.posts.id=?
    `;
  const [posts] = await db.query(query, [req.params.id]);

  if (!posts || posts.length === 0) {
    return res.status(404).render("404");
  }

  res.render("update-post", { post: posts[0] });
});

router.post("/posts/:id/edit",async function (req, res) {
  const query = `
      UPDATE blog.posts SET blog.posts.title =?, blog.posts.summary=?, blog.posts.body=?
      WHERE blog.posts.id=?
    `;

  await db.query(query, [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.params.id,
  ]);

  res.redirect('/posts')

});

module.exports = router;
