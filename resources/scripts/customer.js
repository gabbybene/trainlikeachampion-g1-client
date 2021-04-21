/* Scripts relating to the page customer.html,
including loading customer confirmed appts,
loading available appointments to calendar, 
and loading customer profile */


var today = new Date();
var currentMonth = today.getMonth();
var currentYear = today.getFullYear();



//Check https://github.com/niinpatel/calendarHTML-Javascript/blob/master/scripts.js for a possible JS calendar
function handleCustomerDashboardOnLoad(){ //load each part of dashboard
    let id = getCustomerId();
    let customer = [];
    const customerApiUrl = "https://localhost:5001/api/Customer/GetCustomerByID/"+id;
    fetch(customerApiUrl).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(json){
        customer = json;
        getConfirmedAppointments(customer);
        getAvailableAppointmentCalendar(currentMonth, currentYear);
        getCustomerProfileForm(customer);

    }).catch(function(error){
        console.log(error);
    }) 
}

function getCustomerId(){
    //get customer Id from URL
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get("id");
    return id;
}

function getCustomerObject(){
    var id = getCustomerId();
    let customer = [];

    const customerApiUrl = "https://localhost:5001/api/Customer/GetCustomerByID/"+id;
    fetch(customerApiUrl).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(json){
        customer = json;
    }).catch(function(error){
        console.log(error);
    }) 
    return customer;
}

function getCustDashboardUrl(){
    let customerId = getCustomerId();
    return "./customer.html?id=@"+customerId;

}


function getConfirmedAppointments(customer){
    //Get appointments from DB that match the customer ID In the url & have a date of today or in the future.
    //return that array of appointment objects
    let html = "";
    const apptApiUrl = "https://localhost:5001/api/Appointment/GetConfirmedAppointmentsForCustomer/"+customer.customerId;
    fetch(apptApiUrl).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(json){
        if(json[0] == undefined){
             //will return the empty []
            html += "<h2>You don't have any upcoming appointments scheduled at this time.</h2><h2>Check out the calendar below to find some sessions and get training!</h2>";
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
                let activity =  object.appointmentTrainer.trainerActivities[0].activityName;
                let trainerName = object.appointmentTrainer.fName+ " " + object.appointmentTrainer.lName;
                //print buttons with appt details
                html += "<button type=\"button btn\" class=\"list-group-item list-group-item-action\" onclick=\"showEditCustApptModal("+object.appointmentId+")\">";
                html += apptDate + " at " + startTime + "-" + endTime + " | Activity: " + activity + " | Trainer: " + trainerName +"</button>";
            }
        }
        //set the innerHTML of custApptList
        document.getElementById("custApptList").innerHTML = html;
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


//FOR EDIT CUSTOMER APPT MODAL in viewCustAppointments section
function showEditCustApptModal(apptID){
    //Make API call to get appointment with the passed-in ID from the database
    const apptApiUrl = "https://localhost:5001/api/Appointment/GetAppointmentByID/"+apptID;
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
            activity:  object.appointmentTrainer.trainerActivities[0].activityName,
            trainerName: object.appointmentTrainer.fName+ " " + object.appointmentTrainer.lName,
            price: object.appointmentCost,
        }
        
        //set up HTML 
        let html = "<div class=\"modal-content\"><span class=\"close\" onclick=\"closeEditCustApptModal()\">&times;</span>";
        html += "<h1 class=\"modal-header\">Appoitment Details</h1><br>";
        html += "<div class=\"row\"><div class=\"col-md-4\"><h3>Date/Time:</h3></div><div class=\"col-md-8\"><h3>";
        html += appt.apptDate + " at " + appt.startTime + "-" +  appt.endTime  +"</h3></div></div>";
        html += "<div class=\"row\"><div class=\"col-md-4\"><h3>Trainer:</h3></div><div class=\"col-md-8\"><h3>"+ appt.trainerName+"</h3></div></div>";
        html += "<div class=\"row\"><div class=\"col-md-4\"><h3>Activity:</h3></div><div class=\"col-md-8\"><h3>"+ appt.activity+"</h3></div></div>";
        html += "<div class=\"row\"><div class=\"col-md-4\"><h3>Price:</h3></div><div class=\"col-md-8\"></h3>$"+appt.price+"</h3></div></div>";
        html += "<br><button class=\"btn btn-action btn-warning\" id=\"cancelApptButton\" onclick=\"cancelCustApptOnClick("+apptID+")\">Cancel This Appointment</button></div>";

        //set inner HTML of modal
        document.getElementById("editCustApptModal").innerHTML = html;

        //Show Modal
        var modal = document.getElementById("editCustApptModal");
        modal.style.display = "block";
        var span = document.getElementsByClassName("close")[0];
    }).catch(function(error){
        console.log(error);
    })
}

