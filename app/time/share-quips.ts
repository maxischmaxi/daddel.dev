const HIGH_QUIPS: readonly string[] = [
  "Mein Score: {score}/50. Mein Zeitgefühl ist eine Stoppuhr. Beat that:",
  "{score}/50. Innerer Metronom kalibriert. Versuch's selbst:",
  "Ich zähle Sekunden im Schlaf. Mach mit:",
  "{score}/50. Mein Bauchgefühl misst auf die Millisekunde. Mach mit:",
  "Beat that. Oder zumindest: nicht peinlich daneben tippen.",
  "Mein Score: {score}/50. Du kommst nicht ran, aber probier's:",
];

const MID_QUIPS: readonly string[] = [
  "Bitte spielt mit, damit ich nicht so mittelmäßig wirke. 🥺",
  "{score}/50. Spiel mit, ich brauch jemanden zum Drüberstehen.",
  "Mittelmaß abgeliefert — bitte schicke Konkurrenz vorbei:",
  "Mein Timing hatte heute frei. Machst du's besser?",
  "Solide. Klingt nach Lob, ist eher \"naja\". Hilf mir hier:",
  "{score}/50. Verstärkung gesucht, bevorzugt schwächer als ich:",
];

const LOW_QUIPS: readonly string[] = [
  "Ich glaube ich brauch eine Sanduhr. Mach's besser:",
  "{score}/50. Mein Goldfisch zählt schneller. Zerstör meine Statistik:",
  "Ich war so daneben, dass selbst die Uhr stehen geblieben ist:",
  "Update: Sekunden sind länger als gedacht. Schließt euch der Schande an:",
  "Spielt das mit mir, sonst muss ich allein heulen.",
  "Mein Zeitgefühl und ich hatten heute Differenzen. Lach mit:",
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
