// documentation on writing tests here: http://docs.jquery.com/QUnit
// example tests: https://github.com/jquery/qunit/blob/master/test/same.js

$.fx.off = true;
var timeout = 1000;
//QUnit.testStart = function(name) {
//    log(name.name);
//};
QUnit.testDone = function(name) {
    $('#img a').webbox('destroy');
};

module('core');

test('create', function() {
    expect(11);
    $('#img a').webbox();
    var $webbox = $('#webbox');
    ok($webbox.length, '#webbox exists');
    ok($('#wb-close').length, '#wb-close exists');
    equal($('#wb-close').parent().get(0), $webbox.get(0), '#webbox is parent of #wb-close');
    ok($('#wb-prev').length, '#wb-prev exists');
    equal($('#wb-prev').parent().get(0), $webbox.get(0), '#webbox is parent of #wb-prev');
    ok($('#wb-next').length, '#wb-next exists');
    equal($('#wb-next').parent().get(0), $webbox.get(0), '#webbox is parent of #wb-next');
    ok($('#wb-title').length, '#wb-title exists');
    equal($('#wb-title').parent().get(0), $webbox.get(0), '#webbox is parent of #wb-title');
    ok($('#wb-loader').length, '#wb-loader exists');
    ok($('#wb-overlay').length, '#wb-overlay exists');
});

test('destroy', function() {
    expect(3);
    $('#img a').webbox().webbox('destroy');
    equal($('#webbox').length, false, '#webbox doesnt exist');
    equal($('#wb-overlay').length, false, '#wb-overlay doesnt exist');
    equal($('#wb-loader').length, false, '#wb-loader doesnt exist');
});

module('click events');

test('open by click on trigger', function() {
    stop();
    expect(6);
    $('#img a').webbox().filter(':first').click();
    var $webbox = $('#webbox');
  
    setTimeout(function() {
        ok($webbox.is(':visible'), '#webbox is visible');
        ok($webbox.find('#wb-title').is(':visible'), '#wb-title is visible');
        ok($webbox.find('#wb-close').is(':visible'), '#wb-close is visible');
        ok($webbox.find('#wb-next').is(':visible'), '#wb-next is visible');
        ok($webbox.find('#wb-prev').is(':hidden'), '#wb-prev is hidden');
        ok($('#wb-loader').is(':hidden'), '#wb-loader is hidden');
    
        start();
    }, timeout);
});

test('prev by click on prev button', function() {
    stop();
    expect(5);
    $('#img a').webbox().webbox('open', $('#img a:eq(1)'));
  
    setTimeout(function() {
        equal($('#webbox img').attr('src'), '../media/img/martin-janecky02.jpg', 'image src is "../media/img/martin-janecky02.jpg"');
        $('#wb-prev').click();
        setTimeout(function() {
            ok($('#webbox').is(':visible'), '#webbox is visible');
            ok($('#wb-prev').is(':hidden'), '#wb-prev is hidden');
            ok($('#wb-next').is(':visible'), '#wb-next is visible');
            equal($('#webbox img').attr('src'), '../media/img/martin-janecky01.jpg', 'image src is "../media/img/martin-janecky01.jpg"');
            
            start();
        }, timeout);
    }, timeout);
});

test('next by click on next button', function() {
    stop();
    expect(5);
    $('#img a').webbox();
    $('#img a').webbox('open', $('#img a:eq(0)'));
  
    setTimeout(function() {
        equal($('#webbox img').attr('src'), '../media/img/martin-janecky01.jpg', 'first opened image src is "../media/img/martin-janecky01.jpg"');
        $('#wb-next').click();
    
        setTimeout(function() {
            ok($('#webbox').is(':visible'), '#webbox is visible');
            ok($('#wb-prev').is(':visible'), '#wb-prev is visible');
            ok($('#wb-next').is(':visible'), '#wb-next is visible');
            equal($('#webbox img').attr('src'), '../media/img/martin-janecky02.jpg', 'image src is "../media/img/martin-janecky02.jpg"');
      
            start();
        }, timeout);
    }, timeout);
});

