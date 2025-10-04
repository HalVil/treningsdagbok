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

// Funksjon for å legge til ny øvelse i skjemaet
if (leggTilOvelseBtn) {
    leggTilOvelseBtn.addEventListener('click', () => {
        const ovelseDiv = document.createElement('div');
        ovelseDiv.className = 'ovelse';
        ovelseDiv.innerHTML = `
            <select class="ovelse-navn" required>
                <option value="">Velg øvelse</option>
                <option value="Benkpress">Benkpress</option>
                <option value="Knebøy">Knebøy</option>
                <option value="Markløft">Markløft</option>
                <option value="Skulderpress">Skulderpress</option>
                <option value="Bicepscurl">Bicepscurl</option>
            </select>
            <input type="number" class="sett" placeholder="Antall sett" required min="1">
            <input type="number" class="reps" placeholder="Repetisjoner" required min="1">
            <input type="number" class="vekt" placeholder="Vekt (kg)" required min="0">
        `;
        document.getElementById('ovelser').appendChild(ovelseDiv);
    });
}

// Lagre treningsøkt
if (treningsForm) {
    treningsForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const ovelser = [];
        document.querySelectorAll('.ovelse').forEach(ovelse => {
            ovelser.push({
                navn: ovelse.querySelector('.ovelse-navn').value,
                sett: ovelse.querySelector('.sett').value,
                reps: ovelse.querySelector('.reps').value,
                vekt: ovelse.querySelector('.vekt').value
            });
        });

        const nyOkt = {
            id: Date.now(),
            dato: document.getElementById('dato').value,
            varighet: document.getElementById('varighet').value,
            ovelser: ovelser
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
                ovelserHTML += `
                    <div class="ovelse-detaljer">
                        <strong>${ovelse.navn}</strong>: 
                        ${ovelse.sett} sett × ${ovelse.reps} reps @ ${ovelse.vekt}kg
                    </div>
                `;
            });

            oktElement.innerHTML = `
                <h3>Treningsøkt ${new Date(okt.dato).toLocaleDateString('no-NO')}</h3>
                <p>Varighet: ${okt.varighet} minutter</p>
                <div class="ovelser-liste">
                    ${ovelserHTML}
                </div>
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