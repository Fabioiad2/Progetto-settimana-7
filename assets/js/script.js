// SportsHub — Week Project Settimana VII

import { Squadra, Evento } from '../../classi/classi.js'

// === Elementi DOM ===
const searchForm = document.querySelector('#searchForm')
const searchTeam = document.querySelector('#searchTeam')
const resultSection = document.querySelector('#risultati-section')
const preferitiSection = document.querySelector('#preferitiSection')
const pref = document.querySelector('#pref')
const rowSquadre = document.querySelector('.rowSquadre')
const dettagliSection = document.querySelector('#dettagli-section')

// === API ===
const baseUrlApi = 'https://www.thesportsdb.com/api/v1/json/123/'

// === Stato ===
let searchResults = []
let favoritesList = (JSON.parse(localStorage.getItem('prferiti')) || []).map(item => new Squadra(item))
let debounceTimer = null
let searchController = null

function createSpinner() {
    const wrapper = document.createElement('div')
    wrapper.classList.add('d-flex', 'justify-content-center', 'py-4')
    const spinner = document.createElement('div')
    spinner.classList.add('spinner-border', 'text-primary')
    spinner.setAttribute('role', 'status')
    wrapper.appendChild(spinner)
    return wrapper
}

function showMessage(container, text, type = 'muted') {
    container.textContent = ''
    if (type === 'danger' || type === 'warning') {
        const alertBox = document.createElement('div')
        alertBox.classList.add('alert', `alert-${type}`, 'col-12', 'mb-0')
        alertBox.textContent = text
        container.appendChild(alertBox)
    } else {
        const p = document.createElement('p')
        p.classList.add('text-muted', 'fst-italic', 'mb-0')
        p.textContent = text
        container.appendChild(p)
    }
}

async function loadDetail(squadra) {
    dettagliSection.hidden = false
    rowSquadre.textContent = ''
    rowSquadre.appendChild(createSpinner())

    try {
        const [response, response2] = await Promise.all([
            fetch(`${baseUrlApi}eventsnext.php?id=${squadra.id}`),
            fetch(`${baseUrlApi}eventslast.php?id=${squadra.id}`)
        ])

        if (!response.ok || !response2.ok) {
            throw new Error('Errore nel caricamento dei dettagli')
        }

        const data = await response.json()
        const data2 = await response2.json()

        const nextEvents = (data.events || []).map(ev => new Evento(ev))
        const lastEvents = (data2.results || []).map(ev => new Evento(ev))

        rowSquadre.textContent = ''

        const cardMadre = document.createElement('div')
        cardMadre.classList.add('card', 'shadow-sm', 'rounded-3', 'p-4')

        const teamTitle = document.createElement('h3')
        teamTitle.classList.add('fw-bold', 'fs-4', 'mb-4')
        teamTitle.style.color = 'hsl(220, 60%, 25%)'
        teamTitle.textContent = squadra.nome

        const row = document.createElement('div')
        row.classList.add('row', 'g-4')

        cardMadre.append(teamTitle, row)
        rowSquadre.appendChild(cardMadre)

        renderEventColumn(nextEvents, row, 'Prossimi eventi')
        renderEventColumn(lastEvents, row, 'Ultimi risultati')
    } catch (err) {
        console.error(err)
        rowSquadre.textContent = ''
    }
}

async function loadTeams(name) {
    const query = name.trim()
    if (!query) {
        searchResults = []
        renderResults()
        return
    }

    if (searchController) {
        searchController.abort()
    }
    searchController = new AbortController()

    resultSection.textContent = ''
    resultSection.appendChild(createSpinner())

    try {
        const response = await fetch(
            `${baseUrlApi}searchteams.php?t=${encodeURIComponent(query)}`,
            { signal: searchController.signal }
        )
        if (!response.ok) {
            throw new Error('Errore nella ricerca delle squadre')
        }

        const data = await response.json()
        if (!data.teams || data.teams.length === 0) {
            searchResults = []
            showMessage(resultSection, 'Nessuna squadra trovata.', 'warning')
            return
        }

        searchResults = data.teams.map(t => new Squadra(t))
        renderResults()
    } catch (err) {
        if (err.name === 'AbortError') return
        console.error(err)
        resultSection.textContent = ''
    }
}

