/* === FUNCION PARA CREAR BOTONES DE CAPITULO === */
const createChapterButtons = (chaptersContainer) => {
    chaptersList.forEach(chapter => {
        let chapterButton = document.createElement("button");
        chapterButton.classList.add("chapter-btn")
        let chapterName = chapter.chapterName;
        chapterButton.textContent = `Capítulo ${chapterName}`;
        chaptersContainer.appendChild(chapterButton);
    });
};

/* === FUNCION PARA CREAR LA ESTRUCTURA DE LOS BOTONES Y PANELES DE LAS VERSIONES ===  */
const createVersionDropdowns = (actualChapter, versionsContainer) => {
    actualChapter.versionsList.forEach((version, versionsIndex) => {
        // Crea un contenedor y le asigna atributos
        let dropdownContainer = document.createElement("div");
        dropdownContainer.classList.add("version__dropdown");

        // Crea un boton de version y le asigna atributos, y el nombre del boton
        let versionButton = document.createElement("button");
        let versionName = version.version;
        versionButton.setAttribute("data-panel-for", "dropdown__panel--" + (versionsIndex + 1));
        versionButton.classList.add("dropdown__btn");
        versionButton.textContent = versionName;
        // Agrega el boton al contenedor hijo
        dropdownContainer.appendChild(versionButton);

        // Crea un contenedor y le asigna atributos
        let versionPanel = document.createElement("div");
        versionPanel.classList.add("dropdown__panel--" + (versionsIndex + 1));
        versionPanel.classList.add("dropdown__panel");

        // Obtiene el array de servidores del capitulo actual
        let servers = version.servers;
        servers.forEach(server => {
            let serverButton = document.createElement("button");
            let serverName = server.name;
            let serverLink = server.link;
            serverButton.setAttribute("data-server", serverLink);
            serverButton.classList.add("server-btn");
            serverButton.textContent = serverName;

            versionPanel.appendChild(serverButton);
        });
        // Agrega el panel al contenedor hijo
        dropdownContainer.appendChild(versionPanel);
        // Agrega el contenedor hijo al contenedor padre
        versionsContainer.appendChild(dropdownContainer); 
    });
};
/* === FUNCION PARA MOSTRAR U OCULTAR LOS PANELES DE VERSION === */
const toggleDropdownPanel = (versionsButtons, versionsContainer) => {
    let panels = versionsContainer.querySelectorAll(".dropdown__panel");
    versionsButtons.forEach((versionBtn) => {
        versionBtn.addEventListener("click", () => {
            let panelTarget = versionBtn.getAttribute("data-panel-for");
            let actualPanel = versionsContainer.querySelector("." + panelTarget);

            panels.forEach(panel => {
                if (panel !== actualPanel) {
                    panel.classList.remove("dropdown__panel--active");
                    panel.classList.add("dropdown__panel--hidden");
                }
            });

            if (actualPanel.classList.contains("dropdown__panel--active")) {
                actualPanel.classList.remove("dropdown__panel--active");
                actualPanel.classList.add("dropdown__panel--hidden");
            } else {
                actualPanel.classList.remove("dropdown__panel--hidden");
                actualPanel.classList.add("dropdown__panel--active");
            }

            document.addEventListener('click', function(event) {
                if (event.target !== versionBtn) {
                    actualPanel.classList.remove("dropdown__panel--active");
                    actualPanel.classList.add("dropdown__panel--hidden");
                }
            });
        });
    });

    
    panels.forEach(panel => {
        panel.classList.remove("dropdown__panel--active");
        panel.classList.add("dropdown__panel--hidden");
    });
};

/* === FUNCION PARA CREAR UN IFRAME E INYECTARLE SRC, Y ACTIVA PANTALLA DE CARGA === */
const handleServerButtonClick = (serversButtons, videoContainer, loadingScreenContainer) => {
    loadingScreenContainer.style.display = "none";
    serversButtons.forEach(serverBtn => {
        serverBtn.addEventListener("click", () => {
            loadingScreenContainer.style.display = "flex";
            videoContainer.style.display = "none";
            videoContainer.innerHTML = "";

            serversButtons.forEach(button => {
                button.classList.remove("server-btn--active");
            });
            serverBtn.classList.add("server-btn--active");

            let serverLink = serverBtn.getAttribute("data-server");
            let iframeVideo = document.createElement("iframe");
            iframeVideo.setAttribute("id", "video-iframe");
            iframeVideo.setAttribute("src", serverLink);
            videoContainer.appendChild(iframeVideo);

            iframeVideo.addEventListener("load", () => {
                setTimeout(() => {
                    loadingScreenContainer.style.display = "none";
                    videoContainer.style.display = "block";
                }, 500);
            });
        });
    });
};

/* === FUNCION QUE ASIGNA ACCIONES A LOS BOTONES DE NAVEGACION === */
const navButtons = (navsContainer, index, chaptersButtons) => {
    let actualChapter = index;
    let backButton = navsContainer.querySelector("#nav-btn--back");
    let nextButton = navsContainer.querySelector("#nav-btn--next");

    const updateButtons = () => {
        backButton.disabled = actualChapter == 0;
        nextButton.disabled = actualChapter == chaptersButtons.length - 1;
    };

    backButton.addEventListener("click", () => {
        actualChapter--;
        console.log("Click en botón de regreso " + actualChapter);
        chaptersButtons[actualChapter].click();
        updateButtons();
    });

    nextButton.addEventListener("click", () => {
        actualChapter++;
        console.log("Click en el botón siguiente " + actualChapter);
        chaptersButtons[actualChapter].click();
        updateButtons();
    });

    updateButtons();
};

