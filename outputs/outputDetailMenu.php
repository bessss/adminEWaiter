<?php
header("Access-Control-Allow-Origin: *");
class outputDetailMenu
{
  var $json_array = array();
  var $result = '';
  var $idMenu = '';
  var $obj_idRestaurant;

  function outputDetailMenu()
  {
    include('../data/data.php');

    if ( isset( $_REQUEST['idMenu'] ) )
    {
      $this -> idMenu = $_REQUEST['idMenu'];
      $this -> getDetailMenu();
    }
  }

  function getDetailMenu()
  {
    $sql = 'SELECT * FROM menu WHERE id = '.$this -> idMenu.'';
    $this -> result = mysql_query($sql) or die($sql);

    if ( mysql_num_rows($this -> result) > 0 )
    {
      $path = 'http://admin.ewaiter.info/'.mysql_result($this -> result,0,'Image');
      $this -> json_array = array( 'removability' => '<a style="cursor: pointer;" onclick="menuObject.menuOperation.menu_Delete(\''.mysql_result($this -> result,0,'id').'\');"><img src="http://ewaiter.info/images/b_drop.png" /></a>','editability' => '<a style="cursor: pointer;" onclick="menuObject.menuOperation.menu_Edit(\'curent\',\'menuTable\');"><img src="http://ewaiter.info/images/b_edit.png" /></a>','name' => mysql_result($this -> result,0,'name'), 'shortDescription' => mysql_result($this -> result,0,'shortDescription'),'path' => $path,'price' => mysql_result($this -> result,0,'price'),'article' => mysql_result($this -> result,0,'id'),'Description' => mysql_result($this -> result,0,'Description'),'energyValuePortion' => mysql_result($this -> result,0,'energyValuePortion'),'energyValue100' => mysql_result($this -> result,0,'energyValue100'));
      print( str_replace('\/','/',json_encode($this -> json_array)) );
      //print( json_encode($this -> json_array) );
    }
    else 
    {
      print('1');
    }
  }
}

$obj = new outputDetailMenu();
?>