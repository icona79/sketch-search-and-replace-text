// disable the context menu (eg. the right click menu) to have a more native feel
document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});

// call the plugin from the webview
// document.getElementById('button').addEventListener('click', () => {
//     window.postMessage('nativeLog', 'Called from the webview')
// })

// Enter Key = Click on Create Button button
// document.addEventListener("keyup", function (event) {
//     if (event.key === "Enter") {
//         document.getElementById("parametersSubmit").click();
//     }
// });

// ************************************************** //
// Validate the input fields                          //
// ************************************************** //
const numbersOnly = "/^d+$/";
const decimalOnly = "/^s*-?[1-9]d*(.d{1,2})?s*$/";
const uppercaseOnly = "/^[A-Z]+$/";
const lowercaseOnly = "/^[a-z]+$/";
const stringOnly = "/^[A-Za-z0-9]+$/";

document.getElementById("parametersSubmit").addEventListener("click", () => {
    var searchArea = document.querySelector('input[name="searchArea"]:checked')
        .value;
    var performTextLayers = false;
    if (document.querySelector('input[name="textLayers"]:checked')) {
        performTextLayers = true;
    }
    var performSymbolInstances = false;
    if (document.querySelector('input[name="symbolInstances"]:checked')) {
        performSymbolInstances = true;
    }
    var searchText = document.getElementById("searchText").value;
    var isCaseSensitive = false;
    if (document.querySelector('input[name="caseSensitive"]:checked')) {
        isCaseSensitive = true;
    }
    var replaceText = document.getElementById("replaceText").value;
    var parameters = {
        searchArea: searchArea,
        performTextLayers: performTextLayers,
        performSymbolInstances: performSymbolInstances,
        searchText: searchText,
        isCaseSensitive: isCaseSensitive,
        replaceText: replaceText,
    };

    // console.log(parameters);

    window.postMessage("nativeLog", parameters);
});

// Function to populate the Styles dropdown
window.passDetails = function (textDetails) {};

// document.getElementById("my-element").remove()
//document.getElementById("tag-id").innerHTML = "<ol><li>html data</li></ol>";
