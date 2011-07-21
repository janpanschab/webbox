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
        overlayOpacity: 0.25,
        closeOnOverlayClick: true,
        position: 'absolute', // fixed, absolute
        margin: 50,
        loaderDelay: 250,
        width: 600,
        height: 600,
        beforeOpen: function() {},
        open: function() {},
        beforeClose: function() {},
        close: function() {}
      },
      singleOptions = ['wb-position','wb-overlay', 'wb-iframe', 'wb-width', 'wb-height'],
      storeOptions,
      cache = [],
      $body = $('body'),
      wb = {
        IMAGE: 'image',
        AJAX: 'ajax',
        IFRAME: 'iframe',
        ANCHOR: 'anchor'
      },
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
  m.hideAnchors();
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
        singleDataOptions = {};
    if (dataOptions) { // extend options with data from wb-options
      o = $.extend({}, o, dataOptions);
    }
    singleDataOptions = m.getSingleDataOptions();
    o = $.extend({}, o, singleDataOptions) // extend options with data from single data options
    wb.box.css('position', 'absolute');
    o.beforeOpen();
    m.showLoader();
    // switch open by content type
    wb.contentType = m.getContentType(url);
    switch (wb.contentType) {
      case wb.AJAX: m.openAjax(url); break;
      case wb.IFRAME: m.openIframe(url); break;
      case wb.ANCHOR: m.openAnchor(url); break;
      default: m.openImage(url);
    }
  }
},
close: function() {
  if (wb.isOpen) {
    o.beforeClose();
    m.unbindWindowResize();
    if (wb.contentType === wb.ANCHOR) {
      wb.content.children().appendTo(wb.trigger.attr('href'));
    }
    if (wb.contentType === wb.IMAGE) {
      wb.img.fadeOut(500, function() {
        $(this).remove();
      });
    } else {
      wb.content.removeClass('wb-content').removeClass('wb-iframe').empty();
    }
    wb.box.add(wb.overlay).fadeOut(500, function() {
      o.close();
    });
    m.disable(wb.prev);
    m.disable(wb.next);
    m.hideTitle();
    m.unbindShortcuts();
    o = storeOptions;
    wb.isOpen = false;
  }
},
next: function() {
  if (group.name !== undefined && group.name !== false && group.index !== group.size - 1 && wb.isOpen) {
    o = storeOptions;
    m.show(group.index + 1);
  }
},
prev: function() {
  if (group.name !== undefined && group.name !== false && group.index !== 0 && wb.isOpen) {
    o = storeOptions;
    m.show(group.index - 1);
  }
},
openImage: function(url) {
  var dimensions,
      center;
  $.when(m.loadImage(url))
    .done(function() {
      m.hideLoader();
      if (wb.box.is(':visible')) { //listing
        wb.img.appendTo(wb.content).hide();
        wb.content.show();
        dimensions = m.loadImageDimensions();
        dimensions = m.getMaxDimensions(dimensions);
        center = m.getCenter(dimensions);
        $.when(m.resizeBox(dimensions, center)).then(function() {
          m.setFixedPosition(dimensions);
          m.setDimensions(wb.img, dimensions);
          wb.img.fadeIn(500, function() {
            m.setListing();
            wb.close.show();
            m.showTitle();
            o.open();
          });
        });
      } else { //opening
        wb.img.appendTo(wb.content);
        wb.content.show();
        wb.box.fadeIn(500, function() {
          m.setListing();
          m.bindShortcuts();
          m.bindWindowResize();
          m.showTitle();
          o.open();
        });
        if (o.overlay) {
          wb.overlay.fadeTo(500, o.overlayOpacity);
        }
        dimensions = m.loadImageDimensions();
        dimensions = m.getMaxDimensions(dimensions);
        m.setDimensions(wb.box, dimensions);
        m.setDimensions(wb.img, dimensions);
        center = m.getCenter(dimensions);
        m.setCenter(wb.box, center);
        m.setFixedPosition(dimensions);
      }
      wb.isOpen = true;
    })
    .fail(function() {
      m.hideLoader();
      $.error('Error loading image '+ url);
    });
},
openAjax: function(url) {
  var dimensions,
      center,
      contentDimensions;
  $.when($.ajax({url: url, type: 'GET'}))
    .done(function(data) {
        m.hideLoader();
        wb.content.addClass('wb-content').append(data);
        wb.box.fadeIn(500, function() {
          m.bindShortcuts();
          m.bindWindowResize();
          o.open();
        });
        if (o.overlay) {
          wb.overlay.fadeTo(500, o.overlayOpacity);
        }
        dimensions = [o.width, o.height];
        dimensions = m.getMaxDimensions(dimensions);
        m.setDimensions(wb.box, dimensions);
        contentDimensions = m.getContentDimensions(dimensions);
        m.setDimensions(wb.content, contentDimensions);
        center = m.getCenter(dimensions);
        m.setCenter(wb.box, center);
        m.setFixedPosition(dimensions);
        wb.isOpen = true;
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      m.hideLoader();
      $.error('Error '+ jqXHR.status +' '+ errorThrown +' while loading '+ url);
    });
},
openIframe: function(url) {
  var dimensions,
      center,
      contentDimensions;
  $.when(m.loadIframe(url))
    .done(function() {
      m.hideLoader();
      wb.content.addClass('wb-iframe');
      wb.box.fadeIn(500, function() {
        m.bindShortcuts();
        m.bindWindowResize();
        o.open();
      });
      if (o.overlay) {
        wb.overlay.fadeTo(500, o.overlayOpacity);
      }
      dimensions = [o.width, o.height];
      dimensions = m.getMaxDimensions(dimensions);
      m.setDimensions(wb.box, dimensions);
      contentDimensions = m.getContentDimensions(dimensions);
      m.setDimensions(wb.content, contentDimensions);
      center = m.getCenter(dimensions);
      m.setCenter(wb.box, center);
      m.setFixedPosition(dimensions);
      wb.isOpen = true;
    })
    .fail(function() {
      m.hideLoader();
      $.error('Error while loading '+ url);
    });
},
openAnchor: function(url) {
  var dimensions,
      center,
      contentDimensions,
      $content = $(url);
  if ($content.length) {
    m.hideLoader();
    wb.content.addClass('wb-content').append($content.children());
    wb.box.fadeIn(500, function() {
      m.bindShortcuts();
      m.bindWindowResize();
      o.open();
    });
    if (o.overlay) {
      wb.overlay.fadeTo(500, o.overlayOpacity);
    }
    dimensions = [o.width, o.height];
    dimensions = m.getMaxDimensions(dimensions);
    m.setDimensions(wb.box, dimensions);
    contentDimensions = m.getContentDimensions(dimensions);
    m.setDimensions(wb.content, contentDimensions);
    center = m.getCenter(dimensions);
    m.setCenter(wb.box, center);
    m.setFixedPosition(dimensions);
    wb.isOpen = true;
  }
},
setFixedPosition: function(dimensions) {
  if (o.position === 'fixed') {
    var center = m.getCenter(dimensions, true);
    m.setCenter(wb.box, center);
    wb.box.css('position', 'fixed');
  }
},
setAbsolutePosition: function(dimensions) {
  var center = m.getCenter(dimensions);
  m.setCenter(wb.box, center);
  wb.box.css('position', 'absolute');
},
showTitle: function() {
  var title = o.title || wb.trigger.attr('title'),
      dimensions = m.getDimensions(wb.box),
      width = dimensions[0];
  if (title) {
    wb.title.width(width).show().children().html(title);
    wb.box.attr('aria-labelledby', 'wb-title-aria');
  }
},
hideTitle: function() {
  wb.title.hide();
  wb.box.removeAttr('aria-labelledby');
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
getContentDimensions: function(dimensions) {
  var margin = {
        top: parseInt(wb.content.css('marginTop'), 10),
        right: parseInt(wb.content.css('marginRight'), 10),
        bottom: parseInt(wb.content.css('marginBottom'), 10),
        left: parseInt(wb.content.css('marginLeft'), 10)
      },
      border = {
        top: parseInt(wb.content.css('borderTopWidth'), 10),
        right: parseInt(wb.content.css('borderRightWidth'), 10),
        bottom: parseInt(wb.content.css('borderBottomWidth'), 10),
        left: parseInt(wb.content.css('borderLeftWidth'), 10)
      },
      padding = {
        top: parseInt(wb.content.css('paddingTop'), 10),
        right: parseInt(wb.content.css('paddingRight'), 10),
        bottom: parseInt(wb.content.css('paddingBottom'), 10),
        left: parseInt(wb.content.css('paddingLeft'), 10)
      },
      vertical = dimensions[1] - margin.top - margin.bottom - border.top - border.bottom - padding.top - padding.bottom,
      horizontal = dimensions[0] - margin.left - margin.right - border.left - border.right - padding.left - padding.right;
   return [ horizontal, vertical ];
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
getCenter: function(dimensions, fixed) {
  var viewport = m.getViewport(),
      scroll = fixed ? [0,0] : m.getScroll(),
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
  wb.img = $('<img role="img" />');
  wb.img
    .load(dfd.resolve)
    .error(dfd.reject)
    .attr('src', url);
  return dfd.promise();
},
loadIframe: function(url) {
  var dfd = $.Deferred();
  wb.iframe = $('<iframe frameborder="0" />');
  wb.iframe
    .appendTo(wb.content)
    .load(dfd.resolve)
    //.error(dfd.reject)
    .attr('src', url);
  // TODO - iframe never trigger error handler
  setTimeout(function() {
    dfd.resolve(); // or reject?
  }, 10000);
  return dfd.promise();
},
hideContent: function() {
  var dfd = $.Deferred();
  wb.content.fadeOut(500, dfd.resolve);
  return dfd.promise();
},
showLoader: function() {
  loaderDelay = setTimeout(function() {
    wb.loader.show();
    var dimensions = m.getDimensions(wb.loader),
        center = m.getCenter(dimensions, true);
    m.setCenter(wb.loader, center);
  }, o.loaderDelay);
},
hideLoader: function() {
  clearTimeout(loaderDelay);
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
  $(document).unbind('keydown.wb');
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
        m.preload(group.triggers.eq(group.index - 1));
      }
      if (group.index !== group.size - 1) {
        m.enable(wb.next);
        m.preload(group.triggers.eq(group.index + 1));
      }
    }
    m.positionArrows();
  }
},
preload: function($trigger) {
  var src = $trigger.attr('href');
  if ($.inArray(src, cache) === -1) {
    var img = document.createElement('img');
    img.src = src;
    cache.push(src);
  };
},
enable: function($el) {
  $el.removeClass('disabled').addClass('enabled').attr('aria-disabled', false).show();
},
disable: function($el) {
  $el.removeClass('enabled').addClass('disabled').attr('aria-disabled', true).hide();
},
getSingleDataOptions: function() {
  var SDO = [];
  $.each(singleOptions, function(i, val) {
    var dataO = wb.trigger.data(val),
        key = val.replace('wb-', '');
    if (dataO !== undefined) {
      SDO[key] = dataO;
    }
  });
  return SDO;
},
getContentType: function(url) {
  var type = wb.AJAX;
  if (url.match(/\.(jpg|gif|png|bmp|jpeg)(.*)?$/i)) {
    type = wb.IMAGE;
  } else if (o.iframe) {
    type = wb.IFRAME
  } else if (/^#/.test(url)) {
    type = wb.ANCHOR;
  }
  return type;
},
hideAnchors: function() {
  wb.self.each(function() {
    var $trigger = $(this),
        url = $trigger.attr('href');
    if (/^#/.test(url)) {
      $(url).hide();
    }
  });
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
  $.when(m.hideContent())
    .then(function() {
      var dimensions = m.getDimensions(wb.box);
      m.setAbsolutePosition(dimensions);
      wb.img.remove();
      m.open(group.triggers.eq(index));
    });
},
bindListing: function() {
  wb.prev.add(wb.next).bind('click.wb', function(e) {
    var showIndex = this === wb.prev.get(0) ? group.index - 1 : group.index + 1;
    o = storeOptions;
    m.show(showIndex);
  });
},
bindOpen: function() {
  $body.delegate(wb.self.selector +':not(#wb-close, #wb-prev, #wb-next)', 'click.wb', function(e) {
    e.preventDefault();
    m.open(this);
  });
},
bindClose: function() {
  wb.close.bind('click.wb', function(e) {
    m.close();
  });
  m.bindCloseOnOverlayClick();
},
bindCloseOnOverlayClick: function() {
  wb.overlay.bind('click.wb', function() {
    if (o.closeOnOverlayClick) {
      m.close();
    }
  });
},
bindWindowResize: function() {
  var $window = $(window),
      dimensions,
      center,
      contentDimensions;
  $window.bind('resize.wb', function() {
    wb.close.hide();
    m.hideTitle();
    $.when(m.hideContent()).then(function() {
      if (wb.contentType === wb.IMAGE) {
        dimensions = m.loadImageDimensions();
      } else {
        dimensions = [o.width, o.height];
      }
      dimensions = m.getMaxDimensions(dimensions);
      center = m.getCenter(dimensions, o.position === 'fixed');
      $.when(m.resizeBox(dimensions, center)).then(function() {
        if (wb.contentType === wb.IMAGE) {
          m.setDimensions(wb.img, dimensions);
        } else {
          contentDimensions = m.getContentDimensions(dimensions);
          m.setDimensions(wb.content, contentDimensions);
        }
        wb.content.fadeIn(500);
        wb.close.show();
        m.showTitle();
        m.positionArrows();
      });
    });
  });
},
unbindWindowResize: function() {
  $(window).unbind('resize.wb');
},
create: function() {
  $('<div id="webbox" role="dialog"><div id="wb-content"></div><div id="wb-close" role="button">×</div><div id="wb-prev" class="disabled" role="button" aria-disabled="true"><span>«</span></div><div id="wb-next" class="disabled" role="button" aria-disabled="true"><span>»</span></div><div id="wb-title"><div id="wb-title-aria" /></div></div><div id="wb-loader"><span>\u2605</span></div>').appendTo('body');
  wb.box = $('#webbox');
  wb.close = $('#wb-close');
  wb.prev = $('#wb-prev');
  wb.next = $('#wb-next');
  wb.content = $('#wb-content');
  wb.title = $('#wb-title');
  wb.loader = $('#wb-loader');
  if (o.overlay) {
    $('<div id="wb-overlay" />').appendTo('body');
    wb.overlay = $('#wb-overlay');
  }
  wb.isCreated = true;
},
destroy: function() {
  wb.box.add(wb.overlay).add(wb.loader).remove();
  $body.undelegate('.wb');
  $(window).unbind('.wb');
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