function cancelCustApptOnClick(apptID){
    //get customerID and create a body Object to send in the PUT request
    let customerId = getCustomerId();
    let bodyObj = [customerId, apptID];
    const cancelApptApiUrl = "https://localhost:5001/api/Appointment/PutByDeletingCustomerID/"+bodyObj;
    //make an int[] to send into the put request. [0]=custID, [1]=apptID
    fetch(cancelApptApiUrl, {
        method: "PUT",
        headers: {
            "Accept": 'application/json',
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(bodyObj)
    })
    .then(function(response){
        //when they cancel the appointment, change the modal html to show that the apointment was canceled, and change button to close.
        let html = " <div class=\"modal-content\"><span class=\"close\" onclick=\"apptCanceledCloseModal()\">&times;</span>";
        html += "<h1 class=\"modal-header\">Appoitment Canceled</h1><br>";
        html += "<div class=\"row text-center\"><h2>This appointment has been canceled.</h2></div>"; 
        html += "<div class=\"row text-center\"><h2>Click the button to return to your dashboard to search for other appointments.</h2></div>";
        html += "<br><button class=\"btn btn-action\" onclick=\"apptCanceledCloseModal()\">Close</button>";
        document.getElementById("editCustApptModal").innerHTML = html;
    })
    //use the customer's id to remove them from the appointment. Then save that appointment back to the database. 
}

function apptCanceledCloseModal(){
    //if customer canceled an appointment, reload their confirmed appts & the available appt calendar, THEN close the modal
    let id = getCustomerId();
    let customer = [];
    const customerApiUrl = "https://localhost:5001/api/Customer/GetCustomerByID/"+id;
    fetch(customerApiUrl).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(json){
        customer = json;
        getConfirmedAppointments(customer);
        getAvailableAppointmentCalendar(currentMonth, currentYear);
        //close the modal
        var modal = document.getElementById("editCustApptModal");
        modal.style.display = "none";
    }).catch(function(error){
        console.log(error);
    }) 
}

function closeEditCustApptModal(){
    var modal = document.getElementById("editCustApptModal");
    modal.style.display = "none";
}

window.onclick = function(event){
    var modal = document.getElementById("editCustApptModal");
    if(event.target == modal){
        modal.style.display = "none";
    }
}
/*END CUSTOMER EDIT APPOINTMENTS & MODAL*/




