// SportsHub — Week Project Settimana VII
//
// Devi fare 4 cose per la Versione Base:
// 1. Definire le classi Squadra ed Evento (mappano i dati di TheSportsDB)
// 2. Funzione async cercaSquadre(query) che chiama /searchteams.php
// 3. Funzione async caricaDettagli(idTeam) che chiama in parallelo
//    eventsnext.php + eventslast.php usando Promise.all
// 4. Render dinamico: card squadre, lista prossimi eventi, lista risultati
//
// Endpoint base: https://www.thesportsdb.com/api/v1/json/3/
// Il `3` nell'URL è la chiave API pubblica di test di TheSportsDB: gratis, non serve registrarsi.
//
// Per le versioni Intermedia/Avanzata: localStorage preferiti, debounce, Promise.all multi.


// === Classi ===
const searchTeam = document.querySelector('#searchTeam')
const startSearch = document.querySelector('#startSearch')
const resultSection = document.querySelector('#risultati-section')
const preferitiSection = document.querySelector('#preferitiSection')
const pref = document.querySelector('#pref')
const res = document.querySelector('#res')
// === API ===
const baseUrlApi = 'https://www.thesportsdb.com/api/v1/json/123/'
const endpointSearchTeams = 'searchteams.php?t='
const endpointNext = 'eventsnext.php?id='
const endpointLast = 'eventslast.php?id='
const rowSquadre = document.querySelector('.rowSquadre')
const dettagliSection = document.querySelector('#dettagli-section')
let selectedObj;

async function loadDetail(id) {
    try {
        const [response, response2] = await Promise.all([
            fetch(`${baseUrlApi}${endpointNext}${id}`),
            fetch(`${baseUrlApi}${endpointLast}${id}`)
        ])

        if (!response.ok || !response2.ok) {
            throw new Error('Errore nel caricamento')
        }

        const data = await response.json()
        const data2 = await response2.json()

        const nextEvent = data.events?.[0]
        const lastEvent = data2.results?.[0]

        // Pulisco il contenitore e mostro la sezione
        dettagliSection.hidden = false
        rowSquadre.textContent = ''

        // Creo la card madre
        const cardMadre = document.createElement('div')
        cardMadre.classList.add('card', 'border-0', 'p-3')

        // Creo una row per le due card
        const row = document.createElement('div')
        row.classList.add('row', 'g-3')

        cardMadre.appendChild(row)
        rowSquadre.appendChild(cardMadre)

        // Creo le due card figlie
        if (nextEvent) {
            cardEvents(nextEvent, row, 'Prossimo evento')
        }

        if (lastEvent) {
            cardEvents(lastEvent, row, 'Ultimo risultato')
        }

    } catch (err) {
        console.error(err)
    }
}

async function loadTeams(name) {
    const query = name.trim()
    if (!query) return
    try {
        const response = await fetch(`${baseUrlApi}${endpointSearchTeams}${encodeURIComponent(query)}`)
        let data = await response.json()
        if (data.teams == undefined || data.teams.length === 0) {
            alert('Team non trovato')
            console.error('undefined')
            return
        }
        selectedObj = data.teams[0]
        console.log(selectedObj)
        const { idTeam, strBadge, strTeam, strLeague, strCountry } = selectedObj
        loadResult(idTeam, resultSection, strBadge, strTeam, strLeague, strCountry)
        return selectedObj
    } catch (err) {
        console.error(err)
    }
}


startSearch.addEventListener('click', () => {
    loadTeams(searchTeam.value)
})

let favoritesList = JSON.parse(localStorage.getItem('prferiti')) || []
console.log(favoritesList)

function TeamCard(idTeam, section, strBadge, strTeam, strLeague, strCountry) {
    console.log(idTeam, "id arrivo")
    const card = document.createElement('div')
    card.addEventListener('click', () => {
        loadDetail(idTeam)
    })
    const content = document.createElement('div')
    const teamName = document.createElement('h4')
    const lega = document.createElement('p')
    const nation = document.createElement('p')
    const addToList = document.createElement('button')
    addToList.textContent = 'add to favorites'
    addToList.classList.add('btn', 'btn-dark', 'w-100')
    addToList.addEventListener('click', (e) => {
        e.stopPropagation()
        pref.textContent = 'Preferiti'
        const alredyExist = favoritesList.some(team => team.idTeam == idTeam)
        if (alredyExist) {
            alert('è già nei preferiti')
            return
        }
        favoritesList.push({ idTeam, strBadge, strTeam, strLeague, strCountry })
        localStorage.setItem('prferiti', JSON.stringify(favoritesList))
        addToList.textContent = 'Aggiunto ai preferiti'
        render()
    })
    nation.textContent = strCountry
    lega.textContent = strLeague
    content.classList.add('p-3')
    teamName.classList.add('fw-bold')
    teamName.textContent = strTeam
    card.classList.add('card', 'p-3', 'col-md-6', 'col-lg-4', 'col-12', 'text-center')
    const badge = document.createElement('img')
    badge.classList.add('img-fluid')
    badge.src = strBadge
    section.appendChild(card)
    card.append(badge, content)
    content.append(teamName, lega, nation, addToList)
}


function loadResult(idTeam, section, strBadge, strTeam, strLeague, strCountry) {
    resultSection.textContent = ''
    TeamCard(idTeam, resultSection, strBadge, strTeam, strLeague, strCountry)
}


function loadPreferiti() {
    preferitiSection.textContent = ''

    if (favoritesList.length === 0) {
        pref.textContent = 'Non ci sono preferiti'
        return
    }

    pref.textContent = 'Preferiti'

    favoritesList.forEach(list => {
        TeamCard(
            list.idTeam,
            preferitiSection,
            list.strBadge,
            list.strTeam,
            list.strLeague,
            list.strCountry
        )
    })
}

function cardEvents(evento, section, titolo) {
    const {
        idEvent,
        dateEvent,
        strHomeTeam,
        strAwayTeam,
        intHomeScore,
        intAwayScore
    } = evento

    const col = document.createElement('div')
    col.classList.add('col-12', 'col-md-6')

    const card = document.createElement('div')
    card.classList.add('card', 'p-3', 'h-100', 'text-center')

    const title = document.createElement('h4')
    title.textContent = titolo

    const teams = document.createElement('h5')
    teams.textContent = `${strHomeTeam} VS ${strAwayTeam}`

    const date = document.createElement('p')
    date.textContent = dateEvent

    const score = document.createElement('p')

    if (intHomeScore != null && intAwayScore != null) {
        score.textContent = `${intHomeScore} - ${intAwayScore}`
    } else {
        score.textContent = 'Partita da giocare'
    }

    card.append(title, teams, date, score)

    col.appendChild(card)
    section.appendChild(col)
}
// === Stato ===




// === Render ===
function render() {
    if (selectedObj) {
        const { idTeam, strBadge, strTeam, strLeague, strCountry } = selectedObj
        loadResult(idTeam, resultSection, strBadge, strTeam, strLeague, strCountry)
    }
    loadPreferiti()

}
render()



// === Eventi ===