function TeamCard(squadra, section) {
    const col = document.createElement('div')
    col.classList.add('col-12', 'col-md-6', 'col-lg-4')

    const card = document.createElement('div')
    card.classList.add('card', 'team-card', 'shadow-sm', 'rounded-3', 'p-3', 'h-100', 'text-center')
    card.addEventListener('click', () => {
        loadDetail(squadra)
    })

    const badge = document.createElement('img')
    badge.classList.add('team-badge')
    badge.src = squadra.logo
    badge.alt = squadra.nome

    const content = document.createElement('div')
    content.classList.add('p-2')

    const teamName = document.createElement('h4')
    teamName.classList.add('fw-bold', 'fs-5', 'mb-1')
    teamName.textContent = squadra.nome

    const lega = document.createElement('p')
    lega.classList.add('text-muted', 'small', 'mb-1')
    lega.textContent = squadra.lega

    const nation = document.createElement('p')
    nation.classList.add('text-muted', 'small', 'mb-3')
    nation.textContent = squadra.paese

    const addToList = document.createElement('button')
    const isFavorite = favoritesList.some(team => team.id == squadra.id)
    addToList.textContent = isFavorite ? 'Rimuovi' : '★ Aggiungi ai preferiti'
    addToList.classList.add('btn', isFavorite ? 'btn-outline-danger' : 'btn-dark', 'w-100')
    addToList.addEventListener('click', (e) => {
        e.stopPropagation()
        if (isFavorite) {
            favoritesList = favoritesList.filter(team => team.id != squadra.id)
        } else {
            favoritesList.push(squadra)
        }
        localStorage.setItem('prferiti', JSON.stringify(favoritesList))
        render()
    })

    content.append(teamName, lega, nation, addToList)
    card.append(badge, content)
    col.appendChild(card)
    section.appendChild(col)
}

function renderEventColumn(events, row, titolo) {
    const col = document.createElement('div')
    col.classList.add('col-12', 'col-md-6')

    const title = document.createElement('h4')
    title.textContent = titolo
    col.appendChild(title)

    if (events.length === 0) {
        const empty = document.createElement('p')
        empty.classList.add('text-muted', 'fst-italic', 'small')
        empty.textContent = 'Nessun evento in programma'
        col.appendChild(empty)
    } else {
        events.forEach(evento => {
            const item = document.createElement('div')
            item.classList.add('border-bottom', 'py-2')

            const date = document.createElement('p')
            date.classList.add('text-muted', 'small', 'mb-1')
            date.textContent = evento.formattaData()

            const matchRow = document.createElement('div')
            matchRow.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'gap-2')

            const teams = document.createElement('span')
            teams.classList.add('fw-bold', 'small')
            teams.textContent = `${evento.casa} vs ${evento.trasferta}`
            matchRow.appendChild(teams)

            const punteggio = evento.getPunteggio()
            if (punteggio) {
                const badge = document.createElement('span')
                badge.classList.add('badge', 'bg-success')
                badge.textContent = punteggio
                matchRow.appendChild(badge)
            }

            item.append(date, matchRow)
            col.appendChild(item)
        })
    }

    row.appendChild(col)
}

// === Render ===
function renderResults() {
    resultSection.textContent = ''
    if (searchResults.length === 0) {
        showMessage(resultSection, 'Cerca una squadra per vedere i risultati.')
        return
    }
    searchResults.forEach(squadra => TeamCard(squadra, resultSection))
}

function loadPreferiti() {
    preferitiSection.textContent = ''

    if (favoritesList.length === 0) {
        pref.textContent = 'Non ci sono preferiti'
        return
    }

    pref.textContent = '⭐ Le tue squadre preferite'
    favoritesList.forEach(squadra => TeamCard(squadra, preferitiSection))
}

function render() {
    renderResults()
    loadPreferiti()
}

// === Eventi ===
searchForm.addEventListener('submit', (e) => {
    e.preventDefault()
    clearTimeout(debounceTimer)
    loadTeams(searchTeam.value)
})

searchTeam.addEventListener('input', () => {
    clearTimeout(debounceTimer)
    const query = searchTeam.value.trim()
    if (query.length < 3) {
        if (searchController) searchController.abort()
        searchResults = []
        renderResults()
        return
    }
    debounceTimer = setTimeout(() => {
        loadTeams(query)
    }, 400)
})

render()
