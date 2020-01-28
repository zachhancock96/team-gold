<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	<link rel="stylesheet" href="/css/style.css">
	<title>Rep Profile</title>
	<script src="jquery-3.4.1.min.js"></script>
</head>

<body>
	<header>
		<h1>Rep Profile</h1>
	</header>
	
	<div>

    <table>
        <tr>
        <td><a href="index.html">+ Add Games +</a></td>
        <td>+ Verify Games +</td>
        <td><a href="repProfile.php">+ Profile +</a></td> 
        </tr>
    </table>
    

    </div>
	
	
	<table>
		<tr>
		<td>Name:</td>
		<td>John Doe</td>
		</tr>
		
		<tr>
		<td>School:</td>
		<td>West Monroe High School</td>
		</tr>
		
		<tr>
		<td>Phone:</td>
		<td>111-111-1111</td>
		</tr>
		
		<tr>
		<td>Email:</td>
		<td>john.doe@school.edu</td>
		</tr>
	</table>
	<form action="repEditProfile.php" method="post">
	<input type="submit" value="Edit Profile">
	</form>
</body>
</html>