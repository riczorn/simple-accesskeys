<?php
/**
 * System Plugin SimpleAccessKeys adds access keys for accessibility
 * to the menu items to provide keyboard navigation
 *
 * @author Riccardo Zorn code@fasterjoomla.com
 * @copyright (C) 2018 https://www.fasterjoomla.com
 * @license GNU/GPL v2 or greater http://www.gnu.org/licenses/gpl-2.0.html
 * @author Riccardo Zorn code@fasterjoomla.com
 */
defined('_JEXEC') or die;

jimport('joomla.plugin.plugin');

/**
 * This plugin has two events, 
 * onBeforeCompileHead, which is used for copying Joomla Head and emptying it (so nothing will be output)
 * onAfterRender, which finds extra scripts, does all the magic, and updates the body.
 */
class plgSystemSimpleAccessKeys extends JPlugin
{
	/**
	 * The last event we can inject code the Joomla way
	 * is onBeforeCompileHead() but for some components it's not fired
	 * so I'll just hook on to beforeRender
	 */	
	function onBeforeRender() 
	{
	    if (!$this->isAllowed()) {
	        return;
	    }
	    
		$document = JFactory::getDocument();
		$document->addScript('/plugins/system/simpleaccesskeys/assets/js/simpleaccesskeys.js');
		if ($this->params->get('loadcss','1')) {
		  $document->addStyleSheet('/plugins/system/simpleaccesskeys/assets/css/simpleaccesskeys.css');
		}
		$forcedString = $this->params->get('forced');
		$forcedArray = explode("\n",$forcedString);
		$forced = array();
		foreach( $forcedArray as $key=>$forcedItem) {
		    $forcedItemArray = explode("=",$forcedItem);
		    if (is_array($forcedItemArray) && count($forcedItemArray)===2) {
    		    $newForcedItem = new stdClass();
    		    $newForcedItem->title=trim($forcedItemArray[0]);
    		    $newForcedItem->accessKey=trim($forcedItemArray[1]);
    		    $forced[] = $newForcedItem;
		    }
		}
		$this->loadLanguage();
		$accessKeysConfig = new stdClass();
		$accessKeysConfig->debug = $this->params->get('debug','0');
		$accessKeysConfig->selector = $this->params->get('selector','ul li a');
		$accessKeysConfig->exclusion = $this->params->get('exclusion','INPUT TEXTAREA LABEL');
		$accessKeysConfig->reserved = explode(",",$this->params->get('reserved',''));
		$accessKeysConfig->forced = $forced;
		$accessKeysConfig->decoration = $this->params->get('decoration','<em>%s</em>');
		$accessKeysConfig->showLegend = $this->params->get('showlegend','1');
		$accessKeysConfig->legendSelector = $this->params->get('legendselector','');
		$accessKeysConfig->legendButtonText = JText::_("PLG_SYSTEM_SIMPLEACCESSKEYS_LEGEND_BUTTON_TEXT");
		$accessKeysConfig->legendTitle = JText::_("PLG_SYSTEM_SIMPLEACCESSKEYS_LEGEND_TITLE");
		$accessKeysConfig->legendSubTitle = JText::_("PLG_SYSTEM_SIMPLEACCESSKEYS_LEGEND_SUBTITLE");
		$copyright = JText::_("PLG_SYSTEM_SIMPLEACCESSKEYS_LEGEND_COPYRIGHT");
// 		if (stripos($copyright, 'fasterjoomla') ===FALSE ||
// 		    strpos($copyright, 'https://www.fasterjoomla.com')===FALSE)
		{
		    $copyright = "Powered by <a href='https://www.fasterjoomla.com/extensions/simple-accesskeys-accessible-navigation' target='_blank'>Simple AccessKeys</a> &copy; 2018 <a href='https://www.fasterjoomla.com' target='_blank'>fasterjoomla</a>.";
		}
		if ($this->params->get('showcopyright','1')=='1') {
		  $accessKeysConfig->copyright = "<div class='copyright'>$copyright</div>";
		} else {
		  $accessKeysConfig->copyright = "";
		}
		
		
		$document->addScriptDeclaration(sprintf('
			;jQuery(function() {
                var simpleAccessKeys = new SimpleAccessKeys(%s);
            });
		    ',
		    json_encode($accessKeysConfig)		    
		    ));
		
	}
	
	/**
	 * I don't really think admins want this
	 * @return boolean
	 */
	function isAllowed() {
	    if (JPATH_BASE == JPATH_ADMINISTRATOR) {
	        return false;
		}
		$include_itemids = $this->params->get('include_itemids','');
		$exclude_itemids = $this->params->get('exclude_itemids','');
		$Itemid = JFactory::getApplication()->input->get('Itemid','');

		// always enable.
		$result = true;
			
		if (strlen($Itemid)>0) {
			//error_log( "include_itemids:$include_itemids, exclude_itemids: $exclude_itemids, Itemid:$Itemid<br>;");
			// if I set include Itemids, they must match:
			if (strlen($include_itemids)>0) {
				$result = false;
				if (in_array($Itemid, explode(',',$include_itemids))) {
					$result = true;
				}
			}

			// if I have configured exclusions, they must match to disable:
			if (strlen($exclude_itemids)>0) {
				//$result = true;
				if (in_array($Itemid, explode(',',$exclude_itemids))) {
					$result = false;
				}
			}
		}
		//if ($result) {error_log( "SimpleAccessKeys enabled");} else {error_log( "SimpleAccessKeys disabled");}
		
	    return $result;
	}
	
	/**
	 * Load the language file. This is needed for the button text and 
	 * the popup title and subtitle.
	 * @param string $extension
	 * @param string $basePath
	 * @return unknown
	 */
	public function loadLanguage($extension = '', $basePath = JPATH_SITE)
	{
	    if (empty($extension)) {
	        $extension = 'plg_' . $this->_type . '_' . $this->_name;
	    }
	    $lang = JFactory::getLanguage();
	    return $lang->load(strtolower($extension), JPATH_PLUGINS . '/' . $this->_type . '/' . $this->_name, null, false, true);
	}	
}
