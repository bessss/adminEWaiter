<?php
class delete_orderLine
{
  var $id;

  function run()
  {
    $sql = 'DELETE FROM `bessss_ewaiter`.`order_list` WHERE `order_list`.`id` = '.$this -> id.';';
    $result = mysql_query($sql) or die($sql);
  }

  function delete_orderLine()
  {
    include('../data/data.php');
    $this -> id = $_REQUEST['id'];
    $this -> run();
  }
}

$obj = new delete_orderLine();
?>