//CUSTOMER AVAILABLE APPOINTMENT CALENDAR SECTION
function getAvailableAppointmentCalendar(currentMonth, currentYear){
    setCalendarHeader(currentMonth, currentYear);

    //get month and year for use below
    let mon = currentMonth;
    let d = new Date(currentYear, mon);

    //GET DISTINCT dates of available appointments, for use in populating the calendar
    const apptApiUrl = "https://localhost:5001/api/Appointment/GetDistinctAvailableAppointments";
    var fullDistinctDateTimeArray = []; 
    var distinctDateArray = []; 
    fetch(apptApiUrl).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(json){
        fullDistinctDateTimeArray = json; //these values are passed through buttons
        for(var i in json){
            //transform date from yyyy-mm-ddtime to mm/dd/yyyy in distinctDateArray
            let dateAndTime = json[i];
            let myDate = dateAndTime.slice(0,10); //get first 10 characters of json string
            let splitDate = myDate.split('-'); //split at -
            let newMonth = parseInt(splitDate[1]);
            newMonth = +newMonth; //remove leading zero if exists
            let newDay = parseInt(splitDate[2]);
            newDay = +newDay; //remove leading zero if exists
            let newDate = [newMonth, newDay, splitDate[0]]; //make new date with correct order
            newDate = newDate.join("/"); //join back together with /
            distinctDateArray[i] = newDate; //set to distinctArray[i] 
        }

    //BUILD CALENDAR
        let calendarTable = "<table class=\"table table-responsive-sm calendar-table\"><thead>";
        calendarTable += "<th>Mon</th><th>Tue</th><th>Wed</th><th>Thur</th><th>Fri</th><th>Sat</th><th>Sun</th></thead><tbody id=\"calendarBody\">";
        // spaces for the first row from Sunday until the first day of the month
        for(let i = 0; i < d.getDay(); i++) {
            calendarTable += "<td></td>";
        }
        let found = false;
        //<td> with dates for that month
        while(d.getMonth() == mon) {
            let fullDate = (d.getMonth()+1) + "/" + d.getDate() + "/" + d.getFullYear();
            //if month of a date in the array doesn't match the month of fullDate, remove it from distinctDatearray
            for(var i in distinctDateArray){
                //split the date into an array at /
                let tempDateStr = distinctDateArray[i];
                let tempDateArr = tempDateStr.split('/');
                //check month of that date. If not the same as current month, remove from the 2
                if(tempDateArr[0] != fullDate[0]){ 
                    //remove from distinctDateArray
                    let itemToRemove = distinctDateArray[i];
                    let index = distinctDateArray.indexOf(itemToRemove);
                    if(index > -1){
                        distinctDateArray.splice(index, 1);
                    }
                    //remove from fullDistinctDateTimeArray
                    itemToRemove = fullDistinctDateTimeArray[i];
                    index = fullDistinctDateTimeArray.indexOf(itemToRemove);
                    if(index > -1){
                        fullDistinctDateTimeArray.splice(index, 1);
                    }       
                }
            }
            for(var i in distinctDateArray){
                if(distinctDateArray[i] == fullDate){
                    calendarTable += "<td><button onclick=\"showMakeAppointmentModal(value)\" value="+fullDistinctDateTimeArray[i]+">" + d.getDate() + "</button></td>";
                    //delete the element from both arrays
                    distinctDateArray.shift();
                    fullDistinctDateTimeArray.shift();
                    found = true;
                }
            }
            if (found == false) {
                //if no date with an available appointment was found, disable the  button
                calendarTable += "<td><button disabled style=\"background-color: #808080\">" + d.getDate() + "</button></td>"; 
            }
            if(d.getDay() == 6) { //if last day of week (Saturday), new table row
                calendarTable += "</tr><tr>";
            }
            d.setDate(d.getDate() + 1); //increment date
            found = false; //reset found to false for the next loop
        }
        //add spaces after last days of month for last row if Saturday isn't the last day of the month
        if(d.getDay() != 6) {
            for(let i = d.getDay(); i < 7; i++) {
                calendarTable += "<td></td>";
            }
        }
        //close table & set innerHTML
        calendarTable += "<tr></tbody></table>";
        document.getElementById("calendar").innerHTML = calendarTable;
    }).catch(function(error){
        console.log(error);
    }) 
}

function setCalendarHeader(currentMonth, currentYear)
{
    // var currDate = new Date(); //current date
    var mList = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
    var monthName = mList[currentMonth];
    var monthAndYear = monthName + " " + currentYear;
    document.getElementById("currMonth").innerHTML = monthAndYear;
}

function nextMonth() {
    currentYear = (currentMonth === 11) ? currentYear + 1 : currentYear;
    currentMonth = (currentMonth + 1) % 12;
    setCalendarHeader(currentMonth, currentYear);
    getAvailableAppointmentCalendar(currentMonth, currentYear);
}

function previousMonth() {
    currentYear = (currentMonth === 0) ? currentYear - 1 : currentYear;
    currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1;
    setCalendarHeader(currentMonth, currentYear);
    getAvailableAppointmentCalendar(currentMonth, currentYear);
}



