<?php
class authorization
{
  var $id_session = '';
  var $result = '';
  var $accsess;
  
  function authorization()
  {
    include('data/data.php');
    include('outputs/outputAccess.php');
    $this -> accsess = new accsess_analiz();
    if ( $this -> accsess -> rand_password != 'cancel' )
    {
      if ( isset( $_COOKIE['id_session'] ) && $_COOKIE['id_session'] != '' )
      {
        $this -> id_session = $_COOKIE['id_session'];
      }
      else
      {
        if ( isset( $_REQUEST['id_session'] ) )
        {
          $this -> id_session = $_REQUEST['id_session'];
        }
        else
        {
          $this -> id_session = '';
        }
      }
    }
    else
    {
      //Header("Location: index.php");
      //print('<script type="text/javascript">window.location = "../../index.php"</script>');
    }
  }
  
  function run()
  {
    $sql = 'SELECT * FROM session WHERE id_session = \''.$this -> id_session.'\'';
    $this -> result = mysql_query($sql) or die('нет выборки');
    if ( mysql_num_rows($this -> result) > 0 )
    {
      $temp_url = substr($_SERVER['REQUEST_URI'],0,strripos($_SERVER['REQUEST_URI'],'.php'));
      print('<script type="text/javascript" src="js/base.js"></script>');
      switch ( $temp_url )
      {
        case '/index':
        {
          print('<script type="text/javascript" src="js/menu/menuTypeLookup.js"></script>');
          print('<script type="text/javascript" src="js/menu/menuExcelExport.js"></script>');
          print('<script type="text/javascript" src="js/menu/menuExcelImport.js"></script>');
          print('<script type="text/javascript" src="js/menu/menuTypeOperation.js"></script>');
          print('<script type="text/javascript" src="js/menu/menuType.js"></script>');
          print('<script type="text/javascript" src="js/menu/menuOperation.js"></script>');
          print('<script type="text/javascript" src="js/menu/menu.js"></script>');
          break;
        }
        case '/orders':
        {
          print('<script type="text/javascript" src="js/orders_filter.js"></script>');
          print('<script type="text/javascript" src="js/menu/menuTypeLookup.js"></script>');

          print('<script type="text/javascript" src="js/orders/orders.js"></script>');
          print('<script type="text/javascript" src="js/orders/ordersOperation.js"></script>');
          
          print('<script type="text/javascript" src="js/orderLines/orderLines.js"></script>');
          print('<script type="text/javascript" src="js/orderLines/orderLines_AddDish.js"></script>');
          print('<script type="text/javascript" src="js/orderLines/orderLinesOperation.js"></script>');
          break;
        }
      }
    }
  }
}

$auth = new authorization();
?>