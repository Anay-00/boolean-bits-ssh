/* ================================================
   Seed 101 mock complaints into Firestore
   Run:  node seed-complaints.js
   ================================================ */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, writeBatch, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBzK7OR6jM9ixjhQnLKORfwWcP9GLqVQrw",
  authDomain: "ssh26-70e1e.firebaseapp.com",
  projectId: "ssh26-70e1e",
  storageBucket: "ssh26-70e1e.firebasestorage.app",
  messagingSenderId: "473817431022",
  appId: "1:473817431022:web:e968ac60c2dd614d31ecff",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ── Helpers ── */
function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomBetween(min, max) { return min + Math.random() * (max - min); }
function generateId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'GRV-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

/* ── Indore Locations with real lat/lng ── */
const LOCATIONS = [
  { area: 'Rajwada',               lat: 22.7196, lng: 75.8577 },
  { area: 'Vijay Nagar',           lat: 22.7533, lng: 75.8937 },
  { area: 'Palasia Square',        lat: 22.7235, lng: 75.8817 },
  { area: 'Bhawarkua Square',      lat: 22.7120, lng: 75.8680 },
  { area: 'Sapna Sangeeta Road',   lat: 22.7170, lng: 75.8640 },
  { area: 'MR-10 Ring Road',       lat: 22.7450, lng: 75.8200 },
  { area: 'Rau',                   lat: 22.6600, lng: 75.8550 },
  { area: 'Sudama Nagar',          lat: 22.6920, lng: 75.8770 },
  { area: 'Nipania',               lat: 22.7620, lng: 75.9100 },
  { area: 'Scheme No. 78',         lat: 22.7290, lng: 75.8870 },
  { area: 'Scheme No. 54',         lat: 22.7310, lng: 75.8760 },
  { area: 'Geeta Bhawan',          lat: 22.7140, lng: 75.8720 },
  { area: 'LIG Colony',            lat: 22.7050, lng: 75.8650 },
  { area: 'Mhow Naka',             lat: 22.6700, lng: 75.8400 },
  { area: 'Pipliyahana',           lat: 22.7380, lng: 75.8680 },
  { area: 'Super Corridor',        lat: 22.6800, lng: 75.9100 },
  { area: 'Silicon City',          lat: 22.6810, lng: 75.9110 },
  { area: 'Khandwa Road',          lat: 22.6850, lng: 75.8650 },
  { area: 'AB Road (Bypass)',      lat: 22.6950, lng: 75.8550 },
  { area: 'Annapurna Road',        lat: 22.7160, lng: 75.8520 },
  { area: 'Mahalaxmi Nagar',       lat: 22.7470, lng: 75.8830 },
  { area: 'Bicholi Mardana',       lat: 22.7580, lng: 75.8400 },
  { area: 'Limbodi',               lat: 22.7680, lng: 75.8320 },
  { area: 'Dewas Naka',            lat: 22.7550, lng: 75.8600 },
  { area: 'Musakhedi',             lat: 22.7060, lng: 75.8580 },
  { area: 'Chhoti Gwaltoli',       lat: 22.7210, lng: 75.8550 },
  { area: 'Banganga',              lat: 22.7080, lng: 75.8700 },
  { area: 'Tilak Nagar',           lat: 22.7320, lng: 75.8650 },
  { area: 'Bhanwarkuan',           lat: 22.7395, lng: 75.8690 },
  { area: 'Sneh Nagar',            lat: 22.7340, lng: 75.8720 },
  { area: 'Old Palasia',           lat: 22.7240, lng: 75.8790 },
  { area: 'New Palasia',           lat: 22.7260, lng: 75.8830 },
  { area: 'Race Course Road',      lat: 22.7280, lng: 75.8590 },
  { area: 'Pardeshipura',          lat: 22.7150, lng: 75.8490 },
  { area: 'Lasudia Mori',          lat: 22.7530, lng: 75.8270 },
  { area: 'Kanadiya Road',         lat: 22.7480, lng: 75.8350 },
  { area: 'Jamburi Maidan',        lat: 22.6960, lng: 75.8760 },
  { area: 'Chandan Nagar',         lat: 22.7430, lng: 75.9020 },
  { area: 'Khajrana',              lat: 22.7350, lng: 75.9060 },
  { area: 'Ranjit Hanuman',        lat: 22.7380, lng: 75.8940 },
];

