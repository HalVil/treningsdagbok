// Registrer service worker for PWA-støtte
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/treningsdagbok/sw.js')
            .then(registration => {
                console.log('Service Worker registrert:', registration);
            })
            .catch(error => {
                console.log('Service Worker registrering feilet:', error);
            });
    });
}

// Sjekk om det finnes lagrede treningsøkter i localStorage
let treningsokter = JSON.parse(localStorage.getItem('treningsokter')) || [];

// DOM elementer
const treningsForm = document.getElementById('treningsForm');
const treningshistorikk = document.getElementById('treningshistorikk');
const leggTilOvelseBtn = document.getElementById('leggTilOvelse');

// Funksjon for å legge til nytt sett
function leggTilNyttSett(settContainer) {
    const nyttSett = document.createElement('div');
    nyttSett.className = 'sett-gruppe';
    nyttSett.innerHTML = `
        <input type="number" class="vekt" placeholder="Vekt (kg)" required min="0">
        <input type="number" class="reps" placeholder="Reps" required min="1">
        <button type="button" class="fjern-sett">-</button>
    `;
    settContainer.appendChild(nyttSett);
    
    // Legg til lytter for fjern-knappen
    const fjernSettBtn = nyttSett.querySelector('.fjern-sett');
    fjernSettBtn.addEventListener('click', () => nyttSett.remove());
}

// Funksjon for å sette opp sett-knapper
function setupSettHandlers(container) {
    const leggTilSettBtn = container.querySelector('.legg-til-sett');
    if (leggTilSettBtn && !leggTilSettBtn.hasEventListener) {
        leggTilSettBtn.hasEventListener = true;
        leggTilSettBtn.addEventListener('click', () => {
            const settContainer = leggTilSettBtn.closest('.sett-container');
            leggTilNyttSett(settContainer);
        });
    }
}

// Funksjon for å legge til ny øvelse
function leggTilNyOvelse() {
    const ovelseDiv = document.createElement('div');
    ovelseDiv.className = 'ovelse';
    ovelseDiv.innerHTML = `
        <select class="ovelse-navn" required>
            <option value="">Velg øvelse</option>
            <!-- Bryst -->
            <optgroup label="Bryst">
                <option value="Benkpress">Benkpress</option>
                <option value="Skråbenk">Skråbenk</option>
                <option value="Flies">Flies</option>
                <option value="Push-ups">Push-ups</option>
            </optgroup>
            <!-- Ben -->
            <optgroup label="Ben">
                <option value="Knebøy">Knebøy</option>
                <option value="Leg Press">Leg Press</option>
                <option value="Leg Extension">Leg Extension</option>
                <option value="Leg Curl">Leg Curl</option>
                <option value="Calf Raises">Calf Raises</option>
            </optgroup>
            <!-- Rygg -->
            <optgroup label="Rygg">
                <option value="Markløft">Markløft</option>
                <option value="Pull-ups">Pull-ups</option>
                <option value="Rows">Rows</option>
                <option value="Lat Pulldown">Lat Pulldown</option>
            </optgroup>
            <!-- Skuldre -->
            <optgroup label="Skuldre">
                <option value="Skulderpress">Skulderpress</option>
                <option value="Lateral Raise">Lateral Raise</option>
                <option value="Front Raise">Front Raise</option>
                <option value="Face Pulls">Face Pulls</option>
            </optgroup>
            <!-- Armer -->
            <optgroup label="Armer">
                <option value="Bicepscurl">Bicepscurl</option>
                <option value="Triceps Extension">Triceps Extension</option>
                <option value="Hammer Curls">Hammer Curls</option>
                <option value="Skull Crushers">Skull Crushers</option>
            </optgroup>
            <!-- Core -->
            <optgroup label="Core">
                <option value="Sit-ups">Sit-ups</option>
                <option value="Planke">Planke</option>
                <option value="Russian Twist">Russian Twist</option>
                <option value="Cable Crunch">Cable Crunch</option>
            </optgroup>
        </select>
        <div class="sett-container">
            <div class="sett-gruppe">
                <input type="number" class="vekt" placeholder="Vekt (kg)" required min="0">
                <input type="number" class="reps" placeholder="Reps" required min="1">
                <button type="button" class="legg-til-sett">+</button>
            </div>
        </div>
    `;
    document.getElementById('ovelser').appendChild(ovelseDiv);
    setupSettHandlers(ovelseDiv);
}

