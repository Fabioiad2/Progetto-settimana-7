export class Squadra {
    constructor(dati) {
        this.id = dati.idTeam ?? dati.id
        this.nome = dati.strTeam ?? dati.nome
        this.logo = dati.strBadge ?? dati.logo ?? ''
        this.lega = dati.strLeague ?? dati.lega ?? ''
        this.paese = dati.strCountry ?? dati.paese ?? ''
        this.sport = dati.strSport ?? dati.sport ?? ''
    }
}

export class Evento {
    constructor(dati) {
        this.id = dati.idEvent
        this.data = dati.dateEvent
        this.casa = dati.strHomeTeam
        this.trasferta = dati.strAwayTeam
        this.punteggioCasa = dati.intHomeScore
        this.punteggioTrasferta = dati.intAwayScore
    }

    formattaData() {
        if (!this.data) return 'Data da definire'
        return new Intl.DateTimeFormat('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(new Date(this.data))
    }

    getPunteggio() {
        if (this.punteggioCasa != null && this.punteggioTrasferta != null) {
            return `${this.punteggioCasa} – ${this.punteggioTrasferta}`
        }
        return null
    }
}
