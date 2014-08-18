<?php
class orderLines_Edit
{
  var $order = array();

  function orderLines_Edit()
  {
    include('../data/data.php');
    $this -> orderList['id'] = $_REQUEST['id_orderList'];
    $this -> orderList['dish_amount'] = $_REQUEST['dish_amount'];

    if ( $this -> orderList['dish_amount'] == '0' )
    {
      $this -> remove();
    }
    else
    {
      $this -> update();
    }
    
  }

  function remove()
  {
    $sql = 'DELETE FROM `bessss_ewaiter`.`order_list` WHERE `order_list`.`id` = \''.$this -> orderList['id'].'\';';
    $result = mysql_query($sql) or die($sql);
    print('{"success": true, "message": "Данные удалены"}');
  }

  function update()
  {
    $sql = 'UPDATE `bessss_ewaiter`.`order_list` SET `amount` = \''.$this -> orderList['dish_amount'].'\' WHERE `order_list`.`id` = '.$this -> orderList['id'].';';
    $result = mysql_query($sql) or die($sql);

    if ( mysql_insert_id() != '' )
    {
      print('{"success": true, "message": "Данные успешно внесены"}');
    }
  }
}

$obj = new orderLines_Edit();
?>