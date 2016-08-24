var Table = require('./components/table');
var Kalendae = require('../../lib/Kalendae/Kalendae');
$(function(){
  var webPage = {
    init: function(){
      this.bindEvent();
      new Kalendae.Input('date', {
        mode: 'single',
        direction: 'today-future'
      });
      this.initTable();
    },
    bindEvent: function(){
      var self = this;
      $('#book').click(function(){
        var sd = {};
        var level = $('input[name="level"]:checked').val();
        var name = $('#name').val().trim();
        var date = $('#date').val();
        if(name == '') return crmAlert('这餐给谁点的呢？');
        if(date == '') return crmAlert('选个日期呗！');
        self.book({
          name: name,
          orderDate: date,
          type: level
        }, function(){
          self.table.go();
        });
      });
    },
    getData: function(sd, cb){
      $.ajax({
        url: '/list',
        data: sd,
        dataType: 'json',
        success: function(res){
          res.data = {
            count: res.data.length,
            rows: res.data
          };
          cb && cb(res.data);
        }
      });
    },
    book: function(sd, cb){
      $.ajax({
        url: '/book',
        data: sd,
        dataType: 'json',
        success: function(res){
          if(!res.success) return crmAlert(res.msg);
          crmAlert('等着吃饭吧！', true);
          cb && cb(res.data);
        }
      });
    },
    initTable: function(){
      this.table = new Table({
        containerId: 'table',
        columns: [
          {
            name: '姓名',
            key: 'name'
          }, {
            name: '档次',
            key: 'type'
          }, {
            name: '日期',
            key: 'orderDate'
          }
        ],
        onchange: this.getData.bind(this)
      }).render();
    }
  };
  webPage.init();
});
