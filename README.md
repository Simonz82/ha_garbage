# ♻️ Raccolta Differenziata per Home Assistant

Card e package per Home Assistant che gestiscono i giorni della raccolta differenziata: mostra un'immagine diversa in base al rifiuto del giorno, il giorno del ritiro, l'orario in cui esporre i bidoni, e manda un promemoria (notifica push + annuncio vocale su Alexa) finché non lo disattivi.

Progetto storico ripreso da una card più vecchia che avevo condiviso tempo fa (con basi di Saverio Gravagnola e Agostino Pitasi — altri spunti su [domoticamente.it](http://domoticamente.it) e su [scheccia1/hagarbage](https://github.com/scheccia1/hagarbage)). Riscritto da zero il 18/09/2026: nuova card personalizzata (lo stesso stile visivo delle mie altre card pubbliche), package YAML pulito e senza duplicazioni, immagini dei rifiuti ritagliate e rese più nitide.

Questa card fa parte delle mie card pubbliche per Home Assistant (elettrodomestici, energia, FritzBox, server HA, NAS, Proxmox, UPS), raccolte tutte insieme, con lo stesso stile visivo, nel repo **[smart-home-cards](https://github.com/Simonz82/smart-home-cards)**.

## Anteprima

**La card:**

![Card raccolta differenziata](example/card-vista-principale.png)

**Pulsante ingranaggio → impostazioni giorni** (prima riga: Layout):

| Chiaro | Scuro |
|---|---|
| ![Impostazioni, chiaro](example/impostazioni-light.png) | ![Impostazioni, scuro](example/impostazioni-dark.png) |

**Ultimo pulsante → Tipi di raccolta** (scrivi a mano i tipi di rifiuto del tuo comune): vedi la sezione più sotto.

**Pulsante megafono (opzionale) → tua pagina notifiche Alexa condivisa:**

![Centro notifiche Alexa](example/megafono-centro-notifiche.png)

## Come funziona

- Ogni giorno la card mostra l'immagine del rifiuto che va buttato **oggi** (bidone/sacco corrispondente), il giorno della settimana e il giorno del ritiro di domani.
- Un'automazione attiva un promemoria in una finestra oraria configurabile: finché è attivo, ogni tot minuti (a scelta) manda una notifica push e fa annunciare ad Alexa cosa buttare — a meno che oggi non ci sia nulla da buttare.
- L'ingranaggio in alto a destra apre le impostazioni per assegnare un rifiuto ad ogni giorno della settimana.
- Il pulsante **Tipi di raccolta** (l'ultimo a destra) serve a scrivere a mano i tipi di rifiuto del **tuo** comune (Carta, Vetro, Organico e Resto, …): l'elenco non è fisso, vedi la sezione dedicata.
- Il megafono (opzionale) è pensato per chi vuole centralizzare in un'unica pagina le impostazioni di volume/orario degli annunci Alexa condivise fra più card (vedi sezione "Notifiche Alexa condivise" più sotto) — se non ti serve, semplicemente non lo configuri e non compare.

## 🗂️ Configura i tipi di raccolta del tuo comune

Ogni comune raccoglie cose diverse: c'è chi ha "Umido" e "Secco", chi "Organico e Resto", chi anche "Ingombranti" o "Pile". Per questo l'elenco dei rifiuti **non è fisso**: lo scrivi tu, direttamente dalla card, con il pulsante **Tipi di raccolta** (l'ultimo a destra, dopo l'ingranaggio).

| Chiaro | Scuro |
|---|---|
| ![Tipi di raccolta, chiaro](example/tipi-di-raccolta-light.png) | ![Tipi di raccolta, scuro](example/tipi-di-raccolta-dark.png) |

**Come si usa**

1. Tocca **Tipi di raccolta** e scrivi le voci separate da **virgola** (vanno bene anche `;` o un a capo).
2. Sotto vedi subito l'**anteprima** dei menu che verranno creati. Premi **Salva elenco**.
3. Da quel momento i 7 menu dei giorni (nelle **Impostazioni**, l'ingranaggio) contengono le tue voci.

**Come ragionare (importante)**

> **Ogni voce è ciò che viene ritirato in una singola giornata.** Quando poi imposti i giorni, per ogni giorno scegli **una sola voce**. Se in un giorno fanno **due ritiri insieme**, scrivi una **voce apposta** che li comprende entrambi.

**Esempio**

Scrivi: `Carta, Vetro, Plastica, Organico, Organico e Resto`

- il **lunedì** scegli **Organico** → quel giorno ritirano solo l'organico;
- il **giovedì** scegli **Organico e Resto** → quel giorno ritirano organico e resto insieme (due ritiri, una voce);
- il **sabato** scegli **Nulla** → nessun ritiro. **"Nulla" viene aggiunta da sola**, non devi scriverla.

**Cosa succede da solo**

- A ogni voce viene aggiunta un'**icona** (carta 🥡, vetro 🍶, plastica 🥛, organico 🍌, indifferenziato ♻, ingombranti 🛋, pile 🔋, sfalci 🌿 …; se la parola non è nota viene messo un cestino 🗑). Se la voce comincia già con un'emoji, viene lasciata com'è.
- **Le scelte già fatte per i giorni restano**, se la voce esiste ancora nel nuovo elenco (altrimenti quel giorno passa a "Nulla").
- La scelta di ogni giorno viene **salvata al sicuro** (`input_text.raccolta_giorno_lun` … `dom`): sopravvive ai riavvii di Home Assistant.
- L'immagine della card: per i tipi che hanno una foto (`state_images`) si vede quella; per un tipo **senza foto** compare la sua **icona in grande**.
- Notifica push e annuncio vocale usano la stessa voce ("Oggi si butta *Organico e Resto*").

**Cosa serve**: il package [`packages/differenziata.yaml`](packages/differenziata.yaml) (crea `input_text.raccolta_tipi_elenco`, i 7 `input_text` di appoggio e le due automazioni) e, nella configurazione della card, una riga in più:

```yaml
types_entity: input_text.raccolta_tipi_elenco
```

Senza `types_entity` il pulsante non compare e i menu restano quelli del package (Indifferenziato, Organico, Organico e Resto, Carta, Vetro, Plastica, Nulla). Se `raccolta_tipi_elenco` è vuoto si usa quell'elenco di esempio.

**Su smartphone**

| Tipi di raccolta | Impostazioni giorni |
|---|---|
| ![Mobile tipi](example/tipi-di-raccolta-mobile-dark.png) | ![Mobile impostazioni](example/impostazioni-mobile-dark.png) |

## 🎛️ Layout classico o centrato

La card si può mostrare in **due layout**, scelti da un menu nella **prima riga delle Impostazioni** (l'ingranaggio): con **classico** l'immagine è a sinistra e le informazioni a destra; con **centrato** l'immagine del rifiuto è grande al centro in alto e le informazioni stanno sotto.

| | Classico | Centrato |
|---|---|---|
| **Chiaro** | ![Classico chiaro](example/layout/garbage-classico-light.png) | ![Centrato chiaro](example/layout/garbage-centrato-light.png) |
| **Scuro** | ![Classico scuro](example/layout/garbage-classico-dark.png) | ![Centrato scuro](example/layout/garbage-centrato-dark.png) |

**La riga "Layout" è la prima delle Impostazioni:**

| Chiaro | Scuro |
|---|---|
| ![Layout nelle impostazioni, chiaro](example/layout/impostazioni-layout-light.png) | ![Layout nelle impostazioni, scuro](example/layout/impostazioni-layout-dark.png) |

**Come si attiva:**

1. Il package [`packages/differenziata.yaml`](packages/differenziata.yaml) crea già il menu `input_select.layout_garbage` (con *Classico* e *Centrato*).
2. Nella configurazione della card aggiungi `layout_entity: input_select.layout_garbage`.
3. Metti la riga del layout come **prima** delle impostazioni (vedi gli esempi qui sotto).

Se non vuoi il menu, puoi fissare il layout con `layout: centrato` (oppure `classico`, il predefinito).

## Installazione

1. **Card**: in HA vai su Impostazioni → Dashboard → Risorse, e aggiungi il file [`dm-garbage-card.js`](dm-garbage-card.js) come risorsa JS. Il modo più semplice: copialo in `/config/www/dm-garbage-card.js` e aggiungi la risorsa `/local/dm-garbage-card.js` di tipo "Modulo JavaScript". Non serve nessuna dipendenza HACS: il file è autoconsistente.

2. **Package**: copia [`packages/differenziata.yaml`](packages/differenziata.yaml) e [`packages/centro_notifiche_alexa.yaml`](packages/centro_notifiche_alexa.yaml) nella tua cartella `packages/` (se non hai ancora abilitato i package, aggiungi `packages: !include_dir_named packages` sotto `homeassistant:` in `configuration.yaml`). Il secondo file contiene lo script condiviso `script.notifica_vocale_alexa` che il primo usa per l'annuncio vocale — servono entrambi.

3. **Modifica solo queste righe** in `packages/differenziata.yaml` (in cima al file, sezione `setting`):
   - `Device per notifica push 1/2`: le TUE entità `mobile_app_...` (companion app del telefono). Ne bastano 1: se non ti serve il secondo, elimina la riga e la corrispondente riga `service: *push2` più in basso nel blocco `notify:`.
   - Il resto (etichette dei rifiuti) va bene così.

4. **Immagini**: copia la cartella [`www/rifiuti/`](www/rifiuti/) dentro la tua `/config/www/`. Sono le 6 immagini usate di default (Carta, Vetro, Plastica, Organico, Organico e Resto, Nulla) — puoi sostituirle con le tue, basta mantenere gli stessi nomi file o aggiornare i percorsi nella configurazione della card (punto 6).

5. **Helper di test (opzionale)**: se vuoi un pulsante per testare l'annuncio vocale senza aspettare, crea da UI (Impostazioni → Dispositivi e servizi → Helper → Interruttore) un helper con id `test_notifica` — attivandolo parte l'annuncio di prova.

6. **Configura la card** nel tuo dashboard (modalità YAML):
   ```yaml
   type: custom:dm-garbage-card
   layout_entity: input_select.layout_garbage
   types_entity: input_text.raccolta_tipi_elenco   # pulsante "Tipi di raccolta"
   entity: sensor.raccoltadifferenziata
   weekday_entity: sensor.giornosettimana
   pickup_day_entity: sensor.giornoritiro
   expose_time_entity: input_datetime.raccolta_differenziata_notifiche_start_time
   state_images:
     Carta: /local/rifiuti/carta.png
     Vetro: /local/rifiuti/vetro.png
     Plastica: /local/rifiuti/plastica.png
     Organico: /local/rifiuti/organico.png
     "Organico e Resto": /local/rifiuti/organicoeresto.png
     Nulla: /local/rifiuti/nulla.png
   settings_sections:
     - title: Aspetto
       rows:
         - entity: input_select.layout_garbage
           label: Layout
     - title: Giorni raccolta
       rows:
         - entity: input_select.raccolta_differenziata_lun
           label: Martedì
         - entity: input_select.raccolta_differenziata_mar
           label: Mercoledì
         - entity: input_select.raccolta_differenziata_mer
           label: Giovedì
         - entity: input_select.raccolta_differenziata_gio
           label: Venerdì
         - entity: input_select.raccolta_differenziata_ven
           label: Sabato
         - entity: input_select.raccolta_differenziata_sab
           label: Domenica
         - entity: input_select.raccolta_differenziata_dom
           label: Lunedì
   ```
   Con questa configurazione l'ingranaggio apre una finestra **nativa** (nessuna dipendenza extra) con i 7 giorni, come nello screenshot sopra.

### Notifiche Alexa condivise (opzionale, avanzato)

Il package chiama uno script condiviso (`script.notifica_vocale_alexa`, dentro `centro_notifiche_alexa.yaml`) invece di duplicare volume/dispositivo/orario in ogni card: così se hai altre card della stessa famiglia (elettrodomestici, ecc.) tutte condividono le stesse impostazioni Alexa, modificabili in un unico punto. Se vuoi anche tu un pulsante megafono che porti a QUELLA pagina di impostazioni condivise, aggiungi alla configurazione della card:
```yaml
alexa_settings_path: /lovelace/nome-della-tua-vista
```
sostituendo con il percorso di una tua vista/dashboard che contenga una card `entities` con gli helper di `centro_notifiche_alexa.yaml` (`input_datetime.orario_inizio/fine_notifiche_alexa`, `input_number.volume_alexa_notifica_elettrodomestici`, ecc.). Se non imposti `alexa_settings_path`, il pulsante semplicemente non compare — tutto il resto funziona lo stesso, con l'annuncio Alexa di default su `media_player.alexa_salone`.

### Se usi già browser_mod

Se hai già l'integrazione HACS `browser_mod` e preferisci il suo popup invece della finestra nativa, puoi passare `legacy_settings_popup` al posto di `settings_sections`:
```yaml
legacy_settings_popup:
  service: browser_mod.popup
  data:
    title: Giorni raccolta
    content:
      type: entities
      entities:
        - entity: input_select.layout_garbage      # la riga Layout per prima
          name: Layout
          icon: mdi:view-dashboard-outline
        - type: divider
        - entity: input_select.raccolta_differenziata_lun
        # ... gli altri 6 giorni
```

## Struttura del repository

- `dm-garbage-card.js` — la card, autoconsistente
- `packages/differenziata.yaml` — helper, sensori e automazioni della raccolta differenziata
- `packages/centro_notifiche_alexa.yaml` — script condiviso per gli annunci vocali Alexa (volume/ritardo/orario)
- `www/rifiuti/` — le immagini di default dei rifiuti (ritagliate e ottimizzate)
- `example/` — screenshot di questo README (in `example/layout/` quelli dei due layout)

## Changelog

- **21/09/2026 (sera)**: nuovo pulsante **Tipi di raccolta** per scrivere a mano i tipi di rifiuto del proprio comune (parametro `types_entity`, nuovi `input_text` e 2 automazioni nel package: icona automatica, "Nulla" sempre in fondo, scelte dei giorni salvate e mantenute); il sensore `sensor.raccoltadifferenziata` non dipende più dal taglio dei primi 2 caratteri (toglie da solo l'emoji) e ha gli attributi `completo` ed `emoji`; per i tipi senza foto la card mostra l'icona in grande; impostazioni dei giorni nella finestra nativa con la riga Layout; tutte le schermate rifatte.
- **21/09/2026**: nuova scelta del **layout classico o centrato** dalla prima riga delle Impostazioni (menu `input_select.layout_garbage`, parametro `layout_entity`); le righe `input_select` del popup nativo sono ora un vero menu a tendina.
- **18/09/2026**: riscrittura completa. Nuova card personalizzata (era una card `entities` + `button-card` via HACS); package pulito, niente più impostazioni Alexa duplicate (ora condivise via `centro_notifiche_alexa.yaml`, stesso meccanismo delle altre mie card); immagini dei rifiuti ritagliate sul soggetto e rese più nitide.

## ☕ Vuoi darmi una mano?

Il contenuto di questa pagina è completamente gratuito e lo scopo non è certamente fare soldi. Se vuoi darmi una mano per le spese e il tempo perso, ecco alcuni modi:

| | |
|---|---|
| [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/C0C713VTGJ) | Offrimi un caffè su Ko-fi |
| [![PayPal](https://github.com/Simonz82/shared-assets/blob/main/paypal.svg)](https://www.paypal.com/paypalme/simongmail) | Una donazione libera su PayPal |
| [![Amazon](https://github.com/Simonz82/shared-assets/blob/main/Amazon_logo.png)](https://amzn.to/3XWWTgz) | Fai i tuoi acquisti Amazon partendo da questo link |

**Canali Telegram:**

| | |
|---|---|
| [![Home_Assistant_News](https://github.com/Simonz82/shared-assets/blob/main/home_assistant_news.jpg)](https://t.me/Home_Assistant_News) | Notizie dedicate a Home Assistant |
| [![Offerte Domotica](https://github.com/Simonz82/shared-assets/blob/main/offerte_domotica.jpg)](https://t.me/offerte_domotica_ita) | Offerte sui prodotti di domotica |

---

Sviluppato e curato da [Simonz82](https://t.me/Simonz82) · © 2026
