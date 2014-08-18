<?php
class edit_order
{
  var $order = array();

  function edit_order()
  {
    include('../data/data.php');
    $this -> order['id'] = $_REQUEST['orders_id'];
    $this -> order['table'] = $_REQUEST['table'];
    $this -> order['order_status'] = $_REQUEST['order_status-inputEl'];
    $this -> order['user_status'] = $_REQUEST['user_status-inputEl'];
    $this -> order['Description'] = $_REQUEST['Description'];
    $this -> order['id_restaurant'] = $_REQUEST['id_restaurant'];
    $this -> order['imei'] = $_REQUEST['imei'];

    $this -> run();
  }

  function run()
  {
    $sql = 'UPDATE `bessss_ewaiter`.`orders` SET `id_status` = \''.$this -> order['order_status'].'\',`table` = \''.$this -> order['table'].'\' WHERE `orders`.`id` = '.$this -> order['id'].';';
    $result = mysql_query($sql) or die($sql);

    $sql2 = 'INSERT INTO `bessss_ewaiter`.`blacklist` (`id`, `id_company`, `id_restaurant`, `date`, `imei`, `block`, `description`) VALUES (NULL, \'0\', \''.$this -> order['id_restaurant'].'\', \''.date('Y-m-d').'\', \''.$this -> order['imei'].'\', \''.$this -> order['user_status'].'\', \''.$this -> order['Description'].'\');';
    $result2 = mysql_query($sql2) or die($sql2);

    if ( mysql_insert_id() != '' )
    {
      print('{"success": true, "message": "Данные успешно внесены"}');
    }
  }
}

$obj = new edit_order();
?>