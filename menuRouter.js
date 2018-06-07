const express = require('express');
const sqlite3 = require('sqlite3');

const menuRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

function validateMenuInput(req, res, next) {
  let menu = req.body.menu;
  if (menu === undefined ||
    !menu.title ) {
    res.status(400).send();
  } else {
    req.menuInput = menu;
    next();
  }
}

menuRouter.param('id', (req, res, next, id) => {
  db.get(`SELECT * FROM Menu WHERE id = ${id}`, (error, row) => {
    if (error) {
      res.status(400).send(error);
    } else if (row === undefined) {
      res.status(404).send('Menu not found!');
    } else {
      req.menu = row;
      next();
    }
  });
});

menuRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Menu`, (error, rows) => {
    res.send({ menus: rows });
  });
});

menuRouter.get('/:id', (req, res, next) => {
  res.send({ menu: req.menu });
});

menuRouter.post('/', validateMenuInput, (req, res, next) => {
  db.run(`INSERT INTO Menu (title) VALUES ($title)`, {
    $title: req.menuInput.title
  }, function (error) {
      if (error) {
        console.log(error);
      } else {
        db.get(`SELECT * FROM Menu
          WHERE id = ${this.lastID}`, (error, row) => {
            res.status(201).send({ menu: row });
          });
      }
    });
});

module.exports = menuRouter;
