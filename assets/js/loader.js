(function () {
    const loaderSrc = document.currentScript
        ? document.currentScript.src
        : (() => {
            // Fallback: descobre o caminho pelo script tag
            const scripts = document.getElementsByTagName('script');
            for (let s of scripts) {
                if (s.src && s.src.includes('loader.js')) return s.src;
            }
            return '';
        })();

    const base = loaderSrc.replace(/loader\.js([?#].*)?$/, '');

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const tag = document.createElement('script');
            tag.src = src;
            tag.onload = resolve;
            tag.onerror = () => {
                console.warn('[loader] Não conseguiu carregar:', src);
                resolve(); // não bloqueia os outros
            };
            document.head.appendChild(tag);
        });
    }

    // Carrega o manifesto, depois os scripts em ordem
    loadScript(base + 'manifest.js').then(async () => {
        if (typeof CLUBINGUE_SCRIPTS === 'undefined') {
            console.warn('[loader] manifest.js não definiu CLUBINGUE_SCRIPTS');
            return;
        }
        for (const name of CLUBINGUE_SCRIPTS) {
            await loadScript(base + name);
        }
    });
})();
