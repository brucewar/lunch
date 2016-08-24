;(function(){
    window.crmAlert = function(msg, success, cb){
        if(typeof msg != 'string') throw new Error('first argument must be a string!');
        if(typeof success == 'undefined') success = false;
        if(typeof success == 'function') {
            cb = success;
            success = false;
        }
        // clearInterval and remove .crm-dialog
        clearInterval($('.crm-dialog').data('timeout'));
        $('.crm-dialog').remove();
        var htmlTemp = [
            '<div class="crm-dialog" role="alert">',
                '<div class="dialog-progress"></div>',
                '<span class="dialog-close-button">&times;</span>',
                '<div class="dialog ' + (success ? 'dialog-success' : 'dialog-error') + '">',
                    '<div class="dialog-message">' + msg + '</div>',
                '</div>',
            '</div>'
        ];
        var $crmDialog = $(htmlTemp.join(''));
        $crmDialog.find('.dialog-close-button').click(function(){
            var $crmDialog = $(this).parent();
            $crmDialog.fadeOut(function(){
                $crmDialog.remove();
            });
        });
        $('body').append($crmDialog);
        function timer(time){
            time = time || 5000;
            var timeTemp = time;
            var $progress = $crmDialog.find('.dialog-progress').css('width', '100%');
            $crmDialog.data('timeout', setInterval(function(){
                $progress.css('width', (timeTemp / time * 100) + '%');
                if(timeTemp <= 0){
                    clearInterval($crmDialog.data('timeout'));
                    $crmDialog.fadeOut(2000, function(){
                        $crmDialog.remove();
                        cb && cb();
                    });
                }
                timeTemp-=10;
            }, 10));
        }
        timer(5000);
        $crmDialog.mouseover(function(){
            $(this).find('.dialog-progress').css('width', 0);
            clearInterval($(this).data('timeout'));
        });
        $crmDialog.mouseout(function(){
            timer(2000);
        });
    }
})();
