import {Alarma} from "./Alarma.js";
let Alarmes = new Map();

// Esperem que el DOM estigui carregat
window.addEventListener('DOMContentLoaded', () => {
    const formulari = document.getElementById("formulari_alarma");
    formulari.addEventListener('submit', (e) => {
        e.preventDefault();
        creaAlarma();
    });
});

// Array de músiques vàlides disponibles
const MUSIQUES_DISPONIBLES = ["Notification.wav", "Screech.wav", "Spooky.wav"];

function validarFormulari() {
    let valid = true;
    let errors = [];
    
    document.querySelectorAll('.input-error').forEach(input => {
        input.classList.remove('input-error');
    });
    
    // Validar títol (mínim 3 caràcters)
    const inputTitol = document.getElementById("input_titol");
    const titol = inputTitol.value.trim();
    const errorTitol = document.getElementById("error_titol");
    if (titol.length === 0) {
        errorTitol.textContent = " El títol és obligatori";
        errorTitol.style.display = "block";
        inputTitol.classList.add('input-error');
        errors.push("El títol és obligatori");
        valid = false;
    } else if (titol.length < 3) {
        errorTitol.textContent = " El títol ha de tenir almenys 3 caràcters";
        errorTitol.style.display = "block";
        inputTitol.classList.add('input-error');
        errors.push("El títol ha de tenir almenys 3 caràcters");
        valid = false;
    } else {
        errorTitol.style.display = "none";
    }
    
    // Validar hora (0-23)
    const inputHora = document.getElementById("input_hora");
    const horaInput = inputHora.value;
    const hora = parseInt(horaInput);
    const errorHora = document.getElementById("error_hora");
    if (horaInput === "" || horaInput === null) {
        errorHora.textContent = " L'hora és obligatòria";
        errorHora.style.display = "block";
        inputHora.classList.add('input-error');
        errors.push("L'hora és obligatòria");
        valid = false;
    } else if (isNaN(hora) || hora < 0 || hora > 23) {
        errorHora.textContent = " L'hora ha d'estar entre 0 i 23";
        errorHora.style.display = "block";
        inputHora.classList.add('input-error');
        errors.push("L'hora ha d'estar entre 0 i 23");
        valid = false;
    } else {
        errorHora.style.display = "none";
    }
    
    // Validar minut (0-59)
    const inputMinut = document.getElementById("input_minut");
    const minutInput = inputMinut.value;
    const minut = parseInt(minutInput);
    const errorMinut = document.getElementById("error_minut");
    if (minutInput === "" || minutInput === null) {
        errorMinut.textContent = " El minut és obligatori";
        errorMinut.style.display = "block";
        inputMinut.classList.add('input-error');
        errors.push("El minut és obligatori");
        valid = false;
    } else if (isNaN(minut) || minut < 0 || minut > 59) {
        errorMinut.textContent = " El minut ha d'estar entre 0 i 59";
        errorMinut.style.display = "block";
        inputMinut.classList.add('input-error');
        errors.push("El minut ha d'estar entre 0 i 59");
        valid = false;
    } else {
        errorMinut.style.display = "none";
    }
    
    // Validar segon (0-59)
    const inputSegon = document.getElementById("input_segon");
    const segonInput = inputSegon.value;
    const segon = parseInt(segonInput);
    const errorSegon = document.getElementById("error_segon");
    if (segonInput === "" || segonInput === null) {
        errorSegon.textContent = " El segon és obligatori";
        errorSegon.style.display = "block";
        inputSegon.classList.add('input-error');
        errors.push("El segon és obligatori");
        valid = false;
    } else if (isNaN(segon) || segon < 0 || segon > 59) {
        errorSegon.textContent = " El segon ha d'estar entre 0 i 59";
        errorSegon.style.display = "block";
        inputSegon.classList.add('input-error');
        errors.push("El segon ha d'estar entre 0 i 59");
        valid = false;
    } else {
        errorSegon.style.display = "none";
    }
    
    // Validar música 
    const inputMusica = document.getElementById("input_musica");
    const musica = inputMusica.value;
    const errorMusica = document.getElementById("error_musica");
    if (musica === "" || musica === null) {
        errorMusica.textContent = " Has de seleccionar una música";
        errorMusica.style.display = "block";
        inputMusica.classList.add('input-error');
        errors.push("Has de seleccionar una música");
        valid = false;
    } else if (!MUSIQUES_DISPONIBLES.includes(musica)) {
        errorMusica.textContent = " La música seleccionada no és vàlida";
        errorMusica.style.display = "block";
        inputMusica.classList.add('input-error');
        errors.push("La música seleccionada no és vàlida");
        valid = false;
    } else {
        errorMusica.style.display = "none";
    }
    
    // Validar que no existeix una alarma amb la mateixa hora completa
    // Només validem això si tots els camps de temps són vàlids
    if (valid || (!isNaN(hora) && hora >= 0 && hora <= 23 && 
                   !isNaN(minut) && minut >= 0 && minut <= 59 && 
                   !isNaN(segon) && segon >= 0 && segon <= 59)) {
        
        const horaFormatada = `${String(hora).padStart(2, '0')}:${String(minut).padStart(2, '0')}:${String(segon).padStart(2, '0')}`;
        const alarmaExistent = Alarmes.get(horaFormatada);
        
        if (alarmaExistent) {
            const missatge = `JA EXISTEIX UNA ALARMA A AQUESTA HORA!\n\n` +
                           `Alarma existent: "${alarmaExistent.titol}"\n` +
                           `Hora: ${horaFormatada}\n\n` +
                           `No es poden crear dues alarmes amb la mateixa hora.`;
            alert(missatge);
            // Marquem els camps d'hora com a error
            inputHora.classList.add('input-error');
            inputMinut.classList.add('input-error');
            inputSegon.classList.add('input-error');
            valid = false;
        }
    }
    
    // Si hi ha errors de validació, mostrem un resum
    if (!valid && errors.length > 0) {
        const missatgeError = ` ERRORS DE VALIDACIÓ:\n\n${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}\n\nSi us plau, corregeix els errors abans de crear l'alarma.`;
        alert(missatgeError);
    }
    
    return valid;
}

