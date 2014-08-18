<?php
header('Content-Type: application/xml');
header('Access-Control-Allow-Origin: *');
class outputMenuType
{
  var $json_array = array();
  var $result = '';
  var $obj_idRestaurant;

  function outputMenuType()
  {
    include('../data/data.php');
    include('outputRestaurant.php');
    $this -> obj_idRestaurant = new output_restaurant();

    $this -> getMenuType();
  }

  function get_commonMenu()
  {
    $sql = 'SELECT * FROM menutype JOIN restaurant on menutype.id_restaurant = restaurant.id AND restaurant.id_company = '.$this -> obj_idRestaurant -> id_company.' AND menutype.common = 1 ORDER BY `menutype`.`id` ASC';
    $this -> result = mysql_query($sql) or die($sql);
    if ( mysql_num_rows($this -> result) > 0 )
    {
      for ( $i = 0; $i < mysql_num_rows($this -> result); ++$i )
      {
        //array_push($this -> json_array,array( 'removability' => '<a style="cursor: pointer;" onclick="menuObject.menuTypeObject.menuTypeOperation.menuType_Delete(\''.mysql_result($this -> result,$i,'id').'\');"><img src="http://ewaiter.info/images/b_drop.png" /></a>','editability' => '<a style="cursor: pointer;" onclick="menuObject.menuTypeObject.menuTypeOperation.menuType_Edit(\'curent\',\'menuTypeTable\');"><img src="http://ewaiter.info/images/b_edit.png" /></a>','menuType' => '<script type="text/javascript">alert(\'Расстояние до отображаемого ресторана - '.$this -> obj_idRestaurant -> shotName.': '.$this -> obj_idRestaurant -> dist.' м.\')</script>'.mysql_result($this -> result,$i,'name'), 'id' => mysql_result($this -> result,$i,'id'),'common' => 'общее' ) );
        array_push($this -> json_array,array( 'removability' => '<a style="cursor: pointer;" onclick="menuObject.menuTypeObject.menuTypeOperation.menuType_Delete(\''.mysql_result($this -> result,$i,'id').'\');"><img src="http://ewaiter.info/images/b_drop.png" /></a>','editability' => '<a style="cursor: pointer;" onclick="menuObject.menuTypeObject.menuTypeOperation.menuType_Edit(\'curent\',\'menuTypeTable\');"><img src="http://ewaiter.info/images/b_edit.png" /></a>','menuType' => mysql_result($this -> result,$i,'name'), 'id' => mysql_result($this -> result,$i,'id'),'common' => 'общее' ) );
      }
    }

    if ( count($this -> json_array) == 0 )
    {
      $this -> json_array[0] = array( 'menuType' => '', 'id' => 'new' );
    }
  }

  function getMenuType()
  {
    $sql = 'SELECT * FROM menutype JOIN restaurant on menutype.id_restaurant = restaurant.id and restaurant.id = '.$this -> obj_idRestaurant -> id_restaurant.' AND menutype.common = 0 ORDER BY `menutype`.`id` ASC';
    $this -> result = mysql_query($sql) or die($sql);

    if ( mysql_num_rows($this -> result) > 0 )
    {
      for ( $i = 0; $i < mysql_num_rows($this -> result); ++$i )
      {
        $this -> json_array[$i] = array( 'removability' => '<a style="cursor: pointer;" onclick="menuObject.menuTypeObject.menuTypeOperation.menuType_Delete(\''.mysql_result($this -> result,$i,'id').'\');"><img src="http://ewaiter.info/images/b_drop.png" /></a>','editability' => '<a style="cursor: pointer;" onclick="menuObject.menuTypeObject.menuTypeOperation.menuType_Edit(\'curent\',\'menuTypeTable\');"><img src="http://ewaiter.info/images/b_edit.png" /></a>','menuType' => mysql_result($this -> result,$i,'name'), 'id' => mysql_result($this -> result,$i,'id'),'common' => 'индивидуальное' );
      }
    }
    $this -> get_commonMenu();
    print( str_replace('\/','/',json_encode($this -> json_array)) );
  }
}
$obj = new outputMenuType();
?>