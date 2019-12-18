/********************************************************************
* Part 1: Handles single gamertag availabiliy functionality
********************************************************************/

//Sets the URL that will be used for the API call based on the entered gamertag
function setXuidURL() {
	var tag = document.getElementById('tag').value;

	if(!tag) {
		alert("Please enter a gamertag first.");
	}
	else {
		setLoading("Getting XUID...");
    	let url = "https://xboxapi.com/v2/xuid/" + tag
    	getXUID(url);
	}
}

//If no XUID is returned notifies user of available gamertag, otherwise create the URL to get history
function setActivityURL(xuid) {
	console.log("error code: " + xuid.error_code);
	if(xuid.error_code != undefined) {
		console.log("xuid failed");
		setLoading("This gamertag is currently <b>Available</b> for use!");
	}
	else {
		console.log(xuid);
		setLoading("Detecting Availability...");
		var url = "https://xboxapi.com/v2/" + xuid + "/title-history";
		getActivity(url, xuid);	
	}
	
}

//API Key b6ff29a5171e68cd4f1fd1f43ac4d059f914648a
//Gets the XUID for the requested gamertag and passes it to setActivtyURL
function getXUID(url) {
    fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'X-Auth': 'b6ff29a5171e68cd4f1fd1f43ac4d059f914648a',
            'Content-Type': 'application/json',
        }
    }).then((response) => response.json())
    .then((next) => setActivityURL(next))
    .catch(error => console.error('Error:', error));
}

function getActivity(url, xuid) {
    fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'X-Auth': 'b6ff29a5171e68cd4f1fd1f43ac4d059f914648a',
            'Content-Type': 'application/json',
        }
    }).then((response) => response.json())
    .then((next) => checkSuccess(next, xuid))
    .catch(error => console.error('Error:', error));
}

//Looks at the specified gamertag's video history to determine activity
function getClips(url) {
    fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'X-Auth': 'b6ff29a5171e68cd4f1fd1f43ac4d059f914648a',
            'Content-Type': 'application/json',
        }
    }).then((response) => response.json())
    .then((next) => renderTag(next))
    .catch(error => console.error('Error:', error));
}

//If the user does not have a game history look at game clips instead
function checkSuccess(tag, xuid) {
	if(tag.titles.length == 0) {
		var url = "https://xboxapi.com/v2/" + xuid + "/game-clips";
		getClips(url);
	}
	else {
		renderTag(tag);
	}
}

//Look for a valid timestamp in the title history or game clips
function renderTag(tag) {
	console.log(tag);

	//Check title history first, then clip history, otherwise throw error
	if(tag.errorCode) {
		setLoading("This gamertag is <b>Not Available</b> for public use.");
	}
	else if(tag.titles) {
		parseDate(tag.titles[0].titleHistory.lastTimePlayed);
	}
	else if(tag[0].lastModified) {
		parseDate(tag[0].lastModified);
	}
	else {
		setLoading("This gamertag is either <b>Invalid</b> or <b>Private</b>.");
	}
}

//Parse the time stamp retrieved into year, month, and day
function parseDate(date){
	var year = "";
	var month ="";
	var day = "";

	for (var i = 0; i < 4; i++) {
		year += date.charAt(i);  		 
	}

	for (var i = 5; i < 7; i++) {
		month += date.charAt(i);  		 
	}

	for (var i = 8; i < 10; i++) {
		day += date.charAt(i);  		 
	}


	calcDays(year, month, day);
}

//Calculate how many days until gamertag will be available
function calcDays(year, month, days) {
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0');
	var yyyy = today.getFullYear();

	console.log("Today is: " + yyyy + " " + mm + " " + dd + " ");

	console.log("New Year: " + year + " Today Year: " + yyyy);

	var yearLeft = (Number(year) + 5 - yyyy)*365;
	var monthLeft = (Number(month) - mm)*30;
	var daysLeft = Number(days) - dd;

	totalDays = yearLeft + monthLeft + daysLeft;

	console.log("year: " + yearLeft);
	console.log("month: " + monthLeft);
	console.log("day: " + daysLeft);
	console.log("total: " + totalDays);

	if(totalDays < 0) {
		setLoading("Pending release by Microsoft")
	}
	else {
		displayDays(totalDays);
	}
}

