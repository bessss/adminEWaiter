<?php
include('data/data.php');
include('includes/authorization.php');
?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Администрирование ресторана</title>
  <link rel="stylesheet" type="text/css" href="js/extjs/resources/css/ext-all.css">
  <link rel="stylesheet" type="text/css" href="styles/additional.css">
  <script type="text/javascript" src="js/extjs/ext-all.js"></script>
  <?php $auth -> run();?>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <!--<script type="text/javascript" src="js/jquery/jquery-2.0.3.min.js"></script>
  <link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon">-->
</head>
<body>
<?php $auth -> accsess -> print_information();?>
</body>
</html>