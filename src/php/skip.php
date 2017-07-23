<?php
  header("Access-Control-Allow-Origin: *");
  include "db-config.php";
  // Create connection
  $conn = new mysqli($servername, $username, $password, $dbname);
  // Check connection
  if ($conn->connect_error) {
    die("Error, connection failed: " . $conn->connect_error);
  }
  $sql = "UPDATE `statistics` SET `statistics`.`value` = `statistics`.`value` + 1 WHERE `statistics`.`name` = 'missed'";
  echo $sql;
  $result = $conn->query($sql);
  $conn->close();
?>
