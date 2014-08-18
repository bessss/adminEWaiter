<?php
class outputMenuExcel
{
  var $xls;
  var $sheet;
  var $xlsFile;
  var $obj_idRestaurant;
  var $number;

  function outputMenuExcel()
  {
    include('../includes/PHPExcel/PHPExcel.php');
    include('../includes/PHPExcel/PHPExcel/Writer/Excel2007.php');
    include('../includes/PHPExcel/PHPExcel/IOFactory.php');
    include('../data/data.php');
    include('outputRestaurant.php');
    $this -> number = 2;
    $this -> obj_idRestaurant = new output_restaurant();

    $this -> run();
    
  }

  function menuHead_Create()
  {
    $this -> sheet -> setCellValueByColumnAndRow(0, $this -> number, 'ID');
    $this -> sheet -> setCellValueByColumnAndRow(1, $this -> number, 'Название');
    $this -> sheet -> setCellValueByColumnAndRow(2, $this -> number, 'Краткое описание');
    $this -> sheet -> setCellValueByColumnAndRow(3, $this -> number, 'Изображение');
    $this -> sheet -> setCellValueByColumnAndRow(4, $this -> number, 'Эн. ценность порции');
    $this -> sheet -> setCellValueByColumnAndRow(5, $this -> number, 'Стоимость');
    ++$this -> number;
  }

  function menu_Write($result,$i)
  {
    $this -> sheet -> getRowDimension($this -> number) -> setRowHeight(100);
    $this -> sheet -> setCellValueByColumnAndRow(0, $this -> number, mysql_result($result,$i,'id'));
    $this -> sheet -> setCellValueByColumnAndRow(1, $this -> number, mysql_result($result,$i,'name'));
    $this -> sheet -> setCellValueByColumnAndRow(2, $this -> number, mysql_result($result,$i,'shortDescription'));

    if ( file_exists('../'.mysql_result($result,$i,'image')) )
    {
      $logo = new PHPExcel_Worksheet_Drawing();
      $logo -> setPath( '../'.mysql_result($result,$i,'image') );
      $logo -> setHeight(200);
      $logo -> setWidth(120);
      $logo -> setCoordinates('D'.$this -> number);
      $logo -> setOffsetX(10);
      $logo -> setOffsetY(10);
      $logo -> setWorksheet($this -> sheet);
    } 

    $this -> sheet -> setCellValueByColumnAndRow(4, $this -> number, mysql_result($result,$i,'energyValuePortion'));
    $this -> sheet -> setCellValueByColumnAndRow(5, $this -> number, mysql_result($result,$i,'price'));
    $this -> sheet -> getStyle('A'.$this -> number) -> getProtection() -> setLocked(true);
    ++$this -> number;
  }

  function menu_Create($menuType)
  {
    $arrayLabel = array('A','B','C','D');

    $sql = 'SELECT * FROM menu JOIN menutype ON menu.id_menuType = menutype.id AND menutype.id_restaurant = '.$this -> obj_idRestaurant -> id_restaurant.' AND menutype.id = \''.$menuType.'\'';
    $result = mysql_query($sql) or die($sql);

    if ( mysql_num_rows($result) > 0 )
    {
      $this -> menuHead_Create();
      for ( $i = 0; $i < mysql_num_rows($result); ++$i )
      {
        if ( $_REQUEST['imageCheck'] != 'false' )
        {
          if ( file_exists( '../'.mysql_result($result,$i,'image') ) == false )
          {
            $this -> menu_Write($result,$i);
          }
        }
        else
        {
          $this -> menu_Write($result,$i);
        }
      }
    }
  }

  function menuRazdel_Cell_Mod()
  {
    $arrayLabel = array('A','B','C','D','E','F');
    for ( $i = 0; $i < count($arrayLabel); ++$i )
    {
      $this -> sheet -> getStyle($arrayLabel[$i].$this -> number) -> getFill() -> setFillType(
        PHPExcel_Style_Fill::FILL_SOLID);
      $this -> sheet -> getStyle($arrayLabel[$i].$this -> number) -> getFill() -> getStartColor() -> setRGB('EEEEEE');
      if ( $i == 0 || $i == 2 )
      {
        $this -> sheet -> getStyle($arrayLabel[$i].$this -> number) -> getProtection() -> setLocked(true);
      }
    }
  }

  function menuRazdel_Write($result)
  {
    if ( mysql_num_rows($result) > 0 )
    {
      for ( $i = 0; $i < mysql_num_rows($result); ++$i )
      {
        $this -> sheet -> setCellValueByColumnAndRow(0, $this -> number, 'Раздел');
        $this -> sheet -> setCellValueByColumnAndRow(1, $this -> number, mysql_result($result,$i,'name'));
        $this -> sheet -> setCellValueByColumnAndRow(2, $this -> number, mysql_result($result,$i,'id'));
        if ( mysql_result($result,$i,'common') == '1' )
        {
          $this -> sheet -> setCellValueByColumnAndRow(3, $this -> number, 'Общее');
        }
        else
        {
          $this -> sheet -> setCellValueByColumnAndRow(3, $this -> number, 'Индивидуальное');
        }
        $this -> menuRazdel_Cell_Mod();
        ++$this -> number;
        $this -> menu_Create( mysql_result($result,$i,'id') );
      }
    }
  }

