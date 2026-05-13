const HIGH_QUIPS: readonly string[] = [
  "Mein Score: {score}/50. Mein Gehör ist anscheinend kalibriert. Probier's:",
  "{score}/50. Perfect-Pitch-Imitator. Beat that, wenn du dich traust.",
  "Ich hör Frequenzen wie andere Farben sehen. Versuch's selbst:",
  "{score}/50. Auf einem Klavier wäre ich in der ersten Reihe. Mach mit:",
  "Beat that. Oder zumindest: versuch's nicht zu peinlich.",
  "Mein Score: {score}/50. Du wirst mich nicht erreichen, aber probier's:",
];

const MID_QUIPS: readonly string[] = [
  "Bitte macht das auch, damit ich mich nicht so taub fühle. 🥺",
  "{score}/50. Spiel mit, ich brauch jemanden zum Drüberstehen.",
  "Mittelmaß abgeliefert — ich brauch Konkurrenz, hilf mir:",
  "Meine Ohren meinten heute Pause. Machst du's besser?",
  "Solide. Klingt nach Lob, ist eher \"naja\". Hilf mir hier:",
  "{score}/50. Verstärkung gesucht, bevorzugt schwächer als ich:",
];

const LOW_QUIPS: readonly string[] = [
  "Ich glaube ich brauch ein Hörgerät. Mach's besser:",
  "{score}/50. Mein Goldfisch hört mehr. Zerstör meine Statistik:",
  "Ich war so daneben, dass selbst der Stimmgerät weggeschaltet hat:",
  "Update: Frequenzen sind schwer. Schließt euch der Schande an:",
  "Spielt das mit mir, sonst muss ich allein heulen.",
  "Meine Ohren und ich hatten heute Differenzen. Lach mit:",
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
