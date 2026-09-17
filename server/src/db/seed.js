import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { query, initDb } from "./database.js";
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, initDb } from './database.js';

async function seed() {
  await initDb();
  console.log("Seeding initial system data...");
  console.log('Seeding initial system data with authentic Delhi NCR coordinates and profiles...');

  // Clear existing records to ensure fresh state
  await query.run("DELETE FROM status_logs");
  await query.run("DELETE FROM service_requests");
  await query.run("DELETE FROM technicians");
  await query.run("DELETE FROM users");
  await query.run('DELETE FROM status_logs');
  await query.run('DELETE FROM service_requests');
  await query.run('DELETE FROM technicians');
  await query.run('DELETE FROM users');

  const passwordAdmin = bcrypt.hashSync("admin123", 10);
  const passwordCustomer = bcrypt.hashSync("customer123", 10);
  const passwordTech = bcrypt.hashSync("tech123", 10);
  const passwordAdmin = bcrypt.hashSync('admin123', 10);
  const passwordCustomer = bcrypt.hashSync('customer123', 10);
  const passwordTech = bcrypt.hashSync('tech123', 10);

  // 1. Admin
  // 1. Admin (Central Delhi Operations Room)
  const adminId = uuidv4();
  await query.run(
    `INSERT INTO users (id, name, email, password_hash, role, phone, address, latitude, longitude)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      adminId,
      "Chief Dispatch Officer",
      "admin@demo.com",
      'Chief Dispatch Officer',
      'admin@demo.com',
      passwordAdmin,
      "admin",
      "+1 (555) 911-0000",
      "Emergency Operations HQ, 1 Centre St, New York, NY",
      40.7128,
      -74.006,
    ],
      'admin',
      '+91 11 2345 6789',
      'Urban Company Operations HQ, Barakhamba Road, Connaught Place, New Delhi 110001',
      28.6290,
      77.2250
    ]
  );

  // 2. Customers
  // 2. Customers (Delhi NCR)
  const customer1Id = uuidv4();
  await query.run(
    `INSERT INTO users (id, name, email, password_hash, role, phone, address, latitude, longitude)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      customer1Id,
      "Michael Sterling",
      "customer@demo.com",
      'Rahul Sharma',
      'customer@demo.com',
      passwordCustomer,
      "customer",
      "+1 (555) 345-6789",
      "45 Wall Street, Apt 8B, New York, NY",
      40.7075,
      -74.009,
    ],
      'customer',
      '+91 98111 23456',
      'Flat 402, Block B, Connaught Place, New Delhi 110001',
      28.6328,
      77.2195
    ]
  );

  const customer2Id = uuidv4();
  await query.run(
    `INSERT INTO users (id, name, email, password_hash, role, phone, address, latitude, longitude)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      customer2Id,
      "Sarah Jenkins",
      "sarah@demo.com",
      'Priya Malhotra',
      'sarah@demo.com',
      passwordCustomer,
      "customer",
      "+1 (555) 456-7890",
      "120 W 10th St, New York, NY",
      40.7335,
      -73.9985,
    ],
      'customer',
      '+91 98222 34567',
      'A-42, Hauz Khas Enclave, South Delhi 110016',
      28.5494,
      77.2001
    ]
  );

  // 3. Technicians
  // 3. Technicians across Delhi NCR Grid (within 1 to 4 km of Connaught Place)
  const techniciansData = [
    {
      name: "Alex Rivera",
      email: "tech.plumber@demo.com",
      phone: "+1 (555) 801-1122",
      category: "Plumbing",
      lat: 40.715,
      lon: -74.002,
      name: 'Rajesh Kumar',
      email: 'tech.plumber@demo.com',
      phone: '+91 98101 11223',
      category: 'Plumbing',
      lat: 28.6517,
      lon: 77.1906, // Karol Bagh (~2.4 km from Connaught Place)
      rating: 4.9,
      total_jobs: 142,
      vehicle: "Rapid Service Van",
      response_avg: 12.3,
      vehicle: 'Rapid Service Van',
      response_avg: 11.8
    },
    {
      name: "David Chen",
      email: "tech.electric@demo.com",
      phone: "+1 (555) 802-3344",
      category: "Electrical",
      lat: 40.722,
      lon: -74.004,
      name: 'Vikram Singh',
      email: 'tech.electric@demo.com',
      phone: '+91 98202 33445',
      category: 'Electrical',
      lat: 28.5677,
      lon: 77.2433, // Lajpat Nagar 2 (~3.5 km)
      rating: 4.8,
      total_jobs: 98,
      vehicle: "Utility Truck",
      response_avg: 14.8,
      vehicle: 'Utility Bike Unit',
      response_avg: 13.5
    },
    {
      name: "Marcus Johnson",
      email: "tech.hvac@demo.com",
      phone: "+1 (555) 803-5566",
      category: "HVAC",
      lat: 40.7095,
      lon: -74.0125,
      name: 'Amit Patel',
      email: 'tech.hvac@demo.com',
      phone: '+91 98303 55667',
      category: 'HVAC',
      lat: 28.6275,
      lon: 77.2280, // Mandi House / Barakhamba (~0.9 km)
      rating: 4.9,
      total_jobs: 120,
      vehicle: "HVAC Mobile Unit",
      response_avg: 11.5,
      vehicle: 'AC Express Van',
      response_avg: 9.5
    },
    {
      name: "Elena Rostova",
      email: "tech.appliance@demo.com",
      phone: "+1 (555) 804-7788",
      category: "Appliance",
      lat: 40.735,
      lon: -73.991,
      name: 'Sunita Sharma',
      email: 'tech.appliance@demo.com',
      phone: '+91 98404 77889',
      category: 'Appliance',
      lat: 28.6375,
      lon: 77.2950, // Preet Vihar (~4.2 km)
      rating: 4.7,
      total_jobs: 85,
      vehicle: "Express Moto-Van",
      response_avg: 16.2,
      vehicle: 'Appliance Moto-Van',
      response_avg: 14.2
    },
    {
      name: "Carlos Gomez",
      email: "tech.locksmith@demo.com",
      phone: "+1 (555) 805-9900",
      category: "Locksmith",
      lat: 40.711,
      lon: -74.007,
      name: 'Manoj Verma',
      email: 'tech.locksmith@demo.com',
      phone: '+91 98505 99001',
      category: 'Locksmith',
      lat: 28.6430,
      lon: 77.2140, // Paharganj (~1.2 km)
      rating: 4.9,
      total_jobs: 165,
      vehicle: "Locksmith Rapid Bike",
      response_avg: 9.8,
      vehicle: 'Locksmith Rapid Bike',
      response_avg: 8.4
    },
    {
      name: "Samira Khan",
      email: "tech.gas@demo.com",
      phone: "+1 (555) 806-1234",
      category: "Gas Leak",
      lat: 40.721,
      lon: -74.0115,
      name: 'Samira Khan',
      email: 'tech.gas@demo.com',
      phone: '+91 98606 12345',
      category: 'Gas Leak',
      lat: 28.6730,
      lon: 77.1700, // Inderlok (~3.8 km)
      rating: 5.0,
      total_jobs: 76,
      vehicle: "Hazmat Response Van",
      response_avg: 8.4,
    },
      vehicle: 'Gas Safety Hazmat Van',
      response_avg: 7.9
    }
  ];

  const createdTechs = [];

  for (const t of techniciansData) {
    const userId = uuidv4();
    const techId = uuidv4();

    await query.run(
      `INSERT INTO users (id, name, email, password_hash, role, phone, address, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        t.name,
        t.email,
        passwordTech,
        "technician",
        t.phone,
        "Mobile Technician Unit",
        t.lat,
        t.lon,
      ],
      [userId, t.name, t.email, passwordTech, 'technician', t.phone, `${t.category} Mobile Unit, Delhi NCR`, t.lat, t.lon]
    );

    await query.run(
      `INSERT INTO technicians (id, user_id, category, latitude, longitude, is_online, is_busy, rating, total_jobs, vehicle_type, response_time_avg)
       VALUES (?, ?, ?, ?, ?, 1, 0, ?, ?, ?, ?)`,
      [
        techId,
        userId,
        t.category,
        t.lat,
        t.lon,
        t.rating,
        t.total_jobs,
        t.vehicle,
        t.response_avg,
      ],
      [techId, userId, t.category, t.lat, t.lon, t.rating, t.total_jobs, t.vehicle, t.response_avg]
    );

    createdTechs.push({ ...t, techId, userId });
  }

  // 4. Past Completed Service Requests for historical audit and analytics
  const plumberTech = createdTechs.find((t) => t.category === "Plumbing");
  const electricTech = createdTechs.find((t) => t.category === "Electrical");
  const hvacTech = createdTechs.find((t) => t.category === "HVAC");
  const locksmithTech = createdTechs.find((t) => t.category === "Locksmith");
  // 4. Past Completed Service Requests in Delhi NCR
  const plumberTech = createdTechs.find(t => t.category === 'Plumbing');
  const electricTech = createdTechs.find(t => t.category === 'Electrical');
  const hvacTech = createdTechs.find(t => t.category === 'HVAC');
  const locksmithTech = createdTechs.find(t => t.category === 'Locksmith');

  const pastRequests = [
    {
      id: uuidv4(),
      customerId: customer1Id,
      techId: plumberTech.techId,
      category: "Plumbing",
      priority: "Critical",
      description: "Burst main water pipe flooding kitchen and basement",
      address: "45 Wall Street, Apt 8B, New York, NY",
      lat: 40.7075,
      lon: -74.009,
      status: "COMPLETED",
      eta: 12,
      distance: 1.1,
      category: 'Plumbing',
      priority: 'Critical',
      description: 'Kitchen main copper pipe burst under sink, water flooding entire living room and balcony',
      address: 'Flat 402, Block B, Connaught Place, New Delhi 110001',
      lat: 28.6328,
      lon: 77.2195,
      status: 'COMPLETED',
      eta: 11,
      distance: 2.1,
      rating: 5,
      feedback:
        "Alex arrived in 11 minutes! Shut off the emergency valve and replaced the copper coupling immediately. Saved our floor!",
      createdOffsetHours: 48,
      feedback: 'Rajesh arrived in under 11 minutes from Karol Bagh! Immediately shut off the main valve and fixed the coupling. Exceptional emergency service!',
      createdOffsetHours: 48
    },
    {
      id: uuidv4(),
      customerId: customer2Id,
      techId: electricTech.techId,
      category: "Electrical",
      priority: "High",
      description: "Main breaker sparking, burning smell throughout apartment",
      address: "120 W 10th St, New York, NY",
      lat: 40.7335,
      lon: -73.9985,
      status: "COMPLETED",
      eta: 15,
      distance: 2.3,
      category: 'Electrical',
      priority: 'High',
      description: 'Main MCB distribution box sparking with heavy burning plastic smell in bedroom',
      address: 'A-42, Hauz Khas Enclave, South Delhi 110016',
      lat: 28.5494,
      lon: 77.2001,
      status: 'COMPLETED',
      eta: 13,
      distance: 3.2,
      rating: 5,
      feedback:
        "David was super professional, isolated the short circuit and safely restored power. Fantastic emergency service.",
      createdOffsetHours: 24,
      feedback: 'Vikram identified a dangerous loose neutral wire and replaced the faulty MCB. Very skilled technician.',
      createdOffsetHours: 24
    },
    {
      id: uuidv4(),
      customerId: customer1Id,
      techId: hvacTech.techId,
      category: "HVAC",
      priority: "High",
      description: "Heating furnace shutdown during sub-zero cold snap",
      address: "45 Wall Street, Apt 8B, New York, NY",
      lat: 40.7075,
      lon: -74.009,
      status: "COMPLETED",
      eta: 10,
      distance: 0.8,
      rating: 4,
      feedback: "Quick dispatch, fixed the thermocouple within 30 minutes.",
      createdOffsetHours: 12,
      category: 'HVAC',
      priority: 'High',
      description: 'Split AC compressor failure during 45°C Delhi heatwave with elderly parents at home',
      address: 'Flat 402, Block B, Connaught Place, New Delhi 110001',
      lat: 28.6328,
      lon: 77.2195,
      status: 'COMPLETED',
      eta: 9,
      distance: 0.9,
      rating: 5,
      feedback: 'Amit arrived in 9 mins from Barakhamba road. Replaced capacitor and restored ice-cold cooling quickly.',
      createdOffsetHours: 12
    },
    {
      id: uuidv4(),
      customerId: customer2Id,
      techId: locksmithTech.techId,
      category: "Locksmith",
      priority: "Critical",
      description: "Child accidentally locked inside bedroom with hot iron on",
      address: "120 W 10th St, New York, NY",
      lat: 40.7335,
      lon: -73.9985,
      status: "COMPLETED",
      category: 'Locksmith',
      priority: 'Critical',
      description: 'Main smart entrance lock jammed with 2-year old child alone inside kitchen',
      address: 'A-42, Hauz Khas Enclave, South Delhi 110016',
      lat: 28.5494,
      lon: 77.2001,
      status: 'COMPLETED',
      eta: 8,
      distance: 0.9,
      distance: 1.4,
      rating: 5,
      feedback:
        "Carlos unlocked the high-security door in under 3 minutes upon arriving. Lifesaver!",
      createdOffsetHours: 6,
    },
      feedback: 'Manoj bypassed the deadbolt within 3 minutes without damaging the door frame. True lifesaver!',
      createdOffsetHours: 6
    }
  ];

  for (const req of pastRequests) {
    const createdAt = new Date(
      Date.now() - req.createdOffsetHours * 3600 * 1000,
    ).toISOString();
    const updatedAt = new Date(
      Date.now() - (req.createdOffsetHours - 1) * 3600 * 1000,
    ).toISOString();
    const createdAt = new Date(Date.now() - req.createdOffsetHours * 3600 * 1000).toISOString();
    const updatedAt = new Date(Date.now() - (req.createdOffsetHours - 1) * 3600 * 1000).toISOString();

    await query.run(
      `INSERT INTO service_requests (id, customer_id, technician_id, category, priority, description, address, latitude, longitude, status, eta_minutes, distance_km, rating, feedback, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.id,
        req.customerId,
        req.techId,
        req.category,
        req.priority,
        req.description,
        req.address,
        req.lat,
        req.lon,
        req.status,
        req.eta,
        req.distance,
        req.rating,
        req.feedback,
        createdAt,
        updatedAt,
      ],
      [req.id, req.customerId, req.techId, req.category, req.priority, req.description, req.address, req.lat, req.lon, req.status, req.eta, req.distance, req.rating, req.feedback, createdAt, updatedAt]
    );

    // Status logs
    const stages = [
      {
        old: null,
        new: "REQUESTED",
        note: "Emergency request created by customer",
      },
      {
        old: "REQUESTED",
        new: "AUTO_DISPATCHED",
        note: "Auto-dispatch engine evaluated 4 candidates. Matched optimal unit.",
      },
      {
        old: "AUTO_DISPATCHED",
        new: "ACCEPTED",
        note: "Technician confirmed dispatch acceptance within 18s.",
      },
      {
        old: "ACCEPTED",
        new: "ON_THE_WAY",
        note: "Technician en route with emergency equipment.",
      },
      {
        old: "ON_THE_WAY",
        new: "ARRIVED",
        note: "Technician reached customer premises.",
      },
      {
        old: "ARRIVED",
        new: "IN_PROGRESS",
        note: "Emergency diagnostics & repair commenced.",
      },
      {
        old: "IN_PROGRESS",
        new: "COMPLETED",
        note: "Work verified safe, customer signed off.",
      },
      { old: null, new: 'REQUESTED', note: 'Emergency request received from Delhi NCR customer' },
      { old: 'REQUESTED', new: 'AUTO_DISPATCHED', note: 'Auto-dispatch engine matched optimal technician in Delhi NCR.' },
      { old: 'AUTO_DISPATCHED', new: 'ACCEPTED', note: 'Technician confirmed dispatch acceptance within 14s.' },
      { old: 'ACCEPTED', new: 'ON_THE_WAY', note: 'Technician en route with emergency kit.' },
      { old: 'ON_THE_WAY', new: 'ARRIVED', note: 'Technician arrived at doorstep.' },
      { old: 'ARRIVED', new: 'IN_PROGRESS', note: 'Emergency repair commenced.' },
      { old: 'IN_PROGRESS', new: 'COMPLETED', note: 'Work verified safe, customer signoff received.' }
    ];

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const logTime = new Date(
        new Date(createdAt).getTime() + i * 10 * 60 * 1000,
      ).toISOString();
      const logTime = new Date(new Date(createdAt).getTime() + i * 10 * 60 * 1000).toISOString();
      await query.run(
        `INSERT INTO status_logs (id, request_id, old_status, new_status, timestamp, note)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), req.id, stage.old, stage.new, logTime, stage.note],
        [uuidv4(), req.id, stage.old, stage.new, logTime, stage.note]
      );
    }
  }

  console.log(
    "Database seeded successfully with demo users, technicians, and historical requests!",
  );
  console.log('Database successfully seeded with authentic Delhi NCR locations, technicians, and requests!');
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
