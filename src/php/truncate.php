<?php
  header("Access-Control-Allow-Origin: *");
  include "db-config.php";
  // Create connection
  $conn = new mysqli($servername, $username, $password, $dbname);
  // Check connection
  if ($conn->connect_error) {
    die("Error, connection failed: " . $conn->connect_error);
  }
  $sql = "TRUNCATE TABLE `results`";
  $result = $conn->query($sql);
  echo $sql;
  $conn->close();
?>
