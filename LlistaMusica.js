
import { Musica } from './Musica.js';

export class LlistaMusiques {
    constructor(titol, etiquetes = [], llistatMusiques = []) {
        this.titol = titol;
        this.etiquetes = etiquetes;
        this.llistatMusiques = llistatMusiques;
    }
    
    set titol(titol) {
        if (typeof titol !== 'string' || titol.trim().length < 2) {
            throw new Error('Títol ha de tenir almenys 2 caràcters');
        }
        this._titol = titol.trim();
    }

    get titol() {
        return this._titol;
    }

    set etiquetes(etiquetes) {
        if (!Array.isArray(etiquetes)) {
            throw new Error('Etiquetes ha de ser un array');
        }
        this._etiquetes = etiquetes;
    }

    get etiquetes() {
        return this._etiquetes || [];
    }

    set llistatMusiques(llistatMusiques) {
        if (!Array.isArray(llistatMusiques)) {
            throw new Error('La llista de músiques ha de ser un array');
        }
        this._llistatMusiques = llistatMusiques;
    }

    get llistatMusiques() {
        return this._llistatMusiques || [];
    }

    // Afegir una música a la llista
    afegirMusica(musica) {
        if (!(musica instanceof Musica)) {
            throw new Error('Ha de ser una instància de Musica');
        }
        if (!this._llistatMusiques.includes(musica)) {
            this._llistatMusiques.push(musica);
        }
    }

    // Treure una música de la llista
    treureMusica(musica) {
        if (!(musica instanceof Musica)) {
            throw new Error('Ha de ser una instància de Musica');
        }
        const index = this._llistatMusiques.indexOf(musica);
        if (index > -1) {
            this._llistatMusiques.splice(index, 1);
        }
    }

    // Afegir una etiqueta a la llista
    afegirEtiqueta(etiqueta) {
        if (typeof etiqueta !== 'string' || etiqueta.trim().length === 0) {
            throw new Error('L\'etiqueta ha de ser una string no buida');
        }
        const trimmed = etiqueta.trim();
        if (!this._etiquetes.includes(trimmed)) {
            this._etiquetes.push(trimmed);
        }
    }

    // Treure una etiqueta de la llista
    treureEtiqueta(etiqueta) {
        if (typeof etiqueta !== 'string') {
            throw new Error('L\'etiqueta ha de ser una string');
        }
        const index = this._etiquetes.indexOf(etiqueta.trim());
        if (index > -1) {
            this._etiquetes.splice(index, 1);
        }
    }

    // Obtenir les músiques filtrades per etiqueta
    getMusiquesPerEtiqueta(etiqueta) {
        return this._llistatMusiques.filter(m => m.teEtiqueta(etiqueta));
    }
}


