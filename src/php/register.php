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
  $inner_id = $_POST['inner_id'];
  $sql = "INSERT INTO `total_results` (`date`, `data`, `first_test`, `inner_id`) VALUES ('".$date."', '".$data."', '".$first_test."', '".$inner_id."')";
  $conn->query($sql);
  // return id
  $result_sql = "SELECT * FROM `total_results` WHERE `total_results`.`inner_id` = '".$inner_id."'";
  $result = $conn->query($result_sql);
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
