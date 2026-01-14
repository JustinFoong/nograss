export const nations = {
  Mondstadt: {
    oculi: {
      Anemoculus: ["1.0"],
      "Crimson Agate": ["1.2"],
    },
    regions: [
      "Brightcrown Mountains",
      "Galesong Hill",
      "Starfell Valley",
      "Windwail Highland",
      "Dragonspine",
    ],
  },
  Liyue: {
    oculi: {
      Geoculus: ["1.0"],
      "Spirit Carp": ["4.4"],
    },
    regions: [
      "Bishui Plain",
      "Lisha",
      "Minlin",
      "Qiongji Estuary",
      "Sea of Clouds",
      "The Chasm",
      "The Chasm: Underground Mines",
      "Chenyu Vale: Southern Mountains",
      "Chenyu Vale: Upper Vale",
      "Mt Laixin",
    ],
  },
  Inazuma: {
    oculi: {
      Electroculus: ["2.0", "2.1", "2.2"],
    },
    regions: [
      "Narukami Island",
      "Kannazuka",
      "Yashiori Island",
      "Watatsumi Island",
      "Seirai Island",
      "Tsurumi Island",
      "Enkanomiya",
    ],
  },
  Sumeru: {
    oculi: {
      Dendroculus: ["3.0", "3.1", "3.4", "3.6"],
    },
    regions: [
      "Ardravi Valley",
      "Ashavan Realm",
      "Avidya Forest",
      "Lokapala Jungle",
      "Lost Nursery",
      "Vanarana",
      "Vissudha Field",
      "Hypostyle Desert",
      "Land of Lower Setekh",
      "Land of Upper Setekh",
      "Desert of Hadramaveth",
      "Gavireh Lajavard",
      "Realm of Farakhkert",
    ],
  },
  Fontaine: {
    oculi: {
      Hydroculus: ["4.0", "4.1", "4.2", "4.6"],
    },
    regions: [
      "Belleau Region",
      "Beryl Region",
      "Court of Fontaine Region",
      "Liffey Region",
      "Fontaine Research Institute of Kinetic Energy Engineering Region",
      "Erinnyes Forest",
      "Morte Region",
      "Nostoi Region",
      "Sea of Bygone Eras",
    ],
  },
  Natlan: {
    oculi: {
      Pyroculus: ["5.0", "5.2", "5.5", "5.8"],
    },
    regions: [
      "Basin of Unnumbered Flames",
      "Coatepec Mountain",
      "Tequemecan Valley",
      "Toyac Springs",
      "Ochkanatlan",
      "Quahuacan Cliff",
      "Tezcatepetonco Range",
      "Ancient Sacred Mountain",
      "Atocpan",
      "Easybreeze Holiday Resort",
    ],
  },
  "Nod Krai": {
    oculi: {
      Lunoculus: ["6.0", "6.3"],
    },
    regions: ["Lempo Isle", 
      "Hiisi Island", 
      "Paha Isle",
      "Voidsea Outlook",
      "Wavechaser Plain",
      "Ashveil Peak",
    ],
  },
  Snezhnaya: {
    oculi: {},
    regions: [],
  },
  "Khaenri'ah": {
    oculi: {},
    regions: [],
  },
};

export const STATUSES = ["Complete", "Working on it", "Not started"];

export const regionEntries = Object.entries(nations).flatMap(([nation, { regions = [] }]) =>
  regions.map((name) => ({
    id: name,
    nation,
    title: name,
    subtitle: `${nation} • Region`,
    kind: "region",
  }))
);

export const oculiEntries = Object.entries(nations).flatMap(
  ([nation, { oculi = {} }]) =>
    Object.entries(oculi).flatMap(([type, patches]) =>
      patches.map((patch) => ({
        id: `${type}::${patch}`,
        nation,
        title: `${type} ${patch}`,
        subtitle: `${nation} • ${type}`,
        kind: "oculus",
        type,
        patch,
      }))
    )
);

export const allRegionIds = regionEntries.map((entry) => entry.id);
export const allOculiIds = oculiEntries.map((entry) => entry.id);

export const allItems = [...regionEntries, ...oculiEntries];

export function getItemById(id) {
  return allItems.find((item) => item.id === id);
}

