<?php
class delet_menu
{
  var $id;

  function delet_menu()
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
    $sql = 'DELETE FROM `bessss_ewaiter`.`menu` WHERE `menu`.`id` = '.$this -> id.';';
    $result = mysql_query($sql) or die("zxcv");
    print('Удаление прошло успешно');
  }
}

$obj = new delet_menu();
?>