<?php
/**
 * System Plugin SimpleAccessKeys adds access keys for accessibility
 * to the menu items to provide keyboard navigation
 *
 * @author Riccardo Zorn code@fasterjoomla.com
 * @copyright (C) 2018 http://www.fasterjoomla.com
 * @license GNU/GPL v2 or greater http://www.gnu.org/licenses/gpl-2.0.html
 * @author      Riccardo Zorn <code@fasterjoomla.com> - https://www.fasterjoomla.com/
 */
defined('_JEXEC') or die;
die();
?>

Simple AccessKeys - System Plugin for Joomla
Homepage: https://www.fasterjoomla.com/extensions/simple-accesskeys-accessible-navigation

--------------------------------------
Version 1.0.0 (2017/12/19)
	Implemented the jQuery hooks to automatically parse the menubar and associate each top-level menu item with an access key.

Version 1.1.5 (2018/01/05)
	Added parameters to configuration:
		- menu selector
		- exclusion selector (the tags that shouldn't listen to keys, default INPUT and TEXTAREA)
		- reserved letters (letters we don't wish to assign)
		- decoration (the decoration for the letters)
		- enable legend button: show a button to popup a legend.
		- legend selector: if none, one will be added in the bottom right corner of the page.

	
Version 1.2.1 
	Added translations for:
		Button Text:    PLG_SYSTEM_SIMPLEACCESSKEYS_LEGEND_BUTTON_TEXT
		Popup Title:    PLG_SYSTEM_SIMPLEACCESSKEYS_LEGEND_TITLE
		Popup Subtitle: PLG_SYSTEM_SIMPLEACCESSKEYS_LEGEND_SUBTITLE
		
	Simply use the Joomla Language Override to change them.

Version 1.2.2
	Right capitalization
	
Version 1.2.3
	Moved to external css file
	
Version 1.2.4
	External CSS File now optional
	Added Italian translation	

Version 1.2.5 
	Update site moved to https
	
Version 1.2.7 (2018/01/09)
	Forced letters (letters that are assigned based on the text 
	  content of the menu node)

Version 1.3.0 
	Reworked the javascript into a prototype object
	 
Version 1.4.0
	Added the include Itemid and Exclude Itemid settings to allow enabling
	only on specific pages.

Version 1.4.1 (2018/01/31)
	Added links on the popup/list page;
	Only allow letters and numbers for access keys;

Version 1.5.0 (2018/02/15)
	Added Joomla 4 compatibility
Version 1.5.1 (2018/02/15)
	Compatibility improvement
	