test('close by click on close button', function() {
    stop();
    expect(3);
    $('#img a').webbox().webbox('open', $('#img a:eq(1)'));
  
    setTimeout(function() {
        $('#wb-close').click();
        setTimeout(function() {
            ok($('#webbox').is(':hidden'), '#webbox is hidden');
            ok($('#wb-overlay').is(':hidden'), '#wb-overlay is hidden');
            ok($('#wb-loader').is(':hidden'), '#wb-loader is hidden');
      
            start();
        }, timeout);
    }, timeout);
});

module('manual methods');

test('open by manual call (trigger not as argument)', function() {
    stop();
    expect(5);
    $('#img a').webbox();
    var $webbox = $('#webbox');
    $('#img a:eq(3)').webbox('open');
  
    setTimeout(function() {
        ok($webbox.is(':visible'), '#webbox is visible');
        ok($webbox.find('#wb-title').is(':hidden'), '#wb-title is hidden');
        ok($webbox.find('#wb-close').is(':visible'), '#wb-close is visible');
        ok($webbox.find('#wb-next').is(':hidden'), '#wb-next is hidden');
        ok($webbox.find('#wb-prev').is(':visible'), '#wb-prev is visible');
    
        start();
    }, timeout);
});

test('open by manual call (trigger as argument)', function() {
    stop();
    expect(5);
    $('#img a').webbox();
    var $webbox = $('#webbox');
    $('#img a').webbox('open', $('#img a:eq(1)'));
  
    setTimeout(function() {
        ok($webbox.is(':visible'), '#webbox is visible');
        ok($webbox.find('#wb-title').is(':visible'), '#wb-title is visible');
        ok($webbox.find('#wb-close').is(':visible'), '#wb-close is visible');
        ok($webbox.find('#wb-next').is(':visible'), '#wb-next is visible');
        ok($webbox.find('#wb-prev').is(':visible'), '#wb-prev is visible');
    
        start();
    }, timeout);
});

test('prev by manual call', function() {
    stop();
    expect(5);
    $('#img a').webbox().webbox('open', $('#img a:eq(3)'));
  
    setTimeout(function() {
        equal($('#webbox img').attr('src'), '../media/img/martin-janecky04.jpg', 'image src is "../media/img/martin-janecky04.jpg"');
        $('#img a').webbox('prev');
        setTimeout(function() {
            ok($('#webbox').is(':visible'), '#webbox is visible');
            ok($('#wb-prev').is(':visible'), '#wb-prev is visible');
            ok($('#wb-next').is(':visible'), '#wb-next is visible');
            equal($('#webbox img').attr('src'), '../media/img/martin-janecky02.jpg', 'image src is "../media/img/martin-janecky02.jpg"');
      
            start();
        }, timeout);
    }, timeout);
});

test('next by manual call (on last trigger - nothing changed)', function() {
    stop();
    expect(5);
    $('#img a').webbox().webbox('open', $('#img a:eq(3)'));
  
    setTimeout(function() {
        equal($('#webbox img').attr('src'), '../media/img/martin-janecky04.jpg', 'image src is "../media/img/martin-janecky04.jpg"');
        $('#img a').webbox('next');
        setTimeout(function() {
            ok($('#webbox').is(':visible'), '#webbox is visible');
            ok($('#wb-prev').is(':visible'), '#wb-prev is visible');
            ok($('#wb-next').is(':hidden'), '#wb-next is hidden');
            equal($('#webbox img').attr('src'), '../media/img/martin-janecky04.jpg', 'image src is "../media/img/martin-janecky04.jpg"');
      
            start();
        }, timeout);
    }, timeout);
});

test('close by manual call', function() {
    stop();
    expect(3);
    $('#img a').webbox().webbox('open', $('#img a:eq(3)'));
  
    setTimeout(function() {
        $('#img a').webbox('close');
        setTimeout(function() {
            ok($('#webbox').is(':hidden'), '#webbox is hidden');
            ok($('#wb-overlay').is(':hidden'), '#wb-overlay is hidden');
            ok($('#wb-loader').is(':hidden'), '#wb-loader is hidden');
      
            start();
        }, timeout);
    }, timeout);
});

module('shortcuts');

