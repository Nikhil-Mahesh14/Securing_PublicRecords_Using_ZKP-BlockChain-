import User from "../models/user.model.js";

const users = [
  { name: "System Admin", email: "admin@secure-records.gov", password: "Admin@12345", role: "Admin" },
  { name: "Gov Officer", email: "officer@secure-records.gov", password: "Officer@12345", role: "Government Officer" },
  { name: "Record Verifier", email: "verifier@secure-records.gov", password: "Verifier@12345", role: "Verifier" }
];

export async function seedDemoUsers() {
  if (process.env.SEED_DEMO_USERS !== "true") return;

  for (const user of users) {
    const exists = await User.exists({ email: user.email });
    if (!exists) {
      await User.create(user);
    }
  }
}

