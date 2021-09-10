/**
 * System Plugin SimpleAccessKeys adds access keys for accessibility
 * to the menu items to provide keyboard navigation
 *
 * @copyright (C) 2018 https://www.fasterjoomla.com
 * @license GNU/GPL v2 or greater http://www.gnu.org/licenses/gpl-2.0.html
 * @author Riccardo Zorn code@fasterjoomla.com
 */

/**
 * SimpleAccessKeys
 * Expects the var accessKeysConfig as the config param
 * @returns
 */

;
var SimpleAccessKeys = function (config) {
    this.config = config;
    this.sakPOPUP = null;
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
SimpleAccessKeys.prototype.log = function (level, message, ...item) {
    if (level > 1 || this.config.debug) {
        if (item) {
            console.log(message, ...item);
        } else {
            console.log(message);
        }
    }
}

/**
 * Find menu items, assign keys, return structure with all data
 * @returns
 */
SimpleAccessKeys.prototype.load = function () {
    var self = this;
    self.log(0, 'SimpleAccessKeys initialising. Configuration');
    self.log(0, self.config);
    var urls = new Array();
    var $menus = jQuery(self.config.selector);
    self.log(0, '  found ', $menus.length, 'items');

    jQuery.each($menus, function (index, item) {
        // self.log(0, 'examine', item);
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
    self.decorateAccessKeys(urls);

    self.log(0, 'Access Keys Assigned', urls);
    self.config.urls = urls;
    jQuery(document).keydown(function (event) {
        if (event.which == 27) {
            self.toggleSAKPopup(self);
        }
        self.log(0, 'event: ' + event.which, event.altKey, event.shiftKey, event.ctrlKey);
        if (!(event.altKey || event.shiftKey || event.ctrlKey)) {
            var pressedChar = String.fromCharCode(event.which).toLowerCase();

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
        }
    });

    /**
  * AddRule snap-in
  *!
     * jquery.addrule.js 0.0.2 - https://gist.github.com/yckart/5563717/
     * Add css-rules to an existing stylesheet.
     *
     * @see http://stackoverflow.com/a/16507264/1250044
     *
     * Copyright (c) 2013 Yannick Albert (http://yckart.com)
     * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).
     * 2013/11/23
     **/
    let $ = jQuery || Zepto;

    window.addRule = function (selector, styles, sheet) {

        styles = (function (styles) {
            if (typeof styles === "string") return styles;
            var clone = "";
            for (var prop in styles) {
                if (styles.hasOwnProperty(prop)) {
                    var val = styles[prop];
                    prop = prop.replace(/([A-Z])/g, "-$1").toLowerCase(); // convert to dash-case
                    clone += prop + ":" + (prop === "content" ? '"' + val + '"' : val) + "; ";
                }
            }
            return clone;
        }(styles));
        sheet = sheet || document.styleSheets[document.styleSheets.length - 1];

        if (sheet.insertRule) sheet.insertRule(selector + " {" + styles + "}", sheet.cssRules.length);
        else if (sheet.addRule) sheet.addRule(selector, styles);

        return this;

    };

    if ($) $.fn.addRule = function (styles, sheet) {
        addRule(this.selector, styles, sheet);
        return this;
    };
}

/**
 * Iterate over the collected urls (object urls: text, accessKey, item)
 * and assign an accessKey first to those who are forced; then proceed as normal
 * and assign keys as available to the remaining urls; finally, clean up 
 * any leftover urls.
 * @param urls
 * @returns
 */
SimpleAccessKeys.prototype.assignAccessKeys = function (urls) {
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
            // this.log(0, 'deleting empty url', urls[i]);
            urls.splice(i, 1);
        }
    }
    this.log(1, 'Access keys: ' + reservedAccessKeys.join(' '));
}

/**
 * apply the decoration to the menu items, i.e.
 * <a href="?id=3">Aristocratic bitch</a>
 * becomes
 * <a href="?id=3"><em>A</em>ristocratic bitch</a>
 * Decoration pattern is set in the plugin config.
 */
SimpleAccessKeys.prototype.decorateAccessKeys = function (urls) {
    var self = this;
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
            // self.log(0, 'Decorating markup:' + markup + ' with key ' +
            //     accessKey + ' with ', decoratedKeyU);


            // markup could be: 
            // <img src="/images/wiki.jpg" alt="Download"><span class="image-title">Download</span>
            // this helps prevent things like:
            // error: <img src=\"/images/wiki.jpg\" alt=\"<em class=\" accesskey\"=\"\">Download\"&gt;<span class=\"image-title\">Download</span>
            var markupU = markup.replace(
                text + '<',
                decoratedText + '<');

            // then fallback: it will break if the text is present in the attributes such as alt or url:
            if (markupU == markup) {
                //     self.log(0, 'rollback ');
                markupU = markup.replace(
                    text,
                    decoratedText);
            }
            // self.log(0, 'markup', markup, 'markupU', markupU);

            jQuery(url.item).html(markupU);

        }
    }
}

/**
 * Build the "Keys" button that will open the popup.
 * @returns
 */
SimpleAccessKeys.prototype.loadSAKLegendButton = function () {
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
            '</a>').css(buttonStyle).click(function () {
                self.toggleSAKPopup(self);
            }).appendTo(jQuery('body'));
    }
    self.log(0, 'SAK Button: ', button);

}

/**
 * Show the popup with the map of the keys 
 * @returns
 */
SimpleAccessKeys.prototype.showSAKPopup = function (self) {
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

    popupText.push("<li><a href='#' class='sak-link sak-esc'><span class='key'>ESC</span>&nbsp;<span class='label'>Toggle Menu</span></a></li>");
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

    self.sakPOPUP = jQuery(popupText.join(''))
        .css(popupStyle).click(function () {
            //sakPOPUP.remove();
            self.toggleSAKPopup(self);
        }).appendTo(jQuery('body'));
    jQuery('.sak-link:focus').addRule({ border: '1px solid red', "border-radius": "5px" });
    jQuery('.sak-link').addRule({ padding: '2px 5px' });
    jQuery('.sak-link.sak-esc').click(() => { self.toggleSAKPopup(self); }).focus();
};

/**
 * Show the popup with the map of the keys 
 * @returns
 */
SimpleAccessKeys.prototype.toggleSAKPopup = function (self) {
    // initial state:
    let isVisible = false;
    if (self.sakPOPUP) {
        if (self.sakPOPUP.is(":visible")) {
            isVisible = true;
        }
    }
    if (self.sakPOPUP == null) {
        self.showSAKPopup(self);
    } else {
        if (!isVisible) {
            self.sakPOPUP.css({ display: "block", opacity: 0 }).animate({ opacity: 1 }, {
                duration: 500, complete: () => {
                    self.sakPOPUP.find('.sak-link.sak-esc, sak-link').first().trigger('focus');
                }
            });
        } else {
            self.sakPOPUP.animate({ opacity: 0 }, {
                duration: 800, complete: () => {
                    self.sakPOPUP.css({ display: "none" });
                }
            });
        }
    }
}