/* Scripts relating to trainer.js, including:
    -loading trainer's confirmed appointments and related modal
    -calendar to edit trainer availability and related modal
    -edit trainer profile form
are included in this JS file.
*/


//get dates for use later
var today = new Date();
var currentMonth = today.getMonth();
var currentYear = today.getFullYear();

//Check https://github.com/niinpatel/calendarHTML-Javascript/blob/master/scripts.js for a possible JS calendar
function handleTrainerDashboardOnLoad(){ //load each part of dashboard
    let id = getTrainerId();
    //update href of MyAccount in navbar
    
    // let trainer = [];
    // const trainerApiUrl = "https://localhost:5001/api/Trainer/GetTrainerByID/"+id;
    const trainerApiUrl = "https://trainlikeachampion-g1-api.herokuapp.com/api/Trainer/GetTrainerByID/"+id;
    fetch(trainerApiUrl).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(json){
        // trainer = json;
        //json is a single trainer object
        getConfirmedAppointments(json);
        getTrainerCalendar(currentMonth, currentYear);
        getTrainerProfileForm(json);

    }).catch(function(error){
        console.log(error);
    }) 
}


function getTrainerId(){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get("id");
    return id;
}

function getDashboardHref(){
    let trainerId = getTrainerId();
    let dashboardUrl = "./trainer.html?id="+trainerId;
    return dashboardUrl;
}


function getConfirmedAppointments(trainer){
    //get any trainer appointments that have "customer" !=null and trainerID matches trainerID
    let html = "";
    let id = getTrainerId();
    // const apptApiUrl = "https://localhost:5001/api/Appointment/GetConfirmedAppointmentsForTrainer/"+id;
    const apptApiUrl = "https://trainlikeachampion-g1-api.herokuapp.com/api/Appointment/GetConfirmedAppointmentsForTrainer/"+id;
    fetch(apptApiUrl).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(json){
        if(json[0] == undefined){
             //will return the empty []
            html += "<h2>You don't have any upcoming appointments scheduled at this time.</h2>";
        }
        else{
            //if there are appointments found w/ that customerId
            for(var i in json){
                //stringify, then re-parse to an object **couldn't get the start and end times to read without doing this**
                var tempStr = JSON.stringify(json[i]);
                var object = JSON.parse(tempStr);
                //format date and time
                let apptDate = getFormattedDate(object.appointmentDate);
                let startTime = getFormattedTime(object.startTime.hours, object.startTime.minutes);
                let endTime = getFormattedTime(object.endTime.hours, object.endTime.minutes);
                let activity =  object.appointmentActivity.activityName;
                let customerName = object.appointmentCustomer.fName+ " " + object.appointmentCustomer.lName;
                //print buttons with appt details
                html += "<button type=\"button btn\" class=\"list-group-item list-group-item-action\" onclick=\"showEditTrainerApptModal("+object.appointmentId+")\">";
                html += apptDate + " at " + startTime + "-" + endTime + " | Activity: " + activity + " | Customer: " + customerName +"</button>";
            }
        }
        //set the innerHTML of custApptList
        document.getElementById("trainerApptList").innerHTML = html;
    }).catch(function(error){
        console.log(error);
    }) 
}

function getFormattedDate(date){
    //take a date from json and convert to mm/dd/yyyy
    let myDate = date.slice(0,10); //get first 10 characters of json string
    let splitDate = myDate.split('-'); //split at -
    let newMonth = parseInt(splitDate[1]);
    newMonth = +newMonth; //remove leading zero if exists
    let newDay = parseInt(splitDate[2]);
    newDay = +newDay; //remove leading zero if exists
    let newDate = [newMonth, newDay, splitDate[0]]; //make new date with correct order
    newDate = newDate.join("/"); //join back together with /
    return newDate;
}

function getFormattedTime(hours, minutes){
    let formattedHours = "";
    let formattedMinutes = "";
    let suffix = "AM";
    if(hours >= 12){
        suffix = "PM";
        if(hours % 12 != 0){
            hours = hours % 12;
        }
    }
    formattedHours = hours.toString();
    if(minutes < 10){
        formattedMinutes = minutes.toString();
        if(formattedMinutes == "0"){
            formattedMinutes = "00";
        }
        else {
            formattedMinutes = "0" + minutes;
        }
    }
    else {
        formattedMinutes = minutes.toString();
    }
    return (formattedHours + ":" + formattedMinutes + suffix);
}
      

