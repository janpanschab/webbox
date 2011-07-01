// documentation on writing tests here: http://docs.jquery.com/QUnit
// example tests: https://github.com/jquery/qunit/blob/master/test/same.js

$.fx.off = true;
var timeout = 1000;

module('core');

test('create', function() {
  expect(11);
  $('a.webbox').webbox();
  var $webbox = $('#webbox');
  ok($webbox.length, '#webbox exists');
  ok($('#wb-close').length, '#wb-close exists');
  equals($('#wb-close').parent().get(0), $webbox.get(0), '#webbox is parent of #wb-close');
  ok($('#wb-prev').length, '#wb-prev exists');
  equals($('#wb-prev').parent().get(0), $webbox.get(0), '#webbox is parent of #wb-prev');
  ok($('#wb-next').length, '#wb-next exists');
  equals($('#wb-next').parent().get(0), $webbox.get(0), '#webbox is parent of #wb-next');
  ok($('#wb-title').length, '#wb-title exists');
  equals($('#wb-title').parent().get(0), $webbox.get(0), '#webbox is parent of #wb-title');
  ok($('#wb-loader').length, '#wb-loader exists');
  ok($('#wb-overlay').length, '#wb-overlay exists');
});

test('destroy', function() {
  expect(3);
  $('a.webbox').webbox().webbox('destroy');
  equals($('#webbox').length, false, '#webbox doesnt exist');
  equals($('#wb-overlay').length, false, '#wb-overlay doesnt exist');
  equals($('#wb-loader').length, false, '#wb-loader doesnt exist');
});

module('click events');

test('open by click on trigger', function() {
  stop();
  expect(5);
  $('a.webbox').webbox().filter(':first').click();
  var $webbox = $('#webbox');
  
  setTimeout(function() {
    ok($webbox.is(':visible'), '#webbox is visible');
    ok($webbox.find('#wb-title').is(':visible'), '#wb-title is visible');
    ok($webbox.find('#wb-close').is(':visible'), '#wb-close is visible');
    ok($webbox.find('#wb-next').is(':visible'), '#wb-next is visible');
    ok($webbox.find('#wb-prev').is(':hidden'), '#wb-prev is hidden');
    
    start();
  }, timeout);
});

test('prev by click on prev button', function() {
  stop();
  expect(5);
  $('a.webbox').webbox();
  $('a.webbox').webbox('open', $('a.webbox:eq(1)'));
  
  setTimeout(function() {
    equals($('#webbox img').attr('src'), '../demo/img/63.jpg', 'image src is "../demo/img/63.jpg"');
    $('#wb-prev').click();
    setTimeout(function() {
      ok($('#webbox').is(':visible'), '#webbox is visible');
      ok($('#wb-prev').is(':hidden'), '#wb-prev is hidden');
      ok($('#wb-next').is(':visible'), '#wb-next is visible');
      equals($('#webbox img').attr('src'), '../demo/img/61.jpg', 'image src is "../demo/img/61.jpg"');
      
      start();
    }, timeout);
  }, timeout);
});

test('next by click on next button', function() {
  stop();
  expect(5);
  $('a.webbox').webbox();
  $('a.webbox').webbox('open', $('a.webbox:eq(0)'));
  
  setTimeout(function() {
    equals($('#webbox img').attr('src'), '../demo/img/61.jpg', 'first opened image src is "../demo/img/61.jpg"');
    $('#wb-next').click();
    
    setTimeout(function() {
      ok($('#webbox').is(':visible'), '#webbox is visible');
      ok($('#wb-prev').is(':visible'), '#wb-prev is visible');
      ok($('#wb-next').is(':visible'), '#wb-next is visible');
      equals($('#webbox img').attr('src'), '../demo/img/63.jpg', 'image src is "../demo/img/63.jpg"');
      
      start();
    }, timeout);
  }, timeout);
});

