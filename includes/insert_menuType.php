<?php
class insert_menuType
{
  var $json_array = array();
  var $result = '';
  var $id_restorant;
  var $id;
  var $menuType;
  var $common;

  function insert_menuType()
  {
    include('../data/data.php');
    $this -> id_restaurant = $_REQUEST['id_restaurant'];
    $this -> id = $_REQUEST['id'];
    $this -> menuType = $_REQUEST['menuType'];
    if ( $_REQUEST['common-inputEl'] == '' )
    {
      $this -> common = 0;
    }
    else
    {
      $this -> common = $_REQUEST['common-inputEl'];
    }

    if ( isset($_REQUEST['noAuto']) == false )
    {
      $this -> run();
    }
  }

  function insert()
  {
    $sql = 'INSERT INTO `bessss_ewaiter`.`menutype` (`id`, `id_restaurant`, `common`, `name`, `additional`) VALUES (NULL, \''.$this -> id_restaurant.'\',\''.$this -> common.'\', \''.$this -> menuType.'\', \'0\');';
    $this -> result = mysql_query($sql) or die($sql);
    $this -> id_menuType = mysql_insert_id();
  }

  function update()
  {
    $sql = 'UPDATE `bessss_ewaiter`.`menutype` SET `name` = \''.$this -> menuType.'\', `common` = \''.$this -> common.'\' WHERE `menutype`.`id` = '.$this -> id.';';
    $this -> result = mysql_query($sql) or die($sql);
    $this -> id_menuType = $this -> id;
  }

  function run()
  {
    if ( $this -> id == 'new' )
    {
      $this -> insert();
    }
    else
    {
      $this -> update();
    }

    if ( isset($_REQUEST['noAuto']) == false )
    {
      print('{"success": true, "message": "Данные успешно внесены"}');
    }
  }
}
$obj = new insert_menuType();
?>