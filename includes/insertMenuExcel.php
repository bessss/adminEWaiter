<?php
class insertMenuExcel
{
  var $excelFileName;
  var $columnCount;
  var $rowCount;
  var $obj_insertMenu;
  var $obj_insertMenuType;
  var $id_restorant;
  var $sheet;

  function run()
  {
    $xls = PHPExcel_IOFactory::load($this -> excelFileName);
    $xls -> setActiveSheetIndex(0);
    $this -> sheet = $xls -> getActiveSheet();

    $this -> columnCount = $this -> sheet -> getHighestColumn();
    $this -> rowCount = $this -> sheet -> getHighestRow();

    $temp = '';
    $arrayLabel = array("A","B","C","D","E","F");
    for ( $i = 2; $i <= $this -> rowCount; ++$i )
    {
      switch ( $this -> sheet -> getCell('A'.$i) -> getValue() )
      {
        case 'Раздел':
        {
          $this -> insertMenuType($i);
          break;
        }
        case 'ID':
        {
          break;
        }
        default:
        {
          if ( $this -> sheet -> getCell('D'.$i) -> getValue() == 'Индивидуальное' || $this -> sheet -> getCell('D'.$i) -> getValue() == 'Общее' )
          {
            $this -> insertMenuType($i);
          }
          else
          {
            $this -> insertMenu($i);
          }
          break;
        }
      }
    }
  }

  function insertMenuType($i)
  {
    if ( $this -> sheet -> getCell('C'.$i) -> getValue() == '' )
    {
      $this -> obj_insertMenuType -> id = 'new';
    }
    else 
    {
      $this -> obj_insertMenuType -> id = $this -> sheet -> getCell('C'.$i) -> getValue();
    }
    $this -> obj_insertMenuType -> json_array = json_decode( '[{"menuType":"'.$this -> sheet -> getCell('B'.$i) -> getValue().'","id":"'.$this -> sheet -> getCell('C'.$i) -> getValue().'"},{"id_restorant":"'.$this -> id_restorant.'"}]' );
    $this -> obj_insertMenuType -> menuType = $this -> sheet -> getCell('B'.$i) -> getValue();
    $this -> obj_insertMenuType -> common = $this -> sheet -> getCell('D'.$i) -> getValue();
    $this -> obj_insertMenuType -> id_restorant = $this -> id_restorant;
    $this -> obj_insertMenuType -> run();
  }

  function insertMenu($i)
  {
    $this -> obj_insertMenu -> id_restaurant = $this -> id_restorant;
    $temp_DC = $this -> sheet -> getDrawingCollection();
    $temp_EXT = '';
    for ( $q = 0; $q < count($temp_DC); ++$q )
    {
      if ( $temp_DC[$q] -> getCoordinates() == ( 'D'.$i ) )
      {
        $temp_EXT = '.'.$temp_DC[$q] -> getExtension();
        $im = file_get_contents( $temp_DC[$q] -> getPath() );
        $this -> obj_insertMenu -> generateName();
        $this -> obj_insertMenu -> get_company();//print('../'.$this -> obj_insertMenu -> dir.$this -> obj_insertMenu -> randName.$temp_EXT.'!!!');
        file_put_contents('../'.$this -> obj_insertMenu -> dir.$this -> obj_insertMenu -> randName.$temp_EXT, $im);
      }
    }

    if ( $this -> sheet -> getCell('A'.$i) -> getValue() == '' )
    {
      $this -> obj_insertMenu -> menu['id'] = 'new';
    }
    else 
    {
      $this -> obj_insertMenu -> menu['id'] = $this -> sheet -> getCell('A'.$i) -> getValue();
    }

    $this -> obj_insertMenu -> menu['name'] = $this -> sheet -> getCell('B'.$i) -> getValue();
    $this -> obj_insertMenu -> menu['shortDescription'] = $this -> sheet -> getCell('C'.$i) -> getValue();
/*TODO*/          $this -> obj_insertMenu -> menu['Description'] = '';
    $this -> obj_insertMenu -> menu['price'] = $this -> sheet -> getCell('F'.$i) -> getValue();
    $this -> obj_insertMenu -> menu['energyValuePortion'] = $this -> sheet -> getCell('E'.$i) -> getValue();
/*TODO*/          $this -> obj_insertMenu -> menu['energyValue100'] = '';
    $this -> obj_insertMenu -> menu['menuType'] = $this -> obj_insertMenuType -> id_menuType;
    $this -> obj_insertMenu -> extension = $temp_EXT;
    $this -> obj_insertMenu -> run();
  }

  function insertMenuExcel()
  {
    include('PHPExcel/PHPExcel.php');
    include('PHPExcel/PHPExcel/IOFactory.php');
    include('insert_menuType.php');
    include('insert_menu.php');

    if ( isset($_FILES['excelFile']) )
    {
      $this -> excelFileName = $_FILES['excelFile']['tmp_name'];
      $this -> obj_insertMenu = new insert_menu();
      $this -> obj_insertMenuType = new insert_menuType();
      $this -> id_restorant = $_REQUEST['id_restaurant'];
      $this -> run();
      print('{"success": true, "message": "Данные успешно внесены"}');
    }
  }
}

$obj = new insertMenuExcel();
?>