//FOR MODAL TO MAKE APPOINTMENTS
function showMakeAppointmentModal(value){
    let selectedDate = value;
    
    //Make API call to get available appointments matching user-selected date
    const apptApiUrl = "https://localhost:5001/api/Appointment/GetAvailableAppointmentsByDate/"+selectedDate;
    fetch(apptApiUrl).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(json){
        //set up starting HTML
        let html = document.getElementById("custMakeApptModal");
        html += "<div class=\"modal-dialog\"><div class=\"modal-content\">";
        html += "<span class=\"close\" onclick=\"closeMakeAppointmentModal()\">&times;</span><h1 class=\"modal-header\">Available Appointments</h1>";
        html += "<div class=\"list-group avail-appt-list text-center\" id=\"availApptList\">";
  
        for(var i in json){

            //stringify, then re-parse to an object **couldn't get the start and end times to read without doing this**
            var tempStr = JSON.stringify(json[i]);
            var object = JSON.parse(tempStr);
            //simplify object format with only the needed items
            var appt = {
                apptDate: getFormattedDate(object.appointmentDate),
                startTime: getFormattedTime(object.startTime.hours, object.startTime.minutes),
                endTime: getFormattedTime(object.endTime.hours, object.endTime.minutes),
                activity:  object.appointmentTrainer.trainerActivities[0].activityName,
                trainerName: object.appointmentTrainer.fName+ " " + object.appointmentTrainer.lName,
                // price: object.appointmentTrainer.trainerActivities[0].trainerPriceForActivity,
                price: object.appointmentCost
            }
            console.log('appt apptDate');
            console.log(appt.apptDate);
            //populate buttons with details
            html += "<button type=\"button btn\" class=\"list-group-item list-group-item-action\" value="+object.appointmentId+" onclick=\"showApptDetails("+object.appointmentId+")\">";
            html += "Time: " + appt.startTime + "-" + appt.endTime + " | Price: $"+ appt.price +" ";
            html += " | Activity: "+appt.activity +" "+ " | Trainer: "+appt.trainerName +"</button>";
        }
        //closing HTML & set modal innerHTML
        html += "</div></div></div>";
        document.getElementById("custMakeApptModal").innerHTML = html;

        //show modal
        var modal = document.getElementById("custMakeApptModal");
        modal.style.display = "block";
    
        var span = document.getElementsByClassName("close")[0];
    }).catch(function(error){
        console.log(error);
    })

}