function creaAlarma(){
    // Validar el formulari abans de crear l'alarma
    if (!validarFormulari()) {
        return;
    }
    
    // Si totes les validacions passen, creem l'alarma
    let titol = document.getElementById("input_titol").value.trim();
    let hora = parseInt(document.getElementById("input_hora").value);
    let minut = parseInt(document.getElementById("input_minut").value);
    let segon = parseInt(document.getElementById("input_segon").value);
    let musica = document.getElementById("input_musica").value;
    let activa = document.getElementById("input_activa").checked;
    
    try {
        let novaAlarma = new Alarma(titol, hora, minut, segon, musica, activa);

        // Afegir l'alarma al Map utilitzant hora_completa com a clau
        Alarmes.set(novaAlarma.hora_completa, novaAlarma);
        
        // Activar l'alarma si està marcada com activa
        if (activa) {
            novaAlarma.activaAlarma();
        }
        
        actualitzaLlistaAlarmes();
        netejFormulari();
        
        // Missatge de confirmació
        alert(`✅ Alarma "${titol}" creada correctament per les ${hora}:${minut}:${segon}`);
        
    } catch (error) {
        alert(` Error en crear l'alarma: ${error.message}`);
    }
}

function netejFormulari() {
    document.getElementById("input_titol").value = "";
    document.getElementById("input_hora").value = "";
    document.getElementById("input_minut").value = "";
    document.getElementById("input_segon").value = "";
    document.getElementById("input_musica").value = "";
    document.getElementById("input_activa").checked = true;
}

function actualitzaLlistaAlarmes(){
    let llista_alarmes = document.getElementById("llista_alarmes");
    llista_alarmes.innerHTML = "";
    
    if (Alarmes.size === 0) {
        llista_alarmes.innerHTML = "<p style='text-align: center; color: #999;'>No hi ha alarmes creades</p>";
        return;
    }
    
    // Recorrem el Map utilitzant forEach
    Alarmes.forEach((alarma, horaCompleta) => {
        llista_alarmes.innerHTML += alarma.generaCodiHTML(horaCompleta);
    });
}

window.activaAlarma = function(horaCompleta) {
    const alarma = Alarmes.get(horaCompleta);
    if (alarma) {
        alarma.activaAlarma();
        actualitzaLlistaAlarmes();
    }
}

window.desactivaAlarma = function(horaCompleta) {
    const alarma = Alarmes.get(horaCompleta);
    if (alarma) {
        alarma.desactivaAlarma();
        actualitzaLlistaAlarmes();
    }
}