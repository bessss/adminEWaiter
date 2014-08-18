<?php
//[{"order_id" : "номер заказа", "order_dishes" : "перечень блюд в заказе (через запятую!!!!)", "order_total" : "Сумма заказа", "order_status" : "Статус заказа"}, { ....}]
class outputOrders
{
  var $bssid;
  var $imei;
  var $presentUser;
  var $json_array;
  var $json;
  var $accsess;
  var $day;
  var $ordersFilter = array();
  var $checkBlackList = 'разблокирован';

  function run()
  {
    $sql = 'SELECT * FROM orders WHERE orders.id_session = \''.$this -> presentUser -> id_session.'\'';
    $result = mysql_query($sql) or die($sql);
    if ( mysql_num_rows($result) > 0 )
    {
      for ( $i = 0; $i < mysql_num_rows($result); ++$i )
      {
        $this -> json[$i]['order_id'] = mysql_result($result,$i,'id');
        $sql2 = 'SELECT * FROM order_list JOIN menu ON order_list.id_menu = menu.id WHERE order_list.id_order = \''.mysql_result($result,$i,'id').'\'';
        $result2 = mysql_query($sql2) or die($sql2);
        for ( $z = 0; $z < mysql_num_rows($result2); ++$z )
        {
          $this -> json[$i]['order_dishes'] .= (','.mysql_result($result2,$z,'name'));
        }
        $this -> json[$i]['order_total'] = '123';
        $this -> json[$i]['order_status'] = '1';
      }
    }
    print( json_encode($this -> json) );
  }

  function outputOrders()
  {
    include('../data/data.php');
    include('presentUser.php');
    include('outputAccess.php');

    $this -> accsess = new accsess_analiz();
    $this -> presentUser = new presentUser();

    if ( isset($_REQUEST['bssid']) && isset($_REQUEST['imei']) && $this -> presentUser -> id_session != 'cancel' )
    {
      $this -> imei = $_REQUEST['imei'];
      $this -> bssid = $_REQUEST['bssid'];
      $this -> run();
    }
    else
    {
      //if ( $this -> accsess -> rand_password != 'cancel' )
      //{
        if ( isset($_REQUEST['tableId']) == false )
        {
          $this -> ordersFilter['table'] = '';
        }
        else
        {
          if ( $_REQUEST['tableId'] == '0' )
          {
            $this -> ordersFilter['table'] = '';
          }
          else 
          {
            $this -> ordersFilter['table'] = ' AND orders.table = '.$_REQUEST['tableId'];
          }
        }
        if ( isset($_REQUEST['fromDay']) == false ){$this -> ordersFilter['fromDay'] = date('Y-m-d');}else{$this -> ordersFilter['fromDay'] = $_REQUEST['fromDay'];}
        if ( isset($_REQUEST['toDay']) == false ){$this -> ordersFilter['toDay'] = date('Y-m-d');}else{$this -> ordersFilter['toDay'] = $_REQUEST['toDay'];}
        if ( isset($_REQUEST['fromTime']) == false ){$this -> ordersFilter['fromTime'] = '00:00:00';}else{$this -> ordersFilter['fromTime'] = $_REQUEST['fromTime'];}
        if ( isset($_REQUEST['toTime']) == false ){$this -> ordersFilter['toTime'] = '23:59:59';}else{$this -> ordersFilter['toTime'] = $_REQUEST['toTime'];}
        $this -> get_orders();
      //}
    }
  }

  function set_sql_substr()
  {
    if ( $this -> ordersFilter['tableId'] != '' )
    {
      $this -> ordersFilter['tableId'] = ' AND tableId = '.$this -> ordersFilter['tableId'];
    }
  }

  function check_blacklist($imei)
  {
    $sql = 'SELECT * FROM blacklist WHERE imei = \''.$imei.'\' ORDER BY id DESC';
    $result = mysql_query($sql) or die($sql);
    if ( mysql_num_rows($result) > 0 )
    {
      if ( mysql_result($result,0,'block') == '1' )
      {
        $this -> checkBlackList = 'заблокирован';
      }
      else
      {
        $this -> checkBlackList = 'разблокирован';
      }
    }
    else
    {
      $this -> checkBlackList = 'разблокирован';
    }
  }

  function get_orders()
  {
    $sql = 'SELECT * FROM orders JOIN usersinput ON usersinput.id = orders.id_session JOIN status ON orders.id_status = status.id WHERE usersinput.day_start BETWEEN \''.$this -> ordersFilter['fromDay'].'\' AND \''.$this -> ordersFilter['toDay'].'\' AND usersinput.time_start >= \''.$this -> ordersFilter['fromTime'].'\' AND usersinput.time_stop <= \''.$this -> ordersFilter['toTime'].'\''.$this -> ordersFilter['table'];
    $result = mysql_query($sql) or die($sql);
    if ( mysql_num_rows($result) > 0 )
    {
      for ( $i = 0; $i < mysql_num_rows($result); ++$i )
      {
        $this -> check_blacklist( mysql_result($result,$i,'imei') );
        $this -> json[$i] = array( 'removability' => '<a style="cursor: pointer;" onclick="ordersObject.ordersOper.order_Delete(\''.mysql_result($result,$i,'orders.id').'\');"><img src="http://ewaiter.info/images/b_drop.png" /></a>','editability' => '<a style="cursor: pointer;" onclick="ordersObject.ordersOper.order_Edit(0,\'ordersTable\');"><img src="http://ewaiter.info/images/b_edit.png" /></a>','imei' => mysql_result($result,$i,'imei'), 'day_start' => mysql_result($result,$i,'day_start'), 'time_start' => mysql_result($result,$i,'time_start'), 'time_stop' => mysql_result($result,$i,'time_stop'), 'orders_id' => mysql_result($result,$i,'orders.id'), 'table' => mysql_result($result,$i,'orders.table'), 'order_status' => mysql_result($result,$i,'status.name'), 'user_status' => $this -> checkBlackList);
      }
      print( json_encode($this -> json) );
    }
  }
}

$obj = new outputOrders();
?>