function showApptDetails(apptID){
    //Make API call to get appointment details corresponding to the id
    const apptApiUrl = "https://localhost:5001/api/Appointment/GetAppointmentByID/"+apptID;
    fetch(apptApiUrl).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(json){
        var tempStr = JSON.stringify(json);
        var object = JSON.parse(tempStr);
        //simplify object to a format with only the needed items
        var appt = {
            apptDate: getFormattedDate(object.appointmentDate),
            startTime: getFormattedTime(object.startTime.hours, object.startTime.minutes),
            endTime: getFormattedTime(object.endTime.hours, object.endTime.minutes),
            activity:  object.appointmentTrainer.trainerActivities[0].activityName,
            trainerName: object.appointmentTrainer.fName+ " " + object.appointmentTrainer.lName,
            price: object.appointmentCost
        }
        //Set up HTML
        let html = "";
        html += "<div class=\"modal-dialog\"><div class=\"modal-content\">";
        html += "<span class=\"close\" onclick=\"closeMakeAppointmentModal()\">&times;</span><h1 class=\"modal-header\">Pay and Confirm Appointment</h1>";
        html += "<div id=\"apptDetails\"><div class=\"row text-left\"><h4>Date: "+appt.apptDate+"</h4></div>";
        html += "<div class=\"row text-left\"><h4>Time: "+appt.startTime+"-"+appt.endTime+"</h4></div>";
        html += "<div class=\"row text-left\"><h4>Activity: "+appt.activity+"</h4></div>";
        html += "<div class=\"row text-left\"><h4>Trainer: "+appt.trainerName+"</h4></div>";
        html += "<div class=\"row text-left\"><h4>Price: $"+appt.price+"</h4></div></div>";
        /*radio button for paying cash, and credit card (disabled for now)*/
        html += "<form><div class=\"form-check\"><div class=\"row\">";
        html += "<div class=\"col-md-12\"><input class=\"form-check-input\" type=\"radio\" name=\"flexRadioDefault\" id=\"payingCash\" checked onchange=\"toggleCreditCardForm()\">";
        html += "<label class=\"form-check-label\" for=\"payingCash\">Cash</label></div></div>";
        html += "<div class=\"col-md-12\"><label for=\"amountPaid\" style=\"padding-left: 24px;\">Enter amount:</label>";
        html += "<input type=\"number\" id=\"amountPaid\" placeholder=\"Enter amount here\"></div><small id=\"insufficientCashMessage\" class=\"text-muted\" style=\"display: none\">Amount entered must be equal to the price of the appointment.</small></div>";
        html += "<div class=\"form-check\"><div class=\"row\"><div class=\"col-md-12\"><input class=\"form-check-input\" type=\"radio\" name=\"flexRadioDefault\" id=\"payingCard\" onchange=\"toggleCreditCardForm()\" disabled>"; //DISABLED
        html += "<label class=\"form-check-label\" for=\"payingCard\">Credit Card</label></div></div></div>";
        html += "</form>";

        //add credit form here, start at hide, show if radio button for creditCard is selected
        //HTML FOR THIS FORM CAME FROM https://tutorialzine.com/2016/11/simple-credit-card-validation-form
        html+="<div class=\"row\"><div id=\"creditCardForm\" class=\"payment\" style=\"display: none;\"><form><div class=\"form-group owner\"><label for=\"owner\">Owner</label><input type=\"text\" class=\"form-control\" id=\"owner\"></div>";
        html += "<div class=\"row\"><div class=\"col-sm-12\"><div class=\"form-group\" id=\"card-number-field\"><label for=\"cardNumber\">Card Number</label><input type=\"text\" class=\"form-control\" id=\"cardNumber\"></div></div></div>";
        html += "<div class=\"row\"><div class=\"col-sm-6\"><div class=\"form-group CVV\"><label for=\"cvv\">CVV</label><input type=\"text\" class=\"form-control\" id=\"cvv\"></div></div>";
        html += "<div class=\"col-sm-6\"><div class=\"form-group\" id=\"expiration-date\"><label>Expiration Date</label><select><option value=\"01\">January</option><option value=\"02\">February </option><option value=\"03\">March</option>";
        html += "<option value=\"04\">April</option><option value=\"05\">May</option><option value=\"06\">June</option><option value=\"07\">July</option><option value=\"08\">August</option>";
        html += "<option value=\"09\">September</option><option value=\"10\">October</option><option value=\"11\">November</option><option value=\"12\">December</option></select>";
        html += "<select><option value=\"21\"> 2021</option><option value=\"22\"> 2022</option><option value=\"23\"> 2023</option><option value=\"24\"> 2024</option><option value=\"25\"> 2025</option><option value=\"26\"> 2026</option></select></div></div></div></div></div>";

        html += "<div class=\"text-center\"><button class=\"btn btn-lg btn-success\" type=\"submit\" onclick=\"addCustToAppointment("+apptID+")\">Pay and Confirm</button></div></div></div>";
        //update modal HTML
        document.getElementById("custMakeApptModal").innerHTML = html;
    }).catch(function(error){
        console.log(error);
    })
}

function toggleCreditCardForm(){
    if(document.getElementById("payingCash").checked){
        document.getElementById("creditCardForm").style.display = "none";
    }
    else {
        //if payingCard is checked
        document.getElementById("creditCardForm").style.display = "block";
    }
    
}

