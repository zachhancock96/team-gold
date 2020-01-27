<!DOCTYPE html>
<html>
<head>
	<link rel="stylesheet" href="/css/style.css">
	<title>Add Game Confirmation</title>
	<script src="jquery-3.4.1.min.js"></script>
</head>


<body>
	<header>
		<h1>Add Game</h1>
	</header>
	You have added <?php echo $_POST["HSchool"]; ?> <?php echo $_POST["HTeam"]; ?> VS
	<?php echo $_POST["VSchool"]; ?> <?php echo $_POST["HTeam"]; ?>
	on <?php echo $_POST["date"]; ?> at <?php echo $_POST["location"]; ?>

</body>
</html>