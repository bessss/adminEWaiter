<?php
//[{"dish_name":"Название блюда", "dish_amount":"Количество"},{}]
class outputOrderLine
{
  var $bssid;
  var $imei;
  var $id_order;
  var $presentUser;
  var $json_array;
  var $json;

  function run()
  {
    $sql = 'SELECT * FROM order_list JOIN menu ON order_list.id_menu = menu.id AND order_list.id_order = \''.$this -> id_order.'\'';
    $result = mysql_query($sql) or die($sql);
    if ( mysql_num_rows($result) > 0 )
    {
      for ( $i = 0; $i < mysql_num_rows($result); ++$i )
      {
        $this -> json[$i]['removability'] = '<a style="cursor: pointer;" onclick="orderLinesObject.orderLinesOperation.orderLines_Delete(\''.mysql_result($result,$i,'order_list.id').'\');"><img src="http://ewaiter.info/images/b_drop.png" /></a>';
        $this -> json[$i]['editability'] = '<a style="cursor: pointer;" onclick="orderLinesObject.orderLinesOperation.orderLines_Edit(\''.mysql_result($result,$i,'order_list.id').'\');"><img src="http://ewaiter.info/images/b_edit.png" /></a>';
        $this -> json[$i]['id_orderList'] = mysql_result($result,$i,'order_list.id');
        $this -> json[$i]['dish_name'] = mysql_result($result,$i,'name');
        $this -> json[$i]['dish_amount'] = mysql_result($result,$i,'amount');
        $this -> json[$i]['price'] = mysql_result($result,$i,'price')*mysql_result($result,$i,'amount');
      }
    }
    print( json_encode($this -> json) );
  }

  function outputOrderLine()
  {
    include('../data/data.php');
    include('presentUser.php');
    $this -> presentUser = new presentUser();
    if ( isset($_REQUEST['bssid']) && isset($_REQUEST['imei']) && isset($_REQUEST['id_order']) && $this -> presentUser -> id_session != 'cancel' )
    {
      $this -> imei = $_REQUEST['imei'];
      $this -> bssid = $_REQUEST['bssid'];
      $this -> id_order = $_REQUEST['id_order'];
      $this -> run();
    }
    else
    {
      if ( isset( $_REQUEST['oper'] ) && isset( $_REQUEST['id_order'] ) )
      {
        $this -> id_order = $_REQUEST['id_order'];
        $this -> run();
      }
    }
  }
}

$obj = new outputOrderLine();
?>