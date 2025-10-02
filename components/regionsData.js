export const nations = {
  Mondstadt: [
    "Brightcrown Mountains",
    "Galesong Hill",
    "Starfell Valley",
    "Windwail Highland",
    "Dragonspine",
  ],
  Liyue: [
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
  Inazuma: [
    "Narukami Island",
    "Kannazuka",
    "Yashiori Island",
    "Watatsumi Island",
    "Seirai Island",
    "Tsurumi Island",
    "Enkanomiya",
  ],
  Sumeru: [
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
  Fontaine: [
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
  Natlan: [
    "Ancient Sacred Mountain",
    "Atocpan",
    "Basin of Unnumbered Flames",
    "Coatepec Mountain",
    "Easybreeze Holiday Resort",
    "Ochkanatlan",
    "Quahuacan Cliff",
    "Tequemecan Valley",
    "Tezcatepetonco Range",
    "Toyac Springs",
  ],
  "Nod Krai": [
    "Lempo Isle",
    "Hiisi Island",
    "Paha Isle",
  ],
  Snezhnaya: [
  ],
  "Khaenri'ah": [
  ],
};

export const allRegions = Object.entries(nations).flatMap(([nation, regions]) =>
  regions.map((region) => ({ nation, region }))
);

export const STATUSES = ["Complete", "Working on it", "Not started"];

