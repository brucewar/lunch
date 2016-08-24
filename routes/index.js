var indexController = require('../controllers/index');
module.exports = function(app){
  app.all('*', function(req, res, next){
    next();
  });
  app.get('/', indexController.actionIndex);
  app.get('/list', indexController.getList);
  app.get('/book', indexController.book);
};
