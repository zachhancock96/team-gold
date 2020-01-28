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
	
	<form action="RepEdit" method="post">
		
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
		<td><input type="tel" name="phoneNo" pattern="[0-9] {3} - [0-9] {3} - [0-9] {3}" placeholder="123-456-7890"></td>
		</tr>
		
		<tr>
		<td>Email:</td>
		<td><input type="text" name="email"></td>
		</tr>
		
		<tr>
		<td>Save Changes?</td>
		<td><input type="submit" value="Save"></td>
		</tr>
		</table>
	</form>

</body>
</html>