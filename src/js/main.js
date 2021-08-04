"use strict";


"use strict";

const haushaltsbuch = {

    gesamtbilanz: new Map(), // auf 0 gesetzt, statt Objekt
    eintraege: [],    
    fehler: [],

    eintrag_erfassen() {
        let neuer_eintrag = new Map();
        neuer_eintrag.set("titel", this.titel_verarbeiten(prompt("Titel:")));
        neuer_eintrag.set("typ", this.typ_verarbeiten(prompt("Typ (Einnahme oder Ausgabe):")));
        neuer_eintrag.set("betrag", this.betrag_verarbeiten(prompt("Betrag (in Euro, ohne €-Zeichen):")));
        neuer_eintrag.set("datum", this.datum_verarbeiten(prompt("Datum (jjjj-mm-tt):")));
        neuer_eintrag.set("timestamp", Date.now());
        //damit Einträge nur gepusht werden, wenn es keinen Fehler gibt
        if (this.fehler.length == 0) {
            this.eintraege.push(neuer_eintrag);
        } else {
            console.log("Folgende Fehler wurden gefunden:")
            this.fehler.forEach(fehler => {
                console.log(fehler);
            });
        }
    },



    titel_verarbeiten(titel) {
        titel = titel.trim();
        if (this.titel_validieren(titel)) {
            return titel;
        } else {
            this.fehler.push(`Kein Titel angegeben.`);
            }
    },

    titel_validieren(titel) {
        if (titel !== "") {
            return true;
        } else {
            return false;
        }
    },

    typ_verarbeiten(typ) {
        typ = typ.trim().toLowerCase();
        if (this.typ_validieren(typ)) {
            return typ;
        } else {
            this.fehler.push(`Ungültiger Eintrags-Typ: ${typ}`);
        }
    },

    typ_validieren(typ) {
        if (typ.match(/^(?:einnahme|ausgabe)$/) !== null) {
            return true;
        } else {
            return false;
        }
    },

     //Eingabe Zahl mit Komma in Zahl mit Punkt umwandeln und in Cent umwandeln (wird bei der Ausgabe in Euro)
    betrag_verarbeiten(betrag) {
        betrag = betrag.trim();
        if (this.betrag_validieren(betrag)) {
            return parseFloat(betrag.replace(",", ".")) * 100;
        } else {
            this.fehler.push(`Ungültiger Betrag: ${betrag} €`);
        }
    },

    betrag_validieren(betrag) {
        if (betrag.match(/^\d+(?:(?:,|\.)\d\d?)?$/) !== null) {
            return true;
        } else {
            return false;
        }
    },

    datum_verarbeiten(datum) {
        datum = datum.trim()
        if (this.datum_validieren(datum)) {
            return new Date(`${datum} 00:00:00`);
        } else {
            this.fehler.push(`Ungültiges Datumsformat: "${datum}" €`);
        }
    },

    datum_validieren(datum) {
        if (datum.match(/^\d{4}-\d{2}-\d{2}$/) !== null) {
            return true;
        } else {
            return false;
        }
    },

   

    eintraege_sortieren() {
        this.eintraege.sort(function(eintrag_a, eintrag_b) {
            if (eintrag_a.get("datum") > eintrag_b.get("datum")) {
                return -1;
            } else if (eintrag_a.get("datum") < eintrag_b.get("datum")) {
                return 1;
            } else {
                return 0;
            }
        });
    },



    html_eintrag_generieren(eintrag){
        let listenpunkt = document.createElement("li");
        if (eintrag.get("typ") === "einnahme") {
            listenpunkt.setAttribute("class", "einnahme");
        } else if (eintrag.get("typ") === "ausgabe") {
            listenpunkt.setAttribute("class", "ausgabe");
        }
        listenpunkt.setAttribute("data-timestamp", eintrag.get("timestamp"));    

        let datum = document.createElement("span");
        datum.setAttribute("class", "datum");
        datum.textContent = eintrag.get("datum").toLocaleDateString("de-DE", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit"
                                    });
        listenpunkt.insertAdjacentElement("afterbegin", datum);
        
        let titel = document.createElement("span");
        titel.setAttribute("class", "titel");
        titel.textContent = eintrag.get("titel")
        datum.insertAdjacentElement("afterend", titel);

        let betrag = document.createElement("span");
        betrag.setAttribute("class", "betrag");
        betrag.textContent = `${(eintrag.get("betrag")/100).toFixed(2).replace(/\./, ",")} €`;
        titel.insertAdjacentElement("afterend", betrag);

        let button = document.createElement("button");
        button.setAttribute("class", "entfernen-button");
        betrag.insertAdjacentElement("afterend", button);

        let icon = document.createElement("i");
        icon.setAttribute("class", "fas fa-trash");
        button.insertAdjacentElement("afterbegin", icon);

        return listenpunkt;
    },

    eintraege_anzeigen() {
        //überprüfen ob eine ul bereits vorhanden ist
        document.querySelectorAll(".monatsliste ul").forEach(eintragsliste => {
           eintragsliste.remove();
       });

        //ul erstellen
        let eintragsliste = document.createElement("ul");
        //über Einträge [] itterieren
        for(let eintrag of this.eintraege) {
            // HTML-Eintrag in ul einsetzen
            eintragsliste.insertAdjacentElement("beforeend", this.html_eintrag_generieren(eintrag));
        }

        // ul in den article mit der Klasse Monatsliste einsetzen
        document.querySelector(".monatsliste").insertAdjacentElement("afterbegin", eintragsliste);
    },



    gesamtbilanz_erstellen() {
        let neue_gesamtbilanz = new Map();
        neue_gesamtbilanz.set("einnahmen", 0);
        neue_gesamtbilanz.set("ausgaben", 0);
        neue_gesamtbilanz.set("bilanz", 0);
        this.eintraege.forEach(function(eintrag) {
            switch (eintrag.get("typ")) {
                case "einnahme":
                    neue_gesamtbilanz.set("einnahmen", neue_gesamtbilanz.get("einnahmen") + eintrag.get("betrag"));
                    neue_gesamtbilanz.set("bilanz", neue_gesamtbilanz.get("bilanz") + eintrag.get("betrag"));
                    break;
                case "ausgabe":
                    neue_gesamtbilanz.set("ausgaben", neue_gesamtbilanz.get("ausgaben") + eintrag.get("betrag"));
                    neue_gesamtbilanz.set("bilanz", neue_gesamtbilanz.get("bilanz") - eintrag.get("betrag"));
                    break;
                default:
                    console.log(`Der Typ "${eintrag.get("typ")}" ist nicht bekannt.`);
                    break;
            }
        });
        this.gesamtbilanz = neue_gesamtbilanz;
    },


