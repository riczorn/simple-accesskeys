<?php
/**
 *  @copyright  Copyright (c) 2009-2013 FasterJoomla. All rights reserved.
 *  @license    GNU General Public License version 2, or later
 */

defined('_JEXEC') or die;


// http://docs.joomla.org/J2.5:Managing_Component_Updates_%28Script.php%29

class PlgSystemSimpleAccessKeysInstallerScript
{
	function postflight( $type, $parent ) {
		$manifest = JPATH_SITE.'/plugins/system/simpleaccesskeys/simpleaccesskeys.xml';
		// let's see if the plugin is really installed:
				// the manifest contains the string:
				// <version>1.8.6</version>
		if (file_exists($manifest)) {
			if ( $type == 'update' ) {
				$this->startUpdatePluginConfig('simpleaccesskeys', 'system', $type);
			}
		}

		return true;
	}

	/** 
	 * Loads the plugin from the db and returns is 
	 * as an object that can be updated later by
	 * savePlugin
	 */
	function loadPlugin($pluginName, $pluginFolder) {
		$app = JFactory::getApplication();
		$db = JFactory::getDbo();
		$query = "select * FROM `#__extensions`
			WHERE `type`='plugin' and `folder`='$pluginFolder' and `element`='$pluginName'";

		$currentPlugin = $db->setQuery($query)->loadObject();
		if (!$currentPlugin) {
			$app->enqueueMessage("The plugin $pluginName was not found", 'error');
		}
		return $currentPlugin;
	}
		/** 
	 * Save the plugin to the db
	 */
	function savePlugin($currentPlugin, $pluginName, $pluginFolder) {
		$app = JFactory::getApplication();
		$db = JFactory::getDbo();
		$resultUpdate = $db->updateObject('#__extensions', $currentPlugin, ['extension_id']);
		if ($resultUpdate) {
			$app->enqueueMessage(sprintf("The plugin %s is now enabled", $pluginName), 'message');
		} else {
			$app->enqueueMessage(sprintf("Could not enable the plugin, please do it manually", $pluginName), 'warning');
		}
	}

	function enablePlugin($pluginName, $pluginFolder) {
		$currentPlugin = $this->loadPlugin($pluginName, $pluginFolder);
		if (!$currentPlugin) {
			return false;
		}
		$currentPlugin->enabled = 1;
		$this->savePlugin($currentPlugin, $pluginName, $pluginFolder);
	}


	/**
	 * Update the configuration in case 
	 * of migration from 3.* to 3.7
	 * params->loadStripeLibraryPagesFilter text => menuitem
	 *
	 * @param [type] $pluginName
	 * @param [type] $pluginFolder
	 * @return void
	 */
	function startUpdatePluginConfig($pluginName, $pluginFolder) {
		$currentPlugin = $this->loadPlugin($pluginName, $pluginFolder);
		if (!$currentPlugin) {
			return false;
		}
		try {
			$params = json_decode($currentPlugin->params);
      $changesMade = false;

			if (isset($params->include_itemids)) {
			  $itemIds = $params->include_itemids;
				if (is_string($itemIds)) {
					if (!empty($itemIds)) {
						$params->include_itemids = explode(',',$itemIds);		
            $changesMade = true;		
					}
				}				
			}
			if (isset($params->exclude_itemids)) {
			  $itemIds = $params->exclude_itemids;
				if (is_string($itemIds)) {
					if (!empty($itemIds)) {
						$params->exclude_itemids = explode(',',$itemIds);				
            $changesMade = true;
					}
				}				
			}      

      if ($changesMade) {
        $currentPlugin->params = json_encode($params);
        error_log( 'Configuration params updated');
        $this->savePlugin($currentPlugin, $pluginName, $pluginFolder);
      }
			
		}	catch (Exception $e) {
			error_log('ERROR Update Config: '.$e);
		}		
	}	
}