test('close by shortcut', function() {
    stop();
    expect(3);
    $('#img a').webbox().webbox('open', $('#img a:eq(1)'));
  
    setTimeout(function() {
        var e = $.Event('keydown.wb');
        e.which = 27;
        $(document).trigger(e);
        setTimeout(function() {
            ok($('#webbox').is(':hidden'), '#webbox is hidden');
            ok($('#wb-overlay').is(':hidden'), '#wb-overlay is hidden');
            ok($('#wb-loader').is(':hidden'), '#wb-loader is hidden');
      
            start();
        }, timeout);
    }, timeout);
});

test('prev by shortcut', function() {
    stop();
    expect(4);
    $('#img a').webbox().webbox('open', $('#img a:eq(3)'));
  
    setTimeout(function() {
        var e = $.Event('keydown.wb');
        e.which = 37;
        $(document).trigger(e);
        setTimeout(function() {
            ok($('#webbox').is(':visible'), '#webbox is visible');
            ok($('#wb-prev').is(':visible'), '#wb-prev is visible');
            ok($('#wb-next').is(':visible'), '#wb-next is visible');
            equal($('#webbox img').attr('src'), '../media/img/martin-janecky02.jpg', 'image src is "../media/img/martin-janecky02.jpg"');
      
            start();
        }, timeout);
    }, timeout);
});

test('next by shortcut', function() {
    stop();
    expect(4);
    $('#img a').webbox().webbox('open', $('#img a:eq(3)'));
  
    setTimeout(function() {
        var e = $.Event('keydown.wb');
        e.which = 39;
        $(document).trigger(e);
        setTimeout(function() {
            ok($('#webbox').is(':visible'), '#webbox is visible');
            ok($('#wb-prev').is(':visible'), '#wb-prev is visible');
            ok($('#wb-next').is(':hidden'), '#wb-next is hidden');
            equal($('#webbox img').attr('src'), '../media/img/martin-janecky04.jpg', 'image src is "../media/img/martin-janecky04.jpg"');
      
            start();
        }, timeout);
    }, timeout);
});

module('delegating');

test('open added image to the DOM', function() {
    stop();
    expect(5);
    $('#img a').webbox();
    var $webbox = $('#webbox');
    $('#img').prepend('<a href="../media/img/martin-janecky01.jpg" data-wb-group="gallery" id="added-image"><img src="../media/img/min/martin-janecky01.jpg" /></a>');
    $('#added-image').webbox('open');
  
    setTimeout(function() {
        ok($webbox.is(':visible'), '#webbox is visible');
        ok($webbox.find('#wb-title').is(':hidden'), '#wb-title is hidden');
        ok($webbox.find('#wb-close').is(':visible'), '#wb-close is visible');
        ok($webbox.find('#wb-next').is(':visible'), '#wb-next is visible');
        ok($webbox.find('#wb-prev').is(':hidden'), '#wb-prev is hidden');
        $('#added-image').remove();
    
        start();
    }, timeout);
});

module('listing');

test('is prev disabled when open first image', function() {
    stop();
    expect(1);
    $('#img a').webbox().webbox('open', $('#img a:eq(0)'));
  
    setTimeout(function() {
        ok($('#wb-prev').is(':hidden'), '#wb-prev is hidden');
      
        start();
    }, timeout);
});

test('is next disabled when open last image', function() {
    stop();
    expect(1);
    $('#img a').webbox().webbox('open', $('#img a:eq(3)'));
  
    setTimeout(function() {
        ok($('#wb-next').is(':hidden'), '#wb-next is hidden');

        start();
    }, timeout);
});

module('options');

test('overlay visible', function() {
    stop();
    expect(1);
    $('#img a').webbox().webbox('open', $('#img a:eq(0)'));
  
    setTimeout(function() {
        ok($('#wb-overlay').is(':visible'), '#wb-overlay is visible');
      
        start();
    }, timeout);
});

test('overlay hidden', function() {
    stop();
    expect(1);
    $('#img a').webbox().webbox('open', $('#img a:eq(2)'));
  
    setTimeout(function() {
        ok($('#wb-overlay').is(':hidden'), '#wb-overlay is hidden');
      
        start();
    }, timeout);
});

test('closeOnOverlayClick', function() {
    stop();
    expect(1);
    $('#img a').webbox();
    var $webbox = $('#webbox');
    $('#img a').webbox('open', $('#img a:eq(3)'));
  
    setTimeout(function() {
        $('#wb-overlay').click();
        setTimeout(function() {
            ok($webbox.is(':visible'), '#webbox is visible');

            start();
        }, timeout);
    }, timeout);
});

