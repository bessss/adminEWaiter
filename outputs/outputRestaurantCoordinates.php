<?php
header("Access-Control-Allow-Origin: *");
//[{"title":"название ресторана","latitude":"59.857877","longitude":"30.39257"},{}]
class outputRestaurantCoordinates
{
  var $json;
  var $jsonResult = array('updateTimeRest' => 15000, 'updateTimeUser' => 5000);

  function get_coordinates()
  {
    $sql = 'SELECT * FROM restaurant JOIN company ON restaurant.id_company = company.id';
    $result = mysql_query($sql) or die($sql);
    if ( mysql_num_rows($result) > 0 )
    {
      for ( $i = 0; $i < mysql_num_rows($result); ++$i )
      {
        $this -> json[$i] = array( 'idRestaurant' => mysql_result($result,$i,'id'),'accuracy' => '100','longitude' => mysql_result($result,$i,'coordinateX'),'latitude' => mysql_result($result,$i,'coordinateY'),'css_name' => mysql_result($result,$i,'css_name'),'timeOpen' => mysql_result($result,$i,'timeOpen'),'timeClose' => mysql_result($result,$i,'timeClose'),'contact' => mysql_result($result,$i,'contact'),'adress' => mysql_result($result,$i,'adress'),'shotName' => mysql_result($result,$i,'shotName'),'title' => mysql_result($result,$i,'shotName'), 'latitude' => mysql_result($result,$i,'coordinateX'), 'longitude' => mysql_result($result,$i,'coordinateY') );
      }
      $this -> jsonResult['restaurant'] = $this -> json;
      print( str_replace('\/','/',json_encode($this -> jsonResult)) );
    }
    else
    {
      print('cancel');
    }
  }

  function outputRestaurantCoordinates()
  {
    include('../data/data.php');
    $this -> get_coordinates();
  }
}

$obj = new outputRestaurantCoordinates();
?>