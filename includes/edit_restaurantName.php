<?php 
class edit_restaurantName
{
  var $shotName;
  var $id_restaurant;

  function edit_restaurantName()
  {
    include('../data/data.php');
    if ( isset($_REQUEST['shotName']) )
    {
      $this -> shotName = $_REQUEST['shotName'];
      $this -> id_restaurant = $_REQUEST['id_restaurant'];
      $this -> run();
    }
  }

  function run()
  {
    $sql = 'UPDATE `bessss_ewaiter`.`restaurant` SET `shotName` = \''.$this -> shotName.'\' WHERE `restaurant`.`id` = '.$this -> id_restaurant.';';
    $result = mysql_query($sql) or die("zxcv");
    print('ok');
  }
}

$obj = new edit_restaurantName();
?>