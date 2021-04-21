function handleOnLoad(){
    document.getElementById("customerFAQ").style.display = "none";
    document.getElementById("trainerFAQ").style.display = "none";
}

function showCustomerFAQ(){
    //show the customer FAQ section, hide trainer
    document.getElementById("customerFAQ").style.display = "block";
    document.getElementById("trainerFAQ").style.display = "none";
}

function showTrainerFAQ(){
    //show trainer FAQ section, hide customer
    document.getElementById("trainerFAQ").style.display = "block";
    document.getElementById("customerFAQ").style.display = "none";
}
