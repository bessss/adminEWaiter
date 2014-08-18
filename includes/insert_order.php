<?php
class insert_order
{
  function insert_order()
  {
    include('../../data/data.php');
    if ( isset( $_REQUEST['order'] ) )
    {
      $sql = 'INSERT INTO `bessss_ewaiter`.`test` (`full_text`) VALUES (\''.$_REQUEST['order'].'\');';
    }
    else
    {
      $sql = 'INSERT INTO `bessss_ewaiter`.`test` (`full_text`) VALUES (\'Ничего нет\');';
    }
    $result = mysql_query($sql) or die("zxcv");;
  }
}

$obj = new insert_order();
?>