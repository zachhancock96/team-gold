<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	<link rel="stylesheet" href="css/style.css">
	<title>School Profile</title>
	<script src="jquery-3.4.1.min.js"></script>
</head>

<body>
	<header>
		<h1>School Profile</h1>
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
	<form action="SchoolEdit" method="post">
		<table>	
			<tr>
			<td>School Name:</td>
			<td>West Monroe High School</td>
			</tr>
			
			<tr>
			<td>LHSAA Names:</td>
			<td>West Monroe High School VB<br>
			West Monroe High School VG<br>
			West Monroe High School<br></td>
			</tr>
			
			<tr>
			<td>Address:</td>
			<td>123 School Rd<br>
			West Monroe, LA 71291</td>
			</tr>
			
			<tr>
			<td>Phone:</td>
			<td>111-111-1111</td>
			</tr>
			
			<tr>
			<td>email:</td>
			<td><input type="text" name="email"></td>
			</tr>
			
			
			<tr>
			<td>Primary School color:</td>
			<td><input type="text" name="color1"></td>
			</tr>
			
			<tr>
			<td>Secondary School color:</td>
			<td><input type="text" name="color2"></td>
			</tr>
			
			<tr>
			<td>School Logo:</td>
			<td></td>
			</tr>
			
			<tr>
			<td colspan="2"><form action="repEditSchool.php" method="post">
			<input type="submit" value="Edit Profile">
			</form></td>
			</tr>
		</table>
	</form>

</body>
</html>