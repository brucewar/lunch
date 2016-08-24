var indexApi = require('../api/index');
exports.actionIndex = function(req, res){
  res.render('index');
};

exports.getList = function(req, res){
  req.query.orderDate = new Date().format('YYYY-MM-DD');
  proxy.send(req, {
    url: indexApi.getList
  }, function(data, success){
    if(success){
      res.send(proxy.renderSend(data));
    }else{
      res.send(proxy.renderErrSend(data.msg));
    }
  });
};

exports.book = function(req, res){
  //if(req.query.orderDate == new Date().format('YYYY-MM-DD') && new Date().format('hh:mm') > '10:15') return res.send(proxy.renderErrSend('过了10:15，无法预订今天的午餐啦啦啦！'));
  req.query.remark = '';
  proxy.send(req, {
    url: indexApi.book
  }, function(data, success){
    if(success){
      res.send(proxy.renderSend(data));
    }else{
      res.send(proxy.renderErrSend(data.msg));
    }
  });
};