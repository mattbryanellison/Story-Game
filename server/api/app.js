const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");

const TWO_HOURS = 1000 * 60 * 60 * 2;

const {
  PORT = 3000,
  NODE_ENV = "development",

  SESS_NAME = "sid",
  SESS_SECRET = "ssh!",
  SESS_LIFETIME = TWO_HOURS,
} = process.env;

const IN_PROD = NODE_ENV === "production";

const users = [
  { id: 1, name: "Alex", email: "alex@gmail.com", password: "secret" },
  { id: 2, name: "Alexis", email: "alexis@gmail.com", password: "secret" },
  {
    id: 3,
    name: "Alexandra",
    email: "alexandra@gmail.com",
    password: "secret",
  },
];

const app = express();

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(
  session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
      maxAge: SESS_LIFETIME,
      sameSite: true,
      secure: IN_PROD,
    },
  })
);

const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect("/login");
  } else {
    next();
  }
};

const redirectHome = (req, res, next) => {
  if (req.session.userId) {
    res.redirect("/home");
  } else {
    next();
  }
};

app.get("/", (req, res) => {
  const { userId } = req.session;
  //const userId = 1;
  //console.log(userId)
  res.send(`
  <h1>Welcome!<h1>
  ${
    userId
      ? `<a href='/home'>Home</a>
      <form method='post' action='/logout'>
        <button>Logout</button>
      </form>`
      : `<a href='/login'>Login</a>
  <a href='/register'>Register</a>
  `
  }
  `);
});

app.get("/home", redirectLogin, (req, res) => {
  res.send(`
    <h1>Home</h1>
    <a href='/'>Main</a>
    <ul>
      <li>Name: </li>
      <li>Email: </li>
    <ul>
  `);
});

app.get("/login", redirectHome, (req, res) => {
  //req.session.userId =
  res.send(`
    <h1>Login</h1>
    <form method='post' action='/login'>
      <input type='email' name='email' placeholder='Email' required />
      <input type='password' name='password' placeholder='Password' required />
      <input type='submit' />
    </form>
    <a href='/register'>Register</a>
  `);
});

app.get("/register", redirectHome, (req, res) => {
  res.send(`
    <h1>Register</h1>
    <form method='post' action='/register'>
      <input type='name' placeholder='Name' required />
      <input type='email' name='email' placeholder='Email' required />
      <input type='password' name='password' placeholder='Password' required />
      <input type='submit' />
    </form>
    <a href='/login'>Login</a>
  `);
});

app.post("/login", redirectHome, (req, res) => {
  const { email, password } = req.body;

  if (email && password) {
    const user = users.find((user) => {
      user.email === email && user.password === password;
    });

    if (user) {
      req.session.userId = user.id;
      return res.redirect("/home");
    }
  }
});

app.post("/register", redirectHome, (req, res) => {});

app.post("/logout", redirectLogin, (req, res) => {});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
