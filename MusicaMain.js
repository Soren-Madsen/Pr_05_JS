import { Musica } from './Musica.js';
import { LlistaMusiques } from './LlistaMusica.js';

let musiques = [];
let llistes = [];
let llistaEnEdicio = null;

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[ch]));
}

function mostrarError(message) {
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
        errorDiv.textContent = message;
    }
}

// MUSICA

window.creaMusica = function () {
    try {
        const titol = document.getElementById('input_titol').value;
        const nom = document.getElementById('input_nomArxiu').value;
        const etiquetes = document.getElementById('input_etiquetes').value
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

        const m = new Musica(titol, nom, etiquetes);
        musiques.push(m);

        actualitzaLlistaMusica();
        actualitzaFiltresMusiques();
        actualitzaSelectMusiques();

        document.getElementById('input_titol').value = '';
        document.getElementById('input_nomArxiu').value = '';
        document.getElementById('input_etiquetes').value = '';

        mostrarError('');
        
        document.getElementById('input_nomArxiu').selectedIndex = 0;
    } catch (err) {
        mostrarError(err.message || String(err));
    }
};

function actualitzaLlistaMusica() {
    const llista = document.getElementById('llista_musica');
    llista.innerHTML = '';

    musiques.forEach((m, index) => {
        llista.innerHTML += generaCodiHTML(m, index);
    });
}

function generaCodiHTML(m, index) {
    const etiquetasHTML = m.etiquetes
        .map(tag => `<span class="tag">${escapeHtml(tag)}</span>`)
        .join('');

    return `
        <div class="card">
            <div class="card-header">${escapeHtml(m.titol)}</div>
            <div class="card-body">
                <div>📁 Arxiu: <code>${escapeHtml(m.nomArxiu)}</code></div>
                <div>🎵 Tipus: ${escapeHtml(m.mediaType)}</div>
                ${etiquetasHTML ? `<div class="tags">${etiquetasHTML}</div>` : ''}
            </div>
            <div class="button-group">
                <button onclick="window.reproduirMusica(${index})">▶ Reproduir</button>
                <button onclick="window.mostraInfo(${index})">ℹ Info</button>
                <button onclick="window.afegirEtiquetaMusica(${index})">+ Etiqueta</button>
                <button class="danger" onclick="window.eliminarMusica(${index})">✕ Eliminar</button>
            </div>
        </div>
    `;
}

window.reproduirMusica = function (index) {
    const audio = document.getElementById('audio_player');
    if (musiques[index]) {
        audio.src = musiques[index].nomArxiu;
        audio.play().catch(() => { });
    }
};

window.eliminarMusica = function (index) {
    if (confirm('Estàs segur que vols eliminar aquesta música?')) {
        musiques.splice(index, 1);
        actualitzaLlistaMusica();
        actualitzaFiltresMusiques();
        actualitzaSelectMusiques();
    }
};

window.afegirEtiquetaMusica = function (index) {
    const m = musiques[index];
    if (!m) return;

    const etiqueta = prompt(`Afegir etiqueta a "${escapeHtml(m.titol)}"`);
    if (etiqueta) {
        try {
            m.afegirEtiqueta(etiqueta);
            actualitzaLlistaMusica();
            actualitzaFiltresMusiques();
            mostrarError('');
        } catch (err) {
            mostrarError(err.message);
        }
    }
};