/* EDIT TRAINER APPOINTMENT MODAL SCRIPTS */
function showEditTrainerApptModal(apptID){
    //get appointment by ID, then populate and show the modal
        //Make API call to get appointment with the passed-in ID from the database
        // const apptApiUrl = "https://localhost:5001/api/Appointment/GetAppointmentByID/"+apptID;
        const apptApiUrl = "https://trainlikeachampion-g1-api.herokuapp.com/api/Appointment/GetAppointmentByID/"+apptID;
        fetch(apptApiUrl).then(function(response){
            console.log(response);
            return response.json();
        }).then(function(json){
            //stringify, then re-parse to an object **couldn't get the start and end times to read without doing this**
            var tempStr = JSON.stringify(json);
            var object = JSON.parse(tempStr);
            //simplify object format with only the needed items
            var appt = {
                apptDate: getFormattedDate(object.appointmentDate),
                startTime: getFormattedTime(object.startTime.hours, object.startTime.minutes),
                endTime: getFormattedTime(object.endTime.hours, object.endTime.minutes),
                activity:  object.appointmentActivity.activityName,
                customerName: object.appointmentCustomer.fName+ " " + object.appointmentCustomer.lName,
                price: object.appointmentCost,
            }
            
            //set up HTML 
            let html = "<div class=\"modal-content\"><span class=\"close\" onclick=\"closeEditTrainerApptModal()\">&times;</span>";
            html += "<h1 class=\"modal-header text-center\">Appoitment Details</h1><br>";
            html += "<div class=\"row\"><div class=\"col-md-4\"><h3>Date/Time:</h3></div><div class=\"col-md-8\"><h3>";
            html += appt.apptDate + " at " + appt.startTime + " - " +  appt.endTime  +"</h3></div></div>";
            html += "<div class=\"row\"><div class=\"col-md-4\"><h3>Customer:</h3></div><div class=\"col-md-8\"><h3>"+ appt.customerName+"</h3></div></div>";
            html += "<div class=\"row\"><div class=\"col-md-4\"><h3>Activity:</h3></div><div class=\"col-md-8\"><h3>"+ appt.activity+"</h3></div></div>";
            html += "<div class=\"row\"><div class=\"col-md-4\"><h3>Price:</h3></div><div class=\"col-md-8\"></h3>$"+appt.price+"</h3></div></div>";
            html += "<br><div class=\"row text-center\"><button class=\"btn btn-action btn-warning\" id=\"cancelApptButton\" onclick=\"cancelTrainerAppt("+apptID+")\">Cancel This Appointment</button></div></div>";
    
            //set inner HTML of modal
            document.getElementById("editTrainerApptModal").innerHTML = html;
    
            //Show Modal
            var modal = document.getElementById("editTrainerApptModal");
            modal.style.display = "block";
            var span = document.getElementsByClassName("close")[0];
        }).catch(function(error){
            console.log(error);
        })
}

function closeEditTrainerApptModal(){
    var modal = document.getElementById("editTrainerApptModal");
    modal.style.display = "none";
}

window.onclick = function(event){
    var modal = document.getElementById("editTrainerApptModal");
    if(event.target == modal){
        modal.style.display = "none";
    }
}

function cancelTrainerAppt(apptID) {
    //tell user the appt is canceled with a close button
    // const cancelApptApiUrl = "https://localhost:5001/api/Appointment/"+apptID;
    const cancelApptApiUrl = "https://trainlikeachampion-g1-api.herokuapp.com/api/Appointment/"+apptID;
    //make an int[] to send into the put request. [0]=custID, [1]=apptID
    fetch(cancelApptApiUrl, {
        method: "DELETE",
        headers: {
            "Accept": 'application/json',
            "Content-Type": 'application/json'
        },
        body: JSON.stringify({
            appointmentId: apptID
        })
    })
    .then(function(response){
    //when they cancel the appointment, change the modal html to show that the apointment was canceled, and change button to close.
    let html = " <div class=\"modal-content\"><span class=\"close\" onclick=\"apptCanceledCloseModal()\">&times;</span>";
    html += "<h1 class=\"modal-header text-center\">Appoitment Canceled</h1><br>";
    html += "<div class=\"row text-center\"><h2>This appointment has been canceled.</h2></div>"; 
    html += "<div class=\"row text-center\"><h2>Click the button to return to your dashboard to add more appointment availability.</h2></div>";
    html += "<br><div class=\"row text-center\"><button class=\"btn btn-action\" onclick=\"apptCanceledCloseModal()\">Close</button></div>";
    document.getElementById("editTrainerApptModal").innerHTML = html;
    })
}

function apptCanceledCloseModal(){
    //reload the confirmedAppointments and TrainerCalendar sections to reflect the update
    let id = getTrainerId();
    let trainer = [];
    // const trainerApiUrl = "https://localhost:5001/api/Trainer/GetTrainerByID/"+id;
    const trainerApiUrl = "https://trainlikeachampion-g1-api.herokuapp.com/api/Trainer/GetTrainerByID/"+id;
    fetch(trainerApiUrl).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(json){
        trainer = json;
        getConfirmedAppointments(trainer);
        getTrainerCalendar(currentMonth, currentYear);
        //then close the modal
        var modal = document.getElementById("editTrainerApptModal");
        modal.style.display = "none";

    }).catch(function(error){
        console.log(error);
    }) 
}