//Display for user how many days until gamertag is available
function displayDays(totalDays) {
	var display = document.getElementById('displayTagInfo');
    display.innerHTML = "This gamertag will be available in <b>" + totalDays + "</b> days.";
}

//Sets the loading status to whatever value is passed from calling function
function setLoading(loading) {
	var display = document.getElementById('displayTagInfo');
    display.innerHTML = loading;
}


/********************************************************************
* Part 2: Handles list functionality
********************************************************************/

//Array of objects to store the names and days
let nameList = [
	{name: "", days: 1826}
];

//Initial table string
var displayList = "<table><tr><th>Gamertags</th><th>Days until Avaliable</th></tr>";

//When add to list is selected update array with new gamertag
function addList() {
	var newItem = document.getElementById('tag').value;

	//Check if input is filled out
	if(!newItem) {
		alert("Please enter a gamertag first.");
	}
	else {
		//Make sure nameList is declared
		if(!nameList) {
			nameList = [
			{name: "", days: 1826}
			];
		}

		//Limit the list size to 20
		if(nameList && nameList.length >= 20) {
			alert("You have reached the name limit. Please remove names before adding more");
		}
		else {
			var newObj = {name: newItem, days: "Click Update List"};
	
			//If the list is empty set 0 index to new name, else just push
			if(nameList[0] == null || nameList[0].name == "") {
				nameList[0] = newObj;
			}
			else {
				nameList.push(newObj);
			}

		//Update the table with the new entry
		updateTable();
		}

	}
}

//When Update list button is pushed update the table with the current days
function updateTable() {
	var tableList = document.getElementById('tableList');

	//Clear the current table	
	while (tableList.firstChild) {
        tableList.removeChild(tableList.firstChild);
    }

    //Set the initial table header
    tableList.innerHTML = '<table class="w3-table-all"><tr class="w3-green"><th>Gamertags</th><th>Days until Avaliable</th><th>Remove</th></tr>';

    if(nameList) {
    //For each item in name array, add it to the table
	for (i=0; i<nameList.length; i++) {
		//Add the new name to the name column
		var newItem = document.createElement('tr');
		var nameCol = document.createElement('td');
		nameCol.appendChild(document.createTextNode(nameList[i].name));
		newItem.appendChild(nameCol);

		//Add the number of days to the day column
        var dayCol = document.createElement('td');
        dayCol.appendChild(document.createTextNode(nameList[i].days));
		newItem.appendChild(dayCol);
        
        //Add the remove button that corresponds to this row
        var removeButton = document.createElement('td');
        var newButton = document.createElement('button');
        newButton.appendChild(document.createTextNode("Remove"));
        newButton.setAttribute('onClick','removeName('+i+')');
        removeButton.appendChild(newButton);
        newItem.appendChild(removeButton);
        
        //Add the entire row to the table
        tableList.appendChild(newItem);
		}
	}

}

//Remove the specified name from the array then update the table
function removeName(nameindex){
	//Remove the name from the array
    nameList.splice(nameindex,1);

    //Update the table
    updateTable();
}

//Loop through list and make API call for each
async function updateList() {
	setTableStatus("Updating List...");
	if(nameList) {
		for (i=0; i<nameList.length; i++) {
			await setListXuidURL(nameList[i].name, i);
		}
	}
}

//Sets the URL that will be used for the API call based on the entered gamertag
function setListXuidURL(tag, index) {
    let url = "https://xboxapi.com/v2/xuid/" + tag
    getListXUID(url, index);
}

//Gets the XUID for the requested gamertag and passes it to setActivtyURL
function getListXUID(url, index) {
    fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'X-Auth': 'b6ff29a5171e68cd4f1fd1f43ac4d059f914648a',
            'Content-Type': 'application/json',
        }
    }).then((response) => response.json())
    .then((next) => setListActivityURL(next, index))
    .catch(error => console.error('Error:', error));
}

