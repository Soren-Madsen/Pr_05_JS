export class Alarma {
    set titol(titol) {
        this._titol = titol;
    }
    set hora(hora) {
        this._hora = hora;
    }
    set minut(minut) {
        this._minut = minut;
    }
    set segon(segon) {
        this._segon = segon;
    }
    set musica(musica) {
        this._musica = musica;
    }
    set activa(activa) {
        this._activa = activa;
    }
    get titol() {
        return this._titol;
    }
    get hora() {
        return this._hora;
    }
    get minut() {
        return this._minut;
    }
    get segon() {
        return this._segon;
    }
    get hora_completa() {
        return this._hora + ":" + this._minut + ":" + this._segon;
    }
    get musica() {
        return this._musica;
    }
    get activa() {
        return this._activa;
    }
    constructor(titol, hora, minut, segon, musica, activa) {
        this.titol = titol;
        this.hora = hora;
        this.minut = minut;
        this.segon = segon;
        this.musica = musica;
        this.activa = activa;
    }
    desactivaAlarma() {
        window.clearInterval(this.refInterval);
        this.activa = false;
    }
    activaAlarma() {
        this.refInterval = window.setInterval(() => {
            let date = new Date();
            let hora_actual = date.getHours();
            let minut_actual = date.getMinutes();
            let segon_actual = date.getSeconds();
            if (hora_actual === this.hora && minut_actual === this.minut && segon_actual === this.segon) {
                console.log("Alarmaaaa");
            }else{
                console.log (hora_actual + ":" + minut_actual + ":" + segon_actual);
            }
        }, 1000);
        this.activa = true;
    }
    generaCodiHTML() {
        return `<div>
                    <h2>${this.titol}</h2>
                    <div>Hora Alarma: ${this.hora_completa}</div>
                    <div>Música: ${this.musica}</div>
                    <div>Activa: ${this.activa}</div>
                    <button onclick="activaAlarma(${index})" style="color: green;">ACTIVA</button>
                    <button onclick="desactivaAlarma(${index})" style="color: red;">DESACTIVA</button>
                </div>`;
    }
}