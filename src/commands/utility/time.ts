const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('time').setDescription('Current time by Rob'),
    async execute(interaction: { reply: (arg0: string) => any; }) {
        await interaction.reply(getTimeAsFractionText(new Date()));
    },
};

function getTimeAsFractionText(date: Date = new Date()): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const hourWords = [
        "zwölf", "eins", "zwei", "drei", "vier", "fünf",
        "sechs", "sieben", "acht", "neun", "zehn", "elf"
    ];
    const nextHour = (hours + 1) % 12;
    const currentHourWord = hourWords[hours % 12];
    const nextHourWord = hourWords[nextHour];

    // Sonderfälle: genau volle Stunde
    if (minutes === 0) return `genau ${currentHourWord}`;

    // Kürze den Bruch minutes/60
    const num = minutes;
    const den = 60;
    const g = gcd(num, den);
    const numerator = num / g;
    const denominator = den / g;

    // Numeruswort (1 -> "ein" vor Substantiv)
    const numeratorWord = numberToGerman(numerator, { asNumeralBeforeNoun: true });

    // Nennerbezeichnung (häufig verwendete Formen als Wörter, ansonsten fallback "Xtel")
    const denomWord = denominatorToGermanWord(denominator, numerator);

    // Bei 1/2 verwenden wir "halb" (ohne "ein")
    if (denominator === 2 && numerator === 1) {
        return `halb ${nextHourWord}`;
    }

    return `Rob: "${numeratorWord} ${denomWord} ${nextHourWord}" (${hours}:${minutes})`;
}

// Hilfsfunktionen

function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}

// Wandelt kleine positive Ganzzahlen in deutsches Zahlwort.
// für numerator/denominator bis 60 ausreichend.
function numberToGerman(n: number, opts?: { asNumeralBeforeNoun?: boolean }): string {
    if (n === 1) return opts?.asNumeralBeforeNoun ? "ein" : "eins";

    const units: Record<number, string> = {
        0: "null", 1: "eins", 2: "zwei", 3: "drei", 4: "vier", 5: "fünf",
        6: "sechs", 7: "sieben", 8: "acht", 9: "neun", 10: "zehn",
        11: "elf", 12: "zwölf", 13: "dreizehn", 14: "vierzehn", 15: "fünfzehn",
        16: "sechzehn", 17: "siebzehn", 18: "achtzehn", 19: "neunzehn",
        20: "zwanzig", 30: "dreißig", 40: "vierzig", 50: "fünfzig", 60: "sechzig"
    };

    if (n <= 20 || n % 10 === 0) return units[n];

    const tens = Math.floor(n / 10) * 10;
    const unit = n % 10;
    // z.B. 21 -> "einundzwanzig", 47 -> "siebenundvierzig"
    const unitPart = unit === 1 ? "ein" : units[unit];
    return `${unitPart}und${units[tens]}`;
}

// Nenner in lesbare Bruchbezeichnung umwandeln.
// Für viele übliche Nenner existieren gebräuchliche Wörter.
function denominatorToGermanWord(den: number, numerator: number): string {
    const map: Record<number, string> = {
        2: "halb",           // 1/2 -> halb
        3: "Drittel",
        4: "Viertel",
        5: "Fünftel",
        6: "Sechstel",
        10: "Zehntel",
        12: "Zwölftel",
        15: "Fünfzehntel",
        20: "Zwanzigstel",
        30: "Dreißigstel",
        60: "Sechzigstel"
    };

    if (den in map) {
        // bei "halb" soll kein "ein" davor stehen, das wird oben behandelt
        return map[den];
    }

    // Fallback: z.B. "siebenundzwanzigstel"
    const denWordLower = numberToGerman(den, { asNumeralBeforeNoun: false });
    // kleinschreibung & zusammenfügen, dann erstes Zeichen groß (Substantiv)
    const combined = `${denWordLower}tel`.replace(/ß/g, "ß"); // z.B. "dreißig" -> "dreißigtel"
    return capitalizeFirst(combined);
}

function capitalizeFirst(s: string): string {
    if (!s) return s;
    return s[0].toUpperCase() + s.slice(1);
}