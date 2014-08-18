<?php
header("Access-Control-Allow-Origin: *");
class outputRestaurantsClose
{
  var $id_restaurant;
  var $id_company;
  var $shotName;
  var $cssName;
  var $json_array = array();
  var $coordinatesUser = array('latitude' => 0,'longitude' => 0,'accuracy' => 0);
  var $coordinatesRestaurant = array('latitude' => 0,'longitude' => 0,'accuracy' => 0);
  var $result = '';
  var $dist = 0;

  function outputRestaurantsClose()
  {
    include('../data/data.php');

    if ( isset( $_REQUEST['longitude'] ) && isset( $_REQUEST['latitude'] ) && isset( $_REQUEST['accuracy'] ) )
    {
      $this -> coordinatesUser = array('latitude' => $_REQUEST['latitude'],'longitude' => $_REQUEST['longitude'],'accuracy' => $_REQUEST['accuracy']);
      $this -> search_restaurant();
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
    $sql = 'SELECT * FROM restaurant JOIN company ON restaurant.id_company = company.id';
    $this -> result = mysql_query($sql) or die($sql);
    if ( mysql_num_rows($this -> result) > 0 )
    {
      for ( $i = 0; $i < mysql_num_rows($this -> result); ++$i )
      {
        $this -> coordinatesRestaurant = array('latitude' => mysql_result($this -> result,$i,'coordinateX'),'longitude' => mysql_result($this -> result,$i,'coordinateY'),'accuracy' => 100);
        $this -> calcDistance();//print('Сумма: '.( $this -> coordinatesRestaurant['accuracy'] + $this -> coordinatesUser['accuracy'] ).' Расстояние: ' .$this -> dist. '!!!');
        if ( ( $this -> coordinatesRestaurant['accuracy'] + $this -> coordinatesUser['accuracy'] ) < $this -> dist )
        {
          
        }
        else
        {
          array_push($this -> json_array,array( 'idRestaurant' => mysql_result($this -> result,$i,'id'),'idCompany' => mysql_result($this -> result,$i,'id_company'),'shotName' => mysql_result($this -> result,$i,'shotName'),'cssName' => mysql_result($this -> result,$i,'css_name')));
        }
      }
      print( str_replace('\/','/',json_encode($this -> json_array)) );
    }
    else
    {
      
    }
  }
}

$obj = new outputRestaurantsClose();
?>