/* ── Departments & matching complaint templates ── */
const TEMPLATES = [
  { department: 'Water Supply',           titles: ['No water supply since 3 days','Low water pressure in area','Water pipeline burst','Contaminated drinking water','Irregular water tanker schedule','Water meter malfunction','Rusty water from tap','Water logging near supply line','Water supply timing issue','No water in overhead tank'], descriptions: ['Residents have not received water supply for the past 3 days. Immediate attention required.','Water pressure is extremely low, barely a trickle from the tap. Affects multiple households.','A major pipeline has burst near the main road, wasting hundreds of liters daily.','The water from municipal supply appears yellowish and has foul smell.','The water tanker schedule is highly irregular, comes only once a week.','Water meter shows wrong readings, being charged for excess usage.','Water from the tap is rusty brown, unsafe for drinking.','Water logging near the supply line is causing contamination.','Water supply timings have been cut drastically without any notice.','The overhead tank has not been filled for a week now.'] },
  { department: 'Electricity',            titles: ['Frequent power cuts in colony','Street light not working','Electricity pole leaning dangerously','High voltage fluctuation damaging appliances','Transformer overloaded and sparking','No electricity for 24 hours','Broken electric wire on road','Electricity bill overcharged','Smart meter showing wrong units','Illegal electricity hookup reported'], descriptions: ['Power cuts happen 4–5 times a day, each lasting 2–3 hours. Very difficult for students and elderly.','Street lights on the main road have been off for over 2 weeks. Very unsafe at night.','An electricity pole is leaning at 45 degrees near a school, posing danger to children.','Voltage fluctuations have damaged my refrigerator and AC. MPEB must compensate.','The local transformer sparks at night and is clearly overloaded.','Entire colony has been without electricity since yesterday morning.','A broken electric wire is dangling on the road, extremely dangerous for pedestrians.','My electricity bill jumped from ₹800 to ₹5200 without any change in usage.','The newly installed smart meter is showing far more units than actual consumption.','A nearby shop has an illegal hookup, drawing power from the main line.'] },
  { department: 'Roads & Infrastructure',  titles: ['Massive pothole on main road','Road completely broken after rain','No speed breaker near school zone','Open manhole on busy street','Footpath encroachment by vendors','Road divider damaged by truck','Poor road marking causing accidents','Waterlogged road after light rain','Bridge railing broken','Under-construction road left incomplete'], descriptions: ['A massive pothole near the bus stop has caused 3 accidents this month.','After recent rains the entire road surface has disintegrated into gravel.','There is no speed breaker near the school. Vehicles pass at high speed posing risk to children.','An open manhole has been left uncovered for a week on a busy road. Someone already fell in.','Footpath is completely occupied by street vendors. Pedestrians forced to walk on road.','A truck hit the road divider and it is broken, causing confusion for drivers.','Lane markings have faded completely, leading to frequent accidents at the junction.','Even 30 minutes of rain causes knee-deep water logging on this road.','The railing on the flyover bridge is broken, creating a fatal risk for two-wheeler riders.','Road construction was started 3 months ago and abandoned midway.'] },
  { department: 'Sanitation',             titles: ['Garbage not collected for a week','Overflowing dustbin near hospital','Drain clogged and overflowing','Stray animal carcass on road','Open dumping ground near school','Unhygienic conditions near market','Sewage overflow in residential area','No dustbin provided in new colony','Public toilet not maintained','Garbage burning causing air pollution'], descriptions: ['Garbage has not been picked up from our colony for over 7 days. Foul smell everywhere.','The dustbin near the hospital is overflowing and attracting flies and stray dogs.','The main drain is completely choked and sewage water is flowing onto the street.','A dead stray animal has been lying on the road for 2 days. Nobody has removed it.','An illegal dumping ground has been set up barely 100 meters from a primary school.','The market area has piles of garbage and rotten vegetables attracting rats.','Raw sewage is flowing out of manholes into residential streets after recent rains.','Our newly developed colony has zero dustbins. Residents have to walk 500m to dump waste.','The community public toilet has no water supply and is extremely dirty.','Residents are burning garbage in the open every evening, causing severe air pollution.'] },
  { department: 'Education',              titles: ['School building in dilapidated condition','No teacher for math in govt school','Mid-day meal quality is poor','School has no drinking water facility','Playground occupied for construction','Shortage of textbooks this session','No computer lab in school','Toilet not functional in girls school','School building flooded in rain','Transfer certificates being delayed'], descriptions: ['The roof of the government school building leaks badly. Walls have cracks.','Our government school has had no math teacher for the last 6 months.','The mid-day meal served at the school is of very poor quality and children fall sick.','There is no clean drinking water facility in the school, children bring water from home.','The school playground has been occupied for a commercial construction project.','Many students have not received textbooks even 2 months into the session.','Despite government orders, the school still has no computer lab.','The girls toilet in the government school is non-functional. Girls miss school because of this.','Rainwater floods the school building every monsoon, classes get cancelled.','Our child passed 3 months ago but we still havent received the transfer certificate.'] },
  { department: 'Healthcare',             titles: ['No doctor available at PHC','Medicine stock out at dispensary','Ambulance took 2 hours to arrive','Hospital ward unhygienic','COVID vaccination center overcrowded','Blood bank refused to provide blood','Rude behavior by hospital staff','Mosquito breeding in neighborhood','No X-ray machine at government hospital','Fake medicines being sold nearby'], descriptions: ['The primary health center has no doctor after 2 PM. Patients are turned away.','Essential medicines like paracetamol and antibiotics are out of stock at the dispensary.','I called 108 for my mother and the ambulance took over 2 hours.','The general ward of the district hospital is extremely dirty with stained bedsheets.','The vaccination center had a 5 hour queue with no shade or water arrangement.','The blood bank refused to provide blood without a replacement donor, even in emergency.','Hospital staff behaved very rudely when I asked about my fathers treatment.','Stagnant water in the neighborhood is breeding mosquitoes. Dengue cases are rising.','The government hospital has no working X-ray machine. Patients sent to private labs.','A medical store near the hospital is allegedly selling counterfeit medicines.'] },
  { department: 'Public Transport',       titles: ['Bus route cancelled without notice','Auto rickshaw overcharging','City bus in very poor condition','No bus shelter at major stop','Bus driver driving recklessly','BRTS lane blocked by private vehicles','No night bus service available','Bus frequency reduced on route 12','Student pass not being honored','Overcrowded buses during peak hours'], descriptions: ['Bus route 22 to Rau has been cancelled without any public notice.','Auto drivers near the railway station are charging double the meter rate.','City bus number 7 has broken seats, no windows, and the engine emits black smoke.','The major bus stop at Palasia has no shelter; passengers stand in sun and rain.','The driver of route 14 bus drives at dangerous speed through residential areas.','Private cars and autos routinely block the BRTS lane, defeating its purpose.','There are no bus services after 9 PM. People stranded at night.','Bus frequency on route 12 has been reduced from every 15 min to every 45 min.','Bus conductors refuse to accept student bus passes and demand full fare.','During 8–10 AM buses are overcrowded with people literally hanging outside.'] },
  { department: 'Revenue',                titles: ['Property tax overassessed','Land record not updated after sale','Revenue office staff demanding bribe','Encroachment on government land','Delay in mutation of property','Wrong land survey causing dispute','Property ID not generated online','Revenue court hearing delayed 2 years','Stamp duty refund not processed','Duplicate property registration found'], descriptions: ['My property tax has been assessed at 3x the actual value. Reassessment requested.','I bought land 6 months ago but the revenue records still show the previous owner.','Revenue office staff openly demanded ₹5000 to process my land mutation file.','Government land near our colony is being encroached upon for illegal construction.','My mutation application has been pending for 8 months with no update.','An incorrect land survey has created a boundary dispute between two neighbors.','The online portal refuses to generate a property ID despite correct documents.','My revenue court case has not been heard for over 2 years due to adjournments.','My stamp duty refund for a cancelled property deal has not been processed for 1 year.','Two different registrations exist for the same property. This is causing legal trouble.'] },
  { department: 'Police',                 titles: ['Noise pollution from loudspeaker','Illegal parking blocking road','Theft in residential area','Stray dog menace in colony','Eve teasing near bus stop','Illegal liquor sale in neighborhood','Missing person complaint not filed','Chain snatching incident','Cyber fraud complaint','Drug peddling near school'], descriptions: ['A nearby marriage hall plays loudspeakers past midnight daily, violating noise norms.','Vehicles are illegally parked on both sides of the street making it impassable.','Multiple houses in our colony were burgled in the last month. No police action yet.','A pack of aggressive stray dogs has attacked 3 people in our colony this month.','Young girls are being harassed near the bus stop every evening.','An illegal country liquor outlet is operating openly in a residential neighborhood.','I tried to file a missing person complaint but the police station declined to register it.','My mothers gold chain was snatched by two men on a bike near the market.','I was defrauded of ₹25,000 through a fake online shopping website.','There are reports of drug peddling happening near the school gate after hours.'] },
  { department: 'Other',                  titles: ['Stray cattle blocking traffic','Tree fell on parked car','Community hall booking corruption','Unauthorized construction in colony','Park not maintained','Street dog sterilization needed','WiFi hotspot not working','Public bench vandalized','Playground encroached by builder','Fire hydrant not functional'], descriptions: ['Stray cattle sit on the main road every morning causing major traffic jams.','A large tree fell during the storm and damaged my parked car. Municipal inaction.','The booking clerk at the community hall is demanding extra money under the table.','A 4-story construction is happening without any approval in a residential zone.','The children park has broken swings, overgrown grass, and no lighting.','Over 30 stray dogs in our area need sterilization under the ABC program.','The government WiFi hotspot installed in our ward has not worked for 3 months.','Concrete benches in the garden were vandalized; pieces are scattered on walkway.','A builder has put up a boundary wall around the public playground.','The fire hydrant near our building has been non-functional for years.'] },
];