function addCustToAppointment(apptID){
      //Make API call to get appointment details corresponding to the id
    const apptApiUrl = "https://localhost:5001/api/Appointment/GetAppointmentByID/"+apptID;
    fetch(apptApiUrl).then(function(response){          
        console.log(response);
        return response.json();
    }).then(function(json){
        var tempStr = JSON.stringify(json);
        var object = JSON.parse(tempStr);

        //simplify object to a format with only the needed items

        var appt = {
            apptDate: getFormattedDate(object.appointmentDate),
            startTime: getFormattedTime(object.startTime.hours, object.startTime.minutes),
            endTime: getFormattedTime(object.endTime.hours, object.endTime.minutes),
            activity:  object.appointmentTrainer.trainerActivities[0].activityName,
            trainerName: object.appointmentTrainer.fName+ " " + object.appointmentTrainer.lName,
            price: object.appointmentCost,
            amountPaidByCash: document.getElementById("amountPaid").value
        }

        //parse amountPaid to a number
        let value = document.getElementById("amountPaid").value;
        let amountPaid = parseFloat(value);
        //if not enough $$ entered or if no number is entered, display error message
        if(amountPaid < appt.price || Number.isNaN(amountPaid)){
            document.getElementById("insufficientCashMessage").style.display = "block";
        }
        else //if amount entered is enough, add customer to appointment
        {
            
            //make API call to add customer to appt
            let customerId = getCustomerId();
            // const addCustApiUrl = "https://localhost:5001/api/Appointment/PutByAddingCustomerID/"+customerId;
            //make an int[] to send into the put request. [0]=custID, [1]=apptID

    //REVERT TO THIS IF NO CREDIT CARD
            // let bodyObj = [customerId, apptID];
    //ACTUALLY NEED TO UPDATE THIS TO TAKE A BODYOBJECT

            //IF USING CREDIT CARD, CHANGE PUTBYADDINGCUSTOMERID TO TAKE AN OBJECT WITH APPTCUSTOMER, APPTID, AND AMOUNTPAID BY CASH OR CARD
            let bodyObj = {};

            if(document.getElementById("payingCash").checked){
                console.log("paying with cash");
                bodyObj = {
                    appointmentId: apptID,
                    appointmentCustomer: {
                        customerId: customerId
                    },
                    amountPaidByCard: 0,
                    amountPaidByCash: amountPaid
                };
            }
            else {
                //if checked payingCard
                console.log("paying with card");
                bodyObj = {
                    appointmentId: apptID,
                    appointmentCustomer: {
                        customerId: customerId
                    },
                    amountPaidByCard: amountPaid,
                    amountPaidByCash: 0
                };
            }
            console.log(JSON.stringify(bodyObj));

            const addCustApiUrl = "https://localhost:5001/api/Appointment/PutByAddingCustomer/";
            fetch(addCustApiUrl, {
                method: "PUT",
                headers: {
                    "Accept": 'application/json',
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify(bodyObj)
            })
            .then(function(response){
                console.log(response);
                //update HTML of Modal to show that appt is confirmed
                let html = document.getElementById("custMakeApptModal");
                html = "";
                html += "<div class=\"modal-dialog\"><div class=\"modal-content\">";
                html += "<span class=\"close\" onclick=\"closeMakeAppointmentModal()\">&times;</span><h1 class=\"modal-header\">Appointment Confirmed!</h1>";
                html += "<h2 style=\"padding-top: 20px;\">Your appointment is confirmed!  See the details below:</h3>";
                html += "<div id=\"apptDetails\"><div class=\"row text-left\"><h4>Date: "+appt.apptDate+"</h4></div>";
                html += "<div class=\"row text-left\"><h4>Time: "+appt.startTime+"-"+appt.endTime+"</h4></div>";
                html += "<div class=\"row text-left\"><h4>Activity: "+appt.activity+"</h4></div>";
                html += "<div class=\"row text-left\"><h4>Trainer: "+appt.trainerName+"</h4></div>";
                html += "<div class=\"row text-left\"><h4>Price: $"+appt.price+"</h4></div>";
                html += "<div class=\"row text-left\"><h4>Amount Paid: $"+amountPaid+"</h4></div>";
                html += "<div class=\"row text-center\"><button class=\"btn btn-lg btn-secondary\" role=\"button\" onclick=\"closeMakeAppointmentModal()\">Close this window</button></div>";
                    
                document.getElementById("custMakeApptModal").innerHTML = html;
            })
        }
    }).catch(function(error){
        console.log(error);
    })
}

function closeMakeAppointmentModal(){
    //if customer made an appointment, reload the the calendar & available appointments, then close the modal
    let id = getCustomerId();
    let customer = [];
    const customerApiUrl = "https://localhost:5001/api/Customer/GetCustomerByID/"+id;
    fetch(customerApiUrl).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(json){
        customer = json;
        getConfirmedAppointments(customer);
        getAvailableAppointmentCalendar(currentMonth, currentYear);
        var modal = document.getElementById("custMakeApptModal");
        modal.style.display = "none";
    }).catch(function(error){
        console.log(error);
    }) 
}