/* FOR CALENDAR / TRAINER AVAILABILITY SCRIPTS 
calendar adapted from https://github.com/niinpatel/calendarHTML-Javascript */
function getTrainerCalendar(currentMonth, currentYear){
    setCalendarHeader(currentMonth, currentYear); //displays current/updated Month YYYY at top of calendar

    //get month and year for use below
    let mon = currentMonth;
    let d = new Date(currentYear, mon);
    let today = new Date();
    let todayDate;
    if(currentMonth != today.getMonth()){
        todayDate = 0;
    }
    else {
        todayDate = today.getDate();
    }
    //CREATE CALENDAR TABLE
    let calendarTable = "<table class=\"table table-responsive-sm calendar-table\"><thead>";
    calendarTable += "<th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thur</th><th>Fri</th><th>Sat</th></thead><tbody id=\"calendarBody\">";
    // spaces for the first row from Sunday until the first day of the month
    for(let i = 0; i < d.getDay(); i++) {
        calendarTable += "<td></td>";
    }
    //<td> with dates for that month
    while(d.getMonth() == mon) {
        if(d.getDate() < todayDate) {
            //if date is before today's date, disable button
            calendarTable += "<td><button disabled style=\"background-color: #808080\">" + d.getDate() + "</button></td>"; 
            if(d.getDay() == 6) { //if last day of week, new table row
                calendarTable += "</tr><tr>";
            }
        }
        else {
            //if today or later, enable button
            let selectedDate = d.getFullYear() + "-" + ('0' + (d.getMonth()+1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2);
            calendarTable += "<td><button onclick=\"showEditAvailabilityModal(value)\" value="+ selectedDate +">" + d.getDate() + "</button></td>";
            //(d.getMonth()+1) + "/" + d.getDate() + "/" + d.getFullYear()
            if(d.getDay() == 6) { //if last day of week, new table row
                calendarTable += "</tr><tr>";
            }
        }
        d.setDate(d.getDate() + 1); //increment date
    }
    //add spaces after last days of month for last row if last day of the month is not Saturday
    if(d.getDay() != 6) {
        for(let i = d.getDay(); i < 7; i++) {
            calendarTable += "<td></td>";
        }
    }
    //close table
    calendarTable += "<tr></tbody></table>";
    document.getElementById("calendar").innerHTML = calendarTable;
}

function setCalendarHeader(currentMonth, currentYear)
{
    var currDate = new Date(); //current date
    var mList = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
    var monthName = mList[currentMonth];
    var monthAndYear = monthName + " " + currentYear;
    document.getElementById("currMonth").innerHTML = monthAndYear;
}

function nextMonth() {
    if(currentMonth === 11){ //if at December
        //go to the next year & adjust the month to 0
        currentYear++;
        currentMonth = (currentMonth + 1) % 12;
    }
    else { //if not at December
        currentMonth++;
    }
    //reload calendar & header 
    setCalendarHeader(currentMonth, currentYear);
    getTrainerCalendar(currentMonth, currentYear);
}

function previousMonth() {
    if(currentMonth === 0){ //if at January
        //go to the previous year & to month 11
        currentYear--;
        currentMonth = 11;
    }
    else{ //if not at January
        currentMonth--;
    }
    //reload calendar & header
    setCalendarHeader(currentMonth, currentYear);
    getTrainerCalendar(currentMonth, currentYear);
}

function showEditAvailabilityModal(selectedDate){
    // when trainer clicks on a calendar date, pop up that date with any existing availabile appointments they have.

    //get any AVAILABLE appointments associated w/ TrainerID on that datet
    let trainerId = getTrainerId();
    // const apptApiUrl = "https://localhost:5001/api/Appointment/GetAvailableAppointmentsByDateForTrainer/"+trainerId+"/"+selectedDate;
    const apptApiUrl = "https://trainlikeachampion-g1-api.herokuapp.com/api/Appointment/GetAvailableAppointmentsByDateForTrainer/"+trainerId+"/"+selectedDate;
    fetch(apptApiUrl).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(json){
        let apptArray = [];
        for(var i in json){
            //for every json object, create simplified object with only the needed items (ID, date, startTime, endTime, ActivityId, Price)
            //stringify, then re-parse to an object **couldn't get the start and end times to read without doing this**
            var tempStr = JSON.stringify(json[i]);
            var object = JSON.parse(tempStr);
            
            //add to apptArray
            apptArray[i] = {
                apptID: object.appointmentId,
                apptDate: getFormattedDate(object.appointmentDate),
                fullStartTime: getFullTime(object.startTime.hours, object.startTime.minutes), //e.g. 09:00, 14:00, etc
                fullEndTime: getFullTime(object.endTime.hours, object.endTime.minutes),
                activityId:  object.appointmentActivity.activityId,
                price: object.appointmentCost 
            }
        }
        //set up starter HTML with table and headers
        let html = "<div class=\"modal-dialog modal-lg\"><div class=\"modal-content editTrainerAvailModal\">";
        html += "<span class=\"close\" onclick=\"closeEditAvailabilityModal()\">&times;</span>";
        html += "<h1 class=\"modal-header text-center\">Edit Availability for "+selectedDate+"</h1><br>";
        //set up table & headers
        html += "<table class=\"table table-hover\" id=\"editAvailTable\"><thead><tr><th>Start Time</th><th>End Time</th><th>Activity</th><th>Price</th><th></th><th></th>";
        html += "</tr></thead><tbody>"; //end head, begin body
        
        let count = 5; //use count of 5-13 so we can avoid apptIDs, which end in 4
        //if appointments were found, set up a table with those appointment details
        if(apptArray.length > 0){
            for(var i in apptArray){
                html += "<tr><td><input type=\"time\" id=startTime-"+apptArray[i].apptID+" name=\"startTime"+apptArray[i].apptID+"\" value="+apptArray[i].fullStartTime+" min=\"06:00\" max=\"18:00\" ></td>"; //start time, START DISABLED
                html += "<td><input type=\"time\" id=endTime-"+apptArray[i].apptID+" name=\"endTime"+apptArray[i].apptID+"\" value="+apptArray[i].fullEndTime+" min=\"06:00\" max=\"18:00\" ></td>"; //end time, START DISABLED
                html += getActivityCellsForAppt(apptArray, i, trainerId);
                // html += "<td><select id=activity-"+apptArray[i].apptID+" name=\"activities\" value="+apptArray[i].activityId+" onchange=\"updateApptPrice("+i+","+trainerId+")\"><option disabled value=\"4\" id=\"carOpt"+apptArray[i].apptID+"\">Cardio</option><option disabled id=\"stOpt"+apptArray[i].apptID+"\"value=\"14\">Strength Training</option><option disabled value=\"24\" id=\"kbOpt"+apptArray[i].apptID+"\">Kickboxing</option><option disabled value=\"34\" id=\"yoOpt"+apptArray[i].apptID+"\">Yoga</option></select></td>"; //activity, START DISABLED
                html += "<td><input type=\"text\" name=\"price-"+apptArray[i].apptID+"\" id=\"price-"+apptArray[i].apptID+"\" value="+apptArray[i].price+" style=\"max-width:80px;\" value=\"\" disabled></td>"; //Price: auto-calculated. TEXT DISPLAY, DISABLED.
                html += "<td id=\"editAvailApptBtn"+apptArray[i].apptID+"\"><button class=\"btn btn-secondary\" type=\"button\" onclick=\"enableApptEdit("+apptArray[i].apptID+")\">Edit</button></td>"; //Button for EDIT
                html += "<td id=\"deleteApptBtn"+apptArray[i].apptID+"\"><button class=\"btn btn-danger\" type=\"button\" onclick=\"deleteAppointment("+apptArray[i].apptID+", \'"+ selectedDate+"\')\">Delete</button></td>"; //Button for DELETE
                html += "</tr>"; //end row
       
                //update which activities are disabled
                updateDisabledActivities(apptArray[i].apptID);

            }
        }
        else {
            //if no appointments were found, add 3 rows to table as above, but ids of "startTime-"+count
            for(let i=count; i<8; i++){
                //add 3 ENABLED rows to table as above, but ids of property-count
                html += "<tr><td><input type=\"time\" id=startTime-"+i+" name=\"startTime"+i+"\" value=\"\" min=\"06:00\" max=\"18:00\"></td>"; //start time, START DISABLED
                html += "<td><input type=\"time\" id=endTime-"+i+" name=\"endTime"+i+"\" value=\"\" min=\"06:00\" max=\"18:00\" ></td>"; //end time, START DISABLED
                html += "<td><select id=activity-"+i+" name=\"activities\" onchange=\"updateApptPrice("+i+","+trainerId+")\" value=\"\" ><option disabled id=\"carOpt"+i+"\" value=\"4\">Cardio</option><option disabled id=\"stOpt"+i+"\" value=\"14\">Strength Training</option><option disabled id=\"kbOpt"+count+"\" value=\"24\">Kickboxing</option><option disabled id=\"yoOpt"+count+"\" value=\"34\">Yoga</option></select>"; //activity, START DISABLED
                html += "<td><input type=\"text\" name=\"price-"+i+"\" id=\"price-"+i+"\" value=\"\" style=\"max-width:80px;\"></td>"; //Price: auto-calculated. TEXT DISPLAY, DISABLED.
                html += "<td id=\"editAvailApptBtn"+i+"\"><button class=\"btn btn-success\" type=\"button\" onclick=\"validateNewAppt("+i+", \'"+ selectedDate+"\')\">Save</button></td>"; //SAVE button, send in count to be able to access each input and validate/submit
                html += "<td id=\"deleteApptBtn"+i+"\"></td>"; //BLANK td
                count++; //increment count as with i so it stays updated
                updateDisabledActivities(i);
            }
        }
        //set up table close
        html += "</tbody></table>";

        //add a div with centered button for "add more rows", onclick call AddMoreRows(count)
        html += "<div class=\"row text-center\"><button class=\"btn btn-lg btn-primary\" onclick=\"addRow("+count+", \'"+ selectedDate+"\')\">Add More Rows</button></div>";
        //close modal-content and modal-dialog divs
        html += "</div></div>";
        //addMoreRows sends in count to populate new table row



        //set inner HTML of modal
        document.getElementById("editTrainerApptModal").innerHTML = html;

        //disable startTime and endTime to begin with
        // for(var i in apptArray){
        //     document.getElementById("startTime-"+apptArray[i].apptID).disabled = true;
        //     document.getElementById("endTime-"+apptArray[i].apptID).disabled = true;
        // }

        //Show Modal
        var modal = document.getElementById("editTrainerApptModal");
        modal.style.display = "block";
        var span = document.getElementsByClassName("close")[0];
    }).catch(function(error){
        console.log(error);
    })
}