/* ── Statuses & priorities ── */
const STATUSES = ['Submitted', 'In Progress', 'Under Review', 'Resolved', 'Pending'];
const PRIORITIES = ['Low', 'Normal', 'Medium', 'High'];

/* ── Names pool ── */
const FIRST_NAMES = ['Rahul','Priya','Amit','Neha','Vikram','Sunita','Rohan','Anjali','Deepak','Kavita','Arun','Meena','Suresh','Pooja','Rajesh','Sneha','Manoj','Divya','Sanjay','Ritu','Kunal','Asha','Vivek','Nisha','Hemant','Swati','Pankaj','Rekha','Nitin','Lakshmi'];
const LAST_NAMES = ['Sharma','Patel','Singh','Gupta','Verma','Joshi','Rao','Mishra','Agarwal','Chauhan','Tiwari','Yadav','Malhotra','Saxena','Dubey','Bhatia','Soni','Thakur','Rathore','Pandit'];

/* ── Generate 101 complaints ── */
function generateComplaints() {
  const complaints = [];

  for (let i = 0; i < 101; i++) {
    const loc = LOCATIONS[i % LOCATIONS.length];
    const template = TEMPLATES[i % TEMPLATES.length];
    const titleIdx = i % template.titles.length;

    const firstName = randomItem(FIRST_NAMES);
    const lastName = randomItem(LAST_NAMES);
    const phone = `+91${String(Math.floor(7000000000 + Math.random() * 2999999999))}`;

    // Add small random jitter to coordinates for realism (±300m)
    const lat = loc.lat + randomBetween(-0.003, 0.003);
    const lng = loc.lng + randomBetween(-0.003, 0.003);

    // Random date in last 90 days
    const daysAgo = Math.floor(Math.random() * 90);
    const submittedDate = new Date();
    submittedDate.setDate(submittedDate.getDate() - daysAgo);

    const complaintId = generateId();

    complaints.push({
      complaintId,
      title: template.titles[titleIdx],
      department: template.department,
      category: template.department,
      description: template.descriptions[titleIdx],
      area: loc.area,
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
      status: randomItem(STATUSES),
      priority: randomItem(PRIORITIES),
      fileCount: Math.floor(Math.random() * 4),
      submittedAt: Timestamp.fromDate(submittedDate),
      user: {
        name: `${firstName} ${lastName}`,
        phone,
        userId: `USR-${String(Math.floor(100000 + Math.random() * 899999))}`
      }
    });
  }

  return complaints;
}

/* ── Push to Firestore in batches of 500 (Firestore limit) ── */
async function seed() {
  const complaints = generateComplaints();
  console.log(`\n📋 Generated ${complaints.length} mock complaints for Indore.\n`);

  // Firestore batch limit is 500 writes
  const batchSize = 400;
  for (let start = 0; start < complaints.length; start += batchSize) {
    const batch = writeBatch(db);
    const chunk = complaints.slice(start, start + batchSize);

    chunk.forEach((c) => {
      const ref = doc(collection(db, 'complaints'), c.complaintId);
      batch.set(ref, c);
    });

    await batch.commit();
    console.log(`  ✅ Pushed ${start + 1}–${start + chunk.length} / ${complaints.length}`);
  }

  console.log(`\n🎉 All ${complaints.length} complaints seeded into Firestore!\n`);

  // Print summary
  const deptCounts = {};
  const areaCounts = {};
  complaints.forEach((c) => {
    deptCounts[c.department] = (deptCounts[c.department] || 0) + 1;
    areaCounts[c.area] = (areaCounts[c.area] || 0) + 1;
  });
  console.log('Department-wise:');
  Object.entries(deptCounts).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  console.log('\nTop 10 locations:');
  Object.entries(areaCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
}

seed().catch(console.error);
