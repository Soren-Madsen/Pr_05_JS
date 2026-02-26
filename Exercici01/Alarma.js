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
        return String(this._hora).padStart(2, '0') + ":" + 
               String(this._minut).padStart(2, '0') + ":" + 
               String(this._segon).padStart(2, '0');
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
    generaCodiHTML(horaCompleta) {
        const estatActiva = this.activa ? "✅ Sí" : "❌ No";
        const colorEstat = this.activa ? "green" : "red";
        
        return `<div class="alarma-item">
                    <h2>⏰ ${this.titol}</h2>
                    <div><strong>Hora Alarma:</strong> ${this.hora_completa}</div>
                    <div><strong>Música:</strong> ${this.musica}</div>
                    <div><strong>Activa:</strong> <span style="color: ${colorEstat};">${estatActiva}</span></div>
                    <button onclick="activaAlarma('${horaCompleta}')" style="background-color: green;">ACTIVA</button>
                    <button onclick="desactivaAlarma('${horaCompleta}')" style="background-color: red;">DESACTIVA</button>
                </div>`;
    }
}