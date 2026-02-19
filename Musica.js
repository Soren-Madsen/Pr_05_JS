

export class Musica {
    static EXTENSION_MAP = {
        mp3: 'audio/mpeg',
        ogg: 'audio/ogg',
        wav: 'audio/wav'
    };

    constructor(titol, nomArxiu, etiquetes = []) {
        this.titol = titol;
        this.nomArxiu = nomArxiu;
        this.etiquetes = etiquetes;
    }

    // titol: mínim 2 caràcters
    set titol(titol) {
        if (typeof titol !== 'string' || titol.trim().length < 2) {
            throw new Error('Títol ha de tenir almenys 2 caràcters');
        }
        this._titol = titol.trim();
    }

    get titol() {
        return this._titol;
    }

    // nom de l'arxiu: mínim 1 caràcter i ha d'acabar amb una extensió vàlida
    set nomArxiu(nom) {
        if (typeof nom !== 'string' || nom.trim().length < 1) {
            throw new Error('Nom de l\'arxiu ha de tenir almenys 1 caràcter');
        }
        const trimmed = nom.trim();
        const m = trimmed.match(/\.([^.\\s]+)$/);
        if (!m) {
            throw new Error('El nom de l\'arxiu ha de tenir una extensió vàlida (per exemple: .mp3, .ogg, .wav)');
        }
        const ext = m[1].toLowerCase();
        if (!(ext in Musica.EXTENSION_MAP)) {
            throw new Error(`Extensió no suportada: .${ext}`);
        }
        this._nomArxiu = trimmed;
        // assignar automàticament el media type segons l'extensió
        this.mediaType = ext;
    }

    get nomArxiu() {
        return this._nomArxiu;
    }

    // media type: rebrà la extensió i assignarà el media type corresponent
    set mediaType(extOrType) {
        if (typeof extOrType !== 'string' || extOrType.trim().length === 0) {
            throw new Error('Media type o extensió invàlida');
        }
        const normalized = extOrType.trim().toLowerCase();
        // si reben una extensió com 'mp3' o '.mp3'
        const ext = normalized.replace(/^\./, '');
        if (ext in Musica.EXTENSION_MAP) {
            this._mediaType = Musica.EXTENSION_MAP[ext];
            return;
        }
        // si reben ja un media type, acceptem només els coneguts
        const values = Object.values(Musica.EXTENSION_MAP);
        if (values.includes(normalized)) {
            this._mediaType = normalized;
            return;
        }
        throw new Error(`No es pot assignar media type per: ${extOrType}`);
    }

    get mediaType() {
        return this._mediaType;
    }

    // etiquetes: array de strings
    set etiquetes(tags) {
        if (!Array.isArray(tags)) {
            throw new Error('Etiquetes ha de ser un array de strings');
        }
        for (const t of tags) {
            if (typeof t !== 'string') {
                throw new Error('Cada etiqueta ha de ser una string');
            }
        }
       this._etiquetes = tags;
    }

    get etiquetes() {
        return this._etiquetes || [];
    }

    // Afegir una etiqueta a la música
    afegirEtiqueta(etiqueta) {
        if (typeof etiqueta !== 'string' || etiqueta.trim().length === 0) {
            throw new Error('L\'etiqueta ha de ser una string no buida');
        }
        const trimmed = etiqueta.trim();
        if (!this._etiquetes.includes(trimmed)) {z
            this._etiquetes.push(trimmed);
        }
    }

    // Treure una etiqueta de la música
    treureEtiqueta(etiqueta) {
        if (typeof etiqueta !== 'string') {
            throw new Error('L\'etiqueta ha de ser una string');
        }
        const index = this._etiquetes.indexOf(etiqueta.trim());
        if (index > -1) {
            this._etiquetes.splice(index, 1);
        }
    }

    // Verificar si la música té una etiqueta específica
    teEtiqueta(etiqueta) {
        return this._etiquetes.includes(etiqueta.trim());
    }
}