const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  if (req.session.visits) {
    req.session.visits++;
    if (req.session.visits >= 5) {
      res.setHeader('Content-Type', 'text/html');
      res.send('<script>alert("You have visited this page more than 5 times!");</script>');
    } else {
      next();
    }
  } else {
    req.session.visits = 1;
    next();
  }
});

app.get('/', (req, res) => {
  res.cookie('name', { title: req.query.fname, desc: req.query.career }, { maxAge: 180000 });
  res.send(`
    <html>
      <body>
        <h1>Cookie: ${req.cookies.name.title} - ${req.cookies.name.desc}</h1>
        <div>${res.locals.alert || ''}</div>
      </body>
    </html>
  `);
  console.log(`Cookie: ${req.cookies.name.title} - ${req.cookies.name.desc}`);
});

app.get('/cookies', (req, res) => {
  res.send(`Session visits: ${req.session.visits}<br>Cookie: ${JSON.stringify(req.cookies)}`);
});

let data = [
  { id: 1, nombre: 'ingredient1', tipo: 'type1', alergenos: false },
  { id: 2, nombre: 'ingredient2', tipo: 'type2', alergenos: true },
  { id: 3, nombre: 'ingredient3', tipo: 'type3', alergenos: false }
];

app.get('/insumos/all', (req, res) => {
  res.send(data);
});

app.get('/insumos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const item = data.find(item => item.id === id);
  if (item) {
    res.send(item);
  } else {
    res.status(404).send('Item not found');
  }
});

app.put('/insumos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const itemIndex = data.findIndex(item => item.id === id);
  if (itemIndex !== -1) {
    const { id, name, type, allergens } = req.body;
    if (id && name && type && typeof allergens === 'boolean') {
      data[itemIndex] = { id, name, type, allergens };
      res.status(201).send(data[itemIndex]);
    } else {
      res.status(400).send('Bad Request');
    }
  } else {
    res.status(404).send('Item not found');
  }
});

app.listen(4000, () => {
  console.log('Server listening on port 4000');
});