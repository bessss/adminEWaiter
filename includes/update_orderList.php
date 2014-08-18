<?php
class update_orderList
{
  var $order;

  function run()
  {
    for ( $i = 1; $i < count($this -> order); ++$i )
    {
      $sql = 'INSERT INTO `bessss_ewaiter`.`order_list` (`id`, `id_order`, `id_menu`, `amount`, `status`) VALUES (NULL, \''.$this -> order['id_order'].'\', \''.$this -> order[$i]['id_menu'].'\', \''.$this -> order[$i]['amount'].'\', \'1\');';
      $result = mysql_query($sql) or die($sql);
    }
  }

  function update_orderList()
  {
    include('../data/data.php');
    $this -> order = json_decode( $_REQUEST['data'],true );
    $this -> order['id_order'] = $this -> order[0]['id_order'];
    $this -> run();
  }
}

$obj = new update_orderList();
?>