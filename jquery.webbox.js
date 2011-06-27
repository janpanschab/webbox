window.log = function(){
  log.history = log.history || [];
  log.history.push(arguments);
  if(this.console){
    console.log( Array.prototype.slice.call(arguments) );
  }
};

(function($) {

  var o,
      settings = {
        overlay: true,
        closeOnOverlayClick: true,
        position: 'absolute', // fixed, absolute
        margin: 30,
        beforeOpen: function() {},
        open: function() {},
        beforeClose: function() {},
        close: function() {}
      },
      storeOptions,
      $body = $('body'),
      wb = {},
      group = {},
      m = {
        
init: function(options) {
  if (wb.isCreated) {
    m.destroy();
  }
  o = $.extend({}, settings, options);
  storeOptions = o;
  wb.self = this;
  wb.isCreated = false;
  wb.isOpen = false;
  if (!wb.isCreated) {
    m.create();
  }
  m.bindOpen();
  m.bindClose();
  m.bindListing();
  return this;
},
open: function(trigger) {
  if (!wb.isOpen) {
    if (trigger) {
      wb.trigger = $(trigger);
    } else { // opening image directly by selector
      wb.trigger = this;
    }
    var url = wb.trigger.attr('href'),
        dataOptions = wb.trigger.data('wb-options'),
        dimensions,
        center;
    if (dataOptions) {
      o = $.extend({}, o, dataOptions);
    }
    o.beforeOpen();
    m.showLoader();
    $.when(m.loadImage(url))
      .done(function() {
        m.hideLoader();
        if (wb.box.is(':visible')) { //listing
          wb.img.appendTo(wb.box).hide();
          dimensions = m.loadImageDimensions();
          dimensions = m.getMaxDimensions(dimensions);
          center = m.getCenter(dimensions);
          $.when(m.resizeBox(dimensions, center)).then(function() {
            m.setDimensions(wb.img, dimensions);
            wb.img.fadeIn(500, function() {
              m.setListing();
              wb.close.show();
              m.showTitle();
              o.open();
            });
          });
        } else { //opening
          wb.img.appendTo(wb.box);
          wb.box.fadeIn(500, function() {
            m.bindListing();
            m.setListing();
            m.bindShortcuts();
            m.bindWindowResize();
            m.showTitle();
            o.open();
          });
          if (o.overlay) {
            wb.overlay.fadeIn(500);
          }
          dimensions = m.loadImageDimensions();
          dimensions = m.getMaxDimensions(dimensions);
          m.setDimensions(wb.box, dimensions);
          m.setDimensions(wb.img, dimensions);
          center = m.getCenter(dimensions);
          m.setCenter(wb.box, center);
        }
        wb.isOpen = true;
      })
      .fail(function() {
        m.hideLoader();
        $.error('error loading image');
      });
  }
},
close: function() {
  if (wb.isOpen) {
    o.beforeClose();
    m.unbindWindowResize();
    wb.img.fadeOut(500, function() {
      $(this).remove();
      o.close();
    });
    wb.box.add(wb.overlay).fadeOut(500);
    m.disable(wb.prev);
    m.disable(wb.next);
    m.unbindListing();
    m.hideTitle();
    m.unbindShortcuts();
    o = storeOptions;
    wb.isOpen = false;
  }
},
next: function() {
  if (group.name !== false && group.index !== group.size - 1 && wb.isOpen) {
    o = storeOptions;
    m.show(group.index + 1);
  }
},
prev: function() {
  if (group.name !== false && group.index !== 0 && wb.isOpen) {
    o = storeOptions;
    m.show(group.index - 1);
  }
},
showTitle: function() {
  var title = o.title || wb.trigger.attr('title'),
      dimensions = m.getDimensions(wb.box),
      width = dimensions[0];
  if (title) {
    wb.title.width(width).show().children().html(title);
  }
},
hideTitle: function() {
  wb.title.hide();
},
resizeBox: function(dimensions, center) {
  var dfd = $.Deferred();
  wb.box.animate({
    top: center[0],
    left: center[1],
    width: dimensions[0],
    height: dimensions[1]
  }, 250, dfd.resolve);
  return dfd.promise();
},
getMaxDimensions: function(dimensions) {
  var viewport = m.getViewport(o.margin),
      ratio = [viewport[0] / dimensions[0], viewport[1] / dimensions[1]],
      minRatio = Math.min(ratio[0], ratio[1]);
  if (minRatio < 1) {
    return [parseInt(dimensions[0] * minRatio, 10), parseInt(dimensions[1] * minRatio, 10)];
  }
  return dimensions;
},
loadImageDimensions: function() {
  var dimensions,
      dataDimensions = wb.trigger.data('wb-dimensions');
  if (dataDimensions) {
    dimensions = dataDimensions;
  } else {
    dimensions = m.getDimensions(wb.img);
    wb.trigger.data('wb-dimensions', dimensions);
  }
  return dimensions;
},
getDimensions: function($el) {
  var isVisible = $el.is(':visible');
  if (!isVisible) {
    $el.show();
  }
  var dimensions = [$el.width(), $el.height()];
  if (!isVisible) {
    $el.hide();
  }
  return dimensions;
},
setDimensions: function($el, dimensions) {
  $el.width(dimensions[0]).height(dimensions[1]);
},
getViewport: function(margin) {
  var $window = $(window),
      width = $window.width(),
      height = $window.height(),
      doubleMargin = (2 * margin);
  if (margin) {
    return [ width - doubleMargin, height - doubleMargin ];
  }
  return [width, height];
},
getScroll: function() {
  return [ $(document).scrollTop(), $(document).scrollLeft() ];
},
getCenter: function(dimensions) {
  var viewport = m.getViewport(),
      scroll = m.getScroll(),
      top = ((viewport[1] - dimensions[1]) / 2) + scroll[0],
      left = ((viewport[0] - dimensions[0]) / 2) + scroll[1];
  return [
    viewport[1] < dimensions[1] + 2 * o.margin ? o.margin + scroll[0] : top,
    viewport[0] < dimensions[0] + 2 * o.margin ? o.margin + scroll[1] : left
  ];
},
setCenter: function($el, center) {
  $el.css({
    top: center[0] +'px',
    left: center[1] +'px'
  });
},
loadImage: function(url) {
  var dfd = $.Deferred();
  wb.img = $('<img />');
  wb.img
    .load(dfd.resolve)
    .error(dfd.reject)
    .attr('src', url);
  return dfd.promise();
},
hideImage: function() {
  var dfd = $.Deferred();
  wb.img.fadeOut(500, dfd.resolve);
  return dfd.promise();
},
showLoader: function() {
  wb.loader.show();
  wb.loader.show();
  var dimensions = m.getDimensions(wb.loader),
      center = m.getCenter(dimensions);
  m.setCenter(wb.loader, center);
},
hideLoader: function() {
  wb.loader.hide();
},
bindShortcuts: function() {
  $(document).bind('keydown.wb', function(e) {
    switch (e.which) {
      case 27:m.close();break;
      case 37:m.prev();break;
      case 39:m.next();break;
    }
  });
},
unbindShortcuts: function() {
  $(document).unbind('.wb');
},
setListing: function() {
  group.name = wb.trigger.data('wbGroup') || false;
  if (group.name) {
    group.triggers = $(wb.self.selector +'[data-wb-group='+ group.name +']');
    group.index = group.triggers.index(wb.trigger);
    group.size = group.triggers.size();
    if (group.size > 1) {
      if (group.index !== 0) {
        m.enable(wb.prev);
      }
      if (group.index !== group.size - 1) {
        m.enable(wb.next);
      }
    }
    m.positionArrows();
  }
},
enable: function($el) {
  $el.removeClass('disabled').addClass('enabled').show();
},
disable: function($el) {
  $el.removeClass('enabled').addClass('disabled').hide();
},
positionArrows: function() {
  var $prev = wb.prev.children('span'),
      $next = wb.next.children('span'),
      boxHeight = wb.box.outerHeight(),
      prevHeight = $prev.height(),
      nextHeight = $next.height();
  $prev.css('top', (boxHeight - prevHeight) / 2);
  $next.css('top', (boxHeight - nextHeight) / 2);
},
show: function(index) {
  wb.isOpen = false;
  m.disable(wb.prev);
  m.disable(wb.next);
  wb.close.hide();
  m.hideTitle();
  $.when(m.hideImage())
    .then(function() {
      wb.img.remove();
      m.open(group.triggers.eq(index));
    });
},
bindListing: function() {
  wb.prev.add(wb.next).bind('click.wb', function(e) {
    e.preventDefault();
    var showIndex = this === wb.prev.get(0) ? group.index - 1 : group.index + 1;
    o = storeOptions;
    m.show(showIndex);
  });
},
unbindListing: function() {
  wb.prev.add(wb.next).unbind('.wb');
},
bindOpen: function() {
  $body.delegate(wb.self.selector +':not(#wb-close, #wb-prev, #wb-next)', 'click.wb', function(e) {
    e.preventDefault();
    m.open(this);
  });
},
bindClose: function() {
  wb.close.bind('click.wb', function(e) {
    e.preventDefault();
    m.close();
  });
  if (o.closeOnOverlayClick) {
    wb.overlay.bind('click.wb', function() {
      m.close();
    });
  }
},
bindWindowResize: function() {
  var $window = $(window);
  $window.bind('resize.wb', function() {
    wb.close.hide();
    m.hideTitle();
    $.when(m.hideImage()).then(function() {
      var dimensions = m.loadImageDimensions();
      dimensions = m.getMaxDimensions(dimensions);
      var center = m.getCenter(dimensions);
      $.when(m.resizeBox(dimensions, center)).then(function() {
        m.setDimensions(wb.img, dimensions);
        wb.img.fadeIn(500);
        wb.close.show();
        m.showTitle();
      });
    });
  });
},
unbindWindowResize: function() {
  $(window).unbind('.wb');
},
create: function() {
  $('<div />', {
    id: 'webbox'
  })
    .append(
      $('<a />', {
        id: 'wb-close',
        href: '#',
        text: '×'
      })
    ).append(
      $('<a />', {
        id: 'wb-prev',
        'class': 'disabled',
        href: '#'
      })
        .append(
          $('<span />', {
            text: '«'
          })
        )
    ).append(
      $('<a />', {
        id: 'wb-next',
        'class': 'disabled',
        href: '#'
      })
        .append(
          $('<span />', {
            text: '»'
          })
        )
    ).append(
      $('<div />', {
        id: 'wb-title'
      }).append(
        $('<div />')
      )
    )
    .after(
      $('<div />', {
        id: 'wb-loader'
      }).append(
        $('<span />', {
          text: '\u2605' //\u21c6
        })
      )
    ).appendTo('body');
  wb.box = $('#webbox');
  wb.close = $('#wb-close');
  wb.prev = $('#wb-prev');
  wb.next = $('#wb-next');
  wb.title = $('#wb-title');
  wb.loader = $('#wb-loader');
  if (o.overlay) {
    $('<div />', {
      id: 'wb-overlay'
    }).appendTo('body');
    wb.overlay = $('#wb-overlay');
  }
  wb.box.css('position', o.position);
  wb.isCreated = true;
},
destroy: function() {
  wb.box.add(wb.overlay).add(wb.loader).remove();
  $body.undelegate('.wb');
  $(document).unbind('.wb');
  m.unbindWindowResize();
  wb.isCreated = false;
  wb.isOpen = false;
}
        
      };

  $.fn.webbox = function(method) {
  
    // Method calling logic
    if ( m[method] ) {
      return m[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return m.init.apply( this, arguments );
    } else {
      $.error('Method ' +  method + ' does not exist on jQuery webbox plugin');
    }
    
  };
  
})(jQuery);