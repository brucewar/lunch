var request = require('request');
var HttpRequest = function(req, params, callback){
  this.req = req;
  params = params || {};
  this.callback = callback || function(){};
  this.method = (params.method || 'GET').toUpperCase();
  this.url = params.url || '';
  this.json = params.json || true;
}

HttpRequest.prototype.send = function(){
  if(this.url == ''){
    console.error('缺少接口url');
  }
  this.method == 'POST' ? this.post() : this.get();
};

HttpRequest.prototype.get = function(){
  var self = this;
  request({
    url: this.url + '?' + JSON.stringify(this.req.query || {})
  }, function(err, res, body){
    self.handleReq(err, res, body);
  });
};

HttpRequest.prototype.post = function(){
  var self = this;
  var requestData = {
    url: this.url
  };
  if(this.json){
    requestData.json = this.req.body || {};
  }else{
    requestData.form = {
      data: JSON.stringify(this.req.body || {})
    };
  }
  request.post(requestData, function(err, res, body){
    self.handleReq(err, res, body);
  });
};

HttpRequest.prototype.handleReq = function(err, res, body){
  if(err){
    this.callback(err, false);
    return console.error(err);
  }
  if(res.statusCode == 200){
    var data = {};
    if(typeof body == 'object'){
      data = body;
    }else if(body.indexOf('{') != -1){
      data = JSON.parse(body);
    }
    this.callback(data.success ? data.data : data, data.success);
  }
};

exports.send = function(req, params, callback){
  new HttpRequest(req, params, callback).send();
};

exports.renderSend = function(data){
  return {
    success: true,
    data: data,
    errorCode: ''
  };
};

exports.renderErrSend = function(msg, errorCode){
  return {
    success: false,
    msg: msg,
    errorCode: errorCode || '',
  };
};
