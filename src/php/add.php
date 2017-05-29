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
  $first_test = $_POST['first_test'];
  $id = $_POST['id'];
  $sql = "INSERT INTO `results` (`date`, `data`, `first_test`, `id`) VALUES ('".$date."', '".$data."', '".$first_test."', '".$id."')";
  $result = $conn->query($sql);
  echo $sql;
  $conn->close();
?>