window.mostraInfo = async function (index) {
    const infoDiv = document.getElementById('audio_info');
    if (!infoDiv) return;
    const m = musiques[index];
    if (!m) {
        infoDiv.textContent = 'Índex invàlid';
        return;
    }
    infoDiv.textContent = 'Carregant informació...';
    const url = m.nomArxiu;
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('No s\'ha pogut carregar el fitxer');
        const ab = await resp.arrayBuffer();
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) throw new Error('Web Audio API no disponible');
        const ctx = new AudioCtx();
        const audioBuffer = await ctx.decodeAudioData(ab);

        const etiquetasHTML = m.etiquetes
            .map(tag => `<span class="tag">${escapeHtml(tag)} <span class="tag-remove" onclick="window.treureEtiquetaMusica(${index}, '${escapeHtml(tag)}')">×</span></span>`)
            .join('');

        infoDiv.innerHTML = `
            <div class="card">
                <div class="card-header">${escapeHtml(m.titol)}</div>
                <div class="card-body">
                    <div>📁 Arxiu: <code>${escapeHtml(m.nomArxiu)}</code></div>
                    <div>🎵 Tipus: ${escapeHtml(m.mediaType)}</div>
                    <div>⏱ Durada: ${audioBuffer.duration.toFixed(2)}s</div>
                    ${etiquetasHTML ? `<div class="tags">${etiquetasHTML}</div>` : ''}
                </div>
            </div>
        `;
        try { ctx.close(); } catch (_) { }
    } catch (err) {
        try {
            const audio = document.getElementById('audio_player');
            audio.src = url;
            await new Promise((resolve, reject) => {
                const onMeta = () => { audio.removeEventListener('loadedmetadata', onMeta); resolve(); };
                const onErr = () => { audio.removeEventListener('error', onErr); reject(new Error('No s\'han pogut carregar metadades')) };
                audio.addEventListener('loadedmetadata', onMeta);
                audio.addEventListener('error', onErr);
            });
            const dur = isFinite(audio.duration) ? audio.duration : NaN;

            const etiquetasHTML = m.etiquetes
                .map(tag => `<span class="tag">${escapeHtml(tag)} <span class="tag-remove" onclick="window.treureEtiquetaMusica(${index}, '${escapeHtml(tag)}')">×</span></span>`)
                .join('');

            infoDiv.innerHTML = `
                <div class="card">
                    <div class="card-header">${escapeHtml(m.titol)}</div>
                    <div class="card-body">
                        <div>📁 Arxiu: <code>${escapeHtml(m.nomArxiu)}</code></div>
                        <div>🎵 Tipus: ${escapeHtml(m.mediaType)}</div>
                        <div>⏱ Durada: ${isFinite(dur) ? dur.toFixed(2) + 's' : 'Desconeguda'}</div>
                        ${etiquetasHTML ? `<div class="tags">${etiquetasHTML}</div>` : ''}
                    </div>
                </div>
            `;
        } catch (err2) {
            infoDiv.textContent = 'No s\'ha pogut obtenir la informació: ' + (err2.message || String(err2));
        }
    }
};

window.treureEtiquetaMusica = function (index, etiqueta) {
    const m = musiques[index];
    if (!m) return;

    if (confirm(`Treure l'etiqueta "${escapeHtml(etiqueta)}"?`)) {
        m.treureEtiqueta(etiqueta);
        actualitzaLlistaMusica();
        actualitzaFiltresMusiques();
        mostraInfo(index);
    }
};

function actualitzaFiltresMusiques() {
    const select = document.getElementById('filter_etiquetes_musica');
    if (!select) return;

    const etiquetes = new Set();
    musiques.forEach(m => {
        m.etiquetes.forEach(tag => etiquetes.add(tag));
    });

    const currentValue = select.value;
    select.innerHTML = '<option value="">-- Totes --</option>';
    Array.from(etiquetes).sort().forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        select.appendChild(option);
    });
    select.value = currentValue;
}

window.filtrarMusiques = function () {
    const selectedTag = document.getElementById('filter_etiquetes_musica').value;
    const llista = document.getElementById('llista_musica');
    llista.innerHTML = '';

    musiques.forEach((m, index) => {
        if (!selectedTag || m.teEtiqueta(selectedTag)) {
            llista.innerHTML += generaCodiHTML(m, index);
        }
    });
};

function actualitzaSelectMusiques() {
    const select = document.getElementById('select_musica_afegir');
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="">-- Selecciona una música --</option>';
    musiques.forEach((m, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = m.titol;
        select.appendChild(option);
    });
    select.value = currentValue;
}


// LLISTA MUSICA

