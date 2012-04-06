/**
 * jQuery Webbox Plugin - 1.0.0, 2012/4/5
 * Copyright (c) 2011, Jan Panschab
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *  - http://www.opensource.org/licenses/mit-license.php
 *  - http://www.gnu.org/copyleft/gpl.html
 * 
 * https://github.com/janpanschab/webbox
 */

// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function f(){ log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; args.callee = args.callee.caller; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};

// make it safe to use console.log always
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());

(function($) {

    var o, // options
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
    wb = {
        IMAGE: 'image',
        AJAX: 'ajax',
        IFRAME: 'iframe',
        ANCHOR: 'anchor',
        singleOptions: ['wb-position','wb-overlay', 'wb-iframe', 'wb-width', 'wb-height'], // possible single options
        instance: {},
        isCreated: false,
        isOpen: false,
        loaderTimeout: false, // checking loader setTimeout
        cache: [],
        group: {},
        $body: $('body'),
        $window: $(window),
        $document: $(document)
    },
    m = {
        
        init: function(options) {
            o = $.extend({}, settings, options);
            wb.currentInstanceSelector = this.selector;
            wb.instance[wb.currentInstanceSelector] = {};
            wb.instance[wb.currentInstanceSelector].options = o;
            wb.instance[wb.currentInstanceSelector].self = this;
            if (!wb.isCreated) {
                m.create();
                m.bindClose();
                m.bindListing();
            }
            m.bindOpen();
            // hide content in anchors (is better to hide them in css because of flashing)
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
                    localDataOptions = {};
                
                o = wb.instance[wb.currentInstanceSelector].options;
                if (dataOptions) { // extend options with data from wb-options
                    o = $.extend({}, o, dataOptions);
                }
                localDataOptions = m.getlocalDataOptions();
                o = $.extend({}, o, localDataOptions); // extend options with data from local data options
                wb.box.css('position', 'absolute'); // box must have absolute position when is animated - fixed position (if option position fixed is set) is set after animation is finished
                o.beforeOpen(); // call custom function before webbox is opened
                m.showLoader();
                // switch open by content type
                wb.contentType = m.getContentType(url);
                switch (wb.contentType) {
                    case wb.AJAX:
                    case wb.IFRAME:
                    case wb.ANCHOR:
                        m.openContent(url);
                        break;
                    case wb.IMAGE:
                        m.openImage(url);
                        break;
                    default:
                        m.openImage(url);
                }
            } else {
                console.warn('Webbox is already open. Possible reason - Webbox is attached twice to one trigger.');
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
                $.when(wb.box.fadeOut(500), wb.overlay.fadeOut(500))
                    .done(function() {
                        o.close();
                        o = wb.instance[wb.currentInstanceSelector].options;
                        wb.isOpen = false;
                    });
                m.disable(wb.prev);
                m.disable(wb.next);
                m.hideTitle();
                m.unbindShortcuts();
            }
        },
        next: function() {
            if (wb.group.name !== undefined && wb.group.name !== false && wb.group.index !== wb.group.size - 1 && wb.isOpen) {
                o = wb.instance[wb.currentInstanceSelector].options;
                m.show(wb.group.index + 1);
            }
        },
        prev: function() {
            if (wb.group.name !== undefined && wb.group.name !== false && wb.group.index !== 0 && wb.isOpen) {
                o = wb.instance[wb.currentInstanceSelector].options;
                m.show(wb.group.index - 1);
            }
        },
        openImage: function(url) {
            var dimensions,
                center;
            
            wb.isOpen = true;
            $.when(m.loadImage(url))
                .done(function() {
                    m.hideLoader();
                    if (wb.box.is(':visible')) { //listing
                        wb.img.appendTo(wb.content).hide();
                        wb.content.show();
                        dimensions = m.loadImageDimensions();
                        dimensions = m.getMaxDimensions(dimensions);
                        center = m.getCenter(dimensions);
                        $.when(m.resizeBox(dimensions, center))
                            .then(function() {
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
                            wb.box.focus();
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
                })
                .fail(function() {
                    m.hideLoader();
                    $.error('Error loading image '+ url);
                });
        },
        openContent: function(url) {
            if (wb.contentType === wb.AJAX) {
                $.when($.ajax({
                    url: url, 
                    type: 'GET'
                }))
                    .done(function(data) {
                        m.contentDone(data);
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        m.hideLoader();
                        $.error('Error '+ jqXHR.status +' '+ errorThrown +' while loading '+ url);
                    });
            } else if (wb.contentType === wb.IFRAME) {
                $.when(m.loadIframe(url))
                    .done(function() {
                        m.contentDone();
                    })
                    .fail(function() {
                        m.hideLoader();
                        $.error('Error while loading '+ url);
                    });
            } else if (wb.contentType === wb.ANCHOR) {
                // if element with id url exist (id="[url]")
                if ($(url).length) {
                    m.contentDone($(url).children());
                } else {
                    $.error('Can\'t find anchor '+ url);
                }
            }
        },
        contentDone: function(data) {
            var dimensions,
            center,
            contentDimensions;
            m.hideLoader();
            if (wb.contentType === wb.AJAX || wb.contentType === wb.ANCHOR) {
                wb.content.addClass('wb-content').append(data);
            } else if (wb.contentType === wb.IFRAME) {
                wb.content.addClass('wb-iframe');
            }
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
            var width = wb.$window.width(),
            height = wb.$window.height(),
            doubleMargin = (2 * margin);
            if (margin) {
                return [ width - doubleMargin, height - doubleMargin ];
            }
            return [width, height];
        },
        getScroll: function() {
            return [ wb.$document.scrollTop(), wb.$document.scrollLeft() ];
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
            if (wb.trigger) {
                wb.trigger.css('cursor', 'wait');
            }
            wb.loaderTimeout = true;
            setTimeout(function() {
                if (wb.loaderTimeout) {
                    wb.loader.show();
                    wb.loaderTimeout = false;
                    
                    var dimensions = m.getDimensions(wb.loader),
                    
                    center = m.getCenter(dimensions, true);
                    m.setCenter(wb.loader, center);
                }
            }, o.loaderDelay);
        },
        hideLoader: function() {
            if (wb.trigger) {
                wb.trigger.css('cursor', 'pointer');
            }
            wb.loaderTimeout = false;
            wb.loader.hide();
        },
        tabNavigation: function(e) {
            e.preventDefault();
            if (wb.isOpen) {
                var $focusedEl = wb.box.find(':focus'),
                    focusedEl = $focusedEl.get(0);
                
                if ($focusedEl.length) {
                    if (focusedEl === wb.next.get(0)) {
                        if (wb.prev.is(':visible')) {
                            wb.prev.focus();
                        } else {
                            wb.close.focus();
                        }
                    } else if (focusedEl === wb.prev.get(0)) {
                        wb.close.focus();
                    } else if (focusedEl === wb.close.get(0)) {
                        if (wb.next.is(':visible')) {
                            wb.next.focus();
                        } else if (wb.prev.is(':visible')) {
                            wb.prev.focus();
                        }
                    }
                } else {
                    if (wb.next.is(':visible')) {
                        wb.next.focus();
                    } else if (wb.prev.is(':visible')) {
                        wb.prev.focus();
                    } else {
                        wb.close.focus();
                    }
                }
            }
        },
        enter: function(e) {
            if (wb.isOpen) {
                wb.box.find(':focus').click();
            }
        },
        bindShortcuts: function() {
            wb.$document.bind('keydown.wb', function(e) {
                switch (e.which) {
                    case 27:
                        m.close();
                        break;
                    case 37:
                        m.prev();
                        break;
                    case 39:
                        m.next();
                        break;
                    case 9:
                        m.tabNavigation(e);
                        break;
                    case 13:
                        m.enter(e);
                        break;
                }
            });
        },
        unbindShortcuts: function() {
            wb.$document.unbind('keydown.wb');
        },
        setListing: function() {
            // jQuery > 1.6 || jQuery < 1.6 || false
            wb.group.name = wb.trigger.data('wbGroup') || wb.trigger.data('wb-group') || false;
            if (wb.group.name) {
                wb.group.triggers = $(wb.currentInstanceSelector +'[data-wb-group='+ wb.group.name +']');
                wb.group.index = wb.group.triggers.index(wb.trigger);
                wb.group.size = wb.group.triggers.size();
                if (wb.group.size > 1) {
                    if (wb.group.index !== 0) {
                        m.enable(wb.prev);
                        m.preload(wb.group.triggers.eq(wb.group.index - 1));
                    }
                    if (wb.group.index !== wb.group.size - 1) {
                        m.enable(wb.next);
                        m.preload(wb.group.triggers.eq(wb.group.index + 1));
                    }
                }
                m.positionArrows();
            }
        },
        preload: function($trigger) {
            var src = $trigger.attr('href');
            
            if ($.inArray(src, wb.cache) === -1) {
                var img = document.createElement('img');
                img.src = src;
                wb.cache.push(src);
            }
        },
        enable: function($el) {
            $el.removeClass('disabled').addClass('enabled').attr('aria-disabled', false).show();
        },
        disable: function($el) {
            $el.removeClass('enabled').addClass('disabled').attr('aria-disabled', true).hide();
        },
        getlocalDataOptions: function() {
            var LDO = [];
            
            $.each(wb.singleOptions, function(i, val) {
                var dataO = wb.trigger.data(val),
                key = val.replace('wb-', '');
                if (dataO !== undefined) {
                    LDO[key] = dataO;
                }
            });
            
            return LDO;
        },
        getContentType: function(url) {
            var type = wb.AJAX;
            
            if (url.match(/\.(jpg|gif|png|bmp|jpeg)(.*)?$/i)) {
                type = wb.IMAGE;
            } else if (o.iframe) {
                type = wb.IFRAME;
            } else if (/^#/.test(url)) {
                type = wb.ANCHOR;
            }
            
            return type;
        },
        hideAnchors: function() {
            wb.instance[wb.currentInstanceSelector].self.each(function() {
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
                    m.open(wb.group.triggers.eq(index));
                });
        },
        bindListing: function() {
            wb.prev.add(wb.next).bind('click.wb', function(e) {
                var showIndex = this === wb.prev.get(0) ? wb.group.index - 1 : wb.group.index + 1;
                
                if (showIndex >= 0 && showIndex < wb.group.size) {
                    o = wb.instance[wb.currentInstanceSelector].options;
                    m.show(showIndex);
                } else {
                    $.error('Unknown index '+ showIndex +' in group '+ wb.group.name);
                }
            });
        },
        bindOpen: function() {
            wb.$body.delegate(wb.currentInstanceSelector +':not(#wb-close, #wb-prev, #wb-next)', 'click.wb', { selector: wb.currentInstanceSelector }, function(e) {
                e.preventDefault();
                
                wb.currentInstanceSelector = e.data.selector;
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
            var dimensions,
            center,
            contentDimensions;
            wb.$window.bind('resize.wb', function() {
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
            wb.$window.unbind('resize.wb');
        },
        create: function() {
            $('<div id="webbox" role="dialog" tabindex="-1"><div id="wb-content"></div><div id="wb-close" role="button" tabindex="0">×</div><div id="wb-prev" class="disabled" role="button" aria-disabled="true" tabindex="0"><span>«</span></div><div id="wb-next" class="disabled" role="button" aria-disabled="true" tabindex="0"><span>»</span></div><div id="wb-title"><div id="wb-title-aria" /></div></div><div id="wb-loader"><span>\u2605</span></div>').appendTo('body');
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
            wb.$body.undelegate('.wb');
            wb.$window.unbind('.wb');
            m.unbindWindowResize();
            wb.isCreated = false;
            wb.isOpen = false;
        }
        
    };

    $.fn.webbox = function(method) {
  
        // Method calling logic
        if ( m[method] ) {
            return m[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return m.init.apply(this, arguments);
        } else {
            $.error('Method '+  method +' does not exist on jQuery webbox plugin');
        }
    
    };
  
})(jQuery);