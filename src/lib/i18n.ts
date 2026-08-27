export type Lang = "en" | "ne";

export const LANGS: Lang[] = ["en", "ne"];

export function isLang(v: unknown): v is Lang {
  return v === "en" || v === "ne";
}

// UI chrome only. Feed content stays in its original (mixed) language.
const en = {
  langName: "English",
  otherLangName: "नेपाली",
  siteTagline: "Rescue & Relief Bulletin",
  updatedAt: "Data updated",
  source: "Source",
  sourceUnreachable:
    "Live source is currently unreachable — showing the last saved data.",
  emergency: "Emergency hotlines",
  call: "Call",

  srTitle: "Search & Rescue",
  srIntro:
    "People reported missing or found in the flood. Reported by the community — verify directly before acting.",
  tabMissing: "Need attention",
  tabFound: "Rescued & safe",
  statusMissing: "Missing",
  statusRescued: "Rescued",
  emergencyRelief: "Emergency relief",
  needAttentionChip: "Need attention",
  rescuedChip: "Rescued",
  searchByName: "Search by name",
  searchPlaceholder: "Search by name, place, or phone…",
  resultsCount: "records",
  showing: "Showing",
  of: "of",
  prev: "Prev",
  next: "Next",
  noResults: "No matching records.",
  reportMissing: "Report a missing person",
  reportFound: "Report someone found",
  fieldPlace: "Location",
  fieldPhone: "Contact",
  fieldAge: "Age",
  fieldWhen: "Last seen",
  fieldNote: "Note",
  flagged: "Needs review",

  liveUpdatesTitle: "Live updates from the source",
  liveUpdatesIntro:
    "Recent changes committed by the bulletin maintainer — new reports, corrections, and rescues.",
  liveUpdatesEmpty: "No recent updates available right now.",
  viewAllCommits: "View all changes",
  reportedLabel: "Reported",

  updatesTitle: "Official updates & posts",
  updatesIntro:
    "Human-verified links to posts from official handles and agencies.",
  updatesEmpty: "No updates posted yet.",
  verified: "Verified",
  unverified: "Unverified",
  viewPost: "View post",
  pinned: "Pinned",

  helpTitle: "How to get help",
  helpIntro:
    "Report a missing or found person through the official community forms, or use the emergency numbers.",
  resourcesTitle: "Helpful resources",

  donationTitle: "Support & Donation",
  informationalBadge: "Informational only",
  donationPending:
    "Official donation details are pending verification and are intentionally hidden. Do not publish this page until your team fills in verified details.",
  donationBank: "Bank",
  donationAccountName: "Account name",
  donationAccountNumber: "Account number",
  officialPage: "Official page",
  donatePortal: "Donate via official PM Disaster Relief Fund portal",
  donateInfoNote:
    "Payment is processed on the official government portal (pmdrf.nchl.com.np). This site does not handle payments and is not affiliated with any government body.",

  kpiTitle: "Situation at a glance",
  kpiStillMissing: "Still missing",
  kpiRescued: "Rescued / found",
  kpiReunited: "Reunited",
  kpiAccounted: "Accounted for",
  kpiNew24h: "New (24h)",
  kpiRiversWarn: "Rivers above warning",
  kpiDistricts: "Affected districts",
  kpiOfMissing: "Among those still missing",
  kpiMinors: "minors",
  kpiElderly: "elderly",
  kpiForeign: "foreign*",
  kpiForeignNote: "*foreign nationals — approximate (from location / phone)",
  minAgo: "min ago",
  tagMinor: "Minor",
  tagElderly: "Elderly",
  tagForeign: "Foreign",

  riverTitle: "River Watch",
  riverIntro:
    "Live river levels from the Dept. of Hydrology & Meteorology (DHM). Verify with authorities before acting.",
  riverDangerAlert: "One or more rivers are at or above DANGER level.",
  riverWarningAlert: "One or more rivers are above WARNING level.",
  riverWarn: "Warning",
  riverDanger: "Danger",
  riverLevel: "Level",
  riverObserved: "Observed",
  riverSourceDhm: "DHM source",
  riverRising: "Rising",
  riverFalling: "Falling",
  riverSteady: "Steady",
  riverNormal: "Normal",
  riverReliability: "Gauge data may be unreliable",
  riverEmpty: "River data is unavailable right now.",

  mapTitle: "Flood Map",
  mapIntro:
    "Approximate flood corridor along the Trishuli–Narayani, with live DHM gauge locations coloured by status.",
  mapConfirmed: "River corridor",
  mapAtRisk: "Downstream / at-risk",
  mapGauge: "DHM gauge (by status)",
  mapEntry: "Upstream / entry",
  mapDisclaimer:
    "Pins and paths are approximate (market / bridge points, not the exact channel). Verify with DHM and local authorities.",
  mapRain: "Rain radar",
  mapRainNote: "Live rain radar by RainViewer — toggle it top-right on the map.",
  riverSafetyTitle: "Request to people living near the river.",
  riverSafetyBody: "Move from the riverside to higher ground and stay on high alert.",

  footerDisclaimer:
    "This is an unofficial, community-maintained bulletin. Information may be incomplete or out of date. Verify critical details independently before acting. Not affiliated with any government body.",
  dataMirroredFrom: "Data mirrored from",
  backToTop: "Back to top",

  creditBy: "Data & original bulletin by",
  creditThanks: "full credit to the original author",
  creditView: "View original",
};

