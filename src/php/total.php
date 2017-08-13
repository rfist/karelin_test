<?php
  header("Access-Control-Allow-Origin: *");
  include "db-config.php";
  // Create connection
  $conn = new mysqli($servername, $username, $password, $dbname);
  // Check connection
  if ($conn->connect_error) {
    die("Error, connection failed: " . $conn->connect_error);
  }
  $command = $_POST['command'];
  $sql = "SELECT * FROM `total_results`";
  $result = $conn->query($sql);
  if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {
          $myArray[] = $row;
    }
    echo json_encode($myArray, JSON_NUMERIC_CHECK);
  } else {
    echo "0 results";
  }
  $conn->close();
?>