//If no XUID is returned notifies user of available gamertag, otherwise create the URL to get history
function setListActivityURL(xuid, index) {
	if(xuid.error_code != undefined) {
		nameList[index].days = ("Available");
		updateTable();
	}
	else {
		console.log(xuid);
		var url = "https://xboxapi.com/v2/" + xuid + "/title-history";
		getListActivity(url, xuid, index);	
	}
	
}

function getListActivity(url, xuid, index) {
    fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'X-Auth': 'b6ff29a5171e68cd4f1fd1f43ac4d059f914648a',
            'Content-Type': 'application/json',
        }
    }).then((response) => response.json())
    .then((next) => checkListSuccess(next, xuid, index))
    .catch(error => console.error('Error:', error));
}

//If the user does not have a game history look at game clips instead
function checkListSuccess(tag, xuid, index) {
	if(tag.titles.length == 0) {
		var url = "https://xboxapi.com/v2/" + xuid + "/game-clips";
		getListClips(url, index);
	}
	else {
		renderListTag(tag, index);
	}
}

//Looks at the specified gamertag's video history to determine activity
function getListClips(url, index) {
    fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'X-Auth': 'b6ff29a5171e68cd4f1fd1f43ac4d059f914648a',
            'Content-Type': 'application/json',
        }
    }).then((response) => response.json())
    .then((next) => renderListTag(next, index))
    .catch(error => console.error('Error:', error));
}

//Look for a valid timestamp in the title history or game clips
function renderListTag(tag, index) {
	console.log(tag);

	if(nameList && index >= nameList.length -2) {
		setTableStatus("Update successful");
		console.log("Hit 100%");
	}

	//Check title history first, then clip history, otherwise throw error
	if(tag.errorCode) {
		nameList[index].days = "Error";
	}
	else if(tag.titles) {
		parseListDate(tag.titles[0].titleHistory.lastTimePlayed, index);
	}
	else if(tag) {
		parseListDate(tag[0].lastModified, index);
	}
	else {
		nameList[index].days = "Error";
	}
}

//Parse the time stamp retrieved into year, month, and day
function parseListDate(date, index){
	var year = "";
	var month ="";
	var day = "";

	for (var i = 0; i < 4; i++) {
		year += date.charAt(i);  		 
	}

	for (var i = 5; i < 7; i++) {
		month += date.charAt(i);  		 
	}

	for (var i = 8; i < 10; i++) {
		day += date.charAt(i);  		 
	}


	calcListDays(year, month, day, index);
}

//Calculate how many days until gamertag will be available
function calcListDays(year, month, days, index) {
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0');
	var yyyy = today.getFullYear();

	console.log("Today is: " + yyyy + " " + mm + " " + dd + " ");

	console.log("New Year: " + year + " Today Year: " + yyyy);

	var yearLeft = (Number(year) + 5 - yyyy)*365;
	var monthLeft = (Number(month) - mm)*30;
	var daysLeft = Number(days) - dd;

	totalDays = yearLeft + monthLeft + daysLeft;

	console.log("year: " + yearLeft);
	console.log("month: " + monthLeft);
	console.log("day: " + daysLeft);
	console.log("total: " + totalDays);

	if(totalDays < 0) {
		nameList[index].days = "Pending";
	}
	else {
		nameList[index].days = totalDays;
	}
	updateTable();
}

//Update the current operation status under the table
function setTableStatus (status) {
	var display = document.getElementById('tableStatus');
    display.innerHTML = status;
}

//When saveList is selected, save the list to local storage
function saveList() {
	//If local storage is available save the list else alert user
	if(typeof localStorage !== 'undefined') {
		localStorage.setItem("list", JSON.stringify(nameList));
		setTableStatus("List has been saved");
	}
	else{
		alert("Please enable cookies to use this feature.");
	}
}

//When the page is loaded populate the table with previous saved list
function readList() {
	console.log("reading list");
	var retrievedList = localStorage.getItem("list");
	nameList = JSON.parse(retrievedList);
	console.log(nameList);
	updateTable();
}