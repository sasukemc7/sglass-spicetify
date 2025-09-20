(function SGloss() {
  if (!Spicetify?.Platform || !Spicetify?.Platform?.History?.listen) {
    setTimeout(SGloss, 100);
    return;
  }

  const defImage = "https://i.imgur.com/Wl2D0h0.png";
  let startImage = localStorage.getItem("sgloss:startupBg") || defImage;
  
  // Configuración específica para SGloss by Sasuke MC
  const sglossColor = "#ef8450"; // Color principal de SGloss
  
  const toggleInfo = [
    {
      id: "UseDynamicColors",
      name: "Colores dinámicos de canción",
      defVal: true,
    },
  ];
  
  const toggles = {
    UseDynamicColors: true,
  };
  
  const sliders = [];

  // Activar sidebar
  (function sidebar() {
    if (localStorage.getItem("SGloss Sidebar Activated")) return;
    const parsedObject = JSON.parse(
      localStorage.getItem("spicetify-exp-features")
    );

    let reload = false;
    const features = [
      "enableYLXSidebar",
      "enableRightSidebar",
      "enableRightSidebarTransitionAnimations",
      "enableRightSidebarLyrics",
      "enableRightSidebarExtractedColors",
      "enablePanelSizeCoordination",
    ];

    for (const feature of features) {
      if (!parsedObject[feature]) continue;
      if (!parsedObject[feature].value) {
        parsedObject[feature].value = true;
        reload = true;
      }
    }

    localStorage.setItem(
      "spicetify-exp-features",
      JSON.stringify(parsedObject)
    );
    localStorage.setItem("SGloss Sidebar Activated", true);
    if (reload) {
      window.location.reload();
      reload = false;
    }
  })();

  function loadSliders() {
    // No hay sliders que cargar en la versión simplificada
  }

  // Función simplificada - solo aplicar efectos glass básicos
  function applyGlassEffects() {
    document.body.classList.add("liquid-glass-enabled");
  }

  function setAccentColor(color) {
    // Aplicar el color a las variables de SGloss
    document.querySelector(":root").style.setProperty("--spice-button", color);
    document.querySelector(":root").style.setProperty("--spice-button-active", color);
    document.querySelector(":root").style.setProperty("--spice-accent", color);
    
    // También actualizar las variables CSS personalizadas
    document.documentElement.style.setProperty("--dynamic-accent", color);
    
    // Crear efectos adicionales con el color dinámico
    const rgb = hexToRgb(color);
    if (rgb) {
      document.documentElement.style.setProperty("--dynamic-accent-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
      document.documentElement.style.setProperty("--dynamic-accent-alpha", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
    }
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  async function fetchFadeTime() {
    try {
      const response = await Spicetify.Platform.PlayerAPI._prefs.get({
        key: "audio.crossfade_v2",
      });

      if (!response.entries["audio.crossfade_v2"].bool) {
        document.documentElement.style.setProperty("--fade-time", "0.4s");
        return;
      }
      const fadeTimeResponse = await Spicetify.Platform.PlayerAPI._prefs.get({
        key: "audio.crossfade.time_v2",
      });
      const fadeTime =
        fadeTimeResponse.entries["audio.crossfade.time_v2"].number;

      document.documentElement.style.setProperty(
        "--fade-time",
        `${fadeTime / 1000}s`
      );
    } catch (error) {
      document.documentElement.style.setProperty("--fade-time", "0.4s");
    }
  }

  function getCurrentBackground(replace) {
    let url = Spicetify?.Player?.data?.item?.metadata?.image_url;
    if (!url || !URL.canParse(url)) return defImage;
    if (replace)
      url = url.replace("spotify:image:", "https://i.scdn.co/image/");
    return url;
  }

  // Función de fondo eliminada - ya no necesaria
  function updateBackgroundMode() {
    // Funcionalidad removida para simplificar
  }

  async function onSongChange() {
    fetchFadeTime();

    const album_uri = Spicetify?.Player?.data?.item?.metadata?.album_uri;
    if (album_uri !== undefined && !album_uri.includes("spotify:show")) {
      // Album
    } else if (Spicetify?.Player?.data?.item?.uri?.includes("spotify:episode")) {
      // Podcast
    } else if (Spicetify?.Player?.data?.item?.isLocal) {
      // Local file
    } else if (Spicetify?.Player?.data?.item?.provider === "ad") {
      // Ad
      return;
    } else {
      setTimeout(onSongChange, 200);
    }

    updateLyricsPageProperties();

    // Sistema de cambio de colores dinámicos mejorado
    if (toggles.UseDynamicColors) {
      const img = new Image();
      img.crossOrigin = "Anonymous";

      img.onload = function () {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        ).data;

        const rgbList = [];
        for (let i = 0; i < imageData.length; i += 4)
          rgbList.push({
            r: imageData[i],
            g: imageData[i + 1],
            b: imageData[i + 2],
          });

        let hexColor = findColor(rgbList);
        if (!hexColor) hexColor = findColor(rgbList, true);
        
        // Si no se encuentra color dinámico, usar el color de SGloss
        if (!hexColor) hexColor = sglossColor;

        setAccentColor(hexColor);
        
        // Efectos adicionales con animaciones
        animateColorTransition(hexColor);
      };

      img.src = getCurrentBackground(true);
    } else {
      // Usar color personalizado del usuario cuando los dinámicos están desactivados
      setAccentColor(localStorage.getItem("sgloss:CustomColor") || sglossColor);
    }

    // Simplificado - sin múltiples modos de fondo
  }

  // Funciones auxiliares eliminadas - solo conservar animación de colores simple
  function animateColorTransition(newColor) {
    // Agregar clase de transición para animaciones suaves
    document.body.classList.add("color-transitioning");
    
    setTimeout(() => {
      document.body.classList.remove("color-transitioning");
    }, 800);
  }

  // Función para encontrar color dominante (igual que en Hazy)
  function findColor(rgbList, skipFilters = false) {
    const colorCount = {};
    let maxColor = "";
    let maxCount = 0;

    for (let i = 0; i < rgbList.length; i++) {
      if (
        !skipFilters &&
        (isTooDark(rgbList[i]) || isTooCloseToWhite(rgbList[i]))
      ) {
        continue;
      }

      const color = `${rgbList[i].r},${rgbList[i].g},${rgbList[i].b}`;
      colorCount[color] = (colorCount[color] || 0) + 1;

      if (colorCount[color] > maxCount) {
        maxColor = color;
        maxCount = colorCount[color];
      }
    }

    return maxColor ? rgbToHex(...maxColor.split(",").map(Number)) : null;
  }

  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
  }

  function isTooDark(rgb) {
    const brightness = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
    const threshold = 80; // Ajustado para SGloss
    return brightness < threshold;
  }

  function isTooCloseToWhite(rgb) {
    const threshold = 220;
    return rgb.r > threshold && rgb.g > threshold && rgb.b > threshold;
  }

  function loadToggles() {
    toggles.UseDynamicColors = JSON.parse(
      localStorage.getItem("sgloss:UseDynamicColors")
    ) ?? true;
    
    onSongChange();
  }

  // Funciones auxiliares (iguales que en Hazy pero adaptadas)
  function scrollToTop() {
    const element = document.querySelector(".main-entityHeader-container");
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest(".main-entityHeader-topbarTitle")) scrollToTop();
  });

  function updateZoomVariable() {
    let prevOuterWidth = window.outerWidth;
    let prevInnerWidth = window.innerWidth;
    let prevRatio = window.devicePixelRatio;

    function calculateAndApplyZoom() {
      const newOuterWidth = window.outerWidth;
      const newInnerWidth = window.innerWidth;
      const newRatio = window.devicePixelRatio;

      if (
        prevOuterWidth <= 160 ||
        prevRatio !== newRatio ||
        prevOuterWidth !== newOuterWidth ||
        prevInnerWidth !== newInnerWidth
      ) {
        const zoomFactor = newOuterWidth / newInnerWidth || 1;
        document.documentElement.style.setProperty("--zoom", zoomFactor);

        prevOuterWidth = newOuterWidth;
        prevInnerWidth = newInnerWidth;
        prevRatio = newRatio;
      }
    }

    calculateAndApplyZoom();
    window.addEventListener("resize", calculateAndApplyZoom);
  }

  function waitForElement(elements, func, timeout = 100) {
    const queries = elements.map((element) => document.querySelector(element));
    if (queries.every((a) => a)) {
      func(queries);
    } else if (timeout > 0) {
      setTimeout(waitForElement, 300, elements, func, timeout - 1);
    }
  }

  function updateLyricsPageProperties() {
    function setLyricsPageProperties() {
      function calculateLyricsMaxWidth(lyricsContentWrapper) {
        const lyricsContentContainer = lyricsContentWrapper.parentElement;
        const marginLeft = Number.parseInt(
          window.getComputedStyle(lyricsContentWrapper).marginLeft,
          10
        );
        const totalOffset = lyricsContentWrapper.offsetLeft + marginLeft;
        return Math.round(
          0.95 * (lyricsContentContainer.clientWidth - totalOffset)
        );
      }

      waitForElement(
        [".lyrics-lyrics-contentWrapper"],
        ([lyricsContentWrapper]) => {
          lyricsContentWrapper.style.maxWidth = "";
          lyricsContentWrapper.style.width = "";

          const lyric = document.querySelector(
            ".lyrics-lyricsContent-lyric"
          )[2];
          document.documentElement.style.setProperty(
            "--lyrics-text-direction",
            /[\u0591-\u07FF]/.test(lyric.innerText) ? "right" : "left"
          );

          document.documentElement.style.setProperty(
            "--lyrics-active-max-width",
            `${calculateLyricsMaxWidth(lyricsContentWrapper)}px`
          );

          const lyricsWrapperWidth =
            lyricsContentWrapper.getBoundingClientRect().width;
          lyricsContentWrapper.style.maxWidth = `${lyricsWrapperWidth}px`;
          lyricsContentWrapper.style.width = `${lyricsWrapperWidth}px`;
        }
      );
    }

    function lyricsCallback(mutationsList, lyricsObserver) {
      for (const mutation of mutationsList)
        for (addedNode of mutation.addedNodes)
          if (addedNode.classList?.contains("lyrics-lyricsContent-provider"))
            setLyricsPageProperties();
      lyricsObserver.disconnect;
    }

    waitForElement(
      [".lyrics-lyricsContent-provider"],
      ([lyricsContentProvider]) => {
        setLyricsPageProperties();
        const lyricsObserver = new MutationObserver(lyricsCallback);
        lyricsObserver.observe(lyricsContentProvider.parentElement, {
          childList: true,
        });
      }
    );
  }

  function setFadeDirection(scrollNode) {
    let fadeDirection = "full";
    if (scrollNode.scrollTop === 0) {
      fadeDirection = "bottom";
    } else if (
      scrollNode.scrollHeight -
        scrollNode.scrollTop -
        scrollNode.clientHeight ===
      0
    ) {
      fadeDirection = "top";
    }
    scrollNode.setAttribute("fade", fadeDirection);
  }

  function galaxyFade() {
    const setupFade = (selector, onScrollCallback) => {
      waitForElement([selector], ([scrollNode]) => {
        let ticking = false;

        scrollNode.addEventListener("scroll", () => {
          if (!ticking) {
            window.requestAnimationFrame(() => {
              onScrollCallback(scrollNode);
              ticking = false;
            });
            ticking = true;
          }
        });

        onScrollCallback(scrollNode);
      });
    };

    const applyArtistFade = (scrollNode) => {
      const scrollValue = scrollNode.scrollTop;
      const fadeValue = Math.max(0, (-0.3 * scrollValue + 100) / 100);
      document.documentElement.style.setProperty("--artist-fade", fadeValue);
    };

    setupFade(
      ".Root__main-view [data-overlayscrollbars-viewport]",
      (scrollNode) => {
        applyArtistFade(scrollNode);
        setFadeDirection(scrollNode);
      }
    );

    setupFade(
      ".Root__nav-bar [data-overlayscrollbars-viewport]",
      (scrollNode) => {
        scrollNode.setAttribute("fade", "bottom");
        setFadeDirection(scrollNode);
      }
    );

    setupFade(
      ".Root__right-sidebar [data-overlayscrollbars-viewport]",
      (scrollNode) => {
        scrollNode.setAttribute("fade", "bottom");
        setFadeDirection(scrollNode);
      }
    );
  }

  // Crear botón de configuración simplificado
  const settingsButton = new Spicetify.Topbar.Button("🎨", "edit", () => {
    const content = document.createElement("div");
    content.style.padding = "20px";
    content.style.maxWidth = "400px";

    // Título
    const title = document.createElement("h2");
    title.textContent = "SGloss - Configuración";
    title.style.marginBottom = "10px";
    title.style.textAlign = "center";
    content.append(title);

    // Información del autor
    const authorInfo = document.createElement("div");
    authorInfo.style.textAlign = "center";
    authorInfo.style.fontSize = "0.8rem";
    authorInfo.style.opacity = "0.7";
    authorInfo.style.marginBottom = "20px";
    
    const authorText = document.createElement("p");
    authorText.textContent = "Creado por ";
    authorText.style.margin = "0";
    authorText.style.display = "inline";
    
    const authorLink = document.createElement("a");
    authorLink.textContent = "Sasuke MC";
    authorLink.href = "https://sasukemc.com";
    authorLink.target = "_blank";
    authorLink.style.color = "var(--spice-accent)";
    authorLink.style.textDecoration = "none";
    
    authorInfo.append(authorText, authorLink);
    content.append(authorInfo);

    // Toggle para colores dinámicos
    const toggleRow = document.createElement("div");
    toggleRow.classList.add("hazyOptionRow");
    toggleRow.style.display = "flex";
    toggleRow.style.justifyContent = "space-between";
    toggleRow.style.alignItems = "center";
    toggleRow.style.marginBottom = "15px";
    
    toggleRow.innerHTML = `
    <span class="hazyOptionDesc">Colores dinámicos de canción:</span>
    <button class="hazyOptionToggle">
      <span class="toggleWrapper">
        <span class="toggle"></span>
      </span>
    </button>`;
    
    const toggleButton = toggleRow.querySelector("button");
    const toggle = toggleRow.querySelector(".toggle");
    
    toggleButton.addEventListener("click", () => {
      toggle.classList.toggle("enabled");
      updateColorPickerVisibility();
    });
    
    const isEnabled = JSON.parse(localStorage.getItem("sgloss:UseDynamicColors")) ?? true;
    toggle.classList.toggle("enabled", isEnabled);
    content.append(toggleRow);

    // Selector de color personalizado (se muestra solo cuando dinámicos está desactivado)
    const colorRow = document.createElement("div");
    colorRow.classList.add("colorPickerRow");
    colorRow.style.display = "flex";
    colorRow.style.justifyContent = "space-between";
    colorRow.style.alignItems = "center";
    colorRow.style.marginBottom = "20px";

    const colorLabel = document.createElement("label");
    colorLabel.textContent = "Color personalizado:";
    colorLabel.style.fontSize = "0.875rem";
    colorRow.append(colorLabel);

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.id = "color-input";
    colorInput.value = localStorage.getItem("sgloss:CustomColor") || sglossColor;
    colorInput.style.border = "none";
    colorInput.style.borderRadius = "4px";
    colorInput.style.width = "40px";
    colorInput.style.height = "30px";
    colorRow.append(colorInput);
    content.append(colorRow);

    // Función para mostrar/ocultar selector de color
    function updateColorPickerVisibility() {
      const dynamicColorsEnabled = toggle.classList.contains("enabled");
      colorRow.style.display = dynamicColorsEnabled ? "none" : "flex";
    }

    // Configurar visibilidad inicial
    updateColorPickerVisibility();

    // Botones de acción
    const buttonsRow = document.createElement("div");
    buttonsRow.style.display = "flex";
    buttonsRow.style.justifyContent = "space-between";
    buttonsRow.style.paddingTop = "20px";
    buttonsRow.style.gap = "10px";

    const resetButton = document.createElement("button");
    resetButton.innerHTML = "Restablecer";
    resetButton.style.flex = "1";
    resetButton.style.padding = "8px 16px";
    resetButton.style.borderRadius = "4px";
    resetButton.style.border = "1px solid var(--spice-text)";
    resetButton.style.backgroundColor = "transparent";
    resetButton.style.color = "var(--spice-text)";
    resetButton.style.cursor = "pointer";
    resetButton.style.transition = "all 0.2s ease";

    const saveButton = document.createElement("button");
    saveButton.innerHTML = "Aplicar";
    saveButton.style.flex = "1";
    saveButton.style.padding = "8px 16px";
    saveButton.style.borderRadius = "4px";
    saveButton.style.border = "1px solid var(--spice-accent)";
    saveButton.style.backgroundColor = "var(--spice-accent)";
    saveButton.style.color = "var(--spice-main)";
    saveButton.style.cursor = "pointer";
    saveButton.style.transition = "all 0.2s ease";

    // Efectos hover
    resetButton.addEventListener("mouseover", () => {
      resetButton.style.backgroundColor = "var(--spice-text)";
      resetButton.style.color = "var(--spice-main)";
    });
    resetButton.addEventListener("mouseout", () => {
      resetButton.style.backgroundColor = "transparent";
      resetButton.style.color = "var(--spice-text)";
    });

    saveButton.addEventListener("mouseover", () => {
      saveButton.style.transform = "scale(1.02)";
      saveButton.style.opacity = "0.9";
    });
    saveButton.addEventListener("mouseout", () => {
      saveButton.style.transform = "scale(1)";
      saveButton.style.opacity = "1";
    });

    saveButton.onclick = () => {
      saveButton.innerHTML = "¡Aplicado!";
      saveButton.classList.add("applied");
      saveButton.disabled = true;

      setTimeout(() => {
        saveButton.innerHTML = "Aplicar";
        saveButton.classList.remove("applied");
        saveButton.disabled = false;
      }, 1000);

      // Guardar configuración
      localStorage.setItem(
        "sgloss:CustomColor",
        document.getElementById("color-input").value
      );

      localStorage.setItem(
        "sgloss:UseDynamicColors",
        toggle.classList.contains("enabled")
      );

      loadToggles();
    };

    resetButton.onclick = () => {
      // Restablecer a valores por defecto
      toggle.classList.toggle("enabled", true);
      document.getElementById("color-input").value = sglossColor;
      updateColorPickerVisibility();
    };

    buttonsRow.append(resetButton, saveButton);
    content.append(buttonsRow);

    Spicetify.PopupModal.display({ 
      title: "🎨 SGloss Theme", 
      content 
    });
  });

  // Inicialización simplificada
  applyGlassEffects();
  loadToggles();
  Spicetify.Player.addEventListener("songchange", onSongChange);
  
  if (window.navigator.userAgent.indexOf("Win") !== -1)
    document.body.classList.add("windows");
    
  galaxyFade();
  updateZoomVariable();

  waitForElement(
    [".Root__globalNav"],
    (element) => {
      const isCenteredGlobalNav = Spicetify.Platform.version >= "1.2.46.462";
      let addedClass = "control-nav";
      if (element?.[0]?.classList.contains("Root__globalNav"))
        addedClass = isCenteredGlobalNav ? "global-nav-centered" : "global-nav";
      document.body.classList.add(addedClass);
    },
    10000
  );

  Spicetify.Platform.History.listen(updateLyricsPageProperties);

  waitForElement([".Root__lyrics-cinema"], ([lyricsCinema]) => {
    const lyricsCinemaObserver = new MutationObserver(updateLyricsPageProperties);
    const lyricsCinemaObserverConfig = {
      attributes: true,
      attributeFilter: ["class"],
    };
    lyricsCinemaObserver.observe(lyricsCinema, lyricsCinemaObserverConfig);
  });

  waitForElement([".main-view-container"], ([mainViewContainer]) => {
    const mainViewContainerResizeObserver = new ResizeObserver(updateLyricsPageProperties);
    mainViewContainerResizeObserver.observe(mainViewContainer);
  });

  settingsButton.element.classList.toggle("hidden", false);
})();