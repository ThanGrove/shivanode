<?php
/**
 * @file
 * shiva_services.features.inc
 */

/**
 * Implements hook_ctools_plugin_api().
 */
function shiva_services_ctools_plugin_api($module = NULL, $api = NULL) {
  if ($module == "services" && $api == "services") {
    return array("version" => "3");
  }
}