/* === FUNCION DEL BOTON QUE MUESTRE/OCULTA EL PANEL DE LOS CAPITULOS === */
const chaptersMenu = (navsContainer, chaptersContainerContainer) => {
    let menuButton = navsContainer.querySelector("#nav-btn--menu");
    menuButton.classList.add("nav-btn--menu--inactive");
    chaptersContainerContainer.classList.add("chapters-online__panel--hidden");
    menuButton.addEventListener("click", () => {
        console.log("Click en boton de menu");
        menuButton.classList.toggle("nav-btn--menu--active");
        menuButton.classList.toggle("nav-btn--menu--inactive");
        chaptersContainerContainer.classList.toggle("chapters-online__panel--active");
        chaptersContainerContainer.classList.toggle("chapters-online__panel--hidden");
    });
};

/* === FUNCION PARA CAMBIAR LA DIRECCION DE LOS BOTONES DE CAPITULOS === */

const chaptersOrder = (chaptersContainerContainer, chaptersContainer) => {
    let orderButton = chaptersContainerContainer.querySelector("#chapters__btn-order");
    // Asigna un orden descendente al principio
    chaptersContainer.classList.add("chapters-order--ascendant")
    orderButton.textContent = ("Orden: Ascendente");

    orderButton.addEventListener("click", () => {
        orderButton.innerHTML = "";
        chaptersContainer.classList.toggle("chapters-order--ascendant");
        chaptersContainer.classList.toggle("chapters-order--descendant");
        let orderText = chaptersContainer.classList.contains("chapters-order--ascendant") ? "Orden: Ascendente" : "Orden: Descendente";
        orderButton.textContent = orderText;
    });

    if (releasing == true) {
        orderButton.click();
    }
};
/* === FUNCIÓN PRINCIPAL PARA EL REPRODUCTOR DE VIDEO === */
const initializeOnlinePlayer = () => {
    if (chaptersList && chaptersList.length > 0 && releasing) {
        // Contenedor de las __ versiones __ (donde van a ir cada menu desplegable)
        const versionsContainer = document.getElementById("options-versions");
        // Contenedor donde va el __ nombre del capitulo actual __
        const currentChapterContainer = document.getElementById("current-chapter-name");
        // Contenedor del __ video __ (el que envuelve al iframe)
        const videoContainer = document.getElementById("iframe-container");
        // Contenedor de la __ pantalla de carga __ (el que envuelve al SVG)
        const loadingScreenContainer = document.getElementById("loading-screen-container");
        // Contenedor de los __ botones de navegación __
        const navsContainer = document.getElementById("nav-btn");
        // Contenedor que envuelve al __ contenedor de los capitulos __
        const chaptersContainerContainer = document.getElementById("chapters-online__panel");
        // Contenedor de los __ capitulos __
        const chaptersContainer = document.getElementById("options-chapters");

        if (
            versionsContainer &&
            currentChapterContainer &&
            videoContainer &&
            loadingScreenContainer &&
            navsContainer &&
            chaptersContainerContainer &&
            chaptersContainer
        ) {
            // Llama a la función para crear botones de cada capitulo
            createChapterButtons(chaptersContainer);

            // Arma un array con los botones de los capitulos
            let chaptersButtons = chaptersContainer.querySelectorAll(".chapter-btn");

            chaptersButtons.forEach((chapterBtn, index) => {
                chapterBtn.addEventListener("click", () => {
                    // Limpia los contenedores de las versiones y donde va el nommbre del capitulo
                    versionsContainer.innerHTML = "";
                    currentChapterContainer.innerHTML = "";

                    // Obtiene el capitulo actual empatando el indice con el array de capitulos
                    let selectedChapter = chaptersList[index];
                    let chapterName = selectedChapter.chapterName; /* Cambiar por chapterName o similar */
                    currentChapterContainer.textContent = `En curso: ${chapterName}`;

                    chaptersButtons.forEach(button => {
                        button.classList.remove("chapter-btn--active");
                    });

                    // Agrega la clase al boton de capitulo actual
                    chapterBtn.classList.add("chapter-btn--active");
                    createVersionDropdowns(selectedChapter, versionsContainer);

                    // Arma un array con los botones de version
                    let versionsButtons = versionsContainer.querySelectorAll(".dropdown__btn")
                    toggleDropdownPanel(versionsButtons, versionsContainer);

                    // Arma un array con los botones de servidores
                    let serversButtons = versionsContainer.querySelectorAll(".server-btn");
                    handleServerButtonClick(serversButtons, videoContainer, loadingScreenContainer);
                    serversButtons[0].click();

                    // Llama a la función encargada de la funcionalidad de los botones de navegación
                    navButtons(navsContainer, index, chaptersButtons);
                });
            });
            if (releasing == true) {
                chaptersButtons[chaptersButtons.length -1].click();
            } else {
                chaptersButtons[0].click();
            }
            chaptersMenu(navsContainer, chaptersContainerContainer);

            chaptersOrder(chaptersContainerContainer, chaptersContainer);
        } else {
            if (!versionsContainer) {
                console.error("La variable 'versionsContainer' no existe.");
            }
            if (!currentChapterContainer) {
                console.error("La variable 'currentChapterContainer' no existe.");
            }
            if (!videoContainer) {
                console.error("La variable 'videoContainer' no existe.");
            }
            if (!loadingScreenContainer) {
                console.error("La variable 'loadingScreenContainer' no existe.");
            }
            if (!navsContainer) {
                console.error("La variable 'navsContainer' no existe.");
            }
            if (!chaptersContainerContainer) {
                console.error("La variable 'chaptersContainerContainer' no existe.");
            }
            if (!chaptersContainer) {
                console.error("La variable 'chaptersContainer' no existe.");
            }
        }
    } else {
        console.log("No se encontro la lista de capitulos o el estado de emisión");
    }
};
initializeOnlinePlayer();