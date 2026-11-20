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

let selectedObj;

async function loadTeams(name) {
    try{
        const response  = await fetch(`${baseUrlApi}${endpointSearchTeams}${name}`)
        let data = await response.json()
        if(data.teams == undefined  || data.teams.length === 0 ){
            alert('Team non trovato')
            console.error('undefined')
            return
        }
        selectedObj = data.teams[0]
       console.log(selectedObj)
       const {strBadge,strTeam, strLeague, strCountry} = selectedObj
       loadResult(resultSection, strBadge, strTeam, strLeague,strCountry)
       return selectedObj
    }catch(err){
        console.error(err)
    }
}


startSearch.addEventListener('click',()=>{
   loadTeams(searchTeam.value)
})

let favoritesList = JSON.parse( localStorage.getItem('prferiti')) || []
console.log(favoritesList)

function TeamCard(section,strBadge,strTeam,strLeague,strCountry){
    resultSection.textContent = ''
    const card = document.createElement('div')
    const content = document.createElement('div')
    const teamName = document.createElement('h4')
    const lega = document.createElement('p')
    const nation = document.createElement('p')
    const addToList = document.createElement('button')
    addToList.textContent = 'add to favorites'
    addToList.classList.add('btn' ,'btn-dark','w-100')
    addToList.addEventListener('click',()=>{
        pref.textContent = 'Preferiti'
        const alredyExist = favoritesList.some(team=> team.idTeam == selectedObj.idTeam) 
        if(alredyExist){
            alert('è già nei preferiti')
            return
        }
        favoritesList.push(selectedObj)
        localStorage.setItem('prferiti',JSON.stringify(favoritesList))
        addToList.textContent = 'Aggiunto ai preferiti'
        render()
    })
    nation.textContent = strCountry
    lega.textContent = strLeague
    content.classList.add('p-3')
    teamName.classList.add('fw-bold')
    teamName.textContent = strTeam
    card.classList.add('card','p-3','col-md-6','col-lg-4','col-12','text-center')
    const badge = document.createElement('img')
    badge.classList.add('img-fluid')
    badge.src = strBadge
    section.appendChild(card)
    card.append(badge, content)
    content.append(teamName,lega,nation,addToList)
}


function loadResult(section,strBadge,strTeam,strLeague,strCountry){
    TeamCard(resultSection, strBadge,strTeam,strLeague,strCountry)
}


function loadPreferiti(){
    if(favoritesList <=0){
        pref.textContent = 'Non ci sono preferiti'
        return
    }
    favoritesList.forEach(list=>{
        TeamCard(preferitiSection, list.strBadge,favoritesList.strTeam,list.strLeague,list.strCountry)
        console.log(favoritesList,"qui")
    })
}

// === Stato ===




// === Render ===
function render(){
    if(selectedObj){
        const {section,strBadge,strTeam,strLeague,strCountry} = selectedObj
        loadResult(section,strBadge,strTeam,strLeague,strCountry)
    }
    loadPreferiti()

}
render()



// === Eventi ===