window.creaLlista = function () {
    try {
        const titol = document.getElementById('input_titol_llista').value;
        const etiquetes = document.getElementById('input_etiquetes_llista').value
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

        const nova = new LlistaMusiques(titol, etiquetes, []);
        llistes.push(nova);

        actualitzaLlisteLlistes();
        actualitzaFiltresLlistes();

        document.getElementById('input_titol_llista').value = '';
        document.getElementById('input_etiquetes_llista').value = '';

        mostrarError('');
    } catch (err) {
        mostrarError(err.message || String(err));
    }
};

function actualitzaLlisteLlistes() {
    const llista = document.getElementById('llista_llistes');
    llista.innerHTML = '';

    llistes.forEach((l, index) => {
        llista.innerHTML += generaCodiHTMLLlista(l, index);
    });
}

function generaCodiHTMLLlista(llista, index) {
    const etiquetasHTML = llista.etiquetes
        .map(tag => `<span class="tag">${escapeHtml(tag)}</span>`)
        .join('');

    return `
        <div class="card">
            <div class="card-header">${escapeHtml(llista.titol)}</div>
            <div class="card-body">
                <div>🎵 Músiques: ${llista.llistatMusiques.length}</div>
                ${etiquetasHTML ? `<div class="tags">${etiquetasHTML}</div>` : '<div style="color: #999;">sense etiquetes</div>'}
            </div>
            <div class="button-group">
                <button onclick="window.editarLlista(${index})">✎ Editar</button>
                <button class="danger" onclick="window.eliminarLlista(${index})">✕ Eliminar</button>
            </div>
        </div>
    `;
}

window.editarLlista = function (index) {
    llistaEnEdicio = { index, llista: llistes[index] };

    const seccion = document.getElementById('seccion_editar_llista');
    if (seccion) seccion.style.display = 'block';

    document.getElementById('titulo_editar_llista').textContent = `Editar: ${escapeHtml(llistes[index].titol)}`;
    actualitzaSelectMusiques();
    actualitzaEtiquetesLlistaDisplay();
    actualitzaMusiquesLlistaDisplay();
};

window.eliminarLlista = function (index) {
    if (confirm('Estàs segur que vols eliminar aquesta llista?')) {
        llistes.splice(index, 1);
        actualitzaLlisteLlistes();
        actualitzaFiltresLlistes();
    }
};

window.afegirMusicaALlista = function () {
    if (!llistaEnEdicio) {
        mostrarError('Cap llista seleccionada');
        return;
    }

    const selectMusica = document.getElementById('select_musica_afegir');
    const indexMusica = parseInt(selectMusica.value);

    if (isNaN(indexMusica) || !musiques[indexMusica]) {
        mostrarError('Selecciona una música vàlida');
        return;
    }

    try {
        llistaEnEdicio.llista.afegirMusica(musiques[indexMusica]);
        actualitzaMusiquesLlistaDisplay();
        selectMusica.value = '';
        mostrarError('');
    } catch (err) {
        mostrarError(err.message);
    }
};

window.treureMusicaALlista = function (indexMusica) {
    if (!llistaEnEdicio) return;

    if (confirm('Estàs segur?')) {
        llistaEnEdicio.llista.treureMusica(musiques[indexMusica]);
        actualitzaMusiquesLlistaDisplay();
    }
};

window.afegirEtiquetaALlista = function () {
    if (!llistaEnEdicio) {
        mostrarError('Cap llista seleccionada');
        return;
    }

    const input = document.getElementById('input_nova_etiqueta_llista');
    const etiqueta = input.value.trim();

    if (!etiqueta) {
        mostrarError('Introdueix una etiqueta');
        return;
    }

    try {
        llistaEnEdicio.llista.afegirEtiqueta(etiqueta);
        actualitzaEtiquetesLlistaDisplay();
        input.value = '';
        actualitzaLlisteLlistes();
        mostrarError('');
    } catch (err) {
        mostrarError(err.message);
    }
};