function getActivityCellsForAppt(apptArray, i, trainerId){
    //updates selected activity for existing appointment in each row that is populated in the table
    let html = "<td><select id=activity-"+apptArray[i].apptID+" name=\"activities\" value="+apptArray[i].activityId+" onchange=\"updateApptPrice("+apptArray[i].apptID+","+trainerId+")\">";
    if(apptArray[i].activityId == 4){
        html += "<option selected value=\"4\" id=\"carOpt"+apptArray[i].apptID+"\">Cardio</option><option disabled id=\"stOpt"+apptArray[i].apptID+"\" value=\"14\">Strength Training</option><option disabled value=\"24\" id=\"kbOpt"+apptArray[i].apptID+"\">Kickboxing</option><option disabled value=\"34\" id=\"yoOpt"+apptArray[i].apptID+"\">Yoga</option></select></td>"; //activity, START DISABLED"
    }
    if(apptArray[i].activityId == 14){
        html += "<option disabled value=\"4\" id=\"carOpt"+apptArray[i].apptID+"\">Cardio</option><option selected id=\"stOpt"+apptArray[i].apptID+"\" value=\"14\">Strength Training</option><option disabled value=\"24\" id=\"kbOpt"+apptArray[i].apptID+"\">Kickboxing</option><option disabled value=\"34\" id=\"yoOpt"+apptArray[i].apptID+"\">Yoga</option></select></td>"; //activity, START DISABLED
    }
    if(apptArray[i].activityId == 24){
        html += "<option disabled value=\"4\" id=\"carOpt"+apptArray[i].apptID+"\">Cardio</option><option disabled id=\"stOpt"+apptArray[i].apptID+"\" value=\"14\">Strength Training</option><option selected value=\"24\" id=\"kbOpt"+apptArray[i].apptID+"\">Kickboxing</option><option disabled value=\"34\" id=\"yoOpt"+apptArray[i].apptID+"\">Yoga</option></select></td>"; //activity, START DISABLED
    }
    if(apptArray[i].activityId == 34){
        html += "<option disabled value=\"4\" id=\"carOpt"+apptArray[i].apptID+"\">Cardio</option><option disabled id=\"stOpt"+apptArray[i].apptID+"\" value=\"14\">Strength Training</option><option disabled value=\"24\" id=\"kbOpt"+apptArray[i].apptID+"\">Kickboxing</option><option selected value=\"34\" id=\"yoOpt"+apptArray[i].apptID+"\">Yoga</option></select></td>"; //activity, START DISABLED
    }
    return html;
}