window.onclick = function(event){
    var modal = document.getElementById("custMakeApptModal");
    if(event.target == modal){
        modal.style.display = "none";
    }
}
/*END CALENDAR/MAKE APPOINTMENTS SECTION*/

/* GET / UPDATE CUSTOMER PROFILE SECTION */
function getCustomerProfileForm(customer){
    document.getElementById("currPassword").value = "";

    let birthDateOnly = customer.birthDate.slice(0,10);   
    document.getElementById("currEmail").value = customer.email;
    document.getElementById("inputFName").value = customer.fName;
    document.getElementById("inputLName").value = customer.lName;
    document.getElementById("birthDate").value = birthDateOnly;
    document.getElementById("custGender").value = customer.gender.toLowerCase();
    document.getElementById("fitnessGoals").value = customer.fitnessGoals;
    document.getElementById("updateCustPhone").value = customer.phoneNo;

    for(var i in customer.customerActivities){ //update checked status of activities
        if(customer.customerActivities[i].activityId == 4){ // 4 = cardio
            document.getElementById("cardio").checked = true;
        }
        else if(customer.customerActivities[i].activityId == 14){ // 14 = strength training
            document.getElementById("strengthTraining").checked = true;
        }
        else if(customer.customerActivities[i].activityId == 34){ // 34 = kickboxing
            document.getElementById("kickboxing").checked = true;
        }
        else if(customer.customerActivities[i].activityId == 24){ // 24 = yoga
            document.getElementById("yoga").checked = true;
        }
    }

    if(customer.referredBy != null) { //update checked/referrer name if there is a referred by
        document.getElementById("yesReferred").checked = true;
        document.getElementById("referrerName").value = customer.referredBy.email;
        document.getElementById("referrerName").disabled = false;
    }
}

function handleReferredByOnClick(){
    if(document.getElementById("yesReferred").checked == true){
        document.getElementById("referrerName").disabled = false;
    }
}

function custEditProfile(){
    //get current customer object
    let id = getCustomerId();
    let customer = [];
    const customerApiUrl = "https://localhost:5001/api/Customer/GetCustomerByID/"+id;
    fetch(customerApiUrl).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(json){
        customer = json;

        //get values of items in the form
        //customer MUST enter currPassword in order to make changes
        if(document.getElementById("currPassword").value == undefined){
            document.getElementById("mustEnterCurrPasswordMsg").style.display = "block";
        }
        else if(document.getElementById("currPassword").value != customer.password){
            document.getElementById("incorrectPasswordMsg").style.display = "block";
        }
        else {
            /*once they've entered their currPassword and it's correct, 
            check if they checked referredBy, and only continue if the email the 
            customer entered was found entered was found. */
            
            //If yesReferred is checked, get referrer's email (& id of referrerName) 
            if(document.getElementById("yesReferred").checked){
                let referredByEmail = document.getElementById("referrerName").value;
                let referredById;
                const findReferredApiUrl = "https://localhost:5001/api/Customer/"+referredByEmail;
                fetch(findReferredApiUrl).then(function(response){
                    console.log(response);
                    return response.json();
                }).then(function(json){
                    //set referred by Id to the customer id that was found
                    referredById = json.customerId;

                    //if referredById was found, create customer object to send in body of PUT request
                    let bodyObj = getUpdatedCustomerObj();

                    const putCustApiUrl = "https://localhost:5001/api/Customer/PutCustomerWithReferredBy/"+referredById;
                    //make api call to UPDATE customer
                    fetch(putCustApiUrl, {
                        method: "PUT",
                        headers: {
                            "Accept": 'application/json',
                            "Content-Type": 'application/json'
                        },
                        body: JSON.stringify(bodyObj)
                    }).then(function(response){
                        //get updated customer to reload form
                        const getCustApiUrl="https://localhost:5001/api/Customer/GetCustomerByID/"+customer.customerId;
                        fetch(getCustApiUrl).then(function(response){
                            console.log(response);
                            return response.json();
                        }).then(function(json){
                            getCustomerProfileForm(json);
                            console.log(response);
                        }).catch(function(error){
                            console.log(error);
                        })
                        console.log(response);
                    })
                }).catch(function(error){
                    console.log(error);
                })
            }
            else {
                //if referredBy is not checked, get customer object to send in body of PUT request
                let referredById = "";
                let bodyObj = getUpdatedCustomerObj();
                const putCustApiUrl = "https://localhost:5001/api/Customer/";
                    //make api call to UPDATE customer
                    fetch(putCustApiUrl, {
                        method: "PUT",
                        headers: {
                            "Accept": 'application/json',
                            "Content-Type": 'application/json'
                        },
                        body: JSON.stringify(bodyObj)
                    }).then(function(response){
                        //get updated customer to reload form
                        const getCustApiUrl="https://localhost:5001/api/Customer/GetCustomerByID/"+customer.customerId;
                        fetch(getCustApiUrl).then(function(response){
                            console.log(response);
                            return response.json();
                        }).then(function(json){
                            getCustomerProfileForm(json);
                            console.log(response);
                        }).catch(function(error){
                            console.log(error);
                        })
                        console.log(response);
                    })
            }     
        }
    }).catch(function(error){
        console.log(error);
    }) 
}