test('close by click on close button', function() {
  stop();
  expect(3);
  $('a.webbox').webbox();
  $('a.webbox').webbox('open', $('a.webbox:eq(1)'));
  
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
  $('a.webbox').webbox();
  var $webbox = $('#webbox');
  $('a.webbox:last').webbox('open');
  
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
  $('a.webbox').webbox();
  var $webbox = $('#webbox');
  $('a.webbox').webbox('open', $('a.webbox:eq(1)'));
  
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
  expect(4);
  $('a.webbox').webbox();
  $('a.webbox').webbox('open', $('a.webbox:eq(3)'));
  
  setTimeout(function() {
    $('a.webbox').webbox('prev');
    setTimeout(function() {
      ok($('#webbox').is(':visible'), '#webbox is visible');
      ok($('#wb-prev').is(':visible'), '#wb-prev is visible');
      ok($('#wb-next').is(':visible'), '#wb-next is visible');
      equals($('#webbox img').attr('src'), '../demo/img/63.jpg', 'image src is "../demo/img/63.jpg"');
      
      start();
    }, timeout);
  }, timeout);
});

test('next by manual call', function() {
  stop();
  expect(4);
  $('a.webbox').webbox();
  $('a.webbox').webbox('open', $('a.webbox:eq(3)'));
  
  setTimeout(function() {
    $('a.webbox').webbox('next');
    setTimeout(function() {
      ok($('#webbox').is(':visible'), '#webbox is visible');
      ok($('#wb-prev').is(':visible'), '#wb-prev is visible');
      ok($('#wb-next').is(':hidden'), '#wb-next is hidden');
      equals($('#webbox img').attr('src'), '../demo/img/66.gif', 'image src is "../demo/img/66.gif"');
      
      start();
    }, timeout);
  }, timeout);
});

test('close by manual call', function() {
  stop();
  expect(3);
  $('a.webbox').webbox();
  $('a.webbox').webbox('open', $('a.webbox:eq(3)'));
  
  setTimeout(function() {
    $('a.webbox').webbox('close');
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
  $('a.webbox').webbox();
  $('a.webbox').webbox('open', $('a.webbox:eq(1)'));
  
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
  $('a.webbox').webbox();
  $('a.webbox').webbox('open', $('a.webbox:eq(3)'));
  
  setTimeout(function() {
    var e = $.Event('keydown.wb');
    e.which = 37;
    $(document).trigger(e);
    setTimeout(function() {
      ok($('#webbox').is(':visible'), '#webbox is visible');
      ok($('#wb-prev').is(':visible'), '#wb-prev is visible');
      ok($('#wb-next').is(':visible'), '#wb-next is visible');
      equals($('#webbox img').attr('src'), '../demo/img/63.jpg', 'image src is "../demo/img/63.jpg"');
      
      start();
    }, timeout);
  }, timeout);
});

test('next by shortcut', function() {
  stop();
  expect(4);
  $('a.webbox').webbox();
  $('a.webbox').webbox('open', $('a.webbox:eq(3)'));
  
  setTimeout(function() {
    var e = $.Event('keydown.wb');
    e.which = 39;
    $(document).trigger(e);
    setTimeout(function() {
      ok($('#webbox').is(':visible'), '#webbox is visible');
      ok($('#wb-prev').is(':visible'), '#wb-prev is visible');
      ok($('#wb-next').is(':hidden'), '#wb-next is hidden');
      equals($('#webbox img').attr('src'), '../demo/img/66.gif', 'image src is "../demo/img/66.gif"');
      
      start();
    }, timeout);
  }, timeout);
});

module('delegating');

test('open added image to the DOM', function() {
  stop();
  expect(5);
  $('a.webbox').webbox();
  var $webbox = $('#webbox');
  $('body').prepend('<a href="../demo/img/IMG_4829.JPG" data-wb-group="gallery" class="webbox" id="added-image"><img src="../demo/img/IMG_4829_nahled.jpg" /></a>');
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
  $('a.webbox').webbox();
  $('a.webbox').webbox('open', $('a.webbox:eq(0)'));
  
  setTimeout(function() {
    ok($('#wb-prev').is(':hidden'), '#wb-prev is hidden');
      
    start();
  }, timeout);
});

test('is next disabled when open last image', function() {
  stop();
  expect(1);
  $('a.webbox').webbox();
  $('a.webbox').webbox('open', $('a.webbox:last'));
  
  setTimeout(function() {
    ok($('#wb-next').is(':hidden'), '#wb-next is hidden');

    start();
  }, timeout);
});