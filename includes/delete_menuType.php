<?php
class delete_menuType
{
  var $id_del;

  function delete_menuType()
  {
    include('../data/data.php');
    if ( isset($_REQUEST['id']) )
    {
      $this -> id_del = $_REQUEST['id'];
      $this -> run();
    }
  }

  function run()
  {
    $sql = 'DELETE FROM `bessss_ewaiter`.`menutype` WHERE `menutype`.`id` = '.$this -> id_del.';';
    $result = mysql_query($sql) or die("zxcv");
  }
}
$obj = new delete_menuType();
?>