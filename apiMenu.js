const express = require('express');
const menuRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const {findLastIdMenu,findLastIdMenuItem} = require('./findFunctions');


// In this file every 'menuRoute' is given.
// Two functions are in the file findFunctions.js to find always the lastId.

// Routers to always check for a valid id for menuId and menuItemId.


menuRouter.param('menuId', (req, res, next, menuId) => {
  const sql = 'SELECT * FROM Menu WHERE Menu.id = $menu_Id';
  const values = {$menu_Id: menuId};
  db.get(sql, values, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});
menuRouter.param('menuItemId', (req, res, next, menuItemId) => {
  const sql = 'SELECT * FROM MenuItem WHERE MenuItem.id = $menuItem_id';
  const values = {$menuItem_id: menuItemId};
  db.get(sql, values, (err, menuItem) => {
    if (err) {
      next(err);
    } else if (menuItem) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});


// Get Routes
menuRouter.get('/', (req,res,next) => {
    db.all('SELECT * FROM Menu', (err,menus) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({menus: menus});
      }
    });
});
menuRouter.get('/:menuId', (req,res,next) => {
    db.get('SELECT * FROM Menu WHERE Menu.id = $id',{
      $id: req.params.menuId
    }, (err, menu) =>{
      if (err) {
        res.status(404);
        next(err);
      } else {
        res.status(200).json({menu: menu});
      }
    });
});
menuRouter.get('/:menuId/menu-items', (req,res,next) => {
  db.all('SELECT * FROM Menu, MenuItem WHERE Menu.id = $id AND MenuItem.menu_id = $id', {
    $id: req.params.menuId
  }, (err,menuItems) =>{
    if (err){
      next(err);
    } else {
        res.status(200).json({menuItems: menuItems});
    }
  });
} );

// Post Routes for Menus and MenuItems.
menuRouter.post('/', (req, res, next) => {
  const id = findLastIdMenu(),
        title = req.body.menu.title;
  if (!title) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Menu (id, title) VALUES ($id, $title)';
  const values = {
    $id: id,
    $title: title
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
        (error, menu) => {
          res.status(201).json({menu: menu});
        });
    }
  });
});
menuRouter.post('/:menuId/menu-items', (req,res,next) => {
  const id = findLastIdMenuItem(),
        name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price,
        menu_id = req.params.menuId
  if (!name || !description || !inventory || !price) {
    return res.sendStatus(400);
  };


  const sql = 'INSERT INTO MenuItem (id, name, description, inventory, price, menu_id )' +
      'VALUES ($id, $name, $description, $inventory, $price, $menu_id )';
  const values = {
    $id: id,
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menu_id: menu_id

  };

  db.run(sql, values, function(err) {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
        (err, menuItem) => {
          res.status(201).json({menuItem: menuItem});
        });
      } });
    });

// Put Routes for Menus and MenuItems.
menuRouter.put('/:menuId', (req, res, next) => {
  const title = req.body.menu.title;

  if (!title) {
    return res.sendStatus(400);
      }

  const sql = 'UPDATE Menu SET title = $title WHERE Menu.id = $menuid';
  const values = {
        $title: title,
        $menuid: req.params.menuId
        };

  db.run(sql, values, (error) => {
      if (error) {
        next(error);
      } else {
        db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
          (error, menu) => {
          res.status(200).json({menu: menu});
        });
      }
      });
    });
menuRouter.put('/:menuId/menu-items/:menuItemId', (req, res, next) => {
  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price
        menuId = req.body.menuItem.menuId;


    const sql = 'UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price ' +
              'WHERE MenuItem.menu_id = $menuId AND MenuItem.id = $id';
    const values = {
          $name: name,
          $description: description,
          $inventory: inventory,
          $price: price,
          $id: req.params.menuItemId,
          $menuId: req.params.menuId
      };

    db.run(sql, values, (err) => {
        if (err) {
          next(err);
        } else {
          db.get(`SELECT * FROM MenuItem WHERE MenuItem.menu_id = ${req.params.menuId}
            AND MenuItem.id = ${req.params.MenuItemId}`,
            (err, menuItem) => {
              res.status(200).json({menuItem: menuItem});
            });
        }
      })
    })

//Delete Routes

menuRouter.delete('/:menuId', (req, res, next) => {
    const sql = 'DELETE FROM Menu WHERE Menu.id = $menuId';
    const values = {$menuId: req.params.menuId};

    db.run(sql, values, (error) => {
      if (error) {
        next(error);
      } else {
        res.sendStatus(204);
    }

  });

});
menuRouter.delete('/:menuId/menu-items/:menuItemId', (req, res, next) => {
  const sql = 'DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId AND MenuItem.menu_id = $menuId';
  const values = {$menuId: req.params.menuId,
                  $menuItemId: req.params.menuItemId};

  if (!values){
    res.status(404);
  }
  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});


module.exports = menuRouter;
