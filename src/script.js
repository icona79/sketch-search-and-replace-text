Mocha.sharedRuntime().loadFrameworkWithName("CoreFoundation");

import BrowserWindow from "sketch-module-web-view";
import { getWebview } from "sketch-module-web-view/remote";

const webviewIdentifier = "searchAndReplaceText.webview";

const sketch = require("sketch");
var identifier = __command.identifier();

var symbols = sketch.find("SymbolMaster");
var document = sketch.getSelectedDocument();
var selectedPage = document.selectedPage;
var selectedLayers = document.selectedLayers.layers;

export default function () {
    /* Create the webview with the sizes */
    const options = {
        identifier: webviewIdentifier,
        width: 288,
        height: 522,
        show: false,
        resizable: false,
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        alwaysOnTop: true,
        title: "🔎",
    };

    const browserWindow = new BrowserWindow(options);

    browserWindow.once("ready-to-show", () => {
        try {
            browserWindow.show();
        } catch (createWebViewErr) {
            console.log(createWebViewErr);
        }
    });

    const webContents = browserWindow.webContents;

    // add a handler for a call from web content's javascript
    webContents.on("nativeLog", (parameters) => {
        try {
            if (parameters.searchText !== "") {
                setTimeout(function () {
                    replaceText(parameters);
                }, 180);
            } else if (parameters.replaceText !== "") {
                browserWindow.close();
                sketch.UI.alert(
                    "Missing replace text",
                    "🚨 All the items that present the searched text will be emptied!"
                );
            } else {
                browserWindow.close();
                sketch.UI.alert(
                    "Missing search text",
                    "🚨 Please select at least a word to be searched"
                );
            }
        } catch (pluginErr) {
            console.log(pluginErr);
        }
    });

    browserWindow.loadURL(require("../resources/webview.html"));
}

// const outOfSync = !!layer.sharedStyleId && layer.style.isOutOfSyncWithSharedStyle(layer.sharedStyle)

function replaceText(parameters) {
    let searchFilter = parameters.searchArea;
    let filterParameter = "document";
    let textLayers = [];
    let instances = [];
    if (
        searchFilter === "selectedLayers" ||
        searchFilter === "currentArtboard"
    ) {
        textLayers = layerList(selectedLayers, "Text");
        instances = layerList(selectedLayers, "SymbolInstance");
    } else if (searchFilter === "currentPage") {
        textLayers = sketch.find("Text", selectedPage);
        instances = sketch.find("SymbolInstance", selectedPage);
    } else {
        textLayers = sketch.find("Text");
        instances = sketch.find("SymbolInstance");
    }

    let isCaseSensitive = parameters.isCaseSensitive;

    let searchText = parameters.searchText;
    let replaceText = parameters.replaceText;

    console.log(textLayers);
    console.log(instances);

    if (parameters.performSymbolInstances && instances.length > 0) {
        instances.forEach((instance) => {
            let overrides = instance.overrides;

            overrides.forEach((override) => {
                if (
                    override.property === "stringValue" &&
                    override.editable === true &&
                    override.isDefault === false
                ) {
                    if (
                        (isCaseSensitive && override.value === searchText) ||
                        (!isCaseSensitive &&
                            override.value.toUpperCase() ===
                                searchText.toUpperCase())
                    ) {
                        override.value = replaceText;
                    } else if (
                        (isCaseSensitive &&
                            override.value.includes(searchText)) ||
                        (!isCaseSensitive &&
                            override.value
                                .toUpperCase()
                                .includes(searchText.toUpperCase()))
                    ) {
                        override.value.replace(searchText, replaceText);
                    }
                }
            });
        });
    }

    if (parameters.performTextLayers && textLayers.length > 0) {
        textLayers.forEach((textLayer) => {
            if (
                (isCaseSensitive && textLayer.text === searchText) ||
                (!isCaseSensitive &&
                    textLayer.text.toUpperCase() === searchText.toUpperCase())
            ) {
                textLayer.text = replaceText;
            } else if (
                (isCaseSensitive && textLayer.text.includes(searchText)) ||
                (!isCaseSensitive &&
                    textLayer.text
                        .toUpperCase()
                        .includes(searchText.toUpperCase()))
            ) {
                textLayer.text.replace(searchText, replaceText);
            }
        });
    }
}

function layerList(layers, type = "Text") {
    let textLayers = [];
    let instances = [];
    layers.forEach((layer) => {
        if (
            layer.type === "Artboard" ||
            layer.type === "SymbolMaster" ||
            layer.type === "Group"
        ) {
            textLayers = sketch.find("Text", layer);
            instances = sketch.find("SymbolInstance", layer);
        } else {
            if (layer.type === "Text" && type === "Text") {
                textLayers.push(layer);
                console.log(textLayers);
            } else if (
                layer.type === "SymbolInstance" &&
                type === "SymbolInstance"
            ) {
                let overrides = layer.overrides;
                let inserted = false;
                overrides.forEach((override) => {
                    if (!inserted) {
                        if (override.property === "stringValue") {
                            instances.push(layer);
                            inserted = true;
                        }
                    }
                });
            }
        }
    });
    if (type === "Text") {
        return textLayers;
    } else if (type === "SymbolInstance") {
        return instances;
    }
}

// ******************************************************************* //
// When the plugin is shutdown by Sketch (for example when the user    //
// disable the plugin) we need to close the webview if it's open       //
// ******************************************************************* //
export function onShutdown() {
    const existingWebview = getWebview(webviewIdentifier);
    if (existingWebview) {
        existingWebview.close();
    }
}
