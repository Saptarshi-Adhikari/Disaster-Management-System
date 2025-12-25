// shelter-data.ts

export interface Shelter {
  id: string;
  name: string;
  address: string;
  distance: string;
  capacity: number;
  current: number;
  amenities: string[];
  status: "open" | "full" | "limited";
  phone: string;
  coords: { lat: number; lng: number };
}

export const shelters: Shelter[] = [
  {
    id: "1",
    name: "Netaji Indoor Stadium",
    address: "B.B.D. Bagh, Kolkata, 700001",
    distance: "2.5 km",
    capacity: 2000,
    current: 1100,
    amenities: ["wifi", "power", "medical", "food"],
    status: "open",
    phone: "033-2248-0001",
    coords: { lat: 22.5726, lng: 88.3439 }
  },
  {
    id: "2",
    name: "Salt Lake Stadium (JY)",
    address: "Sector III, Salt Lake, Kolkata, 700098",
    distance: "8.1 km",
    capacity: 5000,
    current: 450,
    amenities: ["wifi", "power", "food"],
    status: "open",
    phone: "033-2335-0002",
    coords: { lat: 22.5691, lng: 88.4091 }
  },
  {
    id: "3",
    name: "Siliguri College Shelter",
    address: "College Para, Siliguri, 734001",
    distance: "580 km",
    capacity: 400,
    current: 380,
    amenities: ["power", "food"],
    status: "limited",
    phone: "0353-252-0003",
    coords: { lat: 26.7271, lng: 88.3953 }
  },
  {
    id: "4",
    name: "Darjeeling Govt College",
    address: "Lebong Cart Road, Darjeeling, 734101",
    distance: "620 km",
    capacity: 250,
    current: 120,
    amenities: ["power", "medical", "food"],
    status: "open",
    phone: "0354-225-0004",
    coords: { lat: 27.05, lng: 88.2627 }
  },
  {
    id: "5",
    name: "Cooch Behar Sports Complex",
    address: "Nilkuthir Maidan, Cooch Behar, 736101",
    distance: "680 km",
    capacity: 800,
    current: 790,
    amenities: ["power", "food"],
    status: "full",
    phone: "03582-222-0005",
    coords: { lat: 26.3452, lng: 89.4484 }
  },
  {
    id: "6",
    name: "Durgapur Youth Hostel",
    address: "City Centre, Durgapur, 713216",
    distance: "170 km",
    capacity: 300,
    current: 300,
    amenities: ["wifi", "food"],
    status: "full",
    phone: "0343-254-0006",
    coords: { lat: 23.5204, lng: 87.3119 }
  },
  {
    id: "7",
    name: "Asansol Community Hall",
    address: "GT Road, Asansol, 713301",
    distance: "210 km",
    capacity: 600,
    current: 212,
    amenities: ["wifi", "power", "food", "medical"],
    status: "open",
    phone: "0341-230-0007",
    coords: { lat: 23.6739, lng: 86.9524 }
  },
  {
    id: "8",
    name: "Purulia Zilla Parishad",
    address: "Ranchi Road, Purulia, 723101",
    distance: "290 km",
    capacity: 400,
    current: 150,
    amenities: ["food", "medical"],
    status: "open",
    phone: "03252-222-0008",
    coords: { lat: 23.3321, lng: 86.3652 }
  },
  {
    id: "9",
    name: "Haldia Guest House",
    address: "Haldia Township, Purba Medinipur, 721607",
    distance: "120 km",
    capacity: 150,
    current: 135,
    amenities: ["food", "medical"],
    status: "limited",
    phone: "03224-252-0009",
    coords: { lat: 22.0667, lng: 88.0698 }
  },
  {
    id: "10",
    name: "Namkhana Cyclone Shelter",
    address: "South 24 Parganas, Coastal WB, 743357",
    distance: "110 km",
    capacity: 1000,
    current: 400,
    amenities: ["power", "food", "medical"],
    status: "open",
    phone: "03210-225-0010",
    coords: { lat: 21.7656, lng: 88.2291 }
  },
  {
    id: "11",
    name: "Malda Town Hall",
    address: "English Bazar, Malda, 732101",
    distance: "330 km",
    capacity: 500,
    current: 480,
    amenities: ["wifi", "food"],
    status: "limited",
    phone: "03512-252-0011",
    coords: { lat: 25.0108, lng: 88.1411 }
  },
  {
    id: "12",
    name: "Kharagpur Community Center",
    address: "IIT Area, Kharagpur, 721301",
    distance: "140 km",
    capacity: 450,
    current: 100,
    amenities: ["wifi", "power", "food"],
    status: "open",
    phone: "03222-255-0012",
    coords: { lat: 22.3149, lng: 87.3105 }
  }
];
