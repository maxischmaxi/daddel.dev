// Buckets follow the existing label thresholds in final-solo.tsx:
// >= 34 → "Beeindruckend"/"Farb-Maestro" (high, smug brag)
// 17–33 → "Stark unterwegs"/"Solide" (mid, fishing for sympathy)
// < 17 → "Da geht noch was"/"Erstmal warmlaufen" (low, self-deprecating)

const HIGH_QUIPS: readonly string[] = [
  "Mein Score: {score}/50. Mal sehen wie weit du kommst. 😏",
  "Ich hab schon geliefert. Versuch's — vielleicht reicht's für Platz 2.",
  "{score}/50. Bring Tränen mit.",
  "Beat that. Oder zumindest: versuch's nicht zu peinlich.",
  "Ich nenn das mal eine Demonstration. Probier's selbst:",
  "Pantone hat angerufen, ich hab abgelehnt. Mach mal:",
  "{score}/50. Ich hab fertig. Du bist dran.",
];

const MID_QUIPS: readonly string[] = [
  "Bitte macht das auch, damit ich mich nicht so schlecht fühle. 🥺",
  "Suche dringend Mitspieler, die schlechter sind als ich.",
  "{score}/50. Spiel mit, ich brauch jemanden zum Drüberstehen.",
  "Meine Augen meinten heute Pause. Machst du's besser?",
  "Solide. Klingt nach Lob, ist Lehrerton für \"naja\". Hilf mir hier:",
  "Mittelmaß abgeliefert. Rette meinen Abend:",
  "Verstärkung gesucht. Bevorzugt schwächer als ich:",
];

const LOW_QUIPS: readonly string[] = [
  "Ich glaube ich bin farbenblind. Mach's besser:",
  "{score}/50. Mein Goldfisch macht mehr. Zerstör meine Statistik:",
  "Ich war so daneben, dass selbst Pantone weggesehen hat:",
  "Update: Farben sind schwer. Schließt euch dem Versager an:",
  "Spielt das mit mir, sonst muss ich allein heulen.",
  "Meine Augen und ich hatten heute Differenzen. Lach mit:",
  "Ich hab eine Farbe nachgebaut. Sie war… eine Farbe.",
];

function pick(list: readonly string[]): string {
  return list[Math.floor(Math.random() * list.length)];
}

export function getShareQuip(score: number): string {
  let bucket: readonly string[];
  if (score >= 34) bucket = HIGH_QUIPS;
  else if (score >= 17) bucket = MID_QUIPS;
  else bucket = LOW_QUIPS;
  return pick(bucket).replace("{score}", score.toFixed(3));
}

export function buildShareText(score: number, url: string): string {
  return `${getShareQuip(score)}\n${url}`;
}
