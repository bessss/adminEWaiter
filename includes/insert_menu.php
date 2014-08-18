<?php
class processing_img
{
  var $val_img;
  var $userfile_name;
  var $userfile_size;
  var $userfile_type;
  var $userfile_orig_name;

  var $dir;

  var $img_name;

  function validate_image()
  {
    if ($this -> userfile_size <> 0)
    {
      if ($this -> userfile_type == 'image/gif' || $this -> userfile_type == 'image/jpeg' || $this -> userfile_type == 'image/png')
      {
        $this -> val_img = true;
      }
      else
      {
        $this -> val_img = false;
      }
    }
    else
    {
      $this -> val_img = false;
    }
  }

  function save_img($width,$height)
  {
    $temp_position = strrpos($this -> userfile_orig_name,'.');
    $temp_extension = substr($this -> userfile_orig_name,$temp_position);

    if ( file_exists( '../'.$this -> dir ) == false )
    {
      mkdir('../'.$this -> dir, 0777,true);
    }

    switch ( $temp_extension )
    {
      case '.jpg':
      {
        $img = imagecreatefromjpeg($this -> userfile_name);
        $im1 = imagecreatetruecolor($width,$height);
        $img_x = imagesx($img);
        $img_y = imagesy($img);
        imagecopyresampled($im1,$img,0,0,0,0,$width,$height,$img_x,$img_y);
        imagejpeg($img,'../'.$this -> dir.$this -> img_name.'.jpg',45);
        break;
      }
      case '.gif':
      {
        $img = imagecreatefromgif($this -> userfile_name);
        $im1 = imagecreatetruecolor($width,$height);
        $img_x = imagesx($img);
        $img_y = imagesy($img);
        imagecopyresampled($im1,$img,0,0,0,0,$width,$height,$img_x,$img_y);
        imagegif($img,'../'.$this -> dir.$this -> img_name.'.gif');
        break;
      }
      case '.png':
      {
        $img = imagecreatefrompng($this -> userfile_name);
        $im1 = imagecreatetruecolor($width,$height);
        $img_x = imagesx($img);
        $img_y = imagesy($img);
        imagecopyresampled($im1,$img,0,0,0,0,$width,$height,$img_x,$img_y);
        imagepng($img,'../'.$this -> dir.$this -> img_name.'.png',5);
        break;
      }
    }
  }

  function edit_image()
  {
    if ( $this -> val_img == true )
    {
      $size = getimagesize($this -> userfile_name);
      if ( $size[0] > 300 )
      {
        $raznitsa_w = $size[0] - 300;
        if ( $size[0] < $size[1] )
        {
          $otnohenie = $size[1]/$size[0];
          $raznitsa_h = round($raznitsa_w*$otnohenie);
        }
        else
        {
          $otnohenie = $size[0]/$size[1];
          $raznitsa_h = round($raznitsa_w/$otnohenie);
        }
        $width = $size[0] - $raznitsa_w;
        $height = $size[1] - $raznitsa_h;
      }
      else
      {
        $width = $size[0];
        $height = $size[1];
      }

      $this -> save_img($width,$height);
    }
  }

  function processing_img($img_name,$dir)
  {
    include('../data/data.php');

    $this -> img_name = $img_name;
    $this -> dir = $dir;

    if ( isset($_FILES['img']) )
    {
      $this -> userfile_name = $_FILES['img']['tmp_name'];
      $this -> userfile_size = $_FILES['img']['size'];
      $this -> userfile_type = $_FILES['img']['type'];
      $this -> userfile_orig_name = $_FILES['img']['name'];
      
      $this -> validate_image();
      $this -> edit_image();
    }
  }
}

class insert_menu
{
  var $menu = array(
    'id' => '',
    'name' => '',
    'shortDescription' => '',
    'Description' => '',
    'price' => '',
    'img' => '',
    'menuType' => ''
  );
  var $id_restaurant;
  var $dir;
  var $curentID;
  var $extension = '';
  var $randName;

  function generateName($length = 8)
  {
    $chars = 'abdefhiknrstyzABDEFGHKNQRSTYZ23456789';
    $numChars = strlen($chars);
    $this -> randName = '';
    for ($i = 0; $i < $length; $i++)
    {
      $this -> randName .= substr($chars, rand(1, $numChars) - 1, 1);
    }
  }

