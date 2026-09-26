import axios from "axios";

const API = "http://localhost:5000/api";

async function runTests() {
  console.log("=== STARTING TECHNICIAN PORTAL VERIFICATION TESTS ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Register a fresh test technician
    const testEmail = `tech_${Date.now()}@example.com`;
    const testPassword = "Password123!";
    console.log(`\n1. Registering test technician with category 'Electrical': ${testEmail}`);
    
    const regRes = await axios.post(`${API}/auth/register-technician`, {
      name: "Suresh Sharma",
      email: testEmail,
      password: testPassword,
      phone: "+91 98111 22334",
      category: "Electrical",
      service_areas: "Central Delhi, South Delhi",
      experience_years: 4,
      account_type: "individual",
    });

    assert(regRes.data.success, "Technician registered successfully");

    // Login to obtain JWT session token
    const loginRes = await axios.post(`${API}/professional/auth/login`, {
      identifier: testEmail,
      password: testPassword,
    });

    const token = loginRes.data.token;
    const techUser = loginRes.data.user;
    assert(techUser && token, "Token and user profile received from professional login");

    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2. Fetch dashboard summary
    console.log("\n2. Verifying initial dashboard summary & status");
    const summaryRes = await axios.get(`${API}/technicians/dashboard-summary`, { headers: authHeaders });
    const techData = summaryRes.data.technician;
    assert(techData.name === "Suresh Sharma", `Authentic name returned: ${techData.name}`);
    assert(techData.category === "Electrical", `Category initialized to Electrical: ${techData.category}`);
    assert(summaryRes.data.availability === "OFFLINE", "New technician initially OFFLINE");

    // 3. Test Availability Toggle (Offline -> Online -> Offline)
    console.log("\n3. Testing Online / Offline Toggle");
    const onlineRes = await axios.put(`${API}/technicians/availability`, { is_online: true }, { headers: authHeaders });
    assert(onlineRes.data.is_online === 1, "Toggled availability to ONLINE");

    const summaryAfterOnline = await axios.get(`${API}/technicians/dashboard-summary`, { headers: authHeaders });
    assert(summaryAfterOnline.data.availability === "ONLINE", "Dashboard summary reports ONLINE");

    const offlineRes = await axios.put(`${API}/technicians/availability`, { is_online: false }, { headers: authHeaders });
    assert(offlineRes.data.is_online === 0, "Toggled availability back to OFFLINE");

    // 4. Test Large Profile Picture Upload (Sync Across Devices)
    console.log("\n4. Testing Large Profile Picture Upload (Base64)");
    // Generate a ~300KB dummy base64 image (larger than default express 100KB limit)
    const largeBase64 = "data:image/jpeg;base64," + "A".repeat(300 * 1024);
    
    const profileUpdateRes = await axios.put(
      `${API}/technicians/profile`,
      {
        avatar: largeBase64,
        phone: "+91 98111 99999",
      },
      { headers: authHeaders }
    );
    assert(profileUpdateRes.data.success, "Profile update with 300KB avatar accepted without 413 error");
    assert(profileUpdateRes.data.user.avatar === largeBase64, "Updated avatar returned in response");

    // Fetch dashboard summary to verify cross-device persistence from SQLite DB
    const summaryAvatar = await axios.get(`${API}/technicians/dashboard-summary`, { headers: authHeaders });
    assert(summaryAvatar.data.technician.avatar === largeBase64, "Avatar persisted in SQLite database and returned on fresh fetch");

    // 5. Test Primary Category Locking Rule (Requirement 4)
    console.log("\n5. Testing Primary Category Locking Rule");
    const categoryAttemptRes = await axios.put(
      `${API}/technicians/profile`,
      {
        category: "Plumbing", // attempt to change locked category
      },
      { headers: authHeaders }
    );
    assert(categoryAttemptRes.data.user.technician.category === "Electrical", "Primary category remains locked to 'Electrical', cannot be changed to 'Plumbing'");

    // 6. Test Additional Services Management (Requirement 4)
    console.log("\n6. Testing Additional Services Management");
    const additionalServicesList = ["Home Wiring", "Fan Installation", "Short Circuit Repair"];
    const addServicesRes = await axios.put(
      `${API}/technicians/profile`,
      {
        additional_categories: JSON.stringify(additionalServicesList),
      },
      { headers: authHeaders }
    );
    assert(addServicesRes.data.success, "Additional services updated");
    
    const summaryAddServices = await axios.get(`${API}/technicians/dashboard-summary`, { headers: authHeaders });
    const parsedAddServices = JSON.parse(summaryAddServices.data.technician.additional_categories || "[]");
    assert(parsedAddServices.length === 3 && parsedAddServices[0] === "Home Wiring", "Additional services persisted and verified in DB");

    // 7. Test Work Experience Proof Persistence (Requirement 6)
    console.log("\n7. Testing Work Experience Proof Persistence");
    const workProofsList = [
      {
        id: "proof-101",
        title: "Main Distribution Board Wiring",
        category: "Completed Project Photo",
        imageUrl: "data:image/jpeg;base64," + "B".repeat(50 * 1024),
        uploadedAt: "26 Sep 2026",
      },
      {
        id: "proof-102",
        title: "National Trade Certificate (NTC) Electrician",
        category: "Trade Certificate",
        imageUrl: "data:image/jpeg;base64," + "C".repeat(50 * 1024),
        uploadedAt: "26 Sep 2026",
      },
    ];

    const proofRes = await axios.put(
      `${API}/technicians/profile`,
      {
        work_proofs: JSON.stringify(workProofsList),
      },
      { headers: authHeaders }
    );
    assert(proofRes.data.success, "Work proofs saved via profile endpoint");

    const summaryProofs = await axios.get(`${API}/technicians/dashboard-summary`, { headers: authHeaders });
    const parsedProofs = JSON.parse(summaryProofs.data.technician.work_proofs || "[]");
    assert(parsedProofs.length === 2 && parsedProofs[0].title === "Main Distribution Board Wiring", "Work proofs persisted in SQLite DB and retrieved in summary");

    // 8. Test Document-Based Verification (Requirement 5)
    console.log("\n8. Testing Document-Based Verification Status");
    // Initially without document: Not Verified
    const docRes = await axios.put(
      `${API}/technicians/profile`,
      {
        id_document_type: "Aadhaar Card",
        id_document_url: "data:image/jpeg;base64," + "D".repeat(40 * 1024),
      },
      { headers: authHeaders }
    );
    assert(docRes.data.success, "ID document uploaded successfully");

    const summaryDoc = await axios.get(`${API}/technicians/dashboard-summary`, { headers: authHeaders });
    assert(summaryDoc.data.technician.status === "Pending Verification", "Status reflects 'Pending Verification' upon document submission");

    // Admin approves verification
    const adminApprove = await axios.put(
      `${API}/technicians/${techData.id}/verification-status`,
      { status: "Approved" },
      { headers: authHeaders }
    );
    assert(adminApprove.data.status === "Approved", "Admin verification approval succeeded");

    const summaryApproved = await axios.get(`${API}/technicians/dashboard-summary`, { headers: authHeaders });
    assert(summaryApproved.data.technician.status === "Approved", "Technician profile status is now Approved");

    // 9. Active Job Offline Prevention Rule (Active Job Rule)
    console.log("\n9. Testing Active Job Offline Prevention Rule");
    // Switch tech back online
    await axios.put(`${API}/technicians/availability`, { is_online: true }, { headers: authHeaders });

    // Create and assign a service request using a fresh customer
    const custEmail = `cust_${Date.now()}@example.com`;
    const custReg = await axios.post(`${API}/auth/register`, {
      name: "Test Customer",
      email: custEmail,
      password: "Password123!",
      phone: "+91 98765 43210",
      role: "customer",
    });
    const custToken = custReg.data.token;

    const reqRes = await axios.post(
      `${API}/requests/book-instantly`,
      {
        category: "Electrical",
        serviceName: "Emergency Wiring Repair",
        description: "Sparking switchboard in kitchen",
        address: "South Extension Part 2, New Delhi",
        lat: 28.5678,
        lon: 77.2189,
        paymentMethod: "UPI",
        price: "799",
      },
      { headers: { Authorization: `Bearer ${custToken}` } }
    );

    const jobId = reqRes.data.request?.id || reqRes.data.booking?.id || reqRes.data.id;
    if (jobId) {
      // Accept job
      await axios.post(`${API}/technicians/jobs/${jobId}/accept`, {}, { headers: authHeaders });

      // Attempt to toggle offline while active job exists
      try {
        await axios.put(`${API}/technicians/availability`, { is_online: false }, { headers: authHeaders });
        assert(false, "Should NOT allow going offline during active job");
      } catch (err) {
        assert(
          err.response?.status === 400 &&
          err.response?.data?.error?.includes("active service"),
          `Offline blocked with active service error: "${err.response?.data?.error}"`
        );
      }

      // Complete job
      // Sequence: ON_THE_WAY -> ARRIVED -> IN_PROGRESS -> COMPLETED
      await axios.post(`${API}/technicians/jobs/${jobId}/status`, { newStatus: "ON_THE_WAY" }, { headers: authHeaders });
      await axios.post(
        `${API}/technicians/jobs/${jobId}/status`,
        { newStatus: "ARRIVED", lat: 28.5678, lng: 77.2189 },
        { headers: authHeaders }
      );
      await axios.post(`${API}/technicians/jobs/${jobId}/status`, { newStatus: "IN_PROGRESS" }, { headers: authHeaders });
      await axios.post(`${API}/technicians/jobs/${jobId}/complete`, {}, { headers: authHeaders });

      // Now toggle offline should succeed
      const offlineAfterJob = await axios.put(`${API}/technicians/availability`, { is_online: false }, { headers: authHeaders });
      assert(offlineAfterJob.data.is_online === 0, "Going offline succeeds once service is completed");
    }

  } catch (err) {
    console.error("Test execution error:", err.response?.data || err.message);
    failed++;
  }

  console.log("\n=======================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================");
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
