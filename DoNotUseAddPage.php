<!DOCTYPE html>
<html>
<head>
<title>Add Game</title>
<script src="jquery-3.4.1.min.js"></script>
</head>

<body>

	<table id='banner'>
        <tr>
        <td>+ View Games +</td>
        <td class='dropdown'>+ Add Games +<div class='dropdown-content'><a href='./index.html'>Add Manually</a><hr />Upload File</div></td>
        <td>+ Verify Games +</td>
        <td class='dropdown'>+ Profile +<div class='dropdown-content'><a href='./repProfile.php'>User Profile</a> <hr /> <a href='./schoolProfile.php'>School Profile</a></div></td>  
        </tr>
	</table>
	
<form action="addGame.php" method="post">
	Home School: <input type="text" id="Home School Name" name="HSchool"><br>
	Home Team: <input type="text" id="Home Team" name="HTeam"><br>
	Visting School: <input type="text" id="Visiting School Name" name="VSchool"><br>
	Visiting Team: <input type="text" id="Home Team" name="VTeam"><br>
	Date: <input type="text" id="mm/dd/yyyy" name="date"><br>
	Location: <input type="text" id="Location" name="location"><br>
	<input type="submit" value="Submit Game">
</form>
<? echo "Test"; ?>
</body>
</html>