function updateDisabledActivities(i){
    //update select options to be enabled/disabled according to Trainer's CanDo activities
    let trainerId = getTrainerId();
    // const trainerApiUrl = "https://localhost:5001/api/Activity/GetTrainerActivities/"+trainerId;
    const trainerApiUrl = "https://trainlikeachampion-g1-api.herokuapp.com/api/Activity/GetTrainerActivities/"+trainerId;
    fetch(trainerApiUrl).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(json){
        //disable select options as needed
        for(var j in json){
            if(json[j].activityId == 4){
                document.getElementById("carOpt"+i).disabled = false;
            }
            if(json[j].activityId == 14){
                document.getElementById("stOpt"+i).disabled = false;
            }
            if(json[j].activityId == 24){
                document.getElementById("kbOpt"+i).disabled = false;
            }
            if(json[j].activityId == 34){
                document.getElementById("yoOpt"+i).disabled = false;
            }
        }
    }).catch(function(error){
        console.log(error)
    })
}

function updateSelectedActivity(activityId, i){
    if(activityId == 4){
        document.getElementById("carOpt"+i).disabled = false;
        document.getElementById("carOpt"+i).selected = true;
    }
    else if(activityId == 14){
        document.getElementById("stOpt"+i).disabled = false;
        document.getElementById("stOpt"+i).selected = true;
    }
    else if(activityId == 24){
        document.getElementById("kbOpt"+i).disabled = false;
        document.getElementById("kbOpt"+i).selected = true;
    }
    else {
        //if activityId == 34
        document.getElementById("yoOpt"+i).disabled = false;
        document.getElementById("yoOpt"+i).selected = true;
    }
}

//AddRow() adds rows to the available appointment input table
function addRow(count, selectedDate){
    let trainerId = getTrainerId();
    if(count % 10 == 4){ //if 4 is the last digit of the number, it's the same as an existing apptID
        count++;
        addRow(count);
    }
    else {
        let newRow = document.createElement('tr');
        newRow.id = "row-"+count;
        let rowHtml = "<td><input type=\"time\" id=startTime-"+count+" name=\"startTime"+count+"\" value=\"\" min=\"06:00\" max=\"18:00\"></td>";
        rowHtml += "<td><input type=\"time\" id=endTime-"+count+" name=\"endTime"+count+"\" value=\"\" min=\"06:00\" max=\"18:00\" ></td>";
        rowHtml += "<td><select id=activity-"+count+" name=\"activities\" onchange=\"updateApptPrice("+count+","+trainerId+")\" value=\"\"><option disabled id=\"carOpt"+count+"\" value=\"4\">Cardio</option><option disabled id=\"stOpt"+count+"\" value=\"14\">Strength Training</option><option disabled id=\"kbOpt"+count+"\" value=\"24\">Kickboxing</option><option id=\"yoOpt"+count+"\" disabled value=\"34\">Yoga</option></select></td>"; 
        rowHtml += "<td><input disabled type=\"text\" name=\"price-"+count+"\" id=\"price-"+count+"\" style=\"max-width:80px;\" value=\"\"></td>";
        rowHtml +="<td id=\"editAvailApptBtn"+count+"\"><button class=\"btn btn-success\" type=\"button\" onclick=\"validateNewAppt("+count+", \'"+ selectedDate+"\')\">Save</button></td>";
        rowHtml += "<td id=\"deleteApptBtn"+count+"\"></td>"; //final td is blank because it's new
        
        updateDisabledActivities(count);

        //set inner HTML and add row
        newRow.innerHTML = rowHtml;
        editAvailTable.appendChild(newRow);

        count++; //increment count
    }
}

