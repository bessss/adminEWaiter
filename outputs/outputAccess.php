<?php
class accsess_analiz
{
  var $login = '';
  var $password = '';
  var $result = '';
  var $session_result = '';
  var $id_restaurant = array(
    'name' => '',
    'id' => '',
    'bssid' => ''
  );
  var $rand_password = 'cancel';

  function accsess_analiz()
  {
    //include('data/data.php');
    if ( isset($_REQUEST['login']) && isset($_REQUEST['password']))
    {
      $this -> login = $_REQUEST['login'];
      $this -> password = $_REQUEST['password'];
      $this -> run();
    }
  }

  function generatePassword($length = 8)
  {
    $chars = 'abdefhiknrstyzABDEFGHKNQRSTYZ23456789';
    $numChars = strlen($chars);
    $this -> rand_password = '';
    for ($i = 0; $i < $length; $i++)
    {
      $this -> rand_password .= substr($chars, rand(1, $numChars) - 1, 1);
    }
  }

  function print_information()
  {
    print('<div id="service_information" style="display: none;">{"name_restorant":"'.$this -> id_restaurant['name'].'","id_restorant":"'.$this -> id_restaurant['id'].'","bssid":"'.$this -> id_restaurant['bssid'].'"}</div>');
  }

  function print_result()
  {
    if ( isset( $_REQUEST['oper'] ) )
    {
      print($this -> rand_password);
    }
  }

  function create_session()
  {
    $sql = 'INSERT INTO session (`id`, `id_session`, `id_restoran`, `date`, `time`) VALUES (NULL, \''.$this -> rand_password.'\', \''.$this -> id_restaurant.'\', \'2013-11-13\', \'13:15\')';
    $this -> session_result = mysql_query($sql) or die("нет вставки");
  }

  function run()
  {
    $sql = 'SELECT * FROM restaurant WHERE login = \''.$this -> login.'\' and password = \''.$this -> password.'\'';
    $this -> result = mysql_query($sql) or die($sql);
    if ( mysql_num_rows($this -> result) > 0 )
    {
      $this -> id_restaurant['id'] = mysql_result($this -> result,0,'id');
      $this -> id_restaurant['name'] = mysql_result($this -> result,0,'shotName');
      $this -> id_restaurant['bssid'] = mysql_result($this -> result,0,'network');
      $this -> generatePassword();
      if ( isset( $_REQUEST['oper'] ) )
      {
        $this -> create_session();
      }
    }
    else
    {
      $this -> rand_password = 'cancel';
    }
    $this -> print_result();
  }
}

if ( isset( $_REQUEST['oper'] ) )
{
  $obj = new accsess_analiz();
}
?>