define(function(require, exports, module) {
    var _ = require('lodash');
    var Table = function(opts){
        opts = opts || {};
        if(typeof opts != 'object'){
            throw new Error('参数必须为对象');
        }
        if(!opts.containerId){
            throw new Error('no table containerId');
        }
        this.containerId = opts.containerId;
        if (opts.containerId) {
            this.$container = $("#" + opts.containerId);
        } else if (opts.containerClass) {
            this.$container = $("." + opts.containerClass);
        }
        this.theads = opts.theads;
        this.tbodys = opts.tbodys;
        if(this.tbodys && this.theads && this.tbodys.length != this.theads.length) throw new Error('column count not match');
        this.hideItem = opts.hideItem || [];
        this.sortItem = [];
        for(var i in this.hideItem){
            this.hideItem[i] = this.theads.indexOf(this.hideItem[i]);
        }
        if(opts.columns){
            // [{name: 'col1', sort: false, hide: false, key: 'key'}]
            this.columns = opts.columns;
            this.theads = [];
            this.tbodys = [];
            this.hideItem = [];
            this.sortItem = [];
            var itemTemp;
            for(var i in this.columns){
                itemTemp = this.columns[i];
                this.theads.push(itemTemp.name || '');
                this.tbodys.push(itemTemp.key ? ('<%=obj.' + itemTemp.key + ' === 0 ? obj.' + itemTemp.key + ' : obj.' + itemTemp.key + ' || "--"%>') : '');
                if(itemTemp.hide) this.hideItem.push(parseInt(i));
                if(itemTemp.sort) this.sortItem.push(parseInt(i));
            }
        }
        this.itemTmpl = opts.itemTmpl ? opts.itemTmpl : this._getItemTmpl(this.tbodys || []);
        this.state = opts.state || false;
        this.params = opts.params || {
                page: 1,
                start: 0,
                limit: 10
            };
        this.onchange = opts.onchange || function(){};
        this.formatData = opts.formatData;
    };
    Table.prototype._getItemTmpl = function(tbodys){
        var arr = [];
        arr.push('<tr>');
        arr = arr.concat(tbodys.map(function(item){
            return '<td>' + item + '</td>';
        }));
        arr.push('</tr>');
        return arr;
    };
    Table.prototype._renderThead = function(){
        var self = this;
        return this.theads.map(function(item, index){
            if(self.sortItem.indexOf(index) != -1){
                return '<th style="cursor: pointer;' + ((self.hideItem.indexOf(index) != -1) ? 'display: none;' : '') + '">' + item + '<span class="glyphicon glyphicon-triangle-top"></span></th>';
            }else{
                return '<th' + (self.hideItem.indexOf(index) != -1 ? ' style="display: none"' : '') + '>' + item + '</th>';
            }
        }).join('');
    };
    Table.prototype.render = function(){
        var self = this;
        var table = [
            '<div class="table-scroll" style="width: 100%; max-width: 100%; overflow-x: auto">',
            '<table class="table table-bordered table-striped" style="margin-bottom: 0;white-space: nowrap">',
                '<thead><tr>' + this._renderThead() + '</tr></thead>',
                '<tbody></tbody>',
            '</table>',
            '</div>',
            '<nav>',
            '<ul class="pagination" style="margin: 0; width: 100%">',
            '<li class="first disabled"><a href="javascript: void(0);">首页</a></li>',
            '<li class="previous disabled"><a href="javascript: void(0);">上一页</a></li>',
            '<li class="next disabled"><a href="javascript: void(0);">下一页</a></li>',
            '<li class="last disabled"><a href="javascript: void(0);">尾页</a></li>',
            '<li style="display: inline-block; height: 30px; line-height: 30px;">共<i class="totalPage"></i>页，每页',
            '<select class="limit disabled">',
            '<option value="1000" select>1000</option>',
            '</select>条数据，共<i class="totalCount"></i>条数据，',
            '</li>',
            '<li>当前页<input type="text" name="currentPage" style="width: 50px;"><button class="btn btn-primary btn-xs disabled" style="margin: 0 5px;">Go</button></li>',
            '<li class="text-danger"></li>',
            '</ul>',
            '</nav>',
            '<a data-toggle="tooltip" data-placement="left" title="表格太长了，选我哦！" class="text-success item-choose" style="z-index: 10; position: absolute; right: 2px; top: 0; font-size: 24px;" href="javascript: void(0);">',
                '<span class="glyphicon glyphicon-th"></span>',
                '<div class="table-items" style="display: none;position: absolute; top: 30px; right: 0; color: #000;font-size: 12px;width: 150px;padding: 5px;border: 1px solid rgb(212, 212, 212);box-shadow: rgb(221, 221, 221) 0px 0px 3px 3px;background-color: rgb(238, 238, 238);max-height: 200px;overflow-y: auto">',
                this.theads.map(function(item, index){return '<label style="display: block;font-weight: normal;margin: 0;cursor: pointer;' + ((index == self.theads.length - 1) ? '' : 'padding: 0 0 5px 0;') + '"><input style="vertical-align: middle;margin-top: -3px;" type="checkbox" name="itemShow" ' + (self.hideItem.indexOf(index) == -1 ? 'checked' : '') + ' value="' + index + '">' + item + '</label>'}).join(''),
                '</div>',
            '</a>'
        ];
        this.$container.empty().append(table.join(''));
        this._bindEvent();
        if(this.state){
            // 取历史
            this.params = history.state && history.state[this.containerId] || this.params;
        }
        this.go();
        return this;
    };
    Table.prototype._bindEvent = function(){
        var self = this;
        this.$container.undelegate('nav a', 'click');
        this.$container.delegate('nav a', 'click', function() {
            var $li = $(this).parent();
            if($li.hasClass('disabled')){
                return false;
            }
            if ($li.hasClass('previous')) {
                if (self.params.page <= 1) {
                    return false;
                } else {
                    self.go(--self.params.page);
                }
            } else if ($li.hasClass('next')) {
                if (self.params.page == self.params.total) {
                    return false;
                } else {
                    self.go(++self.params.page);
                }
            } else if($li.hasClass('first')){
                self.go(1);
            } else if($li.hasClass('last')){
                self.go(self.params.total);
            } else if($li.attr('data-page')){
                self.go(parseInt($li.attr('data-page')));
            }
            return false;
        });

        this.$container.find('select').change(function(e){
            self.params.limit = parseInt($(this).val());
            self.go(1);
        });

        this.$container.find('button').click(function() {
            var page = parseInt($(this).prev().val()) || 0;
            if (self.params.total == 0) {
                $(this).parent().next().text('当前列表无数据！');
                return false;
            } else if (page < 1 || page > self.params.total) {
                $(this).parent().next().text('跳转的页码只能在1-' + self.params.total + '之间！');
                return false;
            }
            $(this).parent().next().text("");
            self.go(page);
        });

        // 排序
        this.$container.undelegate('thead th', 'click');
        this.$container.delegate('thead th', 'click', function (e) {
            var $icon = $(this).find('.glyphicon');
            if (!$icon.size()) return;
            self.columns.map(function(item){
                return item.sort;
            }).forEach(function(key){
                delete self.params[key];
            });
            var currentKey = self.columns[$(this).index()]['sort'];
            if($(this).is('.text-primary')){
                if($icon.is('.glyphicon-triangle-bottom')){
                    self.params[currentKey] = true;
                    $icon.removeClass('.glyphicon-triangle-bottom').addClass('.glyphicon-triangle-top');
                }else{
                    self.params[currentKey] = false;
                    $icon.addClass('.glyphicon-triangle-bottom').removeClass('.glyphicon-triangle-top');
                }
            }else{
                self.params[currentKey] = true;
                $(this)
                    .siblings('.text-primary')
                    .removeClass('text-primary')
                    .find('.glyphicon')
                    .removeClass('glyphicon-triangle-bottom')
                    .addClass('glyphicon-triangle-top');
                $(this).addClass('text-primary');
            }
            self.go(1);
        });

        //展示table隐藏和显示的选择
        this.$container.undelegate('.item-choose', 'click');
        this.$container.delegate('.item-choose', 'click', function(e){
            e.stopPropagation();
            if($(e.target).parents('.table-items').size()) return;
            $(this).find('.table-items').toggle();
        });
        $(document).click(function(){
            self.$container.find('.table-items').hide();
        });
        this.$container.undelegate('label', 'click');
        this.$container.delegate('label', 'click', function(e){
            var $target = e.target.nodeName == 'LABEL' ? $(e.target) : $(e.target).parent();
            var $table = self.$container.find('table');
            var index = self.hideItem.indexOf($target.index());
            if($target.find('input').prop('checked')){
                if(index != -1) self.hideItem.splice(index, 1);
                $table.find('tr th:nth-of-type(' + ($target.index() + 1) + ')').show();
                $table.find('tr td:nth-of-type(' + ($target.index() + 1) + ')').show();
            }else{
                if(index == -1) self.hideItem.push($target.index());
                $table.find('tr th:nth-of-type(' + ($target.index() + 1) + ')').hide();
                $table.find('tr td:nth-of-type(' + ($target.index() + 1) + ')').hide();
            }
        });

        // 固定操作按钮
        this.$container.undelegate('tbody>tr', 'mouseover');
        this.$container.delegate('tbody>tr', 'mouseover', function(e){
            var $tdTemp = $(this).find('td:last-child');
            if(!$tdTemp.find('a').size()) return;
            var $tableScroll = self.$container.find('.table-scroll');
            var scrollLeft = $tableScroll[0].scrollLeft;
            if(scrollLeft > ($tableScroll[0].scrollWidth - $tableScroll.width() - $tdTemp.width())){
                return;
            }
            $tdTemp.css({
                'position': 'absolute',
                'right': 0,
                'background-color': '#add8e6'
            });
        });
        this.$container.undelegate('tbody>tr', 'mouseout');
        this.$container.delegate('tbody>tr', 'mouseout', function(e){
            var $tdTemp = $(this).find('td:last-child');
            if(!$tdTemp.find('a').size()) return;
            $tdTemp.prop('style', '');
        });
        /* 横向滚动
        this.$container.delegate('.table-scroll', 'mousewheel', function(e){
            var event = e.wheelDelta ? e : window.event;
            if (e.target.doScroll) {
                e.target.doScroll(event.wheelDelta > 0 ? "left" : "right");
            }else if ((event.wheelDelta || event.detail) > 0) {
                $(this)[0].scrollLeft -= 10;
            }else {
                $(this)[0].scrollLeft += 10;
            }
            return false;
        });
        */
    };
    Table.prototype.go = function(page){
        var self = this;
        self.params = self.params || {};
        self.params.page = page || self.params.page || 1;
        self.params.limit = self.params.limit || 10;
        self.params.start = self.params.limit * (self.params.page - 1);
        delete self.params.total;
        if(history.pushState && this.state){
            var currentState = history.state || {};
            currentState[this.containerId] = self.params;
            history.replaceState(currentState, document.title);
        }
        self.onchange(self.params, function(data) {
            // data {rows: [], count: 0}
            self.params.total = Math.ceil(data.count / self.params.limit);
            self.params.totalCount = data.count;
            if (self.params.total == 0) {
                self.params.page = 0;
                self.params.totalCount = 0;
            }
            self._change();
            self._renderData(data.rows);
        });
        return this;
    };
    Table.prototype._change = function(){
        this.$container.find('.disabled').removeClass('disabled');
        var $previous = this.$container.find('.previous');
        var $next = this.$container.find('.next');
        var $first = this.$container.find('.first');
        var $last = this.$container.find('.last');
        $first.removeClass('disabled');
        $last.removeClass('disabled');
        $previous.removeClass('disabled');
        $next.removeClass('disabled');
        this.$container.find('.text-danger').text("");

        if (this.params.page <= 1) {
            $previous.addClass('disabled');
            $first.addClass('disabled');
        }

        if (this.params.total == 0 || this.params.total == this.params.page) {
            $next.addClass('disabled');
            $last.addClass('disabled');
        }
        if(this.params.page > 0 && this.params.total > 0){
            this.$container.find('li[data-page]').remove();
            var startPage = Math.floor(this.params.page / 10) * 10;
            if(startPage == this.params.page){
                startPage = Math.floor((this.params.page - 1) / 10) * 10;
            }
            var i = 1;
            var pagesTemp = [], pageNum;
            while(i <= 10){
                pageNum = startPage + (i++);
                if(pageNum > this.params.total){
                    break;
                }
                pagesTemp.push('<li class="' + (this.params.page == pageNum ? 'active' : '') + '" data-page="' + pageNum + '"><a href="javascript:void(0);">' + pageNum + '</a></li>');
            }
            $previous.after(pagesTemp.join(''));
        }else{
            this.$container.find('li[data-page]').remove();
        }
        this.$container.find('input[name="currentPage"]').val(this.params.page);
        this.$container.find('i.totalPage').text(this.params.total);
        this.$container.find('i.totalCount').text(this.params.totalCount);
    };
    Table.prototype._renderData = function(rows){
        var self = this;
        var $tbody = this.$container.find('tbody');
        $tbody.empty();
        var $html = '';
        for(var i in rows) {
            rows[i] = typeof self.formatData == 'function' ? self.formatData(rows[i]) : rows[i];
            rows[i].rowNum = (self.params.page - 1) * self.params.limit + parseInt(i) + 1;
            $html = $(_.template(self.itemTmpl.join(''))(rows[i]));
            self.hideItem.forEach(function (item) {
                $html.find('td:eq(' + item + ')').hide();
            });
            $tbody.append($html);
        }
    };
    Table.prototype.setParameter = function(params){
        for(var key in this.params){
            if(key != 'start' && key != 'limit'){
                delete this.params[key];
            }
        }
        this._resetSort();
        _.extend(this.params, params);
        return this;
    };
    Table.prototype._resetSort = function () {
        // 重置排序
        this.$container.find('thead th.text-primary')
            .removeClass('text-primary');
        this.$container.find('thead .glyphicon-triangle-bottom')
            .removeClass('glyphicon-triangle-bottom')
            .addClass('glyphicon-triangle-top');
    };
    Table.prototype.getParameter = function(){
        return this.params;
    };
    module.exports = Table;
});