const ne: typeof en = {
  langName: "नेपाली",
  otherLangName: "English",
  siteTagline: "उद्धार तथा राहत बुलेटिन",
  updatedAt: "तथ्याङ्क अद्यावधिक",
  source: "स्रोत",
  sourceUnreachable:
    "प्रत्यक्ष स्रोत हाल उपलब्ध छैन — पछिल्लो सुरक्षित तथ्याङ्क देखाइँदैछ।",
  emergency: "आपत्‌कालीन नम्बरहरू",
  call: "फोन",

  srTitle: "खोज तथा उद्धार",
  srIntro:
    "बाढीमा हराएका वा भेटिएका व्यक्तिहरू। समुदायद्वारा रिपोर्ट गरिएको — कार्य गर्नुअघि प्रत्यक्ष पुष्टि गर्नुहोस्।",
  tabMissing: "ध्यान आवश्यक",
  tabFound: "उद्धार / सुरक्षित",
  statusMissing: "हराएको",
  statusRescued: "उद्धार गरिएको",
  emergencyRelief: "आपत्‌कालीन राहत",
  needAttentionChip: "ध्यान आवश्यक",
  rescuedChip: "उद्धार गरिएको",
  searchByName: "नामबाट खोज्नुहोस्",
  searchPlaceholder: "नाम, स्थान वा फोनबाट खोज्नुहोस्…",
  resultsCount: "विवरण",
  showing: "देखाइँदै",
  of: "मध्ये",
  prev: "अघिल्लो",
  next: "अर्को",
  noResults: "कुनै विवरण भेटिएन।",
  reportMissing: "हराएको व्यक्ति रिपोर्ट गर्नुहोस्",
  reportFound: "भेटिएको व्यक्ति रिपोर्ट गर्नुहोस्",
  fieldPlace: "स्थान",
  fieldPhone: "सम्पर्क",
  fieldAge: "उमेर",
  fieldWhen: "अन्तिम पटक देखिएको",
  fieldNote: "टिप्पणी",
  flagged: "पुनरावलोकन आवश्यक",

  liveUpdatesTitle: "स्रोतबाट प्रत्यक्ष अपडेट",
  liveUpdatesIntro:
    "बुलेटिन सम्पादकद्वारा भर्खरै गरिएका परिवर्तन — नयाँ रिपोर्ट, सुधार, र उद्धार।",
  liveUpdatesEmpty: "हाल कुनै अपडेट उपलब्ध छैन।",
  viewAllCommits: "सबै परिवर्तन हेर्नुहोस्",
  reportedLabel: "रिपोर्ट",

  updatesTitle: "आधिकारिक अपडेट तथा पोस्ट",
  updatesIntro:
    "आधिकारिक ह्यान्डल र निकायहरूका पोस्टका मानवद्वारा प्रमाणित लिङ्कहरू।",
  updatesEmpty: "अहिलेसम्म कुनै अपडेट छैन।",
  verified: "प्रमाणित",
  unverified: "अप्रमाणित",
  viewPost: "पोस्ट हेर्नुहोस्",
  pinned: "पिन गरिएको",

  helpTitle: "कसरी सहयोग पाउने",
  helpIntro:
    "आधिकारिक सामुदायिक फारमबाट हराएको वा भेटिएको व्यक्ति रिपोर्ट गर्नुहोस्, वा आपत्‌कालीन नम्बर प्रयोग गर्नुहोस्।",
  resourcesTitle: "उपयोगी स्रोतहरू",

  donationTitle: "सहयोग तथा दान",
  informationalBadge: "जानकारीमूलक मात्र",
  donationPending:
    "आधिकारिक दान विवरण प्रमाणीकरण बाँकी भएकाले लुकाइएको छ। प्रमाणित विवरण नभरेसम्म यो पृष्ठ प्रकाशित नगर्नुहोस्।",
  donationBank: "बैंक",
  donationAccountName: "खाता नाम",
  donationAccountNumber: "खाता नम्बर",
  officialPage: "आधिकारिक पृष्ठ",
  donatePortal:
    "आधिकारिक प्रधानमन्त्री दैवी प्रकोप उद्धार कोष पोर्टलबाट सहयोग गर्नुहोस्",
  donateInfoNote:
    "भुक्तानी आधिकारिक सरकारी पोर्टल (pmdrf.nchl.com.np) मा हुन्छ। यो साइटले भुक्तानी लिँदैन र कुनै सरकारी निकायसँग सम्बद्ध छैन।",

  kpiTitle: "अवस्था एक नजरमा",
  kpiStillMissing: "अझै हराएका",
  kpiRescued: "उद्धार / भेटिएका",
  kpiReunited: "पुनर्मिलन",
  kpiAccounted: "हिसाब भएका",
  kpiNew24h: "नयाँ (२४ घण्टा)",
  kpiRiversWarn: "सतर्कता माथिका नदी",
  kpiDistricts: "प्रभावित जिल्ला",
  kpiOfMissing: "अझै हराएका मध्ये",
  kpiMinors: "नाबालक",
  kpiElderly: "वृद्ध",
  kpiForeign: "विदेशी*",
  kpiForeignNote: "*विदेशी नागरिक — स्थान/फोनका आधारमा अनुमानित",
  minAgo: "मिनेट अघि",
  tagMinor: "नाबालक",
  tagElderly: "वृद्ध",
  tagForeign: "विदेशी",

  riverTitle: "नदी निगरानी",
  riverIntro:
    "जल तथा मौसम विज्ञान विभाग (DHM) बाट नदीको प्रत्यक्ष सतह। कार्य गर्नुअघि अधिकारीहरूसँग पुष्टि गर्नुहोस्।",
  riverDangerAlert: "एक वा बढी नदी खतरा तह वा सोभन्दा माथि छन्।",
  riverWarningAlert: "एक वा बढी नदी सतर्कता तहभन्दा माथि छन्।",
  riverWarn: "सतर्कता",
  riverDanger: "खतरा",
  riverLevel: "सतह",
  riverObserved: "अवलोकन",
  riverSourceDhm: "DHM स्रोत",
  riverRising: "बढ्दै",
  riverFalling: "घट्दै",
  riverSteady: "स्थिर",
  riverNormal: "सामान्य",
  riverReliability: "गेज डाटा अविश्वसनीय हुन सक्छ",
  riverEmpty: "नदी डाटा हाल उपलब्ध छैन।",

  mapTitle: "बाढी नक्सा",
  mapIntro:
    "त्रिशूली–नारायणी किनार भएर बाढीको अनुमानित मार्ग, स्थिति अनुसार रङ दिइएका DHM गेजका प्रत्यक्ष स्थानसहित।",
  mapConfirmed: "नदी मार्ग",
  mapAtRisk: "तल्लो / जोखिममा",
  mapGauge: "DHM गेज (स्थिति अनुसार)",
  mapEntry: "माथिल्लो / प्रवेश",
  mapDisclaimer:
    "पिन र मार्ग अनुमानित हुन् (बजार/पुल बिन्दु, ठ्याक्कै नदी बहाव होइन)। DHM र स्थानीय अधिकारीसँग पुष्टि गर्नुहोस्।",
  mapRain: "वर्षा राडार",
  mapRainNote: "RainViewer द्वारा प्रत्यक्ष वर्षा राडार — नक्साको दायाँ-माथिबाट टगल गर्नुहोस्।",
  riverSafetyTitle: "नदी किनारमा बस्ने जनतालाई अनुरोध।",
  riverSafetyBody: "नदी किनारबाट अग्लो सुरक्षित स्थानमा जानुहोस् र उच्च सतर्क रहनुहोस्।",

  footerDisclaimer:
    "यो अनौपचारिक, समुदायद्वारा सञ्चालित बुलेटिन हो। जानकारी अपूर्ण वा पुरानो हुन सक्छ। कार्य गर्नुअघि महत्त्वपूर्ण विवरण स्वतन्त्र रूपमा पुष्टि गर्नुहोस्। कुनै सरकारी निकायसँग सम्बद्ध छैन।",
  dataMirroredFrom: "तथ्याङ्क स्रोत",
  backToTop: "माथि जानुहोस्",

  creditBy: "तथ्याङ्क तथा मूल बुलेटिन:",
  creditThanks: "मूल स्रष्टालाई पूर्ण श्रेय",
  creditView: "मूल हेर्नुहोस्",
};

export const messages = { en, ne } as const;
export type Messages = typeof en;

export function getMessages(lang: Lang): Messages {
  return messages[lang];
}
