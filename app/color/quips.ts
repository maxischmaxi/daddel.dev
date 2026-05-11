const QUIPS: Record<string, readonly string[]> = {
  "0.0": [
    "0,0? Sicher, dass du gerade nicht die Augen zu hattest?",
    "Wow. Eine Leistung, an die wir uns lange erinnern werden.",
    "Glückwunsch, du hast die maximale Nicht-Treffer-Quote erreicht.",
  ],
  "0.1": [
    "0,1 Punkte. Mathematisch näher an gar nichts als an etwas.",
    "Du hast deinen Monitor gestreichelt, aber nicht angeschaut, oder?",
  ],
  "0.2": [
    "0,2. Die Punkte fühlen sich gerade selber peinlich an.",
    "War das ein Ratespiel oder hast du es absichtlich versucht?",
  ],
  "0.3": [
    "Mit verbundenen Augen hättest du das auch geschafft.",
    "0,3 Punkte – ein Wimpernschlag näher dran als Stillstand.",
  ],
  "0.4": [
    "Bald hast du die ersten halben Punkte. Bald.",
    "0,4. Das ist quasi ein Trostpflaster.",
  ],
  "0.5": [
    "Halber Punkt, halbe Hoffnung.",
    "0,5 – das nennt man wohl 'auf der richtigen Skala'.",
  ],
  "0.6": [
    "Wir akzeptieren das. Wir mögen es aber nicht.",
    "0,6. Ein Trinkgeld für deine Mühe.",
  ],
  "0.7": [
    "0,7. Die Farbe hat dich gesehen, nicht andersrum.",
    "Du tust dein Bestes, das ist süß.",
  ],
  "0.8": [
    "Noch unter 1 Punkt. Knapp daneben ist auch vorbei.",
    "0,8 Punkte und ein bisschen Stolz. Ein ganz kleines bisschen.",
  ],
  "0.9": [
    "0,9. So nah an einem ganzen Punkt und doch so weit weg.",
    "Fast! Aber wirklich nur fast.",
  ],
  "1.0": [
    "Ein ganzer Punkt! Du gehörst quasi zur Elite.",
    "1 Punkt. Mama wäre stolz. Vielleicht.",
    "1,0 – fühlt sich an wie Bronze auf einem Podest aus Pappe.",
  ],
  "1.1": [
    "Du hast die Einser-Hürde geknackt. Mit Anlauf.",
    "1,1 Punkte. Bist du farbenblind oder einfach zu cool?",
  ],
  "1.2": [
    "1,2. Ein Tropfen mehr Farbe in deinem Leben.",
    "Sieht aus, als hättest du den Slider angeschaut, nicht die Farbe.",
  ],
  "1.3": [
    "1,3 Punkte. Klein, aber dein.",
    "Du bist auf einem guten Weg. Welchem ist unklar.",
  ],
  "1.4": [
    "1,4. Reicht nicht für nen Kaffee, aber für ein Schulterklopfen.",
    "Du hast die Lichtwellen gehört statt gesehen.",
  ],
  "1.5": [
    "1,5. Wenn's auch das Doppelte wäre, wär's immer noch peinlich.",
    "Anderthalb Punkte. Mathematisch erträglich.",
  ],
  "1.6": [
    "1,6 Punkte. Die Farbe lacht über dich. Höflich.",
    "Klein wie ein Kindergarten-Abschluss.",
  ],
  "1.7": [
    "1,7. Du näherst dich der Zwei. In Zeitlupe.",
    "Solider Anfängerwert. Nur, das hier ist nicht Folge eins.",
  ],
  "1.8": [
    "1,8. Ein Hoch auf den Mut zur Annäherung.",
    "Du hast Farbe getroffen. Halt nicht die richtige.",
  ],
  "1.9": [
    "Eine 9 vor der Zwei. Reiner Trotz.",
    "1,9 Punkte. Maximal weit unter Mittelmaß.",
  ],
  "2.0": [
    "2 Punkte! Endlich weicht der Hauch von Resignation.",
    "2,0. Die Skala respektiert dich noch nicht, aber bald.",
    "2 Punkte – das ist 1 Punkt mehr als nüchtern raten würde.",
  ],
  "2.1": [
    "2,1. Knapp über 'unbedenklich falsch'.",
    "Du hast Farben gesehen. Vielleicht.",
  ],
  "2.2": [
    "2,2 – wenn das ein Eis wär', würdest du es zurückgeben.",
    "Dein Auge ist im Energiesparmodus.",
  ],
  "2.3": [
    "2,3. Du hast Geschmack. Halt nicht für Farben.",
    "Lass uns das nicht weitererzählen, ja?",
  ],
  "2.4": [
    "2,4. Du hast die richtige Stimmung getroffen. Nur den Ton nicht.",
    "Punkte gibt's, Lob nicht.",
  ],
  "2.5": [
    "2,5. Ein Viertel des Weges. Du machst Fortschritte.",
    "Halbe-halbe zwischen schlecht und mies.",
  ],
  "2.6": [
    "2,6 – fast hätte dein Auge funktioniert.",
    "Du bist hartnäckig. Das zählt. Irgendwie.",
  ],
  "2.7": [
    "2,7 Punkte. Der Pixel hat dich angeschrien, du hast zurückgeflüstert.",
    "Du baust gerade an deiner Leidensfähigkeit.",
  ],
  "2.8": [
    "2,8. Wir sehen Potenzial. Wir sehen es allein.",
    "Was war das? Eine Annäherung im Weltraum?",
  ],
  "2.9": [
    "Hauchnah an der 3! Hauch.",
    "2,9 Punkte. Knapp am Stolz vorbei.",
  ],
  "3.0": [
    "3 Punkte. Du hast die Drei-Punkte-Linie geknackt. Im Color-Basketball.",
    "3,0. Reicht für ein 'okay-ish'.",
    "Drei Punkte – die Skala wirft dir nun einen halben Blick zu.",
  ],
  "3.1": [
    "3,1. Bist du sicher, dass das dein bester Versuch war?",
    "Mehr Punkte als Selbstvertrauen.",
  ],
  "3.2": [
    "3,2. Der Bildschirm hat gefragt, ob du Hilfe brauchst.",
    "Ein Drittel des Weges, zwei Drittel Verzweiflung.",
  ],
  "3.3": [
    "3,3 Punkte. Klingt wie eine Kindheitstherapie-Stufe.",
    "Du näherst dich dem akzeptablen Bereich. Sehr langsam.",
  ],
  "3.4": [
    "3,4. Reicht für einen Sticker, nicht für eine Urkunde.",
    "Du hast die Farbe ungefähr in der richtigen Galaxie getroffen.",
  ],
  "3.5": [
    "3,5. Genau zwischen 'sorry' und 'meh'.",
    "Mehr als ein Drittel. Weniger als ein Lob.",
  ],
  "3.6": [
    "3,6. Du tropfst Talent. Nur kein Farb-Talent.",
    "Bist du eigentlich farbenblind oder einfach nur entspannt?",
  ],
  "3.7": [
    "3,7 Punkte. Wir sind nicht stolz, aber auch nicht enttäuscht.",
    "Knapp am 'okay' vorbei.",
  ],
  "3.8": [
    "3,8. Stell dir vor, du wärst gleich bei 4. Dann wär's fast was.",
    "Punkte, die deine Würde zerschneiden wie Brotmesser.",
  ],
  "3.9": [
    "3,9. So nah und doch noch peinlich.",
    "Eine Stelle vor der Vier. Die Vier guckt böse.",
  ],
  "4.0": [
    "4 Punkte! Bald bist du im Mittelmaß angekommen.",
    "4,0. Halt durch, gleich kommt's gut.",
    "Vier Punkte – die magische Grenze zu 'das war nicht ganz daneben'.",
  ],
  "4.1": [
    "4,1. Du bist auf Tuchfühlung mit dem Durchschnitt.",
    "Punkte, die nach 'gemütlich okay' schmecken.",
  ],
  "4.2": [
    "4,2. Antwort auf alles, aber nicht auf das Richtige.",
    "Du bist im Anflug auf Halbpunkt-City.",
  ],
  "4.3": [
    "4,3 Punkte. Ein Schimmer Hoffnung leuchtet auf.",
    "Wir sehen dich. Mit zugekniffenen Augen.",
  ],
  "4.4": [
    "4,4. Reicht zum 'Naja, geht so'.",
    "Punkte fließen, Stolz noch nicht.",
  ],
  "4.5": [
    "4,5. Genau die Hälfte. Statistisch unbedeutend.",
    "Schulnote zwischen 3 und 4. Mit Bauchschmerzen.",
  ],
  "4.6": [
    "4,6. Du wackelst kurz vor Mittelmaß.",
    "Punkte, die nicht stolz, aber zufrieden sind.",
  ],
  "4.7": [
    "4,7 Punkte. Da geht noch was. Hoffentlich.",
    "Du näherst dich dem mittleren Niemandsland.",
  ],
  "4.8": [
    "4,8. So nah an Mittelmaß, dass es weh tut.",
    "Knapp an der 5 – und damit knapp an einem Lächeln.",
  ],
  "4.9": [
    "4,9 Punkte. Komm schon, einmal das halbe Brot.",
    "Eine Zehntel von 'echt jetzt mal solide'.",
  ],
  "5.0": [
    "5 Punkte! Genau in der Mitte. Wie das Leben.",
    "5,0. Mittelmaß ist auch was wert. Manchmal.",
    "Glückwunsch, du bist offiziell unentschieden.",
  ],
  "5.1": [
    "5,1. Du hast die Hälfte überschritten. Knapp.",
    "Mehr als Mittelmaß. Wenn auch nur durch Rundungsfehler.",
  ],
  "5.2": [
    "5,2 Punkte. Nicht schlecht. Aber auch nicht gut.",
    "Du machst dich. Langsam.",
  ],
  "5.3": [
    "5,3. Solide unspektakulär.",
    "Wir geben dir Punkte und ein leises 'okay'.",
  ],
  "5.4": [
    "5,4. Du hast Farbe ungefähr verstanden.",
    "Punkte, die so okay sind, dass sie keiner notiert.",
  ],
  "5.5": [
    "5,5. Punktezwilling. Symmetrisch mittelmäßig.",
    "Du näherst dich dem 'guten Mittelfeld'.",
  ],
  "5.6": [
    "5,6. Punkte mit einem Hauch von Schulterzucken.",
    "Mehr Treffer als Pech. Marginal.",
  ],
  "5.7": [
    "5,7 Punkte. Du hast vermutlich die Schule gehört.",
    "Nicht schlecht, sagt der Hund.",
  ],
  "5.8": [
    "5,8. Knapp am 'nicht peinlich' vorbei.",
    "Punkte, die wie Smalltalk klingen.",
  ],
  "5.9": [
    "5,9. So nah an 6, so weit von Stolz.",
    "Eine Zehntel von 'oh, beeindruckend'.",
  ],
  "6.0": [
    "6 Punkte. Du knackst die Note 4. Glückwunsch, Streber.",
    "6,0. Erste echte 'oh ja'-Stufe.",
    "Sechs Punkte – ab hier geht's bergauf.",
  ],
  "6.1": [
    "6,1. Sieht aus wie 'fast gut'.",
    "Punkte, die kurz nicken statt achselzucken.",
  ],
  "6.2": [
    "6,2. Du hast Farbe und Skala verstanden.",
    "Solides Pflichtprogramm.",
  ],
  "6.3": [
    "6,3 Punkte. Klar besser als der Durchschnitt-Klick.",
    "Etwas Stolz lugt um die Ecke.",
  ],
  "6.4": [
    "6,4. Das nennt man kompetent.",
    "Nicht überragend, aber wir sind zufrieden.",
  ],
  "6.5": [
    "6,5 Punkte. Mehr als die Hälfte plus Trinkgeld.",
    "Wir reden von 'gerne gesehen'.",
  ],
  "6.6": [
    "6,6. Doppel-Sechs gerundet. Stilvoll.",
    "Du wirst lässig kompetent.",
  ],
  "6.7": [
    "6,7 Punkte. Solide wie ein Holzregal.",
    "Ein anerkennendes Brummen wäre angemessen.",
  ],
  "6.8": [
    "6,8. So nah an 7, dass die 7 winkt.",
    "Punkte mit Selbstwertgefühl.",
  ],
  "6.9": [
    "6,9. Hihihi. Aber auch: nicht schlecht.",
    "Eine Zehntel vor der echten Sieben.",
  ],
  "7.0": [
    "7 Punkte! Du bist in der oberen Hälfte angekommen.",
    "7,0. Das nennt man 'da geht doch was'.",
    "Sieben Punkte – die Glücksskala zwinkert dir zu.",
  ],
  "7.1": [
    "7,1. Wir bemerken dich jetzt offiziell.",
    "Punkte, bei denen man kurz nickt.",
  ],
  "7.2": [
    "7,2 Punkte. Eindeutig gut auf dem Weg.",
    "Wir wären stolz, wenn wir's zugeben würden.",
  ],
  "7.3": [
    "7,3. Stark. Aber lass dir nichts darauf einbilden.",
    "Du machst das, ja.",
  ],
  "7.4": [
    "7,4 Punkte. Du hast Auge.",
    "Punkte, die nach einem Highfive rufen.",
  ],
  "7.5": [
    "7,5. Drei Viertel des Weges. Ehrlicher Respekt.",
    "Da kommt 'ne Acht angeschlichen.",
  ],
  "7.6": [
    "7,6. Gut. Wirklich gut.",
    "Punkte mit Selbstbewusstsein.",
  ],
  "7.7": [
    "7,7 Punkte. Doppelsieben. Glücksgriff oder Skill?",
    "Du fühlst dich richtig an.",
  ],
  "7.8": [
    "7,8. Die Acht ist zum Greifen nah.",
    "Wir applaudieren leise.",
  ],
  "7.9": [
    "7,9. Komm schon, eine Zehntel mehr und du bist eine Acht.",
    "So nah und doch noch nicht ganz.",
  ],
  "8.0": [
    "8 Punkte! Du beeindruckst die Skala.",
    "8,0. Jetzt wird's ernst gut.",
    "Acht Punkte – Pixel verbeugen sich vor dir.",
  ],
  "8.1": [
    "8,1. Du bist jetzt wirklich gut.",
    "Punkte, die nach Sonnenschein riechen.",
  ],
  "8.2": [
    "8,2 Punkte. Wir sind beeindruckt. Heimlich.",
    "Da spielt jemand wirklich Color.",
  ],
  "8.3": [
    "8,3. Das ist Pro-Niveau, fast.",
    "Du blendest uns. Bisschen.",
  ],
  "8.4": [
    "8,4 Punkte. Du nervst die anderen Spieler langsam.",
    "Stark. Aber stell dich nicht in die Sonne.",
  ],
  "8.5": [
    "8,5. Drei Viertel plus Bonus.",
    "Wir lieben das. Wir sagen es nicht.",
  ],
  "8.6": [
    "8,6 Punkte. Du bist gefährlich gut.",
    "Punkte mit Bumms.",
  ],
  "8.7": [
    "8,7. Du killst es, ehrlich.",
    "Die Farbe stand still und du hast sie umarmt.",
  ],
  "8.8": [
    "8,8. Doppel-Acht. Stilvoll und kompetent.",
    "Du schreitest. Auf richtigen Beinen.",
  ],
  "8.9": [
    "8,9. Die Neun atmet schon.",
    "Eine Zehntel vor 'beeindruckend'.",
  ],
  "9.0": [
    "9 Punkte. Jetzt mal langsam, du bist nicht die GPU.",
    "9,0. Wir verneigen uns kurz.",
    "Neun Punkte – mathematisch fast Magie.",
  ],
  "9.1": [
    "9,1. Beeindruckend. Verdächtig beeindruckend.",
    "Bist du eigentlich Designer?",
  ],
  "9.2": [
    "9,2 Punkte. Du legst die Latte hoch.",
    "Wir schauen jetzt mal genauer hin.",
  ],
  "9.3": [
    "9,3. Eine Show.",
    "Die Skala ist sprachlos. Bisschen.",
  ],
  "9.4": [
    "9,4 Punkte. Pro-Modus aktiv.",
    "Echte Liebe zu Farben, das sieht man.",
  ],
  "9.5": [
    "9,5. Lass mal ein bisschen für die anderen übrig.",
    "Du bist gefährlich nahe an perfekt.",
  ],
  "9.6": [
    "9,6 Punkte. Praktisch ein Mensch-zu-Maschine-Vergleich.",
    "Da klappert kein Pixel mehr.",
  ],
  "9.7": [
    "9,7. Wir sind offiziell beeindruckt.",
    "Hast du heimlich einen Color-Picker mitlaufen?",
  ],
  "9.8": [
    "9,8 Punkte. Das ist fast unfair.",
    "Die Zehn winkt schon panisch.",
  ],
  "9.9": [
    "9,9. Eine Zehntel vom Pixel-Olymp.",
    "Verflucht. So nah an perfekt.",
  ],
  "10.0": [
    "10/10. Pixel-perfekt. Wir küssen deine Augen. (Nein.)",
    "10 Punkte. Du hast die GPU höchstpersönlich beleidigt.",
    "Perfekt. Bitte verlasse das Gebäude, du machst uns Angst.",
  ],
};

const FALLBACK = "Punkte sind Punkte.";

export function getRandomQuip(score: number): string {
  const bucket = Math.max(0, Math.min(100, Math.round(score * 10)));
  const key = (bucket / 10).toFixed(1);
  const list = QUIPS[key];
  if (!list || list.length === 0) return FALLBACK;
  return list[Math.floor(Math.random() * list.length)];
}
