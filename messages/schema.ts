export type QuipBuckets = readonly [
  readonly string[], // 0
  readonly string[], // 1
  readonly string[], // 2
  readonly string[], // 3
  readonly string[], // 4
  readonly string[], // 5
  readonly string[], // 6
  readonly string[], // 7
  readonly string[], // 8
  readonly string[], // 9
  readonly string[], // 10
];

export type ShareBuckets = {
  high: readonly string[];
  mid: readonly string[];
  low: readonly string[];
};

export type Dictionary = {
  langTag: string;
  ogLocale: string;
  keywords: readonly string[];

  meta: {
    siteTitle: string;
    siteDescription: string;
    colorTitle: string;
    colorDescription: string;
    soundTitle: string;
    soundDescription: string;
    timeTitle: string;
    timeDescription: string;
    angleTitle: string;
    angleDescription: string;
    teamColorTitle: string;
    teamColorDescription: string;
    teamSoundTitle: string;
    teamSoundDescription: string;
    teamTimeTitle: string;
    teamTimeDescription: string;
    teamAngleTitle: string;
    teamAngleDescription: string;
    creditsTitle: string;
    creditsDescription: string;
    creditsOgDescription: string;
    impressumTitle: string;
    impressumDescription: string;
    impressumOgDescription: string;
    datenschutzTitle: string;
    datenschutzDescription: string;
    datenschutzOgDescription: string;
  };

  footer: {
    impressum: string;
    datenschutz: string;
    inspiredBy: string;
    creditsAriaLabel: string;
    languageAriaLabelTemplate: string; // e.g. "Switch language to {code}"
  };

  common: {
    home: string;
    replay: string;
    retry: string;
    share: string;
    copied: string;
    confirm: string;
    play: string;
    next: string;
    you: string;
    unknownError: string;
    missingName: string;
    yourName: string;
    soloAria: string;
    teamAria: string;
    globalAria: string;
    themeToggle: string;
    audioMute: string;
    audioUnmute: string;
  };

  game: {
    color: {
      idleTitle: string;
      idleInvitedTitle: string;
      soloIntro1: string;
      soloIntro2: string;
      soloIntro3: string;
      soloIntro4: string;
      teamIntro1: string;
      teamIntro2: string;
      hueAria: string;
      satAria: string;
      lightAria: string;
    };
    sound: {
      idleTitle: string;
      idleInvitedTitle: string;
      soloIntro1: string;
      soloIntro2: string;
      soloIntro3: string;
      soloIntro4: string;
      teamIntro1: string;
      teamIntro2: string;
      frequencyAria: string;
      listenLabel: string;
      targetLabel: string;
      youLabel: string;
      centsUnit: string;
    };
    time: {
      idleTitle: string;
      idleInvitedTitle: string;
      soloIntro1: string;
      soloIntro2: string;
      soloIntro3: string;
      soloIntro4: string;
      teamIntro1: string;
      teamIntro2: string;
      memorizeLabel: string;
      holdAria: string;
      holdInstruction: string;
      releaseLabel: string;
      releaseHint: string;
      holdAction: string;
      holdHint: string;
      targetLabel: string;
      youLabel: string;
      offByLabel: string;
    };
    angle: {
      idleTitle: string;
      idleInvitedTitle: string;
      soloIntro1: string;
      soloIntro2: string;
      soloIntro3: string;
      soloIntro4: string;
      teamIntro1: string;
      teamIntro2: string;
      dialAria: string;
      memorizeLabel: string;
      targetLabel: string;
      youLabel: string;
      degreesUnit: string;
      offByLabel: string;
      submitLabel: string;
    };
  };

  nameEntry: {
    soloTitle: string;
    soloHint: string;
    globalTitle: string;
    globalHint: string;
    teamCreatorTitle: string;
    teamParticipantTitle: string;
    teamHint: string;
    placeholder: string;
  };

  final: {
    solo: {
      label: string;
      tiersColor: readonly [string, string, string, string, string, string];
      tiersSound: readonly [string, string, string, string, string, string];
      tiersTime: readonly [string, string, string, string, string, string];
      tiersAngle: readonly [string, string, string, string, string, string];
    };
    team: {
      label: string;
      lobbyCreating: string;
      scoreSending: string;
      createFailed: string;
      sendFailed: string;
    };
    global: {
      label: string;
      rankTemplate: string; // "Platz {rank} von {total}"
      scoreSending: string;
      sendFailed: string;
    };
  };

  quips: {
    color: QuipBuckets;
    sound: QuipBuckets;
    time: QuipBuckets;
    angle: QuipBuckets;
    colorFallback: string;
    soundFallback: string;
    timeFallback: string;
    angleFallback: string;
  };

  shareQuips: {
    color: ShareBuckets;
    sound: ShareBuckets;
    time: ShareBuckets;
    angle: ShareBuckets;
  };

  playerRow: {
    roundAriaTemplate: string; // "Runde {round}: {points} Punkte"
    offByLabel: string;
  };

  credits: {
    aTributeTo: string;
    openOriginal: string;
    intro1Lead: string;
    intro1Mid: string;
    intro1Tail: string;
    paragraph2: string;
    intro3Lead: string;
    intro3Mid: string;
    intro3Tail: string;
    ctaButton: string;
    propsHeading: string;
    propsBody: string;
  };

  impressum: {
    title: string;
    angabenHeading: string;
    contactHeading: string;
    mstvHeading: string;
    liabilityContentHeading: string;
    liabilityContentBody: string;
    liabilityLinksHeading: string;
    liabilityLinksBody: string;
    disputeHeading: string;
    disputeBody: string;
    germany: string;
  };

  datenschutz: {
    title: string;
    intro: string;
    section1Heading: string;
    section2Heading: string;
    section2Para1: string;
    section2Para2: string;
    section3Heading: string;
    section3Para1Lead: string;
    section3Para1Bold: string;
    section3Para1Tail: string;
    section3Para2Lead: string;
    section3Para2Link: string;
    section4Heading: string;
    section4Para1Lead: string;
    section4Para1Bold: string;
    section4Para1Tail: string;
    section4Para2: string;
    section5Heading: string;
    section5Para1: string;
    section5Para2: string;
    section6Heading: string;
    section6Para1Lead: string;
    section6Para1Mid: string;
    section6Para1And: string;
    section6Para1ThirdKey: string;
    section6Para1AfterKeys: string;
    section6Para1Bold: string;
    section6Para1FinalDot: string;
    section7Heading: string;
    section7Intro: string;
    rightInfo: string;
    rightCorrection: string;
    rightDeletion: string;
    rightRestriction: string;
    rightPortability: string;
    rightObjection: string;
    section7Outro: string;
    section8Heading: string;
    section8Body: string;
    section9Heading: string;
    section9Body: string;
    emailLabel: string;
  };
};
