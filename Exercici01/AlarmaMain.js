import {Alarma} from "./Alarma.js";
let Alarmes = [];

window.creaAlarma = creaAlarma;

function creaAlarma(){
    let titol = document.getElementById("input_titol").value;
    let hora = document.getElementById("input_hora").value;
    let minut = document.getElementById("input_minut").value;
    let segon = document.getElementById("input_segon").value;
    let musica = document.getElementById("input_musica").value;
    let novaAlarma = new Alarma(titol, hora, minut, segon, musica, true);

    Alarmes.push(novaAlarma);
    actualitzaLlistaAlarmes();
}

function actualitzaLlistaAlarmes(){
    let llista_alarmes = document.getElementById("llista_alarmes");
    llista_alarmes.innerHTML = "";
    Alarmes.forEach((alarma, index) => {
        llista_alarmes.innerHTML += alarma.generaCodiHTML(index);
    });
}

window.activaAlarma = function(index) {
    Alarmes[index].activaAlarma();
}

window.desactivaAlarma = function(index) {
    Alarmes[index].desactivaAlarma();
}