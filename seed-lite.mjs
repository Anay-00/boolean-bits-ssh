/**
 * Seed 101 complaints using firebase/firestore/lite (REST, no gRPC).
 * Run:  node seed-lite.mjs
 */

import { initializeApp }  from 'firebase/app';
import { getFirestore, doc, writeBatch, collection } from 'firebase/firestore/lite';

const firebaseConfig = {
  apiKey: 'AIzaSyBzK7OR6jM9ixjhQnLKORfwWcP9GLqVQrw',
  authDomain: 'ssh26-70e1e.firebaseapp.com',
  projectId: 'ssh26-70e1e',
  storageBucket: 'ssh26-70e1e.appspot.com',
  messagingSenderId: '938188293',
  appId: '1:938188293:web:abcdef123456'   // placeholder, not strictly needed
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── helpers ──
const pick  = a => a[Math.floor(Math.random() * a.length)];
const rnd   = (lo, hi) => lo + Math.random() * (hi - lo);
const genId = () => {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'GRV-';
  for (let i = 0; i < 6; i++) id += c[Math.floor(Math.random() * c.length)];
  return id;
};

const LOCATIONS = [
  {area:'Rajwada',lat:22.7196,lng:75.8577},{area:'Vijay Nagar',lat:22.7533,lng:75.8937},
  {area:'Palasia Square',lat:22.7235,lng:75.8817},{area:'Bhawarkua Square',lat:22.7120,lng:75.8680},
  {area:'Sapna Sangeeta Road',lat:22.7170,lng:75.8640},{area:'MR-10 Ring Road',lat:22.7450,lng:75.8200},
  {area:'Rau',lat:22.6600,lng:75.8550},{area:'Sudama Nagar',lat:22.6920,lng:75.8770},
  {area:'Nipania',lat:22.7620,lng:75.9100},{area:'Scheme No. 78',lat:22.7290,lng:75.8870},
  {area:'Scheme No. 54',lat:22.7310,lng:75.8760},{area:'Geeta Bhawan',lat:22.7140,lng:75.8720},
  {area:'LIG Colony',lat:22.7050,lng:75.8650},{area:'Mhow Naka',lat:22.6700,lng:75.8400},
  {area:'Pipliyahana',lat:22.7380,lng:75.8680},{area:'Super Corridor',lat:22.6800,lng:75.9100},
  {area:'Silicon City',lat:22.6810,lng:75.9110},{area:'Khandwa Road',lat:22.6850,lng:75.8650},
  {area:'AB Road (Bypass)',lat:22.6950,lng:75.8550},{area:'Annapurna Road',lat:22.7160,lng:75.8520},
  {area:'Mahalaxmi Nagar',lat:22.7470,lng:75.8830},{area:'Bicholi Mardana',lat:22.7580,lng:75.8400},
  {area:'Limbodi',lat:22.7680,lng:75.8320},{area:'Dewas Naka',lat:22.7550,lng:75.8600},
  {area:'Musakhedi',lat:22.7060,lng:75.8580},{area:'Chhoti Gwaltoli',lat:22.7210,lng:75.8550},
  {area:'Banganga',lat:22.7080,lng:75.8700},{area:'Tilak Nagar',lat:22.7320,lng:75.8650},
  {area:'Bhanwarkuan',lat:22.7395,lng:75.8690},{area:'Sneh Nagar',lat:22.7340,lng:75.8720},
  {area:'Old Palasia',lat:22.7240,lng:75.8790},{area:'New Palasia',lat:22.7260,lng:75.8830},
  {area:'Race Course Road',lat:22.7280,lng:75.8590},{area:'Pardeshipura',lat:22.7150,lng:75.8490},
  {area:'Lasudia Mori',lat:22.7530,lng:75.8270},{area:'Kanadiya Road',lat:22.7480,lng:75.8350},
  {area:'Jamburi Maidan',lat:22.6960,lng:75.8760},{area:'Chandan Nagar',lat:22.7430,lng:75.9020},
  {area:'Khajrana',lat:22.7350,lng:75.9060},{area:'Ranjit Hanuman',lat:22.7380,lng:75.8940}
];

const TEMPLATES = [
  {department:'Water Supply',titles:['No water supply since 3 days','Low water pressure in area','Water pipeline burst','Contaminated drinking water','Irregular water tanker schedule','Water meter malfunction','Rusty water from tap','Water logging near supply line','Water supply timing issue','No water in overhead tank'],descriptions:['Residents have not received water supply for the past 3 days.','Water pressure is extremely low, barely a trickle.','A major pipeline has burst near the main road.','Water appears yellowish with foul smell.','Water tanker schedule is highly irregular.','Water meter shows wrong readings.','Water from the tap is rusty brown.','Water logging near the supply line causing contamination.','Water supply timings cut drastically without notice.','Overhead tank has not been filled for a week.']},
  {department:'Electricity',titles:['Frequent power cuts in colony','Street light not working','Electricity pole leaning dangerously','High voltage fluctuation','Transformer overloaded and sparking','No electricity for 24 hours','Broken electric wire on road','Electricity bill overcharged','Smart meter wrong units','Illegal electricity hookup'],descriptions:['Power cuts happen 4-5 times a day, lasting 2-3 hours each.','Street lights off for over 2 weeks. Unsafe at night.','Electricity pole leaning at 45 degrees near school.','Voltage fluctuations have damaged appliances.','Local transformer sparks at night, clearly overloaded.','Entire colony without electricity since yesterday.','Broken wire dangling on road, extremely dangerous.','Bill jumped from 800 to 5200 without usage change.','Smart meter showing far more units than actual consumption.','Nearby shop has illegal hookup from main line.']},
  {department:'Roads & Infrastructure',titles:['Massive pothole on main road','Road broken after rain','No speed breaker near school','Open manhole on busy street','Footpath encroachment by vendors','Road divider damaged','Poor road marking','Waterlogged road after rain','Bridge railing broken','Road left incomplete'],descriptions:['Massive pothole near bus stop caused 3 accidents.','After rains entire road surface disintegrated.','No speed breaker near school, vehicles at high speed.','Open manhole uncovered for a week on busy road.','Footpath occupied by vendors, pedestrians on road.','Truck damaged road divider, confusion for drivers.','Lane markings faded, frequent accidents at junction.','30 minutes of rain causes knee-deep water logging.','Flyover bridge railing broken, fatal risk.','Road construction started 3 months ago, abandoned midway.']},
  {department:'Sanitation',titles:['Garbage not collected for a week','Overflowing dustbin near hospital','Drain clogged and overflowing','Stray animal carcass on road','Open dumping near school','Unhygienic market area','Sewage overflow in colony','No dustbin in new colony','Public toilet not maintained','Garbage burning pollution'],descriptions:['Garbage not picked up for over 7 days, foul smell.','Dustbin near hospital overflowing, attracting flies.','Main drain choked, sewage flowing onto street.','Dead stray animal on road for 2 days, not removed.','Illegal dumping ground 100m from primary school.','Market area has garbage piles attracting rats.','Raw sewage flowing out after recent rains.','New colony has zero dustbins, walk 500m to dump.','Community toilet has no water, extremely dirty.','Residents burning garbage every evening, air pollution.']},
  {department:'Education',titles:['School building dilapidated','No math teacher in govt school','Mid-day meal quality poor','No drinking water in school','Playground occupied','Textbook shortage','No computer lab','Girls toilet not functional','School floods in rain','Transfer certificate delayed'],descriptions:['Government school roof leaks badly, walls cracked.','No math teacher for last 6 months.','Mid-day meal very poor quality, children fall sick.','No clean drinking water, children bring from home.','School playground occupied for commercial construction.','Students missing textbooks 2 months into session.','School still has no computer lab despite orders.','Girls toilet non-functional, girls miss school.','Rainwater floods school every monsoon.','Transfer certificate not received for 3 months.']},
  {department:'Healthcare',titles:['No doctor at PHC','Medicine stock out','Ambulance took 2 hours','Hospital ward unhygienic','Vaccination center overcrowded','Blood bank refusal','Rude hospital staff','Mosquito breeding','No X-ray machine','Fake medicines nearby'],descriptions:['PHC has no doctor after 2 PM, patients turned away.','Essential medicines out of stock at dispensary.','Called 108, ambulance took over 2 hours.','General ward extremely dirty, stained bedsheets.','Vaccination center had 5 hour queue, no shade.','Blood bank refused without replacement donor.','Hospital staff very rude about treatment query.','Stagnant water breeding mosquitoes, dengue rising.','No working X-ray machine, patients sent to private.','Medical store allegedly selling counterfeit medicines.']},
  {department:'Public Transport',titles:['Bus route cancelled','Auto overcharging','City bus poor condition','No bus shelter','Bus driver reckless','BRTS lane blocked','No night bus service','Bus frequency reduced','Student pass not honored','Overcrowded buses'],descriptions:['Bus route to Rau cancelled without notice.','Auto drivers charging double near railway station.','Bus has broken seats, no windows, black smoke.','Major bus stop has no shelter for sun and rain.','Route 14 driver at dangerous speed in residential area.','Private vehicles block BRTS lane routinely.','No bus services after 9 PM, people stranded.','Bus frequency reduced from 15 min to 45 min.','Conductors refuse student passes, demand full fare.','Buses overcrowded 8-10 AM, people hanging outside.']},
  {department:'Revenue',titles:['Property tax overassessed','Land record not updated','Revenue staff demanding bribe','Encroachment on govt land','Mutation delay','Wrong land survey','Property ID issue','Revenue court delayed','Stamp duty refund pending','Duplicate registration'],descriptions:['Property tax assessed at 3x actual value.','Land bought 6 months ago, records show old owner.','Revenue staff openly demanded 5000 for mutation.','Government land being encroached for construction.','Mutation pending 8 months, no update.','Wrong survey causing boundary dispute.','Online portal refuses to generate property ID.','Revenue court case not heard for 2 years.','Stamp duty refund not processed for 1 year.','Two registrations for same property, legal trouble.']},
  {department:'Police',titles:['Noise pollution loudspeaker','Illegal parking blocking road','Theft in residential area','Stray dog menace','Eve teasing near bus stop','Illegal liquor sale','Missing person not filed','Chain snatching','Cyber fraud complaint','Drug peddling near school'],descriptions:['Marriage hall plays loudspeakers past midnight.','Illegal parking on both sides, road impassable.','Multiple houses burgled last month, no action.','Aggressive stray dogs attacked 3 people this month.','Girls harassed near bus stop every evening.','Illegal liquor outlet in residential area.','Police declined to register missing person complaint.','Gold chain snatched by two men on bike.','Defrauded 25000 through fake online website.','Drug peddling near school gate after hours.']},
  {department:'Other',titles:['Stray cattle blocking traffic','Tree fell on car','Community hall corruption','Unauthorized construction','Park not maintained','Dog sterilization needed','WiFi hotspot not working','Public bench vandalized','Playground encroached','Fire hydrant broken'],descriptions:['Stray cattle on road every morning, traffic jams.','Tree fell during storm, damaged parked car.','Community hall clerk demanding extra money.','4-story construction without approval.','Children park has broken swings, no lighting.','30+ stray dogs need sterilization.','Government WiFi hotspot broken for 3 months.','Concrete benches vandalized, pieces on walkway.','Builder put boundary wall around public playground.','Fire hydrant non-functional for years.']}
];

const STATUSES   = ['Submitted','In Progress','Under Review','Resolved','Pending'];
const PRIORITIES = ['Low','Normal','Medium','High'];
const FIRST = ['Rahul','Priya','Amit','Neha','Vikram','Sunita','Rohan','Anjali','Deepak','Kavita','Arun','Meena','Suresh','Pooja','Rajesh','Sneha','Manoj','Divya','Sanjay','Ritu','Kunal','Asha','Vivek','Nisha','Hemant','Swati','Pankaj','Rekha','Nitin','Lakshmi'];
const LAST  = ['Sharma','Patel','Singh','Gupta','Verma','Joshi','Rao','Mishra','Agarwal','Chauhan','Tiwari','Yadav','Malhotra','Saxena','Dubey','Bhatia','Soni','Thakur','Rathore','Pandit'];

function generateComplaints() {
  const list = [];
  for (let i = 0; i < 101; i++) {
    const loc = LOCATIONS[i % LOCATIONS.length];
    const tpl = TEMPLATES[i % TEMPLATES.length];
    const ti  = i % tpl.titles.length;
    const daysAgo = Math.floor(Math.random() * 90);
    const dt = new Date(); dt.setDate(dt.getDate() - daysAgo);
    const phone = '+91' + String(Math.floor(7000000000 + Math.random() * 2999999999));

    list.push({
      complaintId : genId(),
      title       : tpl.titles[ti],
      department  : tpl.department,
      category    : tpl.department,
      description : tpl.descriptions[ti],
      area        : loc.area,
      lat         : parseFloat((loc.lat + rnd(-0.003, 0.003)).toFixed(6)),
      lng         : parseFloat((loc.lng + rnd(-0.003, 0.003)).toFixed(6)),
      status      : pick(STATUSES),
      priority    : pick(PRIORITIES),
      fileCount   : Math.floor(Math.random() * 4),
      submittedAt : dt,
      user        : {
        name   : pick(FIRST) + ' ' + pick(LAST),
        phone,
        userId : 'USR-' + String(Math.floor(100000 + Math.random() * 899999))
      }
    });
  }
  return list;
}

async function main() {
  console.log('Generating 101 mock complaints for Indore...');
  const complaints = generateComplaints();
  console.log(`Generated ${complaints.length} complaints.\n`);

  // firebase/firestore/lite does not have writeBatch - use individual writes
  const { setDoc } = await import('firebase/firestore/lite');

  for (let i = 0; i < complaints.length; i++) {
    const c = complaints[i];
    const ref = doc(db, 'complaints', c.complaintId);
    try {
      await setDoc(ref, c);
      if ((i + 1) % 10 === 0 || i === complaints.length - 1) {
        console.log(`  ✅ ${i + 1} / ${complaints.length} written`);
      }
    } catch (err) {
      console.error(`  ❌ Error writing ${c.complaintId}: ${err.message}`);
      process.exit(1);
    }
  }

  console.log(`\n🎉 All ${complaints.length} complaints seeded into Firestore!\n`);

  const deptCounts = {};
  complaints.forEach(c => { deptCounts[c.department] = (deptCounts[c.department] || 0) + 1; });
  console.log('── Department breakdown ──');
  Object.entries(deptCounts).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(`  ${k}: ${v}`));
}

main().catch(err => { console.error(err); process.exit(1); });
