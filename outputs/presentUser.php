<?php
class presentUser
{
  var $imei;
  var $id_session;
  var $day_now;

  function presentUser()
  {
    include('../data/data.php');
    $this -> day_now = date('Y-m-d');
    if ( isset( $_REQUEST['imei'] ) )
    {
      $this -> imei = $_REQUEST['imei'];
      $this -> run();
    }
  }

  function run()
  {
    $sql = 'SELECT * FROM usersinput WHERE imei = \''.$this -> imei.'\' AND time_stop = \'00:00:00\' AND day_start = \''.$this -> day_now.'\'';
    $result = mysql_query($sql) or die($sql);
    if ( mysql_num_rows($result) > 0 )
    {
      $this -> id_session = mysql_result($result,0,'id');
    }
    else
    {
      $this -> id_session = 'cancel';
    }
  }
}
?>