function getUpdatedCustomerObj(){
    //get values from update customer profile form, create and return an object to be used in PUT request
    let inputPassword;
    if(document.getElementById("newPassword").value == undefined){
        inputPassword = document.getElementById("currPassword").value;
    }
    else {
        //if they've entered a new password, set inputPassword to that
        inputPassword = document.getElementById("newPassword").value;
    }
    //handle email
    let inputEmail;
    if(document.getElementById("newEmail").value == undefined){
        inputEmail = document.getElementById("currEmail");
    }
    else {
        inputEmail = document.getElementById("newEmail").value;
    }
    //handle firstName, lastName, dob, gender
    let inputFirstName = document.getElementById("inputFName").value;
    let inputLastName = document.getElementById("inputLName").value;
    let dob = document.getElementById("birthDate").value;
    let inputGender = document.getElementById("custGender").value; 
    //handle fitness goals
    let inputFitnessGoals = "";
    if(document.getElementById("fitnessGoals").value != undefined){
        inputFitnessGoals = document.getElementById("fitnessGoals").value;
    }
    //handle phoneNo
    let inputPhoneNo = "";
    if(document.getElementById("updateCustPhone").value != undefined){
        if(!isNaN(document.getElementById("updateCustPhone").value)){
            //if it is a number, add its value to inputPhoneNo
            inputPhoneNo = document.getElementById("updateCustPhone").value;
        }
    }
    
    //handle preferred activities
    let inputActivityIDs = [];
    if(document.getElementById("cardio").checked === true){
        let cardio = document.getElementById("cardio").value;
        inputActivityIDs.push(parseInt(cardio))
    }
    if(document.getElementById("strengthTraining").checked === true){
        let st = document.getElementById("strengthTraining").value;
        inputActivityIDs.push(parseInt(st));
    }
    if(document.getElementById("kickboxing").checked === true){
        let kb = document.getElementById("kickboxing").value;
        inputActivityIDs.push(parseInt(kb));
    }
    if(document.getElementById("yoga").checked === true){
        let yoga = document.getElementById("yoga").value;
        inputActivityIDs.push(parseInt(yoga));
    }
    let activityArray = [];
    if(inputActivityIDs.length > 0){
        for(var i in inputActivityIDs){
            activityArray[i] = {
                activityId: inputActivityIDs[i]
            }
        }
    }
    //make object to send in PUT customer
    var bodyObj = {
        customerId: getCustomerId(),
        password: inputPassword,
        birthDate: dob, 
        gender: inputGender,
        fitnessGoals: inputFitnessGoals,
        phoneNo: inputPhoneNo, 
        fName: inputFirstName,
        lName: inputLastName,
        email: inputEmail,
        customerActivities: activityArray,
    };
    return bodyObj;
}