function updateApptPrice(i, trainerId){
    //depending on what is selected, update the price in the price-i field
    // const activityApiUrl = "https://localhost:5001/api/Activity/GetTrainerActivities/"+trainerId;
    const activityApiUrl = "https://trainlikeachampion-g1-api.herokuapp.com/api/Activity/GetTrainerActivities/"+trainerId;
    fetch(activityApiUrl).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(json){
        for(var j in json){
            let dropdown = document.getElementById("activity-"+i);
            let selectedValue = dropdown.value;

            if(json[j].activityId == selectedValue){
                if(selectedValue == "4"){
                    //if select is cardio, update price value to cardio price
                    document.getElementById("price-"+i).value = json[j].trainerPriceForActivity;
                }
                else if(selectedValue == "14"){
                    //if strength training, update to strength training price
                    document.getElementById("price-"+i).value = json[j].trainerPriceForActivity;
                }
                else if(selectedValue == "24"){
                    //if kickboxing, update to kickboxing price
                    document.getElementById("price-"+i).value = json[j].trainerPriceForActivity;
                }
                else {
                    //if yoga, update to yoga price
                    document.getElementById("price-"+apptArray[i].apptID).value = json[j].trainerPriceForActivity;
                }
            }
        }
    }).catch(function(error){
        console.log(error)
    })

}

function enableApptEdit(apptID){
    /* CURRENTLY NOT WORKING because endTime-apptID will not enable for some reason */
    //enable startTime-apptID, endTime-apptID, and activity-apptID
    document.getElementById("startTime-"+apptID).disabled = false;
    document.getElementById("endTime-"+apptID).disabled = false;
    document.getElementById("activity-"+apptID).disabled = false;
    //change edit button to a save button
    let html = "<button class=\"btn btn-success\" type=\"button\" onclick=\"editAvailableAppt("+apptID+")\">Save Changes</button>";
    document.getElementById("editAvailApptBtn"+apptID).innerHTML = html;
}