window.treureEtiquetaALlista = function (etiqueta) {
    if (!llistaEnEdicio) return;

    if (confirm(`Treure l'etiqueta "${escapeHtml(etiqueta)}"?`)) {
        llistaEnEdicio.llista.treureEtiqueta(etiqueta);
        actualitzaEtiquetesLlistaDisplay();
        actualitzaLlisteLlistes();
    }
};

function actualitzaEtiquetesLlistaDisplay() {
    if (!llistaEnEdicio) return;

    const display = document.getElementById('etiquetes_llista_display');
    if (!display) return;

    display.innerHTML = '';
    llistaEnEdicio.llista.etiquetes.forEach(etiqueta => {
        display.innerHTML += `
            <span class="tag">
                ${escapeHtml(etiqueta)}
                <span class="tag-remove" onclick="window.treureEtiquetaALlista('${escapeHtml(etiqueta)}')">×</span>
            </span>
        `;
    });

    if (llistaEnEdicio.llista.etiquetes.length === 0) {
        display.innerHTML = '<div style="color: #999;">sense etiquetes</div>';
    }
}

function actualitzaMusiquesLlistaDisplay() {
    if (!llistaEnEdicio) return;

    const display = document.getElementById('musiques_de_llista');
    if (!display) return;

    display.innerHTML = '';

    if (llistaEnEdicio.llista.llistatMusiques.length === 0) {
        display.innerHTML = '<div style="color: #999; padding: 12px;">La llista no té músiques</div>';
        return;
    }

    llistaEnEdicio.llista.llistatMusiques.forEach((m) => {
        const globalIndex = musiques.indexOf(m);
        const etiquetasHTML = m.etiquetes
            .map(tag => `<span class="tag">${escapeHtml(tag)}</span>`)
            .join('');

        display.innerHTML += `
            <div class="card">
                <div class="card-header">${escapeHtml(m.titol)}</div>
                <div class="card-body">
                    <div>📁 ${escapeHtml(m.nomArxiu)}</div>
                    ${etiquetasHTML ? `<div class="tags">${etiquetasHTML}</div>` : ''}
                </div>
                <div class="button-group">
                    <button onclick="window.reproduirMusica(${globalIndex})">▶ Reproduir</button>
                    <button class="danger" onclick="window.treureMusicaALlista(${globalIndex})">✕ Treure</button>
                </div>
            </div>
        `;
    });
}

function actualitzaFiltresLlistes() {
    const select = document.getElementById('filter_etiquetes_llistes');
    if (!select) return;

    const etiquetes = new Set();
    llistes.forEach(l => {
        l.etiquetes.forEach(tag => etiquetes.add(tag));
    });

    const currentValue = select.value;
    select.innerHTML = '<option value="">-- Totes --</option>';
    Array.from(etiquetes).sort().forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        select.appendChild(option);
    });
    select.value = currentValue;
}

window.filtrarLlistes = function () {
    const selectedTag = document.getElementById('filter_etiquetes_llistes').value;
    const llista = document.getElementById('llista_llistes');
    llista.innerHTML = '';

    llistes.forEach((l, index) => {
        if (!selectedTag || l.etiquetes.includes(selectedTag)) {
            llista.innerHTML += generaCodiHTMLLlista(l, index);
        }
    });
};

    // INICIALITZACIÓ DE DADES

document.addEventListener('DOMContentLoaded', () => {

    actualitzaLlistaMusica();
    actualitzaFiltresMusiques();
    actualitzaSelectMusiques();
    actualitzaLlisteLlistes();
    actualitzaFiltresLlistes();

    const btnCrear = document.getElementById('btn_crear');
    if (btnCrear) btnCrear.addEventListener('click', creaMusica);

    const btnCrearLlista = document.getElementById('btn_crear_llista');
    if (btnCrearLlista) btnCrearLlista.addEventListener('click', creaLlista);

    document.getElementById('input_titol').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') creaMusica();
    });

    document.getElementById('input_titol_llista').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') creaLlista();
    });
});
