// Quips gruppiert nach Score-Range. Jeder Bucket deckt einen ganzzahligen
// Score-Bereich ab (Bucket 0 → 0.0–0.9, …, Bucket 9 → 9.0–9.9, Bucket 10 → 10.0).
// `{score}` wird durch den tatsächlichen Round-Score mit einer Nachkommastelle
// ersetzt (deutsche Schreibweise mit Komma).

const BUCKETS: Record<number, readonly string[]> = {
  0: [
    "{score}? Sicher, dass du gerade nicht die Augen zu hattest?",
    "Wow. Maximale Nicht-Treffer-Quote erreicht.",
    "{score} Punkte. Mathematisch näher an gar nichts als an etwas.",
    "Mit verbundenen Augen hättest du das auch geschafft.",
    "War das ein Ratespiel oder Absicht?",
    "Die Punkte fühlen sich selber peinlich an.",
    "{score} – das nennt man wohl 'auf der richtigen Skala'.",
  ],
  1: [
    "{score} Punkte. Mama wäre stolz. Vielleicht.",
    "Du hast die Einser-Hürde geknackt. Mit Anlauf.",
    "Sieht aus, als hättest du den Slider angeschaut, nicht die Farbe.",
    "{score}. Klein, aber dein.",
    "Reicht nicht für einen Kaffee, aber für ein Schulterklopfen.",
    "Du hast Farbe getroffen. Halt nicht die richtige.",
    "{score} Punkte. Maximal weit unter Mittelmaß.",
  ],
  2: [
    "{score}. Die Skala respektiert dich noch nicht, aber bald.",
    "Du hast Geschmack. Halt nicht für Farben.",
    "{score} Punkte. Ein Fünftel des Weges, vier Fünftel Verzweiflung.",
    "Du baust gerade an deiner Leidensfähigkeit.",
    "Hauchnah an der 3! Hauch.",
    "Du hast die richtige Stimmung getroffen. Nur den Ton nicht.",
    "{score}. Dein Auge ist im Energiesparmodus.",
  ],
  3: [
    "{score} Punkte. Du hast die Drei-Punkte-Linie geknackt. Im Color-Basketball.",
    "Reicht für ein 'okay-ish'.",
    "Du näherst dich dem akzeptablen Bereich. Sehr langsam.",
    "{score}. Reicht für einen Sticker, nicht für eine Urkunde.",
    "Mehr Punkte als Selbstvertrauen.",
    "Stell dir vor, du wärst gleich bei 4. Dann wär's fast was.",
    "{score} Punkte. Klingt wie eine Kindheitstherapie-Stufe.",
  ],
  4: [
    "{score} Punkte! Bald bist du im Mittelmaß angekommen.",
    "Antwort auf alles, aber nicht auf das Richtige.",
    "Schulnote zwischen 3 und 4. Mit Bauchschmerzen.",
    "{score}. Du wackelst kurz vor Mittelmaß.",
    "Punkte, die nach 'gemütlich okay' schmecken.",
    "So nah an Mittelmaß, dass es weh tut.",
    "{score} Punkte. Ein Schimmer Hoffnung leuchtet auf.",
  ],
  5: [
    "{score} Punkte. Genau in der Mitte. Wie das Leben.",
    "Mittelmaß ist auch was wert. Manchmal.",
    "Glückwunsch, du bist offiziell unentschieden.",
    "{score}. Solide unspektakulär.",
    "Mehr Treffer als Pech. Marginal.",
    "So nah an 6, so weit von Stolz.",
    "{score} Punkte. Du machst dich. Langsam.",
  ],
  6: [
    "{score} Punkte. Du knackst die Note 4. Glückwunsch, Streber.",
    "Erste echte 'oh ja'-Stufe.",
    "Solides Pflichtprogramm.",
    "{score}. Das nennt man kompetent.",
    "Doppel-Sechs gerundet. Stilvoll.",
    "Punkte mit Selbstwertgefühl.",
    "{score} Punkte. Etwas Stolz lugt um die Ecke.",
  ],
  7: [
    "{score} Punkte! Du bist in der oberen Hälfte angekommen.",
    "Wir bemerken dich jetzt offiziell.",
    "Eindeutig gut auf dem Weg.",
    "{score}. Stark. Aber lass dir nichts darauf einbilden.",
    "Drei Viertel des Weges. Ehrlicher Respekt.",
    "Wir applaudieren leise.",
    "{score} Punkte. Du fühlst dich richtig an.",
  ],
  8: [
    "{score} Punkte! Du beeindruckst die Skala.",
    "Jetzt wird's ernst gut.",
    "Da spielt jemand wirklich Color.",
    "{score}. Das ist Pro-Niveau, fast.",
    "Du killst es, ehrlich.",
    "Die Neun atmet schon.",
    "{score} Punkte mit Bumms.",
  ],
  9: [
    "{score} Punkte. Jetzt mal langsam, du bist nicht die GPU.",
    "Wir verneigen uns kurz.",
    "Beeindruckend. Verdächtig beeindruckend.",
    "{score}. Eine Show.",
    "Lass mal ein bisschen für die anderen übrig.",
    "Verflucht. So nah an perfekt.",
    "{score} Punkte. Hast du heimlich einen Color-Picker mitlaufen?",
  ],
  10: [
    "10/10. Pixel-perfekt. Wir küssen deine Augen. (Nein.)",
    "Du hast die GPU höchstpersönlich beleidigt.",
    "Perfekt. Bitte verlasse das Gebäude, du machst uns Angst.",
    "10 Punkte. Pixel verbeugen sich vor dir.",
    "Maximaler Score. Wir nennen das ab jetzt 'Der {score}-Moment'.",
  ],
};

const FALLBACK = "Punkte sind Punkte.";

function formatScore(score: number): string {
  return score.toFixed(1).replace(".", ",");
}

export function getRandomQuip(score: number): string {
  const clamped = Math.max(0, Math.min(10, score));
  const bucket = Math.floor(clamped);
  const list = BUCKETS[bucket];
  if (!list || list.length === 0) return FALLBACK;
  const template = list[Math.floor(Math.random() * list.length)];
  return template.replace("{score}", formatScore(score));
}