function editAvailableAppt(apptID){
    /* get values from startTime-id, endTime-id, activity-id, and price-id, 
    create new appt object with that and send in a PUT request */
    let startTime = document.getElementById("startTime-"+apptID).value;
    let newStartTime = "0001-01-01T" + startTime + ":00";

    let endTime = document.getElementById("endTime-"+apptID).value;
    let newEndTime = "0001-01-01T" + endTime + ":00";

    let newActivityID = document.getElementById("activity-"+apptID).value;
    // make new body object to send in PUT request
    let bodyObj = {
        appointmentId: apptID,
        startTime: newStartTime,
        endTime: newEndTime,
        activityId: newActivityID
    }
    // const putApptApiUrl = "https://localhost:5001/api/Appointment/PutAvailableAppointment/"+apptID+"/"+newStartTime+"/"+newEndTime+"/"+newActivityID;
    const putApptApiUrl = "https://trainlikeachampion-g1-api.herokuapp.com/api/Appointment/PutAvailableAppointment/"+apptID+"/"+newStartTime+"/"+newEndTime+"/"+newActivityID;
    fetch(putApptApiUrl, {
        method: "PUT",
        headers: {
            "Accept": 'application/json',
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(bodyObj)
    })
    .then(function(response){
        console.log(response);
    })

    /* NOT WORKING RIGHT NOW because endTime-apptID won't enable and disable like startTime and activity */
    //then disabapptArray[i].apptIle the fields again and change the Save button back to an edit button
    // document.getElementById("startTime-"+apptID).disabled = true;
    // document.getElementById("endTime-"+apptID).dsabled = true;
    // document.getElementById("activity-"+apptID).disabled = true;
    let html = "<button class=\"btn btn-secondary\" type=\"button\" onclick=\"enableApptEdit("+apptID+")\">Edit</button>";
    document.getElementById("editAvailApptBtn"+apptID).innerHTML = html;

}

function validateNewAppt(i, date){
    //get values of startTime-i, endTime-i, activity-i, price-i
    console.log("FOUND validateNewAppt() - selectedDate is now " + date + "?????");
    let startTime = document.getElementById("startTime-"+i).value;
    let newStartTime = "0001-01-01T" + startTime + ":00";

    let endTime = document.getElementById("endTime-"+i).value;
    //if endTime is <= startTime, show error message
    if(endTime <= startTime){
        alert("End time must be later than start time.");
        document.getElementById("endTime-"+i).focus();
    }
    else {
        let newEndTime = "0001-01-01T" + endTime + ":00";
        let dropdown = document.getElementById("activity-"+i);
        let selectedActivity = dropdown.options[dropdown.selectedIndex].value;
        let activityId = selectedActivity;
        console.log('selected activity: ');
        console.log(selectedActivity);
        let price = document.getElementById("price-"+i).value;
        //create new bodyObj to send as appt
        var bodyObj = {
            appointmentDate: date,
            appointmentTrainer: {
                trainerId: getTrainerId()
            },
            appointmentActivity: {
                activityId: activityId
            },
            appointmentCost: price
    
        }
        console.log("activityId of the new appt: " + bodyObj.appointmentActivity.activityId);
        //make POST call to create new appt with bodyObj, startTime, and endTime
        // const apptApiUrl = "https://localhost:5001/api/Appointment/WriteAvailableAppointment/"+newStartTime+"/"+newEndTime;
        const apptApiUrl = "https://trainlikeachampion-g1-api.herokuapp.com/api/Appointment/WriteAvailableAppointment/"+newStartTime+"/"+newEndTime;
        fetch(apptApiUrl, {
            method: "POST",
            headers: {
                "Accept": 'application/json',
                "Content-Type": 'application/json'
            },
            body: JSON.stringify(bodyObj)
        })
        .then(function(response){
            console.log(response);
            //reload the modal
            showEditAvailabilityModal(date);
        })
    }
    
}

function deleteAppointment(apptID, date){
    //delete appointment by ID
    // const apptApiUrl = "https://localhost:5001/api/Appointment/"+apptID;
    const apptApiUrl = "https://trainlikeachampion-g1-api.herokuapp.com/api/Appointment/"+apptID;
    console.log(apptID);
    fetch(apptApiUrl, {
        method: "DELETE",
        headers: {
            "Accept": 'application/json',
            "Content-Type": 'application/json'
        },
        body: JSON.stringify({
            appointmentId: apptID
        })      
    })
    .then(function(response){
        console.log(response);
        showEditAvailabilityModal(date);
    })
}


function closeEditAvailabilityModal(){
    var modal = document.getElementById("editTrainerApptModal");
    modal.style.display = "none";
}

function getFullTime(hours, minutes){
    //add leading zeroes as needed to hours or minutes, return HH:mm
    let newHours = "";
    if(hours < 10){
        newHours = "0" + hours.toString();
    }
    else {
        newHours = hours.toString();
    }
    let newMinutes = "";
    if(minutes < 10){
        newMinutes = "0" + minutes.toString();
    }
    else {
        newMinutes = minutes.toString();
    }
    return newHours + ":" + newMinutes;
}

/* EDIT TRAINER PROFILE SECTION */
function getTrainerProfileForm(trainer){
    //do we have to pass in an id?
    let trainerBirthDateOnly = trainer.birthDate.slice(0,10);

    //fill in everything but the password. Trainer should be required to enter their current password to make changes.
    document.getElementById("currEmail").value = trainer.email;
    document.getElementById("inputFName").value = trainer.fName;
    document.getElementById("inputLName").value = trainer.lName;
    document.getElementById("birthDate").value = trainerBirthDateOnly;
    document.getElementById("trainerGender").value = trainer.gender.toLowerCase();
    document.getElementById("updateTrainerPhone").value = trainer.phoneNo;
    console.log(trainer.phoneNo);
 
    //get activities for trainer, update checked/price fields as needed
    // const activityApiUrl = "https://localhost:5001/api/Activity/GetTrainerActivities/"+trainer.trainerId;
    const activityApiUrl = "https://trainlikeachampion-g1-api.herokuapp.com/api/Activity/GetTrainerActivities/"+trainer.trainerId;
    fetch(activityApiUrl).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(json){
        //json returns an array of objects with activityId and price
        for(var i in json){
            if(json[i].activityId == 4){
                document.getElementById("cardioSelect").checked = true;
                console.log(json[i].trainerPriceForActivity);
                document.getElementById("cardioPrice").value = json[i].trainerPriceForActivity;
                document.getElementById("cardioPrice").disabled = false; 
            }
            if(json[i].activityId == 14){
                document.getElementById("stSelect").checked = true;
                document.getElementById("strengthTrainingPrice").value = json[i].trainerPriceForActivity;
                document.getElementById("strengthTrainingPrice").disabled = false;
            }
            if(json[i].activityId == 24){
                document.getElementById("kbSelect").checked = true;
                document.getElementById("kickboxingPrice").value = json[i].trainerPriceForActivity;
                document.getElementById("kickboxingPrice").disabled = false;
            }
            if(json[i].activityId == 34){
                document.getElementById("yogaSelect").checked = true;
                document.getElementById("yogaPrice").value = json[i].trainerPriceForActivity;
                document.getElementById("yogaPrice").disabled = false;
            }
        }
    }).catch(function(error){
        console.log(error);
    })
}


