var MiradorDisableZoom = {

    // TODO: add more locales
    locales: {
        'en': {
            'button-tooltip': 'Disable zoom controls on this window'
        }
    },

    template: Mirador.Handlebars.compile([
        '<a href="javascript:;" class="mirador-btn mirador-icon-disable-zoom contained-tooltip" title="{{t "button-tooltip"}}">',
            '<i class="fa fa-search fa-lg fa-fw"></i>',
            '<i class="fa fa-lock"></i>',
        '</a>'
    ].join('')),

    init: function() {
        var _this = this;

        i18next.on('initialized', function() {
            for (var locale in _this.locales) {
                i18next.addResources(locale, 'translation', _this.locales[locale]);
            };
        });

        /*
         * Mirador.Window
         */
        (function() {

            /* 0. Declare variables for the constructor and any methods that we'll override. */

            var constructor = Mirador.Window,
                listenForActions = Mirador.Window.prototype.listenForActions;

            /* 1. Override methods and register (and document!) new ones. */

            Mirador.Window.prototype.listenForActions = function() {
                listenForActions.apply(this, arguments);

                this.eventEmitter.subscribe('focusUpdated' + this.id, function(event, focusState) {
                    // triggered when toggling viewing states or changing the current canvas
                    // a new OSD will be created, so just de-select the button
                    this.element.find('.mirador-icon-disable-zoom').removeClass('selected');
                }.bind(this));
            };

            /*
            * Mirador.Window.prototype.toggleZoomLock
            *
            * Disables or enables this window's zoom controls.
            * @param {Object} linkElement
            *   The <a> element with class '.mirador-icon-disable-zoom'.
            * @param {Boolean} disableOsdZoom
            *   Whether to set this window's zoom to enabled (false) or disabled (true).
            */
            Mirador.Window.prototype.toggleZoomLock = function(linkElement, disableOsdZoom) {
                if (disableOsdZoom === true) {
                    this.eventEmitter.publish("disableOsdZoom." + this.id);
                    $(linkElement).addClass('selected');
                } else {
                    this.eventEmitter.publish("enableOsdZoom." + this.id);
                    $(linkElement).removeClass('selected');
                }
                this.windowZoomDisabled = !!disableOsdZoom;
            };

            /* 2. Override the constructor. */

            Mirador.Window = function() {
                var w = new constructor($.extend(true, Array.prototype.slice.call(arguments)[0], {
                    windowZoomDisabled: false
                }));

                // add button (the compiled template) to the DOM
                w.element.find('.window-manifest-navigation').prepend(_this.template());

                // add click handler for the new button
                w.element.find('.mirador-icon-disable-zoom').on('click', function(event) {
                    w.toggleZoomLock(this, !w.windowZoomDisabled);
                });

                return w;
            };
        })();

        /*
         * Mirador.BookView
         * Mirador.ImageView
         */
        (function() {
            ['BookView', 'ImageView'].forEach(function(viewType) {

                /* 0. */

                var constructor = Mirador[viewType],
                    listenForActions = Mirador[viewType].prototype.listenForActions;
            
                /* 1. */

                Mirador[viewType].prototype.listenForActions = function() {
                    listenForActions.apply(this, arguments);
                    this.eventEmitter.subscribe('disableOsdZoom.' + this.windowId, function(event) {
                        // 1 is the multiplicative identity
                        this.osd.zoomPerClick = 1;
                        this.osd.zoomPerScroll = 1;
                    }.bind(this));
                    this.eventEmitter.subscribe('enableOsdZoom.' + this.windowId, function(event) {
                        // restore the default settings
                        this.osd.zoomPerClick = this.defaultWindowZoomPerClick;
                        this.osd.zoomPerScroll = this.defaultWindowZoomPerScroll;
                    }.bind(this));
                };

                /* 2. */

                Mirador[viewType] = function() {
                    return new constructor($.extend(true, Array.prototype.slice.call(arguments)[0], {
                        // TODO: read this from the OSD configuration instead of using this magic number
                        defaultWindowZoomPerClick: 1.2,
                        defaultWindowZoomPerScroll: 1.2
                    }));
                };
            });
        })();
    }
};

$(document).ready(function() {
    MiradorDisableZoom.init();
});