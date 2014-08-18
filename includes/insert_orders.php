<?php
class input_orders
{
  var $orders;
  var $json_data;
  var $user;
  var $restaurant;
  var $presentUser;
  var $curent_orderId;

  function insert_order()
  {
    $sql = 'INSERT INTO `bessss_ewaiter`.`orders` (`id`, `id_session`, `id_status`, `table`) VALUES (NULL, \''.$this -> presentUser -> id_session.'\',\'1\',\''.$this -> json_data['user'][0]['table'].'\');';
    $result = mysql_query($sql) or die($sql);
    $this -> curent_orderId = mysql_insert_id();
  }

  function insert_orderList()
  {
    for ( $i = 0; $i < count($this -> orders); ++$i )
    {
      $sql = 'INSERT INTO `bessss_ewaiter`.`order_list` (`id`, `id_order`, `id_menu`, `amount`, `status`) VALUES (NULL, \''.$this -> curent_orderId.'\', \''.$this -> orders[$i]['id'].'\', \''.$this -> orders[$i]['amount'].'\', \'1\');';
      $result = mysql_query($sql) or die($sql);
    }
  }

  function input_orders()
  {
    include('../data/data.php');
    include('../outputs/outputRestaurant.php');
    include('../outputs/presentUser.php');

    $this -> json_data = json_decode( $_REQUEST['data'],true );
    $this -> user = $this -> json_data['user'][0];
    $this -> orders = $this -> json_data['order'];

    $this -> restaurant = new output_restaurant();
    $this -> restaurant -> bssid = $this -> json_data['user'][0]['bssid'];
    $this -> restaurant -> run();

    $this -> presentUser = new presentUser();
    $this -> presentUser -> imei = $this -> json_data['user'][0]['imei'];
    $this -> presentUser -> run();

    if ( $this -> restaurant -> id_restaurant != 'cancel' && $this -> presentUser -> id_session != 'cancel' )
    {
      $this -> insert_order();
      $this -> insert_orderList();
    }
  }
}

$obj = new input_orders();
?>