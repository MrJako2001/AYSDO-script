const scriptsToLoad = ["online"];

const scriptLinks = [
    {name:"online", link: "https://mrjako2001.github.io/AYSDO-script/onlinePlayer.js"}
]

const scripter = (scriptName) => {
    const scriptToLoad = scriptLinks.find((script) => script.name === scriptName);
    if(!scriptToLoad) {
        console.error(`No se econtro ${scriptName} en la lista de scripts`);
        return;
    }
    let scriptElement = document.createElement("script");
    scriptElement.onload = () => {
        console.log(`El script "${scriptName}" fue cargado exitosamente.`)
    }
    scriptElement.onerror = () => {
        console.log(`Hubo un error al cargar "${scriptName}".`)
    }
    scriptElement.src = scriptToLoad.link;
    document.head.appendChild(scriptElement);
}

const scriptsLoad = (scriptsNames) => {
    scriptsNames.forEach((script) => {
        scripter(script);
    });
}
document.addEventListener("DOMContentLoaded", () => {
    if (scriptsLoad && Array.isArray(scriptsToLoad)) {
        scriptsLoad(scriptsToLoad)
    }
});