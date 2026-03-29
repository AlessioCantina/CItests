# GitHub Actions Security Lab

Repo-lab minimo per studiare in modo **difensivo** due temi:

1. il rischio di `pull_request_target` quando si fa checkout del codice della PR;
2. il rischio di usare action referenziate con tag/branch mobili invece che con commit SHA immutabili.

Il progetto applicativo è banale: una funzione `hello()` con test Node.js. Il valore del lab sta nei workflow dentro `.github/workflows/`.

---

## Contenuto del repository

- `src/index.js`: hello world minimo
- `test/index.test.js`: test base
- `test/secret-observer.test.js`: test innocuo che stampa solo se `DEMO_SECRET` è presente
- `.github/workflows/01-ci-pull-request-safe.yml`: CI normale e relativamente sicura
- `.github/workflows/02-pr-target-unsafe-demo.yml`: demo intenzionalmente insicura
- `.github/workflows/03-pr-target-safe-metadata-only.yml`: uso più prudente di `pull_request_target`
- `.github/workflows/04-movable-tags-demo.yml`: demo del problema dei tag mobili
- `.github/workflows/05-pinned-sha-template.yml`: template per passare allo SHA pinning

---

## Come usarlo

### 1) Crea un repository di prova

Carica questo contenuto in un repository GitHub nuovo e pubblico o privato.

### 2) Aggiungi un secret innocuo

Nelle impostazioni del repository crea un secret chiamato:

- `DEMO_SECRET`

Valore consigliato:

- `training-only`

Usa un valore fittizio, mai un token reale.

### 3) Verifica il comportamento locale

```bash
npm ci
npm test
npm start
```

### 4) Osserva il workflow sicuro

Il workflow `01-ci-pull-request-safe.yml` usa:

- trigger `pull_request`
- permessi minimi
- nessun secret nel job di test

Questo è il punto di partenza da preferire quando vuoi eseguire test su codice proposto da contributor o fork.

### 5) Osserva il workflow intenzionalmente insicuro

Il workflow `02-pr-target-unsafe-demo.yml` combina:

- `pull_request_target`
- checkout della head SHA della PR
- esecuzione di `npm ci` e `npm run test:observer`
- accesso a `DEMO_SECRET`

Questo pattern è il cuore del rischio: con `pull_request_target` il workflow gira nel contesto del repository di destinazione, ma poi esegue codice che arriva dalla PR.

Nel lab il test è innocuo: non stampa mai il valore del secret, stampa solo `DEMO_SECRET_PRESENT=true/false`.

### 6) Esperimento controllato

Per osservare il confine di sicurezza senza fare nulla di offensivo:

- apri una branch o un fork di test;
- modifica soltanto `test/secret-observer.test.js` oppure `package.json`;
- apri una pull request verso `main`;
- confronta il risultato tra:
  - workflow 01 (`pull_request`)
  - workflow 02 (`pull_request_target` + checkout PR code)

L'osservazione importante non è il contenuto del secret, ma **il fatto che il codice proveniente dalla PR venga eseguito in un contesto più privilegiato**.

### 7) Osserva la variante più prudente

Il workflow `03-pr-target-safe-metadata-only.yml` usa `pull_request_target`, ma non esegue il codice della PR. Legge soltanto metadati dell'evento. Questo è un caso d'uso molto più ragionevole per labeling, commenting o automazioni amministrative.

---

## Parte 2: movable tags vs SHA pinning

Il workflow `04-movable-tags-demo.yml` usa riferimenti comodi come:

- `actions/checkout@v5`
- `actions/setup-node@v4`

Questi riferimenti sono pratici, ma non sono immutabili: un tag Git può essere spostato.

Il file `05-pinned-sha-template.yml` è un template da completare con **full commit SHA** presi dalle release ufficiali delle action che vuoi usare. In un contesto hardening, questa è la scelta migliore.

### Procedura pratica consigliata

1. apri la pagina release ufficiale dell'action;
2. individua la release che vuoi usare;
3. copia il commit SHA completo a 40 caratteri;
4. sostituisci il tag nel workflow;
5. aggiorna periodicamente lo SHA in modo controllato.

---

## Cosa guardare nei log

### Workflow 01
- esegue i test normali;
- non riceve il secret demo;
- è il riferimento da considerare “baseline”.

### Workflow 02
- parte su `pull_request_target`;
- fa checkout della head SHA della PR;
- esegue il codice della PR;
- può mostrare `DEMO_SECRET_PRESENT=true` se il secret è disponibile al job.

### Workflow 03
- parte su `pull_request_target`;
- non fa checkout della PR;
- non esegue codice non fidato.

### Workflow 04
- mostra l'uso dei tag mobili.

### Workflow 05
- è il punto di arrivo per lo SHA pinning.

---

## Regole pratiche da tenere a mente

### Evita questo pattern
```yaml
on: pull_request_target
...
- uses: actions/checkout@v5
  with:
    ref: ${{ github.event.pull_request.head.sha }}
- run: npm test
```

### Preferisci questo per testare codice di PR
```yaml
on: pull_request
permissions:
  contents: read
```

### Usa `pull_request_target` solo per attività che non eseguono il codice della PR
Per esempio:
- aggiungere label;
- scrivere commenti automatici;
- leggere metadati della PR.

### Per le action, preferisci SHA immutabili
- meno comodità;
- più controllo;
- migliore postura supply-chain.

---

## Limiti del lab

Questo repository è volutamente didattico:

- non include exploit reali;
- non esfiltra niente;
- non stampa mai il valore del secret demo;
- serve solo a capire il **modello di rischio**.

---

## Avvio rapido

```bash
npm ci
npm test
npm start
```

Output atteso:

```text
Hello World
```
