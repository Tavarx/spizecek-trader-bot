# cruelty squad type beat discord bot (hodler)

## Použití

1. Instalace:

    ```
    npm install
    ```

2. Nastavení tokenu:

    - Vytvořte soubor s názvem `.env` v kořenovém adresáři projektu.
    - Do souboru `.env` vložte svůj Discord bot token pod názvem `DISCORD_BOT_TOKEN`:

    ```
    DISCORD_BOT_TOKEN=TOKEN_TVOJEHO_BOTA
    ```

3. Spuštění bota:

    ```
    node index.js
    ```

## Příkazy

- `!stav`: Zobrazí stav účtu (množství zimbabwských dolarů a matmaroinů uživatele).
- `!cena`: Zobrazí aktuální kurz matmaroinu k zimbabwským dolarům.
- `!koupit <množství>`: Umožňuje uživateli nakoupit matmaroiny za zimbabwské dolary.
- `!prodat <množství>`: Umožňuje uživateli prodat matmaroiny za zimbabwské dolary.
- `!give <uživatel> <množství>`: Umožňuje uživateli poslat peníze jinému uživateli.
