<?php
class output_restaurant
{
  var $id_restaurant;
  var $bssid;
  var $id_company;
  var $shotName;
  var $cssName;
  var $server;
  var $coordinatesUser = array('latitude' => 0,'longitude' => 0,'accuracy' => 0);
  var $coordinatesRestaurant = array('latitude' => 0,'longitude' => 0,'accuracy' => 0);
  var $result = '';
  var $dist = 0;

  function output_restaurant()
  {
    include('../data/data.php');

    if ( isset( $_REQUEST['bssid'] ) )
    {
      $this -> bssid = str_replace('"', '', $_REQUEST['bssid']);
      $this -> run();
    }

    if ( isset( $_REQUEST['longitude'] ) && isset( $_REQUEST['latitude'] ) && isset( $_REQUEST['accuracy'] ) && isset( $_REQUEST['idRestaurant'] ) )
    {
      $this -> coordinatesUser = array('latitude' => $_REQUEST['latitude'],'longitude' => $_REQUEST['longitude'],'accuracy' => $_REQUEST['accuracy']);
      $this -> id_restaurant = $_REQUEST['idRestaurant'];
      $this -> search_restaurant();
    }
  }

  function run()
  {
    $sql = 'SELECT * FROM restaurant WHERE network = \''.$this -> bssid.'\'';
    $result = mysql_query($sql) or die($sql);
    if ( mysql_num_rows($result) > 0 )
    {
      $this -> id_restaurant = mysql_result($result,0,'id');
      $this -> id_company = mysql_result($result,0,'id_company');
      $this -> server = mysql_result($result,0,'serverresponse');
      $this -> shotName = mysql_result($result,0,'shotName');
    }
    else
    {
      $this -> id_restaurant = 'cancel';
      $this -> id_company = 'cancel';
      $this -> server = 'offline';
      $this -> shotName = 'noneName';
    }
  }

  function calcDistance()
  {
    $earth_radius = 6372795;
    // перевести координаты в радианы
    $lat1 = $this -> coordinatesUser['latitude'] * M_PI / 180;
    $lat2 = $this -> coordinatesRestaurant['latitude'] * M_PI / 180;
    $long1 = $this -> coordinatesUser['longitude'] * M_PI / 180;
    $long2 = $this -> coordinatesRestaurant['longitude'] * M_PI / 180;

    // косинусы и синусы широт и разницы долгот
    $cl1 = cos($lat1);
    $cl2 = cos($lat2);
    $sl1 = sin($lat1);
    $sl2 = sin($lat2);
    $delta = $long2 - $long1;
    $cdelta = cos($delta);
    $sdelta = sin($delta);

    // вычисления длины большого круга
    $y = sqrt(pow($cl2 * $sdelta, 2) + pow($cl1 * $sl2 - $sl1 * $cl2 * $cdelta, 2));
    $x = $sl1 * $sl2 + $cl1 * $cl2 * $cdelta;

    $ad = atan2($y, $x);
    $this -> dist = $ad * $earth_radius;
  }

  function search_restaurant()
  {
/*    $sql = 'SELECT * FROM restaurant JOIN company ON restaurant.id_company = company.id';
    $this -> result = mysql_query($sql) or die($sql);
    if ( mysql_num_rows($this -> result) > 0 )
    {
      for ( $i = 0; $i < mysql_num_rows($this -> result); ++$i )
      {
        $this -> coordinatesRestaurant = array('latitude' => mysql_result($this -> result,$i,'coordinateX'),'longitude' => mysql_result($this -> result,$i,'coordinateY'),'accuracy' => 100);
        $this -> calcDistance();//print('Сумма: '.( $this -> coordinatesRestaurant['accuracy'] + $this -> coordinatesUser['accuracy'] ).' Расстояние: ' .$this -> dist. '!!!');
        if ( ( $this -> coordinatesRestaurant['accuracy'] + $this -> coordinatesUser['accuracy'] ) < $this -> dist )
        {
          $this -> id_restaurant = 99999;
          $this -> id_company = 99999;
          $this -> server = 'offline';
          $this -> shotName = 'noneName';
          $this -> cssName = 'default';
        }
        else
        {
          $this -> id_restaurant = mysql_result($this -> result,$i,'id');
          $this -> id_company = mysql_result($this -> result,$i,'id_company');
          $this -> server = mysql_result($this -> result,$i,'serverresponse');
          $this -> shotName = mysql_result($this -> result,$i,'shotName');
          $this -> cssName = mysql_result($this -> result,$i,'css_name');
          break;
        }
      }
    }
    else
    {
      
    }*/
    $sql = 'SELECT * FROM restaurant JOIN company ON restaurant.id_company = company.id WHERE restaurant.id = \''.$this -> id_restaurant.'\'';
    $this -> result = mysql_query($sql) or die($sql);

    if ( mysql_num_rows($this -> result) > 0 )
    {
      $this -> id_company = mysql_result($this -> result,0,'id_company');
      $this -> server = mysql_result($this -> result,0,'serverresponse');
      $this -> shotName = mysql_result($this -> result,0,'shotName');
      $this -> cssName = mysql_result($this -> result,0,'css_name');
    }
    else
    {
      $this -> id_company = 777;
      $this -> server = 7777;
      $this -> shotName = 77777;
      $this -> cssName = 777777;
    }


  }
}
?>