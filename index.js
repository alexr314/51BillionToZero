const myNum = document.getElementById("my-num");

document.getElementById("my-button").onclick = () => {
    myNum.innerHTML = (parseInt(myNum.innerHTML) + 1).toString();
}
