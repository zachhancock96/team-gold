<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	<link rel="stylesheet" href="/css/style.css">
	<title>Add Game Confirmation</title>
	<script src="jquery-3.4.1.min.js"></script>
</head>


<body>
	<header>
		<h1>Add Game</h1>
	</header>
	
	<div>

    <table>
        <tr>
        <td>+ Add Games +</td>
        <td>+ Verify Games +</td>
        <td>+ Profile +</td>  
        </tr>
    </table>
    

    </div>
	
	You have added <?php echo $_POST["HSchool"]; ?> <?php echo $_POST["HTeam"]; ?> VS
	<?php echo $_POST["VSchool"]; ?> <?php echo $_POST["HTeam"]; ?>
	on <?php echo $_POST["date"]; ?> at <?php echo $_POST["location"]; ?>

</body>
</html>