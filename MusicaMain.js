import { Musica } from './Musica.js';
import { LlistaMusiques } from './LlistaMusica.js';

let musiques = [];
let llistes = new Map(); 
let llistaEnEdicio = null;
let llistaDisponible = null;

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

// VALIDACIONS EN TEMPS REAL

function mostrarFeedback(elementId, tipus, missatge) {
    const feedbackDiv = document.getElementById(elementId);
    if (feedbackDiv) {
        feedbackDiv.className = `feedback ${tipus}`;
        feedbackDiv.textContent = missatge;
    }
}

function amagarFeedback(elementId) {
    const feedbackDiv = document.getElementById(elementId);
    if (feedbackDiv) {
        feedbackDiv.className = 'feedback';
        feedbackDiv.textContent = '';
    }
}

function validarTitol() {
    const titol = document.getElementById('input_titol').value.trim();
    
    if (titol.length === 0) {
        amagarFeedback('feedback_titol');
        return false;
    }
    
    if (titol.length < 2) {
        mostrarFeedback('feedback_titol', 'error', 'El títol ha de tenir almenys 2 caràcters');
        return false;
    }
    
    if (titol.length > 20) {
        mostrarFeedback('feedback_titol', 'error', 'El títol no pot superar els 20 caràcters');
        return false;
    }
    
    mostrarFeedback('feedback_titol', 'success', 'Títol correcte');
    return true;
}

function validarNomArxiu() {
    const nom = document.getElementById('input_nomArxiu').value;
    
    if (!nom || nom === '') {
        amagarFeedback('feedback_nomArxiu');
        return false;
    }
    
    const extensionsValides = ['mp3', 'ogg', 'wav'];
    const extensio = nom.split('.').pop().toLowerCase();
    
    if (!extensionsValides.includes(extensio)) {
        mostrarFeedback('feedback_nomArxiu', 'error', 'Extensió no vàlida (usa mp3, ogg o wav)');
        return false;
    }
    
    mostrarFeedback('feedback_nomArxiu', 'success', 'Arxiu correcte');
    return true;
}

function validarEtiquetes() {
    const checkboxes = document.querySelectorAll('input[name="etiquetes"]:checked');
    
    if (checkboxes.length === 0) {
        mostrarFeedback('feedback_etiquetes', 'error', 'Has de seleccionar almenys una etiqueta');
        return false;
    }
    
    mostrarFeedback('feedback_etiquetes', 'success', `${checkboxes.length} etiqueta/es seleccionada/es`);
    return true;
}

function validarFormulari() {
    const titolValid = validarTitol();
    const arxiuValid = validarNomArxiu();
    const etiquetesValid = validarEtiquetes();
    
    const btnCrear = document.getElementById('btn_crear');
    if (btnCrear) {
        btnCrear.disabled = !(titolValid && arxiuValid && etiquetesValid);
    }
    
    return titolValid && arxiuValid && etiquetesValid;
}

// MUSICA

window.creaMusica = function (e) {
    if (e) e.preventDefault();
    
    // Validar tot abans de crear
    if (!validarFormulari()) {
        return;
    }
    
    try {
        const titol = document.getElementById('input_titol').value.trim();
        const nom = document.getElementById('input_nomArxiu').value;
        
        const checkboxes = document.querySelectorAll('input[name="etiquetes"]:checked');
        const etiquetes = Array.from(checkboxes).map(cb => cb.value);

        const m = new Musica(titol, nom, etiquetes);
        musiques.push(m);
        
        // Afegir a la llista "Disponible"
        if (llistaDisponible) {
            llistaDisponible.afegirMusica(m);
        }

        actualitzaLlistaMusica();
        actualitzaFiltresMusiques();
        actualitzaSelectMusiques();
        actualitzaLlisteLlistes();

        // Netejar el formulari
        document.getElementById('input_titol').value = '';
        document.getElementById('input_nomArxiu').value = '';
        document.getElementById('input_nomArxiu').selectedIndex = 0;
        
        // Desmarcar tots els checkboxes
        checkboxes.forEach(cb => cb.checked = false);
        
        // Amagar tots els feedbacks
        amagarFeedback('feedback_titol');
        amagarFeedback('feedback_nomArxiu');
        amagarFeedback('feedback_etiquetes');
        
        // Desactivar el botó fins que es torni a omplir
        document.getElementById('btn_crear').disabled = true;

        mostrarError('');
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
        llistes.set(nova.titol, nova);

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

    llistes.forEach((l, titol) => {
        llista.innerHTML += generaCodiHTMLLlista(l, titol);
    });
}

function generaCodiHTMLLlista(llista, titol) {
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
                <button onclick="window.editarLlista('${escapeHtml(titol)}')">✎ Editar</button>
                <button class="danger" onclick="window.eliminarLlista('${escapeHtml(titol)}')">✕ Eliminar</button>
            </div>
        </div>
    `;
}

window.editarLlista = function (titol) {
    const llista = llistes.get(titol);
    if (!llista) return;
    
    llistaEnEdicio = { titol, llista };

    const seccion = document.getElementById('seccion_editar_llista');
    if (seccion) seccion.style.display = 'block';

    document.getElementById('titulo_editar_llista').textContent = `Editar: ${escapeHtml(llista.titol)}`;
    actualitzaSelectMusiques();
    actualitzaEtiquetesLlistaDisplay();
    actualitzaMusiquesLlistaDisplay();
};

window.eliminarLlista = function (titol) {
    if (confirm('Estàs segur que vols eliminar aquesta llista?')) {
        llistes.delete(titol);
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

    llistes.forEach((l, titol) => {
        if (!selectedTag || l.etiquetes.includes(selectedTag)) {
            llista.innerHTML += generaCodiHTMLLlista(l, titol);
        }
    });
};

    // INICIALITZACIÓ DE DADES

document.addEventListener('DOMContentLoaded', () => {

    // Crear la llista "Disponible" per defecte
    try {
        llistaDisponible = new LlistaMusiques('Disponible', [], []);
        llistes.set(llistaDisponible.titol, llistaDisponible);
    } catch (err) {
        console.error('Error creant llista Disponible:', err);
    }

    actualitzaLlistaMusica();
    actualitzaFiltresMusiques();
    actualitzaSelectMusiques();
    actualitzaLlisteLlistes();
    actualitzaFiltresLlistes();

    // Gestió del formulari de crear música
    const formCrear = document.getElementById('form_crear_musica');
    if (formCrear) formCrear.addEventListener('submit', creaMusica);

    const btnCrearLlista = document.getElementById('btn_crear_llista');
    if (btnCrearLlista) btnCrearLlista.addEventListener('click', creaLlista);

    document.getElementById('input_titol_llista').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') creaLlista();
    });
    
    // Event listeners per validació en temps real
    const inputTitol = document.getElementById('input_titol');
    if (inputTitol) {
        inputTitol.addEventListener('input', validarFormulari);
        inputTitol.addEventListener('blur', validarFormulari);
    }
    
    const inputNomArxiu = document.getElementById('input_nomArxiu');
    if (inputNomArxiu) {
        inputNomArxiu.addEventListener('change', validarFormulari);
    }
    
    const checkboxesEtiquetes = document.querySelectorAll('input[name="etiquetes"]');
    checkboxesEtiquetes.forEach(cb => {
        cb.addEventListener('change', validarFormulari);
    });
});