  function new_menu()
  {
    $sql = 'INSERT INTO `bessss_ewaiter`.`menu` (`id`, `id_menuType`, `article`, `name`, `shortDescription`, `Description`, `energyValuePortion`, `energyValue100`, `image`, `price`) VALUES (NULL, \''.$this -> menu['menuType'].'\', \'0\', \''.$this -> menu['name'].'\', \''.$this -> menu['shortDescription'].'\', \''.$this -> menu['Description'].'\', \''.$this -> menu['energyValuePortion'].'\', \''.$this -> menu['energyValue100'].'\', \''.$this -> dir.$this -> randName.$this -> extension.'\', \''.$this -> menu['price'].'\');';
    $result = mysql_query($sql) or die($sql);
    $this -> curentID = mysql_insert_id();
    $this -> obj = new processing_img( $this -> randName,$this -> dir );
  }

  function update_menu()
  {
    if ( isset($_FILES['img']) )
    {
      $sql = 'UPDATE `bessss_ewaiter`.`menu` SET `image` = \''.$this -> dir.$this -> randName.$this -> extension.'\',`id_menuType` = \''.$this -> menu['menuType'].'\',`price` = \''.$this -> menu['price'].'\',`name` = \''.$this -> menu['name'].'\',`Description` = \''.$this -> menu['Description'].'\',`shortDescription` = \''.$this -> menu['shortDescription'].'\',`energyValuePortion` = \''.$this -> menu['energyValuePortion'].'\',`energyValue100` = \''.$this -> menu['energyValue100'].'\' WHERE `menu`.`id` = '.$this -> menu['id'].';';
    }
    else
    {
      $sql = 'UPDATE `bessss_ewaiter`.`menu` SET `id_menuType` = \''.$this -> menu['menuType'].'\',`price` = \''.$this -> menu['price'].'\',`name` = \''.$this -> menu['name'].'\',`Description` = \''.$this -> menu['Description'].'\',`shortDescription` = \''.$this -> menu['shortDescription'].'\',`energyValuePortion` = \''.$this -> menu['energyValuePortion'].'\',`energyValue100` = \''.$this -> menu['energyValue100'].'\' WHERE `menu`.`id` = '.$this -> menu['id'].';';
    }
    $result = mysql_query($sql) or die($sql);
    $this -> curentID = $this -> menu['id'];
    $this -> obj = new processing_img( $this -> randName,$this -> dir );
  }

  function get_company()
  {
    $sql = 'SELECT * FROM restaurant WHERE restaurant.id = \''.$this -> id_restaurant.'\'';
    $result = mysql_query($sql) or die($sql);
    if ( mysql_num_rows($result) > 0 )
    {
      $this -> id_company = mysql_result($result,0,'id_company');
    }
    else
    {
      $this -> id_company = 0;
    }

    $this -> dir = 'data/companyImages/'.$this -> id_company.'/restaurant/'.$this -> id_restaurant.'/menuImages/';

    if ( file_exists( '../'.$this -> dir ) == false )
    {
      mkdir('../'.$this -> dir, 0777,true);
    }
  }

  function run()
  {
    if ( isset($_FILES['img']) )
    {
      $temp_position = strrpos($_FILES['img']['name'],'.');
      $this -> extension = substr($_FILES['img']['name'],$temp_position);
    }

    $this -> get_company();

    if ( $this -> menu['id'] == 'new' )
    {
      $this -> new_menu();
    }
    else
    {
      $this -> update_menu();
    }
  }

  function insert_menu()
  {
    include('../data/data.php');

    if ( isset( $_REQUEST['id'] ) )
    {
      $this -> menu['id'] = $_REQUEST['id'];
      $this -> menu['name'] = $_REQUEST['name'];
      $this -> menu['shortDescription'] = $_REQUEST['shortDescription'];
      $this -> menu['Description'] = $_REQUEST['Description'];
      $this -> menu['price'] = $_REQUEST['price'];
      $this -> menu['menuType'] = $_REQUEST['menuType-inputEl'];
      $this -> menu['energyValuePortion'] = $_REQUEST['energyValuePortion'];
      $this -> menu['energyValue100'] = $_REQUEST['energyValue100'];
      $this -> id_restaurant = $_REQUEST['id_restaurant'];

      if ( isset($_REQUEST['noAuto']) == false )
      {
        $this -> generateName();
        $this -> run();
        print('{"success": true, "message": "Данные успешно внесены"}');
      }
    }
  }
}

$obj = new insert_menu();
?>