//     <aside id="gesamtbilanz">
//     <h1>Gesamtbilanz</h1>
//     <div class="gesamtbilanz-zeile einnahmen"><span>Einnahmen:</span><span>0,00€</span></div>
//     <div class="gesamtbilanz-zeile ausgaben"><span>Ausgaben:</span><span>0,00€</span></div>
//     <div class="gesamtbilanz-zeile bilanz"><span>Bilanz:</span><span class="positiv">0,00€</span></div>
// </aside>

    html_gesamtbilanz_generieren() {
                //anhand der aktuellen Gesamtbilanz die Gesamtbilanz generieren
                //neue gesamtbilanz anzeigen(html_Gesamtbilanz_generieren() nehmen)
                let gesamtbilanz = document.createElement("aside");
                gesamtbilanz.setAttribute("id", "gesamtbilanz");
        
                let h1 = document.createElement("h1");
                h1.textContent = "Gesamtbilanz";
                gesamtbilanz.insertAdjacentElement("afterbegin", h1);

                //Einnahmen:
                let einnahmen_div = document.createElement("div");

                einnahmen_div.setAttribute("class", "gesamtbilanz-zeile einnahmen");

                let einnahmen_titel = document.createElement("span");
                einnahmen_titel.textContent = "Einnahmen:";
                einnahmen_div.insertAdjacentElement("afterbegin", einnahmen_titel);

                let einnahmen_betrag = document.createElement("span");
                einnahmen_betrag.textContent = `${(this.gesamtbilanz.get("einnahmen")/100).toFixed(2).replace(/\./, ",")} €`;
                einnahmen_div.insertAdjacentElement("beforeend", einnahmen_betrag);

                gesamtbilanz.insertAdjacentElement("beforeend", einnahmen_div);

                //Ausgaben:
                let ausgaben_div = document.createElement("div");
                ausgaben_div.setAttribute("class", "gesamtbilanz-zeile ausgaben");

                let ausgaben_titel = document.createElement("span");
                ausgaben_titel.textContent = "Ausgaben:";
                ausgaben_div.insertAdjacentElement("afterbegin", ausgaben_titel);

                let ausgaben_betrag = document.createElement("span");
                ausgaben_betrag.textContent = `${(this.gesamtbilanz.get("ausgaben")/100).toFixed(2).replace(/\./, ",")} €` ;
                ausgaben_div.insertAdjacentElement("beforeend", ausgaben_betrag);

                gesamtbilanz.insertAdjacentElement("beforeend", ausgaben_div);

                //Bilanz
                let bilanz_div = document.createElement("div");
                bilanz_div.setAttribute("class", "gesamtbilanz-zeile bilanz");

                let bilanz_titel = document.createElement("span");
                bilanz_titel.textContent = "Bilanz:";
                bilanz_div.insertAdjacentElement("afterbegin", bilanz_titel);

                let bilanz_betrag = document.createElement("span");
                if(this.gesamtbilanz.get("bilanz") >= 0) {
                    bilanz_betrag.setAttribute("class", "positiv");  
                } else if (this.gesamtbilanz.get("bilanz") < 0) {
                    bilanz_betrag.setAttribute("class", "negativ");
                 }
                bilanz_betrag.textContent =`${(this.gesamtbilanz.get("bilanz")/100).toFixed(2).replace(/\./, ",")} €` ;
                bilanz_div.insertAdjacentElement("beforeend", bilanz_betrag);

                gesamtbilanz.insertAdjacentElement("beforeend", bilanz_div);

                return gesamtbilanz;
    },


    gesamtbilanz_anzeigen() {
        // prüfen ob bereits Gesamtbilanz angezeigt wird, ggf Gesamtbilanz entfernen
        document.querySelectorAll("#gesamtbilanz").forEach(function(gesamtbilanz) {
           gesamtbilanz.remove();
        });

        document.querySelector("body").insertAdjacentElement("beforeend", this.html_gesamtbilanz_generieren());
        
       },
    
    eintrag_hinzufuegen() {
        let weiterer_eintrag = true;
        while (weiterer_eintrag) {
            this.eintrag_erfassen();
            //Prozess wird nur fortgesetzt wenn kein Fehler
            if(this.fehler.length === 0){            
                //Methodenaufrufe anpassen
                this.eintraege_sortieren();
                this.eintraege_anzeigen();
                this.gesamtbilanz_erstellen();
                this.gesamtbilanz_anzeigen();
            }else {
                //Array wird geleert, ansonsten kann man nichts mehr hinzufügen
                this.fehler = [];
            }

            weiterer_eintrag = confirm("Weiteren Eintrag hinzufügen?");
        }
    }

};

haushaltsbuch.eintrag_hinzufuegen();
console.log(haushaltsbuch);





