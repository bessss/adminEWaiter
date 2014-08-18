<?php
  $array = array();
  $json_array = array();

  //function getCoordinates()
  //{
    if ( isset($_REQUEST["mobile"]) )
    {
      include('../data/data.php');
    }
    else
    {
      include('../data/data.php');
    }

    $sql = "select * from bessss_ewaiter.restaurant join bessss_ewaiter.company on bessss_ewaiter.restaurant.id_company = bessss_ewaiter.company.id";
    $result = mysql_query($sql) or die("нет выборки");

    if ( mysql_num_rows($result) > 0 )
    {
      for ( $i = 0; $i < mysql_num_rows($result); ++$i )
      {
        $array[$i] = array( 'css_name' => mysql_result($result,$i,'css_name'),'coordinateX' => mysql_result($result,$i,'coordinateX'), 'coordinateY' => mysql_result($result,$i,'coordinateY'),'shotName' => mysql_result($result,$i,'shotName'), 'adress' => mysql_result($result,$i,'adress'), 'contact' => mysql_result($result,$i,'contact'));
        //$json_array = 
      }
    }

    /*if ( mysql_num_rows($result) > 0 )
    {
      for ( $i = 3; $i < 5; ++$i )
      {
        $array[$i] = array( 'coordinateX' => mysql_result($result,$i-3,'coordinateX'), 'coordinateY' => mysql_result($result,$i-3,'coordinateY'),'shotName' => mysql_result($result,$i-3,'shotName'), 'adress' => mysql_result($result,$i-3,'adress'), 'contact' => mysql_result($result,$i-3,'contact'));
        //$json_array = 
      }
    }*/

    print( json_encode($array) );
  //}

  //getCoordinates();
?>