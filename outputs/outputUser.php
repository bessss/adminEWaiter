<?php
class userPresence
{
  var $imei;
  var $bssid;
  var $day_now;
  var $time_now;
  var $id_restaurant;

  function userPresence()
  {
    if ( isset( $_REQUEST['imei'] ) && isset( $_REQUEST['bssid'] ) )
    {
      include('../data/data.php');
      $this -> day_now = date('Y-m-d');
      $this -> time_now = strtotime(date('H:i:s')) + 300;
      $this -> imei = $_REQUEST['imei'];
      $this -> bssid = $_REQUEST['bssid'];

      $this -> check_blacklist();
    }
  }

  function insert_bssid()
  {
    $sql = 'INSERT INTO `bessss_ewaiter`.`test` (`full_text`) VALUES (\''.$this -> bssid.'\');';
    $result = mysql_query($sql) or die("zxcv");
  }

  function restaurant_existence()
  {
    $this -> insert_bssid();

    $sql = 'SELECT * FROM restaurant WHERE network = \''.$this -> bssid.'\'';
    $result = mysql_query($sql) or die("zxcv");
    if ( mysql_num_rows($result) > 0 )
    {
      $this -> id_restaurant = mysql_result($result,0,'id');
      $this -> update_oneself();
      $this -> search_missing_user();
      print('ok');
    }
    else
    {
      print('access denied');
    }
  }

  function stop_user($id)
  {
    $sql = 'UPDATE `bessss_ewaiter`.`usersinput` SET `time_stop` = \''.date('H:i:s').'\' WHERE `usersinput`.`id` = '.$id.';';
    $result = mysql_query($sql) or die("zxcv1");
  }

  function update_oneself()
  {
    $sql = 'SELECT * FROM usersinput WHERE imei = \''.$this -> imei.'\' AND time_stop = \'00:00:00\' AND day_start = \''.$this -> day_now.'\'';
    $result = mysql_query($sql) or die("zxcv2");
    if ( mysql_num_rows($result) > 0 )
    {
      $sql2 = 'UPDATE `bessss_ewaiter`.`usersinput` SET `time_start` = \''.date('H:i:s').'\' WHERE `usersinput`.`id` = '.mysql_result($result,0,'id').';';
      $result2 = mysql_query($sql2) or die("zxcv3");
    }
    else
    {
      $sql = 'INSERT INTO `bessss_ewaiter`.`usersinput` (`imei`, `day_start`,`time_start`, `time_stop`, `id_order`, `id_restaurant`) VALUES (\''.$this -> imei.'\', \''.$this -> day_now.'\',\''.date('H:i:s').'\', \'00:00:00\', NULL, \''.$this -> id_restaurant.'\');';
      $result = mysql_query($sql) or die("zxcv");
    }
  }

  function check_blacklist()
  {
    $sql = 'SELECT * FROM blacklist WHERE imei = \''.$this -> imei.'\' ORDER BY id DESC';
    $result = mysql_query($sql) or die($sql);
    if ( mysql_num_rows($result) > 0 )
    {
      if ( mysql_result($result,0,'block') == '1' )
      {
        print('access denied');
      }
      else
      {
        $this -> restaurant_existence();
      }
    }
    else
    {
      $this -> restaurant_existence();
    }
  }

  function search_missing_user()
  {
    $sql = 'SELECT * FROM usersinput WHERE time_stop = "00:00:00" AND day_start = \''.$this -> day_now.'\'';
    $result = mysql_query($sql) or die($sql);
    if ( mysql_num_rows($result) > 0 )
    {
      for ( $i = 0; $i < mysql_num_rows($result); ++$i )
      {
        if ( ( strtotime( mysql_result($result,$i,'time_start') ) + 360 ) < $this -> time_now )
        {
          $this -> stop_user( mysql_result($result,$i,'id') );
        }
      }
    }
  }
}

$obj = new userPresence();
?>