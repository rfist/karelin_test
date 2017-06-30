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
  $sql = "UPDATE `results` SET `".$test."` = '".$data."' WHERE `results`.`id` = ".$id."";
  $result = $conn->query($sql);
  echo $sql;
  $conn->close();
?>
