
<?php
$db = mysqli_connect('127.0.0.1','root','','fuel_labs');
if($db){
	$p = "SELECT * FROM users";
	$w = mysqli_query($db, $p);
	while($row = mysqli_fetch_array($w)){
		echo $row['id']."-".$row['username']."-".$row['password']."<br>";
        print_r(mysqli_fetch_array($w));
        
	}
    
}
?>