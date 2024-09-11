# infovis_board_games

## Descrizione

Questo è il progetto finale del corso di Visualizzazione delle Informazioni. Consiste in un'applicazione web che permette una visualizzazione interattiva di un dataset contenente i 100 giochi da tavolo più importanti reperibili su [BoardGameGeek](https://boardgamegeek.com). Il dataset esplora vari aspetti come valutazioni, durata delle partite, numero minimo e massimo di giocatori, e altro ancora. L'applicazione mira ad offrire una panoramica visiva per facilitare l'analisi di questi dati.

## Installazione ed esecuzione

1. Clona il repository:
    ```bash
    git clone https://github.com/Umberto28/infovis_board_games.git
    ```

2. Naviga nella directory del progetto:
    ```bash
    cd infovis_board_games
    ```

3. Installa le dipendenze necessarie (Flask e pandas):
    ```bash
    pip install -r requirements.txt
    ```

4. Esegui il file `app.py`:
    ```bash
    python app.py
    ```

5. Apri il browser e vai all'indirizzo [http://127.0.0.1:5000](http://127.0.0.1:5000) per visualizzare l'applicazione.

## Utilizzo
L'applicazione offre diverse funzionalità attraverso 5 pagine principali per esplorare e visualizzare i dati sui giochi da tavolo:

### 1. **Network Analysis**
Questa pagina visualizza una rappresentazione grafica del dataset, dove:
- Ogni **nodo** rappresenta un gioco da tavolo.
- Ogni **arco** indica un legame del tipo "a questo utente è piaciuto anche".
  
**Funzionalità:**
- I nodi possono essere filtrati in base a vari parametri:
  - Anno di uscita
  - Numero minimo e massimo di giocatori
  - Durata minima e massima delle partite
  - Età minima consigliata
  - Categorie, meccaniche, designer
- È possibile **clusterizzare** i nodi e colorarli in base a:
  - Anno di uscita
  - Numero di giocatori
  - Durata delle partite
  - Età minima consigliata
- **Interazioni:**
  - Passando il cursore sopra un nodo (hover), si visualizza il nome del gioco.
  - Cliccando su un nodo, si accede a tutti i dettagli relativi al gioco da tavolo selezionato tramite un pop-up. Si può cliccare su una zona qualsiasi fuori il pop-up per chiuderlo.
  - A destra del grafo, una legenda mostra i valori usati per la clusterizzazione. Cliccando sui valori nella legenda, vengono evidenziati i nodi corrispondenti a quel cluster.

### 2. **Distributions**
Questa pagina consente di visualizzare la distribuzione di un attributo selezionato tramite:
- **Pie chart** e **bar chart**.

**Interazioni:**
- Passando il cursore su una fetta del pie chart o su una barra del bar chart, vengono mostrate ulteriori informazioni dettagliate sull'attributo selezionato.

### 3. **Trends**
In questa sezione, viene mostrata una **line chart** che evidenzia le tendenze dei giochi da tavolo nel corso degli anni.

**Funzionalità:**
- I dati possono essere ordinati in base a:
  - **Popolarità** (numero di recensioni ricevute dagli utenti).
  - **Valutazione** (rating medio dei giochi).
  
**Interazioni:**
- Cliccando su un nodo della line chart, una **donut chart** a destra visualizza la distribuzione dei giochi per:
  - Categorie
  - Meccaniche
  - Designer
- Passando il cursore sopra una fetta della donut chart (hover), si possono visualizzare ulteriori informazioni.

### 4. **Scatterplot**
Questa pagina visualizza uno **scatterplot** che mette in relazione il ranking (da 1 a 100) sull'asse delle X con uno degli attributi selezionabili sull'asse delle Y, tra cui:
- Anno di uscita
- Numero minimo e massimo di giocatori
- Durata minima e massima delle partite
- Durata media delle partite
- Età minima consigliata

**Funzionalità:**
- È possibile scegliere se effettuare il ranking in base a:
  - **Popolarità** (numero di recensioni).
  - **Valutazione** (rating medio).
- Si può impostare il ranking in ordine **crescente** o **decrescente**.
  
**Interazioni:**
- Accanto allo scatterplot, un **bar chart** mostra la distribuzione dell'attributo selezionato, facilitando l'interpretazione visiva.
- All'interno dello scatterplot, è presente una **linea di regressione lineare** che evidenzia l'andamento generale dei valori rispetto al ranking.
- Passando il cursore sopra i nodi dello scatterplot o sulle barre del bar chart (hover), vengono mostrate informazioni aggiuntive.
- Cliccando su un nodo dello scatterplot, ulteriori dettagli sul gioco vengono mostrati tramite un pop-up.

### 5. **Bubble Chart**
Questa pagina visualizza una **bubble chart** con:
- Gli **anni** sull'asse delle X (è possibile restringere l'intervallo di anni impostando un anno minimo e massimo).
- Il **numero medio di giocatori** sull'asse delle Y.

**Funzionalità:**
- Ogni **bubble** rappresenta uno o più giochi da tavolo con un numero medio di giocatori pari al valore sull'asse delle Y.
- I bubble sono **colorati** in base al **ranking medio** dei giochi al loro interno.

**Interazioni:**
- Passando il cursore sopra un bubble (**hover**), vengono visualizzate informazioni aggiuntive.
- Cliccando su un bubble, si possono visualizzare i dettagli dei giochi contenuti al suo interno.
