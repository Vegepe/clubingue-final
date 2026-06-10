function getEmojiBase() {
    return 'assets/images/emoji/';
}

function parseEmojis(el) {
    const base = getEmojiBase();
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];

    let node;
    while ((node = walker.nextNode())) {
        if (node.nodeValue.includes(':')) nodes.push(node);
    }

    nodes.forEach(node => {
        const val = node.nodeValue;
        // pattern instanciado dentro do forEach pra lastIndex não vazar entre iterações
        const pattern = /:([a-z0-9_-]+):/g;
        if (!pattern.test(val)) return;
        pattern.lastIndex = 0;

        const frag = document.createDocumentFragment();
        let last = 0, match;

        while ((match = pattern.exec(val)) !== null) {
            const name = match[1];
            const hasExt = /\.[a-z0-9]+$/i.test(name);
            const src = base + name + (hasExt ? '' : '.png');

            if (match.index > last) {
                frag.appendChild(document.createTextNode(val.slice(last, match.index)));
            }

            const img = document.createElement('img');
            img.src = src;
            img.alt = ':' + name + ':';
            img.title = name;
            img.className = 'cemoji';
            // Esconde a imagem se não carregar (arquivo não existe)
            img.onerror = function() { this.style.display = 'none'; };
            frag.appendChild(img);

            last = match.index + match[0].length;
        }

        if (last < val.length) {
            frag.appendChild(document.createTextNode(val.slice(last)));
        }

        if (last > 0) {
            node.parentNode.replaceChild(frag, node);
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => parseEmojis(document.body));
} else {
    parseEmojis(document.body);
}