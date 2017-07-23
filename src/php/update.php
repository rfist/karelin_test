<?php
  header("Access-Control-Allow-Origin: *");
  include "db-config.php";
  // Create connection
  $conn = new mysqli($servername, $username, $password, $dbname);
  // Check connection
  if ($conn->connect_error) {
    die("Error, connection failed: " . $conn->connect_error);
  }
  $date = $_POST['date'];
  $data = addcslashes($_POST['data'], '"');
  $test = $_POST['test'];
  $id = $_POST['id'];
  $inner_id = $_POST['inner_id'];
  $sql = "UPDATE `total_results` SET `".$test."` = '".$data."' WHERE `total_results`.`id` = ".$id." AND `total_results`.`inner_id` = '".$inner_id."'";
  $result = $conn->query($sql);
  echo $sql;
  $conn->close();
?>
