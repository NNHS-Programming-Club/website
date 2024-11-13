document.addEventListener("DOMContentLoaded", function() {
    let big_test = document.querySelectorAll("h1");
    let right = document.querySelector(".right");
    let intervalId;
    let colors = ["red", "orange", "yellow", "green", "blue", "purple"];
    let i = 0;
    big_test.forEach(function(element) {
        element.addEventListener("mouseover", function() {
            intervalId = setInterval(function() {
                i++;
                i %= 6;
                element.style.color = colors[i];
            }, 250);
        });
        element.addEventListener("mouseout", function() {
            clearInterval(intervalId);
            element.style.color = "orange";
        });
    });
    right.addEventListener("click", function() {
        right.textContent = "Error 418";
    });
})