// Funksjon for å håndtere sett
function setupSettHandlers(ovelseDiv) {
    const leggTilSettBtn = ovelseDiv.querySelector('.legg-til-sett');
    const settContainer = ovelseDiv.querySelector('.sett-container');
    
    leggTilSettBtn.addEventListener('click', () => {
        const settGruppe = document.createElement('div');
        settGruppe.className = 'sett-gruppe';
        settGruppe.innerHTML = `
            <input type="number" class="vekt" placeholder="Vekt (kg)" required min="0">
            <input type="number" class="reps" placeholder="Reps" required min="1">
            <button type="button" class="fjern-sett">-</button>
        `;
        settContainer.appendChild(settGruppe);

        settGruppe.querySelector('.fjern-sett').addEventListener('click', () => {
            settGruppe.remove();
        });
    });
}

// Håndter bildeopplasting
const bildeInput = document.getElementById('bilde');
const bildePreview = document.getElementById('bilde-preview');

if (bildeInput) {
    bildeInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                bildePreview.innerHTML = '';
                bildePreview.appendChild(img);
            }
            reader.readAsDataURL(file);
        }
    });
}

// Legg til lytter for "Legg til øvelse" knappen
if (leggTilOvelseBtn) {
    leggTilOvelseBtn.addEventListener('click', leggTilNyOvelse);
}

// Setup initial sett handlers
document.querySelectorAll('.ovelse').forEach(setupSettHandlers);

// Håndter skjema-innsending
if (treningsForm) {
    treningsForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const ovelser = [];
        document.querySelectorAll('.ovelse').forEach(ovelse => {
            const settGrupper = ovelse.querySelectorAll('.sett-gruppe');
            const sett = Array.from(settGrupper).map(gruppe => ({
                vekt: gruppe.querySelector('.vekt').value,
                reps: gruppe.querySelector('.reps').value
            }));

            if (sett.length > 0) { // Bare legg til øvelser som har sett
                ovelser.push({
                    navn: ovelse.querySelector('.ovelse-navn').value,
                    sett: sett
                });
            }
        });

        const nyOkt = {
            id: Date.now(),
            dato: document.getElementById('dato').value,
            varighet: document.getElementById('varighet').value,
            ovelser: ovelser,
            kommentar: document.getElementById('kommentar').value
        };

        treningsokter.push(nyOkt);
        localStorage.setItem('treningsokter', JSON.stringify(treningsokter));
        window.location.href = 'index.html';
    });
}

// Vis treningshistorikk
if (treningshistorikk) {
    function visHistorikk() {
        treningshistorikk.innerHTML = '';
        treningsokter.sort((a, b) => new Date(b.dato) - new Date(a.dato));

        treningsokter.forEach(okt => {
            const oktElement = document.createElement('div');
            oktElement.className = 'treningsokt';
            
            let ovelserHTML = '';
            okt.ovelser.forEach(ovelse => {
                let settHTML = '';
                ovelse.sett.forEach((sett, index) => {
                    settHTML += `
                        <div class="sett-info">
                            Sett ${index + 1}: ${sett.reps} reps @ ${sett.vekt}kg
                        </div>
                    `;
                });

                ovelserHTML += `
                    <div class="ovelse-detaljer">
                        <strong>${ovelse.navn}</strong>
                        <div class="sett-liste">
                            ${settHTML}
                        </div>
                    </div>
                `;
            });

            const kommentarHTML = okt.kommentar ? `
                <div class="kommentar">
                    <h4>Kommentar:</h4>
                    <p>${okt.kommentar}</p>
                </div>
            ` : '';

            oktElement.innerHTML = `
                <h3>Treningsøkt ${new Date(okt.dato).toLocaleDateString('no-NO')}</h3>
                <p>Varighet: ${okt.varighet} minutter</p>
                <div class="ovelser-liste">
                    ${ovelserHTML}
                </div>
                ${kommentarHTML}
                <button onclick="slettOkt(${okt.id})" class="slett-btn">Slett økt</button>
            `;
            
            treningshistorikk.appendChild(oktElement);
        });
    }

    // Slett treningsøkt
    window.slettOkt = function(id) {
        if (confirm('Er du sikker på at du vil slette denne treningsøkten?')) {
            treningsokter = treningsokter.filter(okt => okt.id !== id);
            localStorage.setItem('treningsokter', JSON.stringify(treningsokter));
            visHistorikk();
        }
    }

    // Vis historikk når siden lastes
    visHistorikk();
}