test('position', function() {
    stop();
    expect(4);
    $('#img a').webbox();
    var $webbox = $('#webbox');
    $('#img a:eq(0)').webbox('open');
  
    setTimeout(function() {
        equal($('img', $webbox).attr('src'), '../media/img/martin-janecky01.jpg', 'image src is "../media/img/martin-janecky01.jpg"');
        equal($webbox.css('position'), 'absolute', '#webbox has position absolute');
        $('#wb-next').click();
        setTimeout(function() {
            equal($('img', $webbox).attr('src'), '../media/img/martin-janecky02.jpg', 'image src is "../media/img/martin-janecky02.jpg"');
            equal($webbox.css('position'), 'fixed', '#webbox has position fixed');

            start();
        }, timeout);
    }, timeout);
});


module('content');

test('open', function() {
    stop();
    expect(2);
    $('#content a').webbox();
    var $webbox = $('#webbox');
    $('#content a').webbox('open', $('#content a:eq(0)'));
  
    setTimeout(function() {
        ok($webbox.is(':visible'), '#webbox is visible');
        ok($webbox.find('#wb-content').hasClass('wb-content'), '#wb-content has class wb-content');
    
        start();
    }, timeout);
});

test('close', function() {
    stop();
    expect(2);
    $('#content a').webbox();
    var $webbox = $('#webbox');
    $('#content a').webbox('open', $('#content a:eq(0)'));
  
    setTimeout(function() {
        $('#img a').webbox('close');
        setTimeout(function() {
            ok($webbox.is(':hidden'), '#webbox is hidden');
            equal($webbox.find('#wb-content').hasClass('wb-content'), false, '#wb-content has not class wb-content');

            start();
        }, timeout);
    }, timeout);
});


module('iframe');

test('open', function() {
    stop();
    expect(3);
    $('#content a').webbox();
    var $webbox = $('#webbox');
    $('#content a').webbox('open', $('#content a:eq(1)'));
  
    setTimeout(function() {
        ok($webbox.is(':visible'), '#webbox is visible');
        ok($webbox.find('#wb-content').hasClass('wb-iframe'), '#wb-content has class wb-iframe');
        ok($webbox.find('#wb-content').children('iframe').length, 'iframe is chidlren of #wb-content');
    
        start();
    }, timeout);
});

test('close', function() {
    stop();
    expect(2);
    $('#content a').webbox();
    var $webbox = $('#webbox');
    $('#content a').webbox('open', $('#content a:eq(1)'));
  
    setTimeout(function() {
        $('#img a').webbox('close');
        setTimeout(function() {
            ok($webbox.is(':hidden'), '#webbox is hidden');
            equal($webbox.find('#wb-content').hasClass('wb-iframe'), false, '#wb-content has not class wb-iframe');

            start();
        }, timeout);
    }, timeout);
});


module('anchor');

test('open', function() {
    stop();
    expect(4);
    $('#content a').webbox();
    var $webbox = $('#webbox');
    $('#content a').webbox('open', $('#content a:eq(2)'));
  
    setTimeout(function() {
        ok($webbox.is(':visible'), '#webbox is visible');
        ok($webbox.find('#wb-content').hasClass('wb-content'), '#wb-content has class wb-content');
        ok($webbox.find('#wb-content').children('h3').length, 'h3 is chidlren of #wb-content');
        equal($('#anchor-content').children().length, 0, '#anchor-content is empty');
    
        $('#content a').webbox('close');
        setTimeout(function() {
            start();
        }, timeout);
    }, timeout);
});

test('close', function() {
    stop();
    expect(3);
    $('#content a').webbox();
    var $webbox = $('#webbox');
    $('#content a').webbox('open', $('#content a:eq(2)'));
  
    setTimeout(function() {
        $('#content a').webbox('close');
        setTimeout(function() {
            ok($webbox.is(':hidden'), '#webbox is hidden');
            equal($webbox.find('#wb-content').hasClass('wb-content'), false, '#wb-content has not class wb-content');
            ok($('#anchor-content').children('h3').length, 'h3 is children of #content');
      
            start();
        }, timeout);
    }, timeout);
});