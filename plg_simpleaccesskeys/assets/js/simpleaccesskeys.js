/**
 * System Plugin SimpleAccessKeys adds access keys for accessibility
 * to the menu items to provide keyboard navigation
 *
 * @author Riccardo Zorn code@fasterjoomla.com
 * @copyright (C) 2018 http://www.fasterjoomla.com
 * @license GNU/GPL v2 or greater http://www.gnu.org/licenses/gpl-2.0.html
 * @author Riccardo Zorn code@fasterjoomla.com
 */

/**
 * SimpleAccessKeys
 * Expects the var accessKeysConfig as the config param
 * @returns
 */

;
var SimpleAccessKeys = function(config) {
    this.config = config;
    this.load();
    if (this.config.showLegend) {
        this.loadSAKLegendButton();
    }
    return this;
}

/**
 * Conditionally log based on the debug setting
 * @param level
 * @param message
 * @param item
 * @returns
 */
SimpleAccessKeys.prototype.log = function(level, message, item) {
    if (level || this.config.debug) {
        if (item) {
            console.log(message, item);
        } else {
            console.log(message);
        }
    }
}

/**
 * Find menu items, assign keys, return structure with all data
 * @returns
 */
SimpleAccessKeys.prototype.load = function() {
    var self = this;
    self.log(0, 'SimpleAccessKeys initialising. Configuration');
    self.log(0, self.config);
    var urls = new Array();
    var $menus = jQuery(self.config.selector);
    self.log(0, '  found ', $menus.length, 'items');

    jQuery.each($menus, function(index, item) {
        self.log(0, 'examine', item);
        var text = jQuery(item).text();
        text = text.trim ? text.trim() : text;
        var href = jQuery(item).attr("href");

        if (text.length && href && href.length) {
            urls.push({
                text: text,
                accessKey: '',
                item: item
            });
        }
    });

    self.assignAccessKeys(urls);

    self.log(0, 'Access Keys Assigned', urls);
    self.config.urls = urls;
    jQuery(document).keydown(function(event) {
        var pressedChar = String.fromCharCode(event.which).toLowerCase();
        self.log(0, 'event: ' + pressedChar, event.target);
        if (self.config.exclusion.toUpperCase().indexOf(event.target.tagName.toUpperCase()) === -1) {
            for (var i in urls) {
                url = urls[i];
                if (url.accessKey == pressedChar) {
                    self.log(1, 'Pressed key for ', url);
                    url.item.click();
                    break;
                }
            }
        };
    });
}

/**
 * Iterate over the collected urls (object urls: text, accessKey, item)
 * and assign an accessKey first to those who are forced; then proceed as normal
 * and assign keys as available to the remaining urls; finally, clean up 
 * any leftover urls.
 * @param urls
 * @returns
 */
SimpleAccessKeys.prototype.assignAccessKeys = function(urls) {
    var reservedAccessKeys = new Array();
    /* the forced item contains a list of strings along 
     * with their associated key. Assigning them to the urls:
     */
    for (var i in urls) {
        var url = urls[i];
        if (url.accessKey !== '') {
            continue;
        }
        var text = url.text;
        for (var j in this.config.forced) {
            var f = this.config.forced[j];
            //this.log('f',f);
            if (text === f.title) {
                url.accessKey = f.accessKey;
                reservedAccessKeys.push(url.accessKey);
                break;
            }
        }
    }
    //now try to assign a letter to the others in the order they come in
    for (var i in urls) {
        var url = urls[i];
        if (url.accessKey !== '') {
            continue;
        }
        var text = url.text;

        // let's store a new reference to this item:
        for (var i = 0; i < text.length; i++) {
            var accessKey = text.charAt(i).toLowerCase();
            // only enable for letters and numbers.
            if (/[\w\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]/.test(accessKey)) {

                if (jQuery.inArray(accessKey, reservedAccessKeys) == -1 &&
                    jQuery.inArray(accessKey, this.config.reserved) == -1) {
                    reservedAccessKeys.push(accessKey);
                    url.accessKey = accessKey;
                    break;
                }
            }
        }
    }

    // finally remove items with no accessKey
    for (var i = urls.length - 1; i > 0; i--) {
        if (urls[i].accessKey === '') {
            this.log(0, 'deleting empty url', urls[i]);
            urls.splice(i, 1);
        }
    }
    this.log(1, 'Access keys: ' + reservedAccessKeys.join(' '));
}

/**
 * apply the decoration to the menu items
 */
SimpleAccessKeys.prototype.decorateAccessKeys = function(urls) {
    if (this.config.decoration) {
        for (var i in urls) {
            var url = urls[i];
            var text = url.text;
            var accessKey = url.accessKey;
            if (!accessKey) {
                continue;
            }
            var decoratedKeyU = '';
            var decoratedKeyL = '';

            decoratedKeyU = this.config.decoration.replace('%s', accessKey.toUpperCase());
            decoratedKeyL = this.config.decoration.replace('%s', accessKey);

            var decoratedText = text.replace(
                accessKey.toUpperCase(),
                decoratedKeyU);
            if (text == decoratedText) {
                decoratedKeyU = text.replace(
                    accessKey,
                    decoratedKeyL);
            }

            var markup = jQuery(url.item).html();
            //log(0,'Decorating key ' + accessKey + ' with ',decoratedKeyU);
            var markupU = markup.replace(
                text,
                decoratedText);

            jQuery(url.item).html(markupU);

        }
    }
}

/**
 * Build the "Keys" button that will open the popup.
 * @returns
 */
SimpleAccessKeys.prototype.loadSAKLegendButton = function() {
    // add additional styles here if necessary:
    var self = this;
    var buttonStyle = {

    };
    var button;
    if (self.config.legendSelector.length > 1) {
        button = jQuery(self.config.legendSelector);
    } else {
        button = jQuery('<a class="accessKeyLegend">' +
            self.config.legendButtonText +
            '</a>').css(buttonStyle).click(function() {
            self.showSAKPopup(self);
        }).appendTo(jQuery('body'));
    }
    self.log(0, 'SAK Button: ', button);

}

/**
 * Show the popup with the map of the keys 
 * @returns
 */
SimpleAccessKeys.prototype.showSAKPopup = function(self) {
    // add additional styles here if necessary:
    var popupStyle = {
        "display": "flex",
        "flex-direction": "column"
    };

    var popupText = new Array(
        '<div class="accessKeyPopup">',
        "<h1>" + self.config.legendTitle + "</h1>",
        "<p><span class='sak-logo-disabled'></span>",
        self.config.legendSubTitle,
        "</p><ul>");
    for (var i in self.config.urls) {
        var url = self.config.urls[i];
        var href = jQuery(url.item).attr("href");
        if (href) {
            popupText.push("<li><a class='sak-link' href='" + href + "'><span class='key'>" + url.accessKey + "</span>&nbsp;<span class='label'>" + url.text + "</span></a></li>");
        }
    }
    popupText.push("</ul>");
    popupText.push("<div class='sak-copyright'>" + self.config.copyright + "</div>");
    popupText.push("</div>");

    var sakPOPUP = jQuery(popupText.join(''))
        .css(popupStyle).click(function() {
            sakPOPUP.remove();
        }).appendTo(jQuery('body'));
};