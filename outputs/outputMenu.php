<?php
header("Access-Control-Allow-Origin: *");
class outputMenu
{
  var $json_array = array();
  var $result = '';
  var $menuType;
  var $obj_idRestaurant;

  function outputMenu()
  {
    include('../data/data.php');
    include('outputRestaurant.php');
    $this -> obj_idRestaurant = new output_restaurant();

    if ( isset( $_REQUEST['menuType'] ) )
    {
      $this -> menuType = $_REQUEST['menuType'];
    }
    else
    {
      $this -> get_firstMenuType();
    }
    $this -> getMenu();
  }

  function get_firstMenuType()
  {
    $sql = 'SELECT * FROM `menutype` WHERE menutype.id_restaurant = '.$this -> obj_idRestaurant -> id_restaurant.' ORDER BY `menutype`.`id` ASC';
    $this -> result = mysql_query($sql) or die($sql);
    if ( mysql_num_rows($this -> result) > 0 )
    {
      $this -> menuType = mysql_result($this -> result,0,'id');
    }
    else
    {
      $sql = 'SELECT * FROM menutype JOIN restaurant on menutype.id_restaurant = restaurant.id AND restaurant.id_company = '.$this -> obj_idRestaurant -> id_company.' AND menutype.common = 1 ORDER BY `menutype`.`id` ASC';
      $this -> result = mysql_query($sql) or die($sql);
      if ( mysql_num_rows($this -> result) > 0 )
      {
        $this -> menuType = mysql_result($this -> result,0,'id');
      }
      else
      {
        $this -> menuType = 1;
      }
    }
  }

  function getMenu()
  {
    $sql = 'SELECT * FROM menu JOIN menutype ON menu.id_menuType = menutype.id AND menutype.id_restaurant = '.$this -> obj_idRestaurant -> id_restaurant.' AND menutype.id = \''.$this -> menuType.'\'';
    $this -> result = mysql_query($sql) or die($sql);

    if ( mysql_num_rows($this -> result) > 0 )
    {
      for ( $i = 0; $i < mysql_num_rows($this -> result); ++$i )
      {
        $path = 'http://admin.ewaiter.info/'.mysql_result($this -> result,$i,'Image');
        $this -> json_array[$i] = array( 'removability' => '<a style="cursor: pointer;" onclick="menuObject.menuOperation.menu_Delete(\''.mysql_result($this -> result,$i,'id').'\');"><img src="http://ewaiter.info/images/b_drop.png" /></a>','editability' => '<a style="cursor: pointer;" onclick="menuObject.menuOperation.menu_Edit(\'curent\',\'menuTable\');"><img src="http://ewaiter.info/images/b_edit.png" /></a>','name' => mysql_result($this -> result,$i,'name'), 'shortDescription' => mysql_result($this -> result,$i,'shortDescription'),'path' => $path,'price' => mysql_result($this -> result,$i,'price'),'article' => mysql_result($this -> result,$i,'id'),'Description' => mysql_result($this -> result,$i,'Description'),'energyValuePortion' => mysql_result($this -> result,$i,'energyValuePortion'),'energyValue100' => mysql_result($this -> result,$i,'energyValue100'));
      }
      print( str_replace('\/','/',json_encode($this -> json_array)) );
    }
    else 
    {
      $sql = 'SELECT * FROM menu JOIN menutype ON menu.id_menuType = menutype.id AND menutype.id = \''.$this -> menuType.'\'';
      $this -> result = mysql_query($sql) or die($sql);
      if ( mysql_num_rows($this -> result) > 0 )
      {
        for ( $i = 0; $i < mysql_num_rows($this -> result); ++$i )
        {
          $path = 'http://admin.ewaiter.info/'.mysql_result($this -> result,$i,'Image');
          $this -> json_array[$i] = array( 'removability' => '<a style="cursor: pointer;" onclick="menuObject.menuOperation.menu_Delete(\''.mysql_result($this -> result,$i,'id').'\');"><img src="http://ewaiter.info/images/b_drop.png" /></a>','editability' => '<a style="cursor: pointer;" onclick="menuObject.menuOperation.menu_Edit(\'curent\',\'menuTable\');"><img src="http://ewaiter.info/images/b_edit.png" /></a>','name' => mysql_result($this -> result,$i,'name'), 'shortDescription' => mysql_result($this -> result,$i,'shortDescription'),'path' => $path,'price' => mysql_result($this -> result,$i,'price'),'article' => mysql_result($this -> result,$i,'id'),'Description' => mysql_result($this -> result,$i,'Description'),'energyValuePortion' => mysql_result($this -> result,$i,'energyValuePortion'),'energyValue100' => mysql_result($this -> result,$i,'energyValue100'));
        }
        print( str_replace('\/','/',json_encode($this -> json_array)) );
      }
      else
      {
        print('noMenu');
      }
    }
  }
}

$obj = new outputMenu();
?>