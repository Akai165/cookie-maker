<div align="center">

  <img src="./src/assets/hero.png" alt="Cookie Tracker Logo" width="160" />

  # 🍪 Cookie Tracker
  
  **Trasforma le tue abitudini quotidiane in biscotti e premiati con ciò che ami!**  
  *Un habit tracker gamificato con estetica cozy bakery, sviluppato in React 19, Tailwind CSS e Firebase.*

  <br />

  [![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-12.19-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
  [![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)](LICENSE)

  <br />

  [Caratteristiche](#-caratteristiche-principali) •
  [Demo & Screenshots](#-anteprima) •
  [Installazione](#-guida-allinstallazione) •
  [Configurazione Firebase](#-configurazione-firebase) •
  [Documentazione Tecnica](#-documentazione-tecnica)

</div>

---

## 🌟 Cos'è Cookie Tracker?

La maggior parte degli habit tracker sembra un foglio Excel noioso o un'app aziendale fredda.  
**Cookie Tracker** capovolge questo paradigma portando la gamification in una **calda pasticceria virtuale**:

1. **Inforna le tue attività**: crea abitudini quotidiane (es. *leggere 20 pagine*, *allenarsi*) o settimanali (es. *pulire casa ogni sabato*), assegnando a ciascuna un valore in **Biscotti 🍪**.
2. **Riempi il barattolo**: ogni volta che spunti un'attività completata, guadagni biscotti nel tuo barattolo virtuale.
3. **Riscatta premi reali**: crea il tuo catalogo di premi (es. *1 ora di PlayStation = 15 🍪*, *Serata Pizza = 50 🍪*) e spendi i biscotti quando te li sei meritati!
4. **Sblocca Traguardi Mensili**: raggiungi le soglie cumulative del mese per sbloccare traguardi speciali senza dover spendere il tuo saldo.

---

## ✨ Caratteristiche Principali

| Sezione | Descrizione |
| :--- | :--- |
| 🏪 **La Vetrina (Dashboard)** | Monitora il saldo biscotti in tempo reale nel barattolo, consulta il calendario mensile con le date completate contrassegnate dai biscotti, e visualizza la barra di progresso giornaliera. |
| 🧑‍🍳 **Il Forno** | Il tuo ricettario di abitudini. Crea, modifica ed elimina task giornalieri o ricorrenti in giorni specifici della settimana (es. Lun, Mer, Ven), personalizzando i punti assegnati. |
| 🛍️ **Il Negozio (Shop)** | Un vero shop di ricompense su misura per te! Le card calcolano automaticamente se puoi permetterti il premio o quanti biscotti ti mancano ancora. |
| 🏆 **Traguardi Mensili** | Fissa obiettivi a lungo termine a sblocco automatico basati sul totale di biscotti sfornati durante l'intero mese solare. |
| 📅 **Calendario Stile Italiano** | Calendario con settimana che comincia da **Lunedì** e navigazione rapida per rivedere le attività dei giorni passati. |
| 🔐 **Cloud Sync & Multi-Dispositivo** | Autenticazione sicura tramite **Google Sign-In** e sincronizzazione in tempo reale con **Google Cloud Firestore**. I tuoi dati sono sempre al sicuro e sincronizzati su smartphone, tablet e PC. |
| 📱 **Mobile-First & Cozy Design** | Interfaccia ottimizzata per schermi mobile con palette dai toni caldi biscotto/ambra/vaniglia, feedback tattile e animazioni piacevoli. |

---

## 📸 Anteprima

<div align="center">
  <img src="./src/assets/hero.png" width="220" alt="Mascot Cookie Tracker" />
  <p><i>Un'esperienza accogliente e rilassante pensata per farti sentire a casa mentre raggiungi i tuoi obiettivi.</i></p>
</div>

---

## 🛠️ Stack Tecnologico

- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Backend & Database**: [Firebase Auth](https://firebase.google.com/docs/auth) + [Cloud Firestore](https://firebase.google.com/docs/firestore)
- **Linter & Code Quality**: [Oxlint](https://oxc.rs/)

---

## 🚀 Guida all'Installazione

### Prerequisiti
- [Node.js](https://nodejs.org/) (versione 18 o superiore consigliata)
- [npm](https://www.npmjs.com/) (incluso con Node.js)
- Un account Google per configurare la console di Firebase

### 1. Clona la repository
```bash
git clone https://github.com/tuo-username/cookie-tracker.git
cd cookie-tracker
```

### 2. Installa le dipendenze
```bash
npm install
```

### 3. Configura le variabili d'ambiente
Copia il file `.env.example` in `.env.local`:
```bash
cp .env.example .env.local
```
Apri il file `.env.local` e inserisci le tue credenziali Firebase (vedi sezione successiva).

### 4. Avvia il server di sviluppo
```bash
npm run dev
```
Apri il browser su [http://localhost:5173](http://localhost:5173) per sfornare i tuoi primi biscotti! 🍪

---

## 🔥 Configurazione Firebase

Per consentire l'autenticazione Google e il salvataggio dei dati su Firestore:

1. Vai sulla [Firebase Console](https://console.firebase.google.com/) e crea un nuovo progetto (es. `cookie-tracker`).
2. **Abilita Authentication**:
   - Vai in **Build** > **Authentication** > **Inizia**.
   - Nella scheda **Metodo di accesso**, attiva il provider **Google**.
   - Aggiungi `localhost` tra i domini autorizzati (è già presente di default).
3. **Crea il Database Firestore**:
   - Vai in **Build** > **Firestore Database** > **Crea database**.
   - Scegli la modalità (consigliata *modalità di produzione*).
   - Seleziona la regione più vicina (es. `europe-west1` / `eur3`).
4. **Applica le Regole di Sicurezza**:
   - Vai nella scheda **Regole** di Firestore e incolla le regole presenti nel file [`firestore.rules`](./firestore.rules):
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /users/{userId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;

           match /{subcollection}/{document=**} {
             allow read, write: if request.auth != null && request.auth.uid == userId;
           }
         }
       }
     }
     ```
   - Clicca **Pubblica**.
5. **Ottieni le chiavi API**:
   - Vai nelle **Impostazioni progetto** (icona ingranaggio) > **Generali**.
   - Scorri in basso su *Le tue app*, seleziona **Web** (`</>`) e registra l'app.
   - Copia i valori dell'oggetto `firebaseConfig` nel tuo file `.env.local`.

---

## 📁 Struttura del Progetto

```
cookie-tracker/
├── public/                 # Icone e manifest
├── src/
│   ├── assets/             # Grafiche, illustrazioni e mascotte
│   ├── components/         # Componenti UI (Navbar, Calendar, TaskCard, Forms...)
│   ├── contexts/           # AuthContext (stato login Google)
│   ├── hooks/              # Custom Hooks di integrazione Firestore
│   │   ├── useActivities.js    # Gestione abitudini e filtro per giorno
│   │   ├── useCompletions.js   # Registro completamenti e calcolo mensile
│   │   ├── useMilestones.js    # Traguardi a soglia mensile
│   │   ├── useProfile.js       # Saldo biscotti e dati utente
│   │   └── useRewards.js       # Catalogo premi
│   ├── pages/              # Le viste principali (Dashboard, Forno, Shop)
│   ├── utils/              # Helper date sicure con fuso orario locale
│   ├── App.jsx             # State machine autenticazione e router
│   ├── firebase.js         # Inizializzazione Firebase SDK
│   └── main.jsx            # Entry point React
├── firestore.rules         # Regole di isolamento dati per Firestore
├── .env.example            # Template variabili d'ambiente
└── package.json            # Script e dipendenze
```

---

## 📖 Documentazione Tecnica

Se desideri approfondire l'architettura del software, i pattern dei custom hook e il modello dati dettagliato, consulta la [**Documentazione Tecnica Completa (DOCUMENTATION.md)**](./DOCUMENTATION.md).

---

## 📦 Script Disponibili

| Comando | Descrizione |
| :--- | :--- |
| `npm run dev` | Avvia l'ambiente di sviluppo locale con Hot Reload |
| `npm run build` | Compila l'applicazione per la produzione nella cartella `dist/` |
| `npm run preview` | Avvia un web server locale per testare la build di produzione |
| `npm run lint` | Esegue il controllo del codice con Oxlint |

---

## 🗺️ Roadmap & Idee Future

- [ ] 📱 **PWA Support**: Supporto completo Progressive Web App per installazione nativa su iOS/Android e funzionamento offline
- [ ] 🔥 **Serie di Giorni (Streak)**: Contatore di costanza per incentivare le abitudini consecutive
- [ ] 🔊 **Sound Design**: Effetti sonori croccanti al completamento delle attività e all'acquisto di premi
- [ ] 🎨 **Temi Personalizzabili**: Nuove pasticcerie (cioccolato fondente, matcha green tea, red velvet)

---

## 📄 Licenza

Distribuito sotto licenza **MIT**. Consulta il file `LICENSE` per maggiori informazioni.

---

<div align="center">
  Fatto con ❤️, tanta farina e un pizzico di zucchero 🍪
</div>
