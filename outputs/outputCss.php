<?php
header("Access-Control-Allow-Origin: *");
class outputCss
{
  var $obj_idRestaurant;

  function outputCss()
  {
    include('../data/data.php');
    include('outputRestaurant.php');
    $this -> obj_idRestaurant = new output_restaurant();
  
    $this -> getCss();
  }

  function getCss()
  {
    print( '<link rel="stylesheet" type="text/css" href="css/title_'.$this -> obj_idRestaurant -> cssName.'.css" />' );
    print( '<link rel="stylesheet" type="text/css" href="css/menuLeft_'.$this -> obj_idRestaurant -> cssName.'.css" />' );
    print( '<link rel="stylesheet" type="text/css" href="css/menuType_'.$this -> obj_idRestaurant -> cssName.'.css" />' );
  }
}

$obj = new outputCss();
?>