document.getElementById("playerNameForm").addEventListener("submit", function(event) {
    event.preventDefault();

    let username = document.getElementById("username").value;
    let speedLevel = document.getElementsByName("speed_level");    
    let speed = localStorage.getItem('speed_level');
    for(let i = 0; i < speedLevel.length; i++) {
    
    if(speedLevel[i].checked) {
        speed = speedLevel[i].value;
    }}
    localStorage.setItem("username", username);
    localStorage.setItem("speedLevel", speed);
    window.location.href = "index.html";
});
