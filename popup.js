var commList = [];
loadList();

document.getElementById("addButton").addEventListener("click", addList);
document.getElementById("clearButton").addEventListener("click", clearList);


function addList() {
    let textBox = document.getElementById("commId");
    commList.push(textBox.value);
    textBox.value = "";
    saveList();
    updateList();
}

function clearList() {
    let clear_ = confirm("Listeyi temizlemek istedigine emin misin?");
    if (clear_) {
        commList = [];
        saveList();
        updateList();
    }
}

function updateList() {
    let ul = document.getElementById("commList");
    ul.innerHTML = "";

    commList.forEach(element => {
        let a = document.createElement("li");
        a.innerHTML = element;
        ul.appendChild(a);
    });
}

function saveList() {
    chrome.storage.local.set({"commList": commList}, () => {
        // console.log("Saved data.");
    });
}
function loadList() {
    chrome.storage.local.get("commList", (result) => {
        if (result.commList) {
            commList = result.commList;
            // console.log("loaded commList: ", commList);
            updateList();
        } else {
            // console.log("no data saved??");
            updateList();
        }
    });
}