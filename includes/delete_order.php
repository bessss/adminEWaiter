<?php
class delete_order
{
  var $id;

  function delete_order()
  {
    include('../data/data.php');
    if ( isset( $_REQUEST['id'] ) )
    {
      $this -> id = $_REQUEST['id'];
      $this -> run();
    }
  }

  function run()
  {
    $sql = 'DELETE FROM `bessss_ewaiter`.`orders` WHERE `orders`.`id` = '.$this -> id.';';
    $result = mysql_query($sql) or die("zxcv");
    print('Удаление прошло успешно');
  }
}

$obj = new delete_order();
?>