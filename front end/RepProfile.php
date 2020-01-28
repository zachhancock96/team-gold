<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	<link rel="stylesheet" href="/css/style.css">
	<title>User Profile</title>
	<script src="jquery-3.4.1.min.js"></script>
</head>

<body>
	<header>
		<h1>User Profile</h1>
	</header>
	
	<div>

    <table id='banner'>
        <tr>
        <td>+ View Games +</td>
        <td class='dropdown'>+ Add Games +<div class='dropdown-content'><a href='./index.html'>Add Manually</a><hr />Upload File</div></td>
        <td>+ Verify Games +</td>
        <td class='dropdown'>+ Profile +<div class='dropdown-content'><a href='./repProfile.php'>User Profile</a> <hr /> <a href='./schoolProfile.php'>School Profile</a></div></td>  
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
	
		<tr>
		<td colspan="2"><form action="repEditProfile.php" method="post">
		<input type="submit" value="Edit Profile">
		</form></td>
		</tr>
	</table>
</body>
</html>