function trainerEditProfile(){
    let id = getTrainerId();
    let trainer = [];
    // const trainerApiUrl = "https://localhost:5001/api/Trainer/GetTrainerByID/"+id;
    const trainerApiUrl = "https://trainlikeachampion-g1-api.herokuapp.com/api/Trainer/GetTrainerByID/"+id;
    //GET Trainer by ID
    fetch(trainerApiUrl).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(json){
        trainer = json;
        //set up a bodyObj for trainer, then do a Put with the updated object

        //trainer MUST enter current password to make changes
        if(document.getElementById("currPassword").value == undefined){
            document.getElementById("mustEnterCurrPasswordMsg").style.display = "block";
        }
        else if(document.getElementById("currPassword").value != trainer.password){
            document.getElementById("incorrectPasswordMsg").style.display = "block";
        }
        else {
            //only proceed if trainer entered the correct currPassword
            let bodyObj = getUpdatedTrainerObj(trainer);
            
            //PUT new trainer object
            // const putTrainerApiUrl = "https://localhost:5001/api/Trainer/";
            const putTrainerApiUrl = "https://trainlikeachampion-g1-api.herokuapp.com/api/Trainer";
            fetch(putTrainerApiUrl, {
                method: "PUT",
                headers: {
                    "Accept": 'application/json',
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify(bodyObj)
            })
            .then(function(response){
                console.log(response);
                //reload trainer profile form
                // const getTrainerApiUrl = "https://localhost:5001/api/Trainer/GetTrainerByID/"+trainer.trainerId;
                const getTrainerApiUrl = "https://trainlikeachampion-g1-api.herokuapp.com/api/Trainer/GetTrainerByID/"+trainer.trainerId;
                fetch(getTrainerApiUrl).then(function(response){
                    console.log(response);
                    return response.json();
                }).then(function(json){
                    getTrainerProfileForm(json);
                }).catch(function(error){
                    console.log(error);
                })
                
            })
        }
    }).catch(function(error){
        console.log(error);
    })
}

function getUpdatedTrainerObj(){
    //gets and validates values from editTrainerProfile form, returns a formatted object we can send in PUT request
    //handle password
    let inputPassword;
    if(document.getElementById("newPassword").value == undefined || document.getElementById("newPassword").value == ""){
        inputPassword = document.getElementById("currPassword").value;
    }
    else {
        //if they've entered a new password, set inputPassword to that
        inputPassword = document.getElementById("newPassword").value;
    }
    //handle email
    let inputEmail;
    if(document.getElementById("newEmail").value == undefined || document.getElementById("newEmail").value == ""){
        inputEmail = document.getElementById("currEmail").value;
    }
    else {
        inputEmail = document.getElementById("newEmail").value;
    }
    //handle firstName, lastName, dob, gender
    let inputFirstName = document.getElementById("inputFName").value;
    let inputLastName = document.getElementById("inputLName").value;
    let dob = document.getElementById("birthDate").value;
    let inputGender = document.getElementById("trainerGender").value;

    //handle activities by creating an array to put in the bodyObj
    let activities = [];
    if(document.getElementById("cardioSelect").checked){
        if(document.getElementById("cardioPrice").value > 0){
            activities.push({
                activityId: document.getElementById("cardioSelect").value,
                trainerPriceForActivity: document.getElementById("cardioPrice").value
            });
        }
    }
    if(document.getElementById("stSelect").checked){
        if(document.getElementById("strengthTrainingPrice").value > 0){
            activities.push({
                activityId: document.getElementById("stSelect").value,
                trainerPriceForActivity: document.getElementById("strengthTrainingPrice").value
            });
        }
    }
    if(document.getElementById("kbSelect").checked){
        if(document.getElementById("kickboxingPrice").value > 0){
            activities.push({
                activityId: document.getElementById("kbSelect").value,
                trainerPriceForActivity: document.getElementById("kickboxingPrice").value
            });
        }
    }
    if(document.getElementById("yogaSelect").checked){
        if(document.getElementById("yogaPrice").value > 0){
            activities.push({
                activityId: document.getElementById("yogaSelect").value,
                trainerPriceForActivity: document.getElementById("yogaPrice").value
            });
        }
    }
    if(activities.length == 0){
        //if no activities are selected, display error message
        document.getElementById("mustSelectActivitiesErrorMsg").style.display = "block";
    }

    //handle phoneNo
    let inputPhoneNo = "";
    if(document.getElementById("updateTrainerPhone").value != undefined){
        console.log("result of isNaN");
        console.log(isNaN(document.getElementById("updateTrainerPhone").value));
        if(!isNaN(document.getElementById("updateTrainerPhone").value)){
            //if it is a number, add its value to inputPhoneNo
            inputPhoneNo = document.getElementById("updateTrainerPhone").value;
        }
    }
    console.log("inputPhoneNo is ");
    console.log(inputPhoneNo);


    //create bodyObj to send in PUT request back in EditTrainerProfile()
    bodyObj = {
        trainerId: getTrainerId(),
        password: inputPassword,
        birthDate: dob,
        gender: inputGender,
        phoneNo: inputPhoneNo,
        trainerActivities: activities,
        fName: inputFirstName,
        lName: inputLastName,
        email: inputEmail
    }
    return bodyObj;


}