  function menuRazdel_SqlCommon($menuTypeSql)
  {
    //Общие разделы
    $sql = 'SELECT * FROM menutype JOIN restaurant on menutype.id_restaurant = restaurant.id AND restaurant.id_company = '.$this -> obj_idRestaurant -> id_company.' AND menutype.common = 1 '.$menuTypeSql.' ORDER BY `menutype`.`id` ASC';
    $result = mysql_query($sql) or die($sql);
    $this -> menuRazdel_Write($result);
  }

  function menuRazdel_SqlQuotient($menuTypeSql)
  {
    //Частные разделы
    $sql = 'SELECT * FROM menutype JOIN restaurant on menutype.id_restaurant = restaurant.id and restaurant.id = '.$this -> obj_idRestaurant -> id_restaurant.' AND menutype.common = 0 '.$menuTypeSql.' ORDER BY `menutype`.`id` ASC';
    $result = mysql_query($sql) or die($sql);
    $this -> menuRazdel_Write($result);
  }

  function menuRazdel_Create()
  {
    if ( $_REQUEST['menuType'] != 'null' )
    {
      $menuTypeSql = ' AND menutype.id = '.$_REQUEST['menuType'];
    }
    else
    {
      $menuTypeSql = '';
    }

    switch ( $_REQUEST['menuTypeCommon'] )
    {
      case '1':
      {
        $this -> menuRazdel_SqlQuotient($menuTypeSql);
        break;
      }
      case '2':
      {
        $this -> menuRazdel_SqlCommon($menuTypeSql);
        break;
      }
      default:
      {
        $this -> menuRazdel_SqlCommon($menuTypeSql);
        $this -> menuRazdel_SqlQuotient($menuTypeSql);
        break;
      }
    }
  }

  function columns_Mod()
  {
    $arrayLabel = array('B','C','D','E','F');
    $this -> sheet -> getStyle('A') -> getAlignment() -> setVertical(PHPExcel_Style_Alignment::VERTICAL_TOP);
    for ( $i = 0; $i < count( $arrayLabel ); ++$i )
    {
      $this -> sheet -> getStyle($arrayLabel[$i]) -> getAlignment() -> setWrapText(true);
      $this -> sheet -> getStyle($arrayLabel[$i]) -> getAlignment() -> setVertical(PHPExcel_Style_Alignment::VERTICAL_TOP);
      $this -> sheet -> getStyle($arrayLabel[$i]) -> getProtection() -> setLocked(PHPExcel_Style_Protection::PROTECTION_UNPROTECTED);
    }

    $this -> sheet -> getColumnDimension('E') -> setAutoSize(true);
    $this -> sheet -> getColumnDimension('F') -> setAutoSize(true);
    $this -> sheet -> getColumnDimension('G') -> setAutoSize(true);
    $this -> sheet -> getColumnDimension('B') -> setWidth(40);
    $this -> sheet -> getColumnDimension('C') -> setWidth(40);
    $this -> sheet -> getColumnDimension('D') -> setWidth(20);
    $this -> sheet -> getStyle('D') -> getAlignment() -> setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
  }

  function run()
  {
    $this -> xls = new PHPExcel();
    $this -> xls -> setActiveSheetIndex(0);
    $this -> sheet = $this -> xls -> getActiveSheet();
    $this -> sheet -> setTitle('Меню ресторана');
    $this -> sheet -> setCellValue("A1", 'Меню ресторана');
    $this -> sheet -> getStyle('A1') -> getFill() -> setFillType(
      PHPExcel_Style_Fill::FILL_SOLID);
    $this -> sheet -> getStyle('A1') -> getFill() -> getStartColor() -> setRGB('acacac');

    $this -> sheet -> mergeCells('A1:F1');

    $this -> sheet -> getStyle('A1') -> getAlignment( )-> setHorizontal(
      PHPExcel_Style_Alignment::HORIZONTAL_CENTER);

    $this -> sheet -> getProtection() -> setPassword('1');
    $this -> sheet -> getProtection() -> setSheet(true);
    $this -> sheet -> getProtection() -> setSort(true);
    $this -> sheet -> getProtection() -> setInsertRows(false);
    $this -> sheet -> getProtection() -> setFormatCells(true);

    $this -> columns_Mod();
    $this -> menuRazdel_Create();

    $this -> xlsFile = PHPExcel_IOFactory::createWriter($this -> xls, 'Excel2007');
    $this -> xlsFile -> save('../data/data.xlsx');

    header('Content-Disposition: attachment; filename="data.xlsx"');
    header("Content-Type: application/force-download");
    header("Content-Type: application/octet-stream");
    header("Content-Type: application/download");
    header("Content-Description: File Transfer");
    header('Content-Length: '.filesize('../data/data.xlsx'));

    if ($fd = fopen('../data/data.xlsx', 'rb'))
    {
      while (!feof($fd))
      {
        print fread($fd, 1024);
      }
      fclose($fd);
    }
  }
}

$obj = new outputMenuExcel();
?>