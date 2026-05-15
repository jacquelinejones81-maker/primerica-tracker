import React, { useState, useEffect, useMemo } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection } from "firebase/firestore";

// ─── FIREBASE CONFIG ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDb9DiueYc3zuqSb3hANNPenu9RVvbJLHM",
  authDomain: "checklist-app-ad0fe.firebaseapp.com",
  projectId: "checklist-app-ad0fe",
  storageBucket: "checklist-app-ad0fe.firebasestorage.app",
  messagingSenderId: "603671435017",
  appId: "1:603671435017:web:2c640ae2393f98d12da5d8",
  measurementId: "G-9K9P6PH53E"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// ─── FIREBASE HELPERS ─────────────────────────────────────────────────────────
async function fbSave(key, data) {
  try {
    await setDoc(doc(db, "appdata", key), { value: JSON.stringify(data) });
  } catch(e) { console.error("Firebase save error:", e); }
}

async function fbLoad(key, fallback) {
  try {
    const snap = await getDoc(doc(db, "appdata", key));
    if (snap.exists()) return JSON.parse(snap.data().value);
  } catch(e) { console.error("Firebase load error:", e); }
  return fallback;
}

function fbListen(key, callback) {
  return onSnapshot(doc(db, "appdata", key), (snap) => {
    if (snap.exists()) {
      try {
        const data = JSON.parse(snap.data().value);
        // Only update if data is valid and non-empty
        if (data !== null && data !== undefined) {
          callback(data);
        }
      } catch(e) { console.error("fbListen parse error:", e); }
    }
  });
}

// ─── CHECKLISTS ───────────────────────────────────────────────────────────────

const TRAINER_CHECKLIST = [
  { id: "t1", category: "Getting Started", task: "Complete IBA and register for class or self online study", note: "Urgency: get them moving within 48 hours!", link: null },
  { id: "t2", category: "Apps & Access", task: "Confirm recruit downloaded Primerica app and logged in within 24 hours", note: "🎉 $50 bonus when completed within 24 hours", link: null },
  { id: "t2c", category: "Apps & Access", task: "Share the team onboarding app URL with new rep and confirm they've saved it", note: "Send them the link and have them bookmark it or save it to their phone's home screen so they can track their own checklist progress", link: null },
  { id: "t3", category: "Apps & Access", task: "Confirm recruit downloaded Telegram and joined the group", note: "Send them the link to be added", link: "https://t.me/+WjPWktwvOpVhZDlh" },
  { id: "t4", category: "Apps & Access", task: "Give recruit access to new student folder", note: "Google Drive study resources", link: "https://drive.google.com/drive/folders/1IrsYPZyMlaClTLftKSkK6pCxAzVavTPl" },
  { id: "t5", category: "References", task: "Get 5 character references (names & phone numbers)", note: "MACHO people — most influential in their life", link: null },
  { id: "t7", category: "Onboarding Videos", task: "Send Orientation video to watch", note: "Advise note-taking; be prepared to answer questions", link: null },
  { id: "t8", category: "References", task: "Complete character reference calls & book training appointments", note: "Use the call script link — rep logs appointments in the Appointments tab", link: "https://docs.google.com/document/d/1ju_kh_QbSc5whqLpm8r9190Jr7raYfcGoi2jdDxP49U/edit?usp=sharing" },
  { id: "t9", category: "Appointments", task: "Review rep's Appointments tab — confirm 15–20 training appointments logged", note: "Open the Appointments tab to see full details: name, phone, email, date, status", link: null },
  { id: "t11", category: "Events", task: "Choose Digital Grand Opening (DGO) date", note: "Contact RVP to confirm date and time availability", link: null },
  { id: "t11b", category: "Events", task: "Follow up after DGO — debrief, next steps, and pipeline review", note: "Who attended? Any appointments set? What's the next action?", link: null },
  { id: "t12", category: "FNA & Personal Plan", task: "Schedule time with RVP to complete personal FNA — Life Insurance & Investment (PAC/Roth IRA)", note: "Add yourself as a guest on the appointment", link: "https://calendly.com/jacquelinejones81/meet-with-coach" },
  { id: "t14", category: "Milestones", task: "🏆 First sale milestone — rep writes their first policy", note: "Log the date and celebrate!", link: null },
];

const FAST_START_CHECKLIST = [
  { id: "f1",   category: "Apps & Setup",        task: "Download Primerica app, register, and log in within 24 hours of IBA submission", note: "🎉 Earn a $50 Scholarship Bonus!", link: "https://www.primericaonline.com" },
  { id: "f1b",  category: "Apps & Setup",        task: "Confirm POL login is active on primericaonline.com", note: "Not just registered — actually log in and confirm access", link: null },
  { id: "f2",   category: "Apps & Setup",        task: "Download the Telegram app", note: "Team communication app", link: null },
  { id: "f3",   category: "References",          task: "Provide 5 professional character references to your trainer", note: null, link: null },
  { id: "f4",   category: "Onboarding",          task: "Complete Orientation", note: null, link: null },

  { id: "f7",   category: "FNA",                 task: "Complete Financial Needs Analysis — Life Insurance", note: null, link: null },
  { id: "f8",   category: "FNA",                 task: "Complete Financial Needs Analysis — Roth IRA", note: null, link: null },
  { id: "f10",  category: "Events",              task: "Schedule Digital Grand Opening — enter your DGO date in the DGO card on your dashboard", note: null, link: null },
  { id: "f10b", category: "Events",              task: "Attend DGO — mark complete in the DGO card on your dashboard", note: "Review who attended, appointments set, and next steps", link: null },
  { id: "f15",  category: "Bonus Goals",         task: "3×$3,000 done — $650 Bonus + District Manager Promotion", note: null, link: null },
  { id: "f16",  category: "Bonus Goals",         task: "6×$6,000 done — $1,250 Bonus + District Manager Promotion", note: null, link: null },
  { id: "f17",  category: "Bonus Goals",         task: "10×$10,000 done — $2,050 Bonus + District Manager Promotion", note: null, link: null },
  { id: "f18",  category: "Licensing",           task: "Schedule and complete pre-licensing class", note: "Scroll down to the Pre-Licensing Class card — enter your class start date, type (In-Person, Zoom, or Online), and mark complete when done", link: null },
  { id: "f19",  category: "Licensing",           task: "Schedule exam within 5 days of completing class — enter your exam date in the Exam section on your dashboard", note: null, link: null },
  { id: "f22b", category: "Licensing",           task: "Access Live Life Exam Review Sessions with Licensing Coaches", note: "Path: primericaonline.com → Life Licensing → Pre-Licensing Education (select your state) → Life Exam Study Resources → Life Review Sessions → Live Life Exam Review Sessions", link: "https://www.primericaonline.com" },
  { id: "f23",  category: "Licensing",           task: "Pass exam — upload pass notice and required docs in Primerica App", note: "🎉 Congratulations!!", link: null },
  { id: "f24",  category: "Licensing",           task: "Request License — Now What Checklist", note: null, link: null },
];

const REGULAR_START_CHECKLIST = [
  { id: "r1",   category: "Apps & Setup",        task: "Download Primerica app, register, and log in within 24 hours of IBA submission", note: "🎉 Earn a $50 Scholarship Bonus!", link: "https://www.primericaonline.com" },
  { id: "r1b",  category: "Apps & Setup",        task: "Confirm POL login is active on primericaonline.com", note: "Not just registered — actually log in and confirm access", link: null },
  { id: "r2",   category: "Apps & Setup",        task: "Download the Telegram app", note: "Team communication app", link: null },
  { id: "r3",   category: "References",          task: "Provide 5 character references to your trainer", note: null, link: null },
  { id: "r4",   category: "Onboarding",          task: "Complete Orientation", note: null, link: null },
  { id: "r8",   category: "FNA",                 task: "Complete Financial Needs Analysis — Life Insurance", note: null, link: null },
  { id: "r9",   category: "FNA",                 task: "Complete Financial Needs Analysis — Roth IRA", note: null, link: null },
  { id: "r12",  category: "Events",              task: "Schedule Digital Grand Opening — enter your DGO date in the DGO card on your dashboard", note: null, link: null },
  { id: "r12b", category: "Events",              task: "Attend DGO — mark complete in the DGO card on your dashboard", note: "Review who attended, appointments set, and next steps", link: null },
  { id: "r10",  category: "Licensing",           task: "Schedule and complete pre-licensing class", note: "Scroll down to the Pre-Licensing Class card — enter your class start date, type (In-Person, Zoom, or Online), and mark complete when done", link: null },
  { id: "r11",  category: "Licensing",           task: "Schedule exam within 5 days of completing class — enter your exam date in the Exam section on your dashboard", note: null, link: null },
  { id: "r19b", category: "Licensing",           task: "Access Live Life Exam Review Sessions with Licensing Coaches", note: "Path: primericaonline.com → Life Licensing → Pre-Licensing Education (select your state) → Life Exam Study Resources → Life Review Sessions → Live Life Exam Review Sessions", link: "https://www.primericaonline.com" },
  { id: "r20",  category: "Licensing",           task: "Pass exam — upload pass notice and required docs in Primerica App", note: "🎉 Congratulations!!", link: null },
  { id: "r21",  category: "Licensing",           task: "Request License — Now What Checklist", note: null, link: null },
];

const LICENSED_NOW_WHAT = [
  // ── Always shown first: Milestones ──
  { id: "l41", category: "Milestones",               task: "🏆 Write first policy", note: "Log the date!", link: null },

  // ── Securities License — start immediately after life license ──
  { id: "l28", category: "Securities License",        task: "Start securities license process — SIE", note: null, link: null },
  { id: "l29", category: "Securities License",        task: "Series 6", note: null, link: null },
  { id: "l30", category: "Securities License",        task: "Series 63", note: null, link: null },
  { id: "l31", category: "Securities License",        task: "Series 65", note: null, link: null },
  { id: "l32", category: "Securities License",        task: "Series 26 (if RVP is desired)", note: null, link: null },
  { id: "l33", category: "Securities License",        task: "Start mortgage license process", note: null, link: null },

  // ── Shown only if already licensed (conditional via UI) ──
  { id: "l1",  category: "If Already Licensed",       task: "Download Primerica app, register, and log in within 24 hours of IBA submission", note: "🎉 Earn a $50 Scholarship Bonus!", link: "https://www.primericaonline.com" },
  { id: "l1b", category: "If Already Licensed",       task: "Confirm POL login is active on primericaonline.com", note: null, link: null },
  { id: "l2",  category: "If Already Licensed",       task: "Download Telegram or Telegram Messenger app", note: "Team communication app", link: null },
  { id: "l3",  category: "If Already Licensed",       task: "Provide 5 professional character references to your trainer", note: null, link: null },
  { id: "l4",  category: "If Already Licensed",       task: "Create training list of 20 names and numbers (MACHO people)", note: "Married, Age 25-55, Children 0-17, Homeowners, Occupation — at least 3 of these", link: null },
  { id: "l5",  category: "If Already Licensed",       task: "Complete Orientation", note: null, link: null },
  { id: "l6",  category: "If Already Licensed",       task: "Upload contacts into Contact Manager in Primerica app", note: null, link: null },
  { id: "l7",  category: "If Already Licensed",       task: "Complete digital marketing checklist", note: null, link: null },
  { id: "l8",  category: "Business Commitment",       task: "Make business commitment", note: "Confirm dollar amount with trainer", link: null },
  { id: "l10", category: "Business Commitment",       task: "Set up Business Account", note: null, link: null },
  { id: "l11", category: "Business Commitment",       task: "Complete FNA — Life Insurance", note: null, link: null },
  { id: "l12", category: "Business Commitment",       task: "Complete FNA — Roth IRA", note: null, link: null },
  { id: "l13", category: "Bonus Opportunity",         task: "Earn $200+ bonus — 1 recruit + $1,000 field training observation premium before license shows up", note: "⚡ You have less than 5 days before your license shows up — move NOW! 3×$3,000 = $600 + District Leader Promotion", link: null },

  // ── Learning Activity ──
  { id: "l17",  category: "Learning Activity",        task: "Complete Life Training Hub (POL > Products > Life Insurance > Life Training Hub)", note: null, link: "https://www.primericaonline.com" },
  { id: "l18",  category: "Learning Activity",        task: "Get certified for Indexed and Fixed Annuities", note: null, link: null },
  { id: "l17b", category: "Learning Activity",        task: "Access the Licensed Now What Google Drive Folder", note: "All 7 Fundamentals resources are in this folder", link: "https://docs.google.com/document/d/1NKbtB-lVIIBBXpEC-VWxyAvLnnWHVP99OqewymJYQXM/edit?usp=drive_link" },
  { id: "l21",  category: "Learning Activity",        task: "Complete 3 practice life apps in Primerica app", note: null, link: null },
  { id: "l22",  category: "Learning Activity",        task: "Complete 3 practice IBAs in Primerica app", note: null, link: null },
  { id: "l19",  category: "Learning Activity",        task: "1. Master the 7 Fundamentals — Prospecting", note: "See Licensed Now What Folder", link: "https://docs.google.com/document/d/1NKbtB-lVIIBBXpEC-VWxyAvLnnWHVP99OqewymJYQXM/edit?usp=drive_link" },
  { id: "l20",  category: "Learning Activity",        task: "2. Master the 7 Fundamentals — Setting Appointments", note: "See Licensed Now What Folder", link: "https://docs.google.com/document/d/1NKbtB-lVIIBBXpEC-VWxyAvLnnWHVP99OqewymJYQXM/edit?usp=drive_link" },
  { id: "l23",  category: "Learning Activity",        task: "3. Master the 7 Fundamentals — Giving a Winning Presentation", note: "See Licensed Now What Folder", link: "https://docs.google.com/document/d/1NKbtB-lVIIBBXpEC-VWxyAvLnnWHVP99OqewymJYQXM/edit?usp=drive_link" },
  { id: "l24",  category: "Learning Activity",        task: "4. Master the 7 Fundamentals — Overcoming Objections", note: "See Licensed Now What Folder", link: "https://docs.google.com/document/d/1NKbtB-lVIIBBXpEC-VWxyAvLnnWHVP99OqewymJYQXM/edit?usp=drive_link" },
  { id: "l25",  category: "Learning Activity",        task: "5. Master the 7 Fundamentals — Closing (Life Insurance)", note: "See Licensed Now What Folder", link: "https://docs.google.com/document/d/1NKbtB-lVIIBBXpEC-VWxyAvLnnWHVP99OqewymJYQXM/edit?usp=drive_link" },
  { id: "l25b", category: "Learning Activity",        task: "6. Master the 7 Fundamentals — Getting Referrals", note: "See Licensed Now What Folder", link: "https://docs.google.com/document/d/1NKbtB-lVIIBBXpEC-VWxyAvLnnWHVP99OqewymJYQXM/edit?usp=drive_link" },
  { id: "l25c", category: "Learning Activity",        task: "7. Master the 7 Fundamentals — Getting a New Rep Started", note: "See Licensed Now What Folder", link: "https://docs.google.com/document/d/1NKbtB-lVIIBBXpEC-VWxyAvLnnWHVP99OqewymJYQXM/edit?usp=drive_link" },
  { id: "l26",  category: "Learning Activity",        task: "Master the Products (Life, Investments, etc.)", note: null, link: null },
  { id: "l27",  category: "Learning Activity",        task: "Beneficiary and Emergency Contacts process", note: "See Licensed Now What Folder", link: "https://docs.google.com/document/d/1NKbtB-lVIIBBXpEC-VWxyAvLnnWHVP99OqewymJYQXM/edit?usp=drive_link" },

  // ── Income Producing Activity ──
  { id: "l34", category: "Income Producing Activity", task: "Determine objective: Part-time income ($100-$300/mo)", note: "5 qualified contacts per week", link: null },
  { id: "l35", category: "Income Producing Activity", task: "Determine objective: Consistent part-time income ($500-$1,000/wk)", note: "30-60 qualified contacts per week", link: null },
  { id: "l36", category: "Income Producing Activity", task: "Weekly contacts logged — 5 qualified (part-time goal)", note: "Qualified: at least 3 of — Married, Age 25-55, Children under 17, Homeowner, Occupation", link: null },
  { id: "l37", category: "Income Producing Activity", task: "Weekly contacts logged — 30-60 qualified (full-time goal)", note: null, link: null },
  { id: "l38", category: "Income Producing Activity", task: "Add contacts to CRM", note: null, link: null },
  { id: "l39", category: "Income Producing Activity", task: "Weekly set appointments / follow-ups — 2 qualified (part-time goal)", note: null, link: null },
  { id: "l40", category: "Income Producing Activity", task: "Weekly set appointments / follow-ups — 15-30 qualified (full-time goal)", note: null, link: null },

  // ── RVP Path ──
  { id: "l42", category: "RVP Path",                  task: "Request RVP checklist (if RVP promotion is your desire)", note: null, link: null },
];

const RVP_CHECKLIST = [
  // Licensing
  { id: "rvp1",  category: "Licensing",          task: "Become Life Licensed", note: null, link: null },
  { id: "rvp2",  category: "Licensing",          task: "Get Securities Licensed — SIE", note: null, link: null },
  { id: "rvp3",  category: "Licensing",          task: "Get Securities Licensed — Series 6", note: null, link: null },
  { id: "rvp4",  category: "Licensing",          task: "Get Securities Licensed — Series 63", note: null, link: null },
  { id: "rvp5",  category: "Licensing",          task: "Get Securities Licensed — Series 26", note: null, link: null },
  // Licensed Agents
  { id: "rvp6",  category: "Licensed Agents",    task: "License agents 1–3", note: "3 of 20 licensed agents", link: null },
  { id: "rvp7",  category: "Licensed Agents",    task: "License agents 4–6", note: "6 of 20 licensed agents", link: null },
  { id: "rvp8",  category: "Licensed Agents",    task: "License agents 7–9", note: "9 of 20 licensed agents", link: null },
  { id: "rvp9",  category: "Licensed Agents",    task: "License agents 10–12", note: "12 of 20 licensed agents", link: null },
  { id: "rvp10", category: "Licensed Agents",    task: "License agents 13–16", note: "16 of 20 licensed agents", link: null },
  { id: "rvp11", category: "Licensed Agents",    task: "License agents 17–20", note: "20 of 20 — milestone reached! 🎉", link: null },
  // Production
  { id: "rvp12", category: "Production",         task: "Achieve QBI at 75% minimum", note: null, link: null },
  { id: "rvp13", category: "Production",         task: "Month 1: 10 recruits × $10k in premium (20×20 goal)", note: "10 recs × $10k in premium — Month 1 of 2", link: null },
  { id: "rvp14", category: "Production",         task: "Month 2: 10 recruits × $10k in premium (20×20 goal)", note: "10 recs × $10k in premium — Month 2 of 2", link: null },
  // Financial
  { id: "rvp15", category: "Financial Goals",    task: "Rolling 12-month income minimum of $20,000", note: null, link: null },
  { id: "rvp16", category: "Financial Goals",    task: "Receive $20k in company stock", note: null, link: null },
  // Replacement
  { id: "rvp17", category: "Replacement",        task: "Provide replacement — 15 licenses OR 3 District Legs", note: "Must meet one of these two requirements", link: null },
  // Promotion
  { id: "rvp18", category: "RVP Promotion",      task: "Regional Vice President Promotion 🏆", note: "Set your goal date and go get it!", link: null },
];

const RVP_CAT_COLORS = {
  "Licensing": "#a78bfa",
  "Licensed Agents": "#3b82f6",
  "Production": "#f59e0b",
  "Financial Goals": "#10b981",
  "Replacement": "#06b6d4",
  "RVP Promotion": "#f43f5e",
};

const RVP_CAT_EMOJIS = {
  "Licensing": "📜",
  "Licensed Agents": "👥",
  "Production": "📈",
  "Financial Goals": "💰",
  "Replacement": "🔄",
  "RVP Promotion": "👑",
};

const TRACK_INFO = {
  fast:     { label: "Fast Start",         shortLabel: "Fast",     color: "#f59e0b", days: "7–14 days", checklist: FAST_START_CHECKLIST },
  regular:  { label: "Regular Start",      shortLabel: "Regular",  color: "#3b82f6", days: "30 days",   checklist: REGULAR_START_CHECKLIST },
  licensed: { label: "Licensed, Now What", shortLabel: "Licensed", color: "#10b981", days: "Ongoing",   checklist: LICENSED_NOW_WHAT },
  rvp:      { label: "Becoming an RVP",      shortLabel: "RVP",      color: "#f43f5e",  days: "Goal-based", checklist: RVP_CHECKLIST },
};

const CAT_COLORS = {
  "Getting Started":"#f59e0b","Apps & Setup":"#3b82f6","Apps & Access":"#3b82f6",
  "If Already Licensed":"#06b6d4","References":"#8b5cf6","Onboarding":"#10b981",
  "Onboarding Videos":"#10b981","Business Commitment":"#f43f5e","FNA":"#06b6d4",
  "Training":"#84cc16","Events":"#06b6d4","Appointments":"#f43f5e",
  "Bonus Goals":"#f59e0b","Bonus Opportunity":"#f59e0b","Licensing":"#a78bfa",
  "FNA & Personal Plan":"#06b6d4","Team Schedule":"#ec4899",
  "Learning Activity":"#8b5cf6","Securities License":"#06b6d4",
  "Income Producing Activity":"#10b981","RVP Path":"#f59e0b","Milestones":"#fbbf24",
};

const DEFAULT_APPT_LINK = "https://calendly.com/jacquelinejones81/trainingappointment";
function getApptLink(trainer, admin) {
  if (trainer?.calendlyLink && trainer.calendlyLink.trim()) return trainer.calendlyLink.trim();
  if (admin?.calendlyLink && admin.calendlyLink.trim()) return admin.calendlyLink.trim();
  return DEFAULT_APPT_LINK;
}
const STORAGE_KEY = "primerica_reps_v6";
const MONTHLY_KEY = "primerica_monthly_v1";
const CANCEL_KEY = "primerica_cancellations_v1";

function getMonthKey() {
  const now = new Date();
  return String(now.getFullYear()) + "-" + String(now.getMonth()+1).padStart(2,"0");
}
function getMonthLabel(key) {
  if (!key) return "";
  const parts = key.split("-");
  return new Date(parts[0], parts[1]-1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
function getPrevMonths(data) {
  return Object.keys(data||{}).sort().reverse().slice(0, 6);
}
const TRAINERS_KEY = "primerica_trainers_v1";
const ACTIVE_TRAINER_KEY = "primerica_active_trainer";
const ADMINS_KEY = "primerica_admins_v1";
const SCHEDULE_KEY = "primerica_schedule_v2";
const RVP_KEY = "primerica_rvp_v1";
const DEFAULT_SCHEDULE = [
  { id: "s1", day: "Monday",    time: "7:30 PM CST / 8:30 PM EST",                  title: "Mindset Monday 🎖️",                                    type: "meeting",  required: true  },
  { id: "s2", day: "Tuesday",   time: "7:00 PM PST / 9:00 PM CST / 10:00 PM EST",  title: "SIE Securities Exam Study Group (Licensed Life Agents only)", type: "study", required: false },
  { id: "s3", day: "Wednesday", time: "7:00 PM PST / 9:00 PM CST / 10:00 PM EST",  title: "Education Center",                                      type: "training", required: true  },
  { id: "s4", day: "Thursday",  time: "5:30 PM PST / 7:30 PM CST / 8:30 PM EST",   title: "How Money Works Opportunity Night (invite guests!)",     type: "event",    required: true  },
  { id: "s5", day: "Saturday",  time: "8:10 AM PST / 10:10 AM CST / 11:10 AM EST", title: "Team Training 💪",                                       type: "training", required: true  },
];
const DEFAULT_ADMINS = [{ id: "admin", name: "Admin (You)", color: "#f59e0b", pin: "1234", isSuperAdmin: true, calendlyLink: "" }];
const DEFAULT_TRAINERS = [];

function load(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } }
function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }
// Firebase versions
function saveToFirebase(key, val) { fbSave(key, val); save(key, val); } // save to both for offline fallback
function pct(done, total) { return total === 0 ? 0 : Math.round((done / total) * 100); }

// Format phone number as user types: 111-111-1111
function formatPhone(value) {
  // Strip everything except digits
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0,3)}-${digits.slice(3)}`;
  return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
}
function isGraduated(rep) {
  return rep.trainerCompleted.length === TRAINER_CHECKLIST.length &&
    rep.repCompleted.length === TRACK_INFO[rep.track].checklist.length;
}
function isStalled(rep) {
  if (rep.stalledManual) return true;
  if (!rep.lastContactDate && !rep.lastActivity) return false;
  const ref = rep.lastContactDate || rep.lastActivity;
  return Math.floor((new Date() - new Date(ref)) / 86400000) > 7;
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────
function exportRepCSV(rep, trainers) {
  const track = TRACK_INFO[rep.track];
  const trainer = trainers.find(t => t.id === rep.trainerId)?.name || "Unknown";
  const appts = (rep.appointments || []).filter(a => a.name);
  const lines = [
    ["Primerica Rep Onboarding Export"],
    ["Name", rep.name],
    ["Phone", rep.phone || ""],
    ["Track", track.label],
    ["Trainer", trainer],
    ["Start Date", rep.startDate || rep.date],
    ["Graduation Date", rep.gradDate || ""],
    ["Last Contact Date", rep.lastContactDate || ""],
    ["Notes", rep.notes || ""],
    [],
    ["TRAINER CHECKLIST"],
    ["Task", "Complete"],
    ...TRAINER_CHECKLIST.map(i => [i.task, rep.trainerCompleted.includes(i.id) ? "Yes" : "No"]),
    [],
    [`${track.label.toUpperCase()} CHECKLIST`],
    ["Task", "Complete"],
    ...track.checklist.map(i => [i.task, rep.repCompleted.includes(i.id) ? "Yes" : "No"]),
    [],
    ["TRAINING APPOINTMENTS"],
    ["#", "Name", "Phone", "Email", "Date", "Status", "Notes"],
    ...appts.map((a, i) => [i + 1, a.name, a.phone || "", a.email || "", a.date || "", a.status, a.apptNote || ""]),
  ];
  const csv = lines.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${rep.name.replace(/\s+/g, "_")}_onboarding.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ─── MOTIVATIONAL QUOTES ─────────────────────────────────────────────────────
const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
  { text: "The key to success is to focus on goals, not obstacles.", author: "Unknown" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Your limitation — it's only your imagination.", author: "Unknown" },
  { text: "Hustle in silence and let your success make the noise.", author: "Unknown" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
];
function getDailyQuote() {
  const day = Math.floor(Date.now() / 86400000);
  return QUOTES[day % QUOTES.length];
}

// ─── CATEGORY EMOJIS ─────────────────────────────────────────────────────────
const CAT_EMOJIS = {
  "Getting Started":"🚀","Apps & Setup":"📱","Apps & Access":"📱",
  "If Already Licensed":"⭐","References":"👥","Onboarding":"🎯",
  "Onboarding Videos":"🎬","Business Commitment":"💼","FNA":"💰",
  "Training":"📋","Events":"🎉","Appointments":"📅",
  "Bonus Goals":"🏆","Bonus Opportunity":"💵","Licensing":"📜",
  "FNA & Personal Plan":"💰","Team Schedule":"🗓","Learning Activity":"🧠",
  "Securities License":"📜","Income Producing Activity":"💪","RVP Path":"👑","Milestones":"🏅",
};

// Confetti burst on task complete
function spawnConfetti(x, y) {
  const colors = ["#f59e0b","#10b981","#3b82f6","#f43f5e","#8b5cf6","#06b6d4","#fbbf24"];
  const container = document.createElement("div");
  container.style.cssText = `position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;overflow:hidden`;
  document.body.appendChild(container);
  for (let i = 0; i < 22; i++) {
    const p = document.createElement("div");
    const size = 6 + Math.random() * 8;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = (Math.random() * 360);
    const dist = 60 + Math.random() * 120;
    const dx = Math.cos(angle * Math.PI/180) * dist;
    const dy = Math.sin(angle * Math.PI/180) * dist - 60;
    const shape = Math.random() > 0.5 ? "50%" : "2px";
    p.style.cssText = `position:absolute;width:${size}px;height:${size}px;background:${color};border-radius:${shape};left:${x}px;top:${y}px;opacity:1;transition:transform 0.7s cubic-bezier(.17,.67,.35,1.1),opacity 0.7s ease;transform:translate(0,0) rotate(0deg)`;
    container.appendChild(p);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        p.style.transform = `translate(${dx}px,${dy}px) rotate(${Math.random()*360}deg)`;
        p.style.opacity = "0";
      });
    });
  }
  setTimeout(() => document.body.removeChild(container), 800);
}

// Floating emoji that flies up and fades
function spawnEmoji(x, y, emoji) {
  const el = document.createElement("div");
  el.textContent = emoji;
  el.style.cssText = `position:fixed;left:${x-16}px;top:${y-10}px;font-size:28px;pointer-events:none;z-index:9999;opacity:1;transition:transform 0.9s cubic-bezier(.17,.67,.35,1.1),opacity 0.9s ease;transform:translateY(0)`;
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.transform = "translateY(-80px) scale(1.4)";
      el.style.opacity = "0";
    });
  });
  setTimeout(() => document.body.removeChild(el), 1000);
}

const MILESTONE_EMOJIS = ["🎉","⭐","🔥","💪","🚀","✨","🏆","💥","🎯","👏"];
let completionCount = 0;

// ─── UI HELPERS ───────────────────────────────────────────────────────────────
function ProgressBar({ value, color }) {
  return (
    <div style={{ background: "#ffffff10", borderRadius: 99, height: 6, overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: value === 100 ? "#10b981" : `linear-gradient(90deg,${color},#f43f5e)`, borderRadius: 99, transition: "width 0.4s ease" }} />
    </div>
  );
}

function CheckItem({ item, done, onToggle, isRepView = false }) {
  const color = CAT_COLORS[item.category] || "#ffffff";
  const [justDone, setJustDone] = useState(false);

  const handleClick = (e) => {
    if (!done && isRepView) {
      // Trigger celebrations only for rep view completing a task
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      spawnConfetti(cx, cy);
      const emoji = MILESTONE_EMOJIS[completionCount % MILESTONE_EMOJIS.length];
      completionCount++;
      spawnEmoji(cx, cy, emoji);
      setJustDone(true);
      setTimeout(() => setJustDone(false), 600);
    }
    onToggle();
  };

  return (
    <div onClick={handleClick} style={{ background: done ? `${color}12` : "#ffffff06", border: `1px solid ${done ? color+"40" : "#ffffff10"}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start", transition: "all 0.15s", transform: justDone ? "scale(1.02)" : "scale(1)" }}
      onMouseEnter={e => e.currentTarget.style.background = done ? `${color}1e` : "#ffffff0e"}
      onMouseLeave={e => e.currentTarget.style.background = done ? `${color}12` : "#ffffff06"}>
      <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1, border: `2px solid ${done ? color : "#ffffff30"}`, background: done ? color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", transform: justDone ? "scale(1.3)" : "scale(1)" }}>
        {done && <span style={{ color: "#0f0f11", fontSize: 13, fontWeight: "bold" }}>✓</span>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: done ? "#ffffff50" : "#f0ede8", textDecoration: done ? "line-through" : "none", lineHeight: 1.5 }}>{item.task}</div>
        {item.note && <div style={{ fontSize: 11, color: done ? "#ffffff25" : "#ffffff50", marginTop: 4 }}>{item.note}</div>}
        {item.link && !done && <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: "inline-block", marginTop: 6, fontSize: 11, color, textDecoration: "none" }}>Open Link ↗</a>}
      </div>
    </div>
  );
}

function CategorySection({ title, items, completedIds, onToggle, isRepView = false, inlineContent = {} }) {
  const color = CAT_COLORS[title] || "#ffffff";
  const emoji = CAT_EMOJIS[title] || "📌";
  const done = items.filter(i => completedIds.includes(i.id)).length;
  const allDone = done === items.length;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${color}30` }}>
        <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color, fontWeight: "bold" }}>{emoji} {title} {allDone && isRepView ? "✅" : ""}</div>
        <div style={{ fontSize: 12, color: allDone ? "#10b981" : "#ffffff40", fontWeight: allDone ? "bold" : "normal" }}>{done}/{items.length} {allDone && isRepView ? "🎉" : ""}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map(item => (
          <React.Fragment key={item.id}>
            <CheckItem item={item} done={completedIds.includes(item.id)} onToggle={() => onToggle(item.id)} isRepView={isRepView} />
            {inlineContent[item.id] && completedIds.includes(item.id) && (
              <div style={{ marginTop: -4, marginBottom: 4 }}>
                {inlineContent[item.id]}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── APPOINTMENT TRACKER ──────────────────────────────────────────────────────
function AppointmentTracker({ appointments = [], onChange }) {
  const total = 20;
  const filled = appointments.filter(a => a.name);
  const setCount = filled.length;
  const completedCount = filled.filter(a => a.status === "completed").length;
  const statusColors = { set: "#3b82f6", completed: "#10b981", cancelled: "#ffffff30" };
  const statusLabels = { set: "Set", completed: "Done", cancelled: "Cancelled" };

  const updateAppt = (idx, field, value) => {
    const updated = [...appointments];
    if (!updated[idx]) updated[idx] = { id: `appt-${idx}`, name: "", phone: "", email: "", date: "", status: "set", apptNote: "" };
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  const filledAppts2 = appointments.filter(a => a.name).sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date) - new Date(b.date);
  });
  const emptySlots2 = Array.from({ length: Math.max(0, total - filledAppts2.length) }, (_, i) => ({ id: `appt-empty2-${i}`, name: "", phone: "", email: "", date: "", status: "set", apptNote: "" }));
  const rows = [...filledAppts2, ...emptySlots2];

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ paddingBottom: 8, borderBottom: "1px solid #f43f5e30", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#f43f5e", fontWeight: "bold" }}>Training Appointments</div>
          <div style={{ fontSize: 12, color: "#ffffff40" }}>{setCount} set · {completedCount} completed · goal: 15–20</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {[{ label: "Set", val: pct(setCount, total), color: "#3b82f6", count: setCount }, { label: "Done", val: pct(completedCount, total), color: "#10b981", count: completedCount }].map(b => (
            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 10, color: "#ffffff35", width: 30, textTransform: "uppercase", letterSpacing: "0.06em" }}>{b.label}</div>
              <div style={{ flex: 1 }}><ProgressBar value={b.val} color={b.color} /></div>
              <div style={{ fontSize: 11, color: "#ffffff40", width: 40, textAlign: "right" }}>{b.count}/20</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#f59e0b0f", border: "1px solid #f59e0b30", borderRadius: 10, padding: "12px 16px", marginBottom: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ fontSize: 18 }}>⚠️</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: "bold", color: "#f59e0b", marginBottom: 4 }}>Important: Add yourself as a guest when scheduling!</div>
          <div style={{ fontSize: 12, color: "#ffffff60", marginBottom: 8 }}>Use the link below to schedule your training appointments. Make sure to add your field trainer as a guest so they receive the confirmation.</div>
          <a href={trainerLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#f59e0b", textDecoration: "none", fontWeight: "bold" }}>📅 Schedule Training Appointment ↗</a>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((appt, idx) => {
          const isFilled = !!appt.name;
          const statusColor = statusColors[appt.status] || "#3b82f6";
          const fieldStyle = { background: "transparent", border: "none", borderBottom: "1px solid #ffffff15", color: isFilled ? "#f0ede8" : "#ffffff35", fontSize: 13, outline: "none", width: "100%", padding: "4px 2px", fontFamily: "inherit" };
          return (
            <div key={idx} style={{ background: isFilled ? "#ffffff08" : "#ffffff03", border: `1px solid ${isFilled ? "#ffffff15" : "#ffffff08"}`, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: isFilled ? "#ffffff50" : "#ffffff20", fontWeight: "bold", letterSpacing: "0.1em" }}>APPT #{idx + 1}</div>
                <select value={appt.status} onChange={e => updateAppt(idx, "status", e.target.value)} disabled={!isFilled}
                  style={{ background: isFilled ? `${statusColor}20` : "transparent", border: `1px solid ${isFilled ? statusColor+"50" : "#ffffff10"}`, borderRadius: 6, color: isFilled ? statusColor : "#ffffff20", fontSize: 11, padding: "4px 8px", outline: "none", cursor: isFilled ? "pointer" : "default", fontWeight: "bold" }}>
                  <option value="set" style={{ background: "#1a1a2e", color: "#3b82f6" }}>Set</option>
                  <option value="completed" style={{ background: "#1a1a2e", color: "#10b981" }}>Completed</option>
                  <option value="cancelled" style={{ background: "#1a1a2e", color: "#888" }}>Cancelled</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", marginBottom: 8 }}>
                {[["name","Name","Full name"],["date","Date",null],["phone","Phone","Phone number"],["email","Email","Email address"]].map(([field, label, placeholder]) => (
                  <div key={field}>
                    <div style={{ fontSize: 9, color: "#ffffff30", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{label}</div>
                    <input type={field === "date" ? "date" : field === "email" ? "email" : "text"} value={appt[field] || ""} onChange={e => updateAppt(idx, field, field === "phone" ? formatPhone(e.target.value) : e.target.value)}
                      placeholder={field === "phone" ? "111-111-1111" : (placeholder || "")} maxLength={field === "phone" ? 12 : undefined} style={{ ...fieldStyle, fontSize: field === "date" ? 12 : 13, colorScheme: field === "date" ? "dark" : undefined }} />
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 9, color: "#ffffff30", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Notes / Follow-up</div>
                <input value={appt.apptNote || ""} onChange={e => updateAppt(idx, "apptNote", e.target.value)} placeholder="What was discussed? Next steps?" style={{ ...fieldStyle, fontSize: 12 }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        {[["1–4 set", 4], ["5–8 set", 8], ["9–12 set", 12], ["13–15 set", 15], ["🎯 Goal: 15–20!", 15]].map(([label, threshold]) => (
          <div key={label} style={{ background: setCount >= threshold ? "#10b98118" : "#ffffff08", border: `1px solid ${setCount >= threshold ? "#10b98140" : "#ffffff15"}`, borderRadius: 20, padding: "4px 12px", fontSize: 11, color: setCount >= threshold ? "#10b981" : "#ffffff40", fontWeight: setCount >= threshold ? "bold" : "normal" }}>
            {setCount >= threshold ? "✓ " : ""}{label}
          </div>
        ))}
      </div>
    </div>
  );
}

const LOGIN_KEY = "primerica_session";

function saveSession(role, id) { try { localStorage.setItem(LOGIN_KEY, JSON.stringify({ role, id, ts: Date.now() })); } catch {} }
function loadSession() { try { const v = localStorage.getItem(LOGIN_KEY); return v ? JSON.parse(v) : null; } catch { return null; } }
function clearSession() { try { localStorage.removeItem(LOGIN_KEY); } catch {} }

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ trainers, reps, admins, onLogin }) {
  const [mode, setMode] = useState("select"); // select | trainer | rep
  const [pin, setPin] = useState("");
  const [repSearch, setRepSearch] = useState("");
  const [selectedRepLogin, setSelectedRepLogin] = useState(null);
  const [error, setError] = useState("");

  const handleTrainerLogin = () => {
    setError("");
    // Check admin PINs
    const foundAdmin = admins.find(a => a.pin === pin);
    if (foundAdmin) { onLogin(foundAdmin.isSuperAdmin ? "superadmin" : "admin", foundAdmin.id); return; }
    // Check trainer PINs
    const found = trainers.find(t => t.pin && t.pin === pin);
    if (found) { onLogin("trainer", found.id); return; }
    setError("Incorrect PIN. Try again.");
  };

  const [repPinEntry, setRepPinEntry] = useState("");
  const [repPinStep, setRepPinStep] = useState("select"); // select | create | enter
  const [repPinConfirm, setRepPinConfirm] = useState("");
  const [repPinError, setRepPinError] = useState("");

  const handleRepSelect = (rep) => {
    setSelectedRepLogin(rep);
    setError("");
    setRepPinError("");
    setRepPinEntry("");
    setRepPinConfirm("");
    if (rep.repPin) {
      setRepPinStep("enter");
    } else {
      setRepPinStep("create");
    }
  };

  const handleRepLogin = () => {
    if (!selectedRepLogin) { setError("Please select your name first."); return; }
    if (repPinStep === "create") {
      if (repPinEntry.length < 4) { setRepPinError("PIN must be 4 digits"); return; }
      if (repPinEntry !== repPinConfirm) { setRepPinError("PINs do not match — try again"); return; }
      onLogin("rep", selectedRepLogin.id, repPinEntry);
      return;
    }
    if (repPinStep === "enter") {
      if (repPinEntry !== selectedRepLogin.repPin) { setRepPinError("Incorrect PIN — try again"); setRepPinEntry(""); return; }
      onLogin("rep", selectedRepLogin.id);
      return;
    }
    onLogin("rep", selectedRepLogin.id);
  };

  const filteredReps = repSearch.trim().length === 0 ? [] : reps.filter(r => r.name.toLowerCase().includes(repSearch.toLowerCase()));

  return (
    <div style={{ fontFamily:"'Georgia',serif", minHeight:"100vh", background:"#0f0f11", color:"#f0ede8", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ marginBottom:32, textAlign:"center" }}>
        <div style={{ fontSize:11, letterSpacing:"0.2em", color:"#f59e0b", textTransform:"uppercase", marginBottom:8 }}>Primerica Field Training</div>
        <div style={{ fontSize:28, fontWeight:"bold" }}>Onboarding Tracker</div>
        <div style={{ fontSize:13, color:"#ffffff50", marginTop:6 }}>Sign in to continue</div>
      </div>

      {mode === "select" && (
        <div style={{ width:"100%", maxWidth:400, display:"flex", flexDirection:"column", gap:14 }}>
          <button onClick={() => setMode("trainer")} style={{ background:"linear-gradient(135deg,#1a0a2e,#0f3460)", border:"1px solid #ffffff20", borderRadius:14, padding:"22px 24px", cursor:"pointer", textAlign:"left", color:"#f0ede8" }}>
            <div style={{ fontSize:22, marginBottom:8 }}>🏋️</div>
            <div style={{ fontSize:16, fontWeight:"bold", marginBottom:4 }}>Trainer / Admin</div>
            <div style={{ fontSize:12, color:"#ffffff50" }}>Field trainers and admins sign in here</div>
          </button>
          <button onClick={() => setMode("rep")} style={{ background:"linear-gradient(135deg,#0f2027,#203a43)", border:"1px solid #ffffff20", borderRadius:14, padding:"22px 24px", cursor:"pointer", textAlign:"left", color:"#f0ede8" }}>
            <div style={{ fontSize:22, marginBottom:8 }}>🌟</div>
            <div style={{ fontSize:16, fontWeight:"bold", marginBottom:4 }}>New Rep</div>
            <div style={{ fontSize:12, color:"#ffffff50" }}>View your personal checklist and track your progress</div>
          </button>
        </div>
      )}

      {mode === "trainer" && (
        <div style={{ width:"100%", maxWidth:380 }}>
          <button onClick={() => { setMode("select"); setPin(""); setError(""); }} style={{ background:"none", border:"none", color:"#ffffff60", cursor:"pointer", fontSize:13, marginBottom:20, padding:0 }}>← Back</button>
          <div style={{ background:"#ffffff08", border:"1px solid #ffffff15", borderRadius:14, padding:24 }}>
            <div style={{ fontSize:16, fontWeight:"bold", marginBottom:4 }}>Trainer / Admin Login</div>
            <div style={{ fontSize:12, color:"#ffffff50", marginBottom:20 }}>Enter your PIN to continue</div>
            <input type="password" value={pin} onChange={e => { setPin(e.target.value); setError(""); }} onKeyDown={e => e.key==="Enter"&&handleTrainerLogin()} placeholder="Enter PIN" maxLength={6}
              style={{ ...inputStyle, fontSize:22, letterSpacing:"0.3em", textAlign:"center", marginBottom:12 }} autoFocus />
            {error && <div style={{ fontSize:12, color:"#f43f5e", marginBottom:12, textAlign:"center" }}>{error}</div>}
            <button onClick={handleTrainerLogin} style={{ background:"#f59e0b", border:"none", color:"#0f0f11", padding:"12px", borderRadius:8, cursor:"pointer", fontWeight:"bold", fontSize:14, width:"100%" }}>Sign In</button>
            <div style={{ fontSize:11, color:"#ffffff30", marginTop:12, textAlign:"center" }}>Default admin PIN: 1234 · Change in Manage Trainers</div>
          </div>
        </div>
      )}

      {mode === "rep" && (
        <div style={{ width:"100%", maxWidth:400 }}>
          <button onClick={() => { setMode("select"); setRepSearch(""); setSelectedRepLogin(null); setError(""); setRepPinStep("select"); setRepPinEntry(""); setRepPinConfirm(""); }} style={{ background:"none", border:"none", color:"#ffffff60", cursor:"pointer", fontSize:13, marginBottom:20, padding:0 }}>← Back</button>
          <div style={{ background:"#ffffff08", border:"1px solid #ffffff15", borderRadius:14, padding:24 }}>
            <div style={{ fontSize:16, fontWeight:"bold", marginBottom:4 }}>Rep Login</div>
            <div style={{ fontSize:12, color:"#ffffff50", marginBottom:16 }}>Find your name to view your checklist</div>
            <input value={repSearch} onChange={e => { setRepSearch(e.target.value); setSelectedRepLogin(null); }} placeholder="Search your name..." style={{ ...inputStyle, marginBottom:10 }} autoFocus />
            <div style={{ maxHeight:220, overflowY:"auto", display:"flex", flexDirection:"column", gap:6, marginBottom:14 }}>
              {repSearch.trim().length === 0 && <div style={{ fontSize:13, color:"#ffffff30", textAlign:"center", padding:"20px 0" }}>Start typing your name to find yourself</div>}
              {repSearch.trim().length > 0 && filteredReps.length === 0 && <div style={{ fontSize:13, color:"#ffffff30", textAlign:"center", padding:"20px 0" }}>No results found. Ask your trainer to add you first.</div>}
              {filteredReps.map(r => {
                const track = TRACK_INFO[r.track];
                const sel = selectedRepLogin?.id === r.id;
                return (
                  <div key={r.id} onClick={() => handleRepSelect(r)} style={{ background:sel?`${track.color}18`:"#ffffff06", border:`1px solid ${sel?track.color+"50":"#ffffff10"}`, borderRadius:10, padding:"12px 14px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>{r.photo && <img src={r.photo} alt="" style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover", border:`2px solid ${sel?track.color:"#ffffff30"}` }} />}<div><div style={{ fontSize:14, fontWeight:"bold", color:sel?track.color:"#f0ede8" }}>{r.name}</div><div style={{ fontSize:11, color:"#ffffff40", marginTop:2 }}>{track.label}</div></div></div>
                    </div>
                    {sel && <div style={{ color:track.color, fontSize:18 }}>✓</div>}
                  </div>
                );
              })}
            </div>
            {error && <div style={{ fontSize:12, color:"#f43f5e", marginBottom:10, textAlign:"center" }}>{error}</div>}

            {/* PIN entry — shows after selecting name */}
            {selectedRepLogin && repPinStep === "create" && (
              <div style={{ background:"#10b98110", border:"1px solid #10b98130", borderRadius:10, padding:"14px", marginBottom:12 }}>
                <div style={{ fontSize:13, fontWeight:"bold", color:"#10b981", marginBottom:4 }}>Create Your 4-Digit PIN</div>
                <div style={{ fontSize:11, color:"#ffffff50", marginBottom:10 }}>You will use this PIN every time you log in. Keep it private!</div>
                <input type="password" inputMode="numeric" maxLength={4} value={repPinEntry} onChange={e => { setRepPinEntry(e.target.value.replace(/\D/g,"")); setRepPinError(""); }}
                  placeholder="Choose 4-digit PIN" style={{ background:"#ffffff0d", border:"1px solid #ffffff20", borderRadius:8, padding:"10px 14px", color:"#f0ede8", fontSize:18, outline:"none", width:"100%", boxSizing:"border-box", letterSpacing:"0.3em", textAlign:"center", marginBottom:8, fontFamily:"inherit" }} />
                <input type="password" inputMode="numeric" maxLength={4} value={repPinConfirm} onChange={e => { setRepPinConfirm(e.target.value.replace(/\D/g,"")); setRepPinError(""); }}
                  placeholder="Confirm PIN" style={{ background:"#ffffff0d", border:"1px solid #ffffff20", borderRadius:8, padding:"10px 14px", color:"#f0ede8", fontSize:18, outline:"none", width:"100%", boxSizing:"border-box", letterSpacing:"0.3em", textAlign:"center", fontFamily:"inherit" }} />
                {repPinError && <div style={{ fontSize:12, color:"#f43f5e", marginTop:6, textAlign:"center" }}>{repPinError}</div>}
              </div>
            )}
            {selectedRepLogin && repPinStep === "enter" && (
              <div style={{ background:"#3b82f610", border:"1px solid #3b82f630", borderRadius:10, padding:"14px", marginBottom:12 }}>
                <div style={{ fontSize:13, fontWeight:"bold", color:"#3b82f6", marginBottom:4 }}>Enter Your PIN</div>
                <input type="password" inputMode="numeric" maxLength={4} value={repPinEntry} onChange={e => { setRepPinEntry(e.target.value.replace(/\D/g,"")); setRepPinError(""); }}
                  onKeyDown={e => e.key==="Enter" && handleRepLogin()}
                  placeholder="4-digit PIN" autoFocus style={{ background:"#ffffff0d", border:"1px solid #ffffff20", borderRadius:8, padding:"10px 14px", color:"#f0ede8", fontSize:22, outline:"none", width:"100%", boxSizing:"border-box", letterSpacing:"0.4em", textAlign:"center", fontFamily:"inherit" }} />
                {repPinError && <div style={{ fontSize:12, color:"#f43f5e", marginTop:6, textAlign:"center" }}>{repPinError}</div>}
              </div>
            )}

            <button onClick={handleRepLogin}
              disabled={!selectedRepLogin || (repPinStep==="create" && (repPinEntry.length < 4 || repPinConfirm.length < 4)) || (repPinStep==="enter" && repPinEntry.length < 4)}
              style={{ background: selectedRepLogin?"#10b981":"#ffffff20", border:"none", color: selectedRepLogin?"#0f0f11":"#ffffff40", padding:"12px", borderRadius:8, cursor: selectedRepLogin?"pointer":"default", fontWeight:"bold", fontSize:14, width:"100%", transition:"all 0.2s" }}>
              {!selectedRepLogin ? "Select your name above" : repPinStep==="create" ? "Create PIN and Continue" : repPinStep==="enter" ? "Sign In" : `Continue as ${selectedRepLogin.name}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MACHO QUALIFIER ─────────────────────────────────────────────────────────
const MACHO_CRITERIA = [
  { key: "M", label: "Married", desc: "Married or in a committed relationship" },
  { key: "A", label: "Age 25–55", desc: "Between 25 and 55 years old" },
  { key: "C", label: "Children", desc: "Has children (0–17 yrs old)" },
  { key: "H", label: "Homeowner", desc: "Owns their home" },
  { key: "O", label: "Occupation", desc: "Has a job / steady income" },
];

function MachoQualifier({ contact, onUpdate }) {
  const stars = (contact.macho || []).length;
  const isQualified = stars >= 3;

  const toggleCriteria = (key) => {
    const current = contact.macho || [];
    const updated = current.includes(key) ? current.filter(k => k !== key) : [...current, key];
    onUpdate({ ...contact, macho: updated });
  };

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 10, color: "#ffffff30", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
        MACHO Score — tap to star qualifications
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
        {MACHO_CRITERIA.map(c => {
          const active = (contact.macho || []).includes(c.key);
          return (
            <div key={c.key} onClick={() => toggleCriteria(c.key)}
              title={c.desc}
              style={{ background: active ? "#f59e0b20" : "#ffffff08", border: `2px solid ${active ? "#f59e0b" : "#ffffff15"}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", transition: "all 0.15s", textAlign: "center", minWidth: 44 }}>
              <div style={{ fontSize: active ? 16 : 14, marginBottom: 2 }}>{active ? "⭐" : "☆"}</div>
              <div style={{ fontSize: 10, fontWeight: "bold", color: active ? "#f59e0b" : "#ffffff40", letterSpacing: "0.05em" }}>{c.key}</div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: isQualified ? "#10b981" : stars >= 1 ? "#f59e0b" : "#ffffff30", fontWeight: isQualified ? "bold" : "normal" }}>
        {stars} ⭐ — {isQualified ? "✓ Qualified! Great candidate for an appointment." : stars === 0 ? "Tap letters above to score this contact" : `${3 - stars} more star${3 - stars !== 1 ? "s" : ""} needed to qualify`}
      </div>
      {isQualified && stars >= 5 && <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 2 }}>🔥 5-star contact — top priority!</div>}
    </div>
  );
}

// ─── REP APPOINTMENT TRACKER ─────────────────────────────────────────────────
function RepAppointmentTracker({ appointments = [], onChange, trainerLink = DEFAULT_APPT_LINK }) {
  const total = 20;
  // Sort filled appointments by date (earliest first), empty slots go to the end
  const filledAppts = appointments.filter(a => a.name).sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date) - new Date(b.date);
  });
  const emptySlots = Array.from({ length: Math.max(0, total - filledAppts.length) }, (_, i) => ({
    id: `appt-empty-${i}`, name: "", phone: "", email: "", date: "", status: "set", apptNote: "", completed: false
  }));
  const rows = [...filledAppts, ...emptySlots];

  const filled = rows.filter(a => a.name);
  const setCount = filled.length;
  const completedCount = filled.filter(a => a.completed).length;

  const updateAppt = (idx, field, value) => {
    const updated = [...appointments];
    if (!updated[idx]) updated[idx] = { id: `appt-${idx}`, name: "", phone: "", email: "", date: "", status: "set", apptNote: "", completed: false };
    updated[idx] = { ...updated[idx], [field]: value };
    // auto-set status when completed toggled
    if (field === "completed") updated[idx].status = value ? "completed" : "set";
    onChange(updated);
  };

  const statusColors = { set: "#3b82f6", completed: "#10b981", cancelled: "#ffffff30" };

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Header */}
      <div style={{ paddingBottom: 8, borderBottom: "1px solid #f43f5e30", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#f43f5e", fontWeight: "bold" }}>📅 My Training Appointments</div>
          <div style={{ fontSize: 12, color: "#ffffff40" }}>{setCount} logged · {completedCount} done · goal: 15–20</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {[{ label: "Logged", val: Math.round(setCount/total*100), color: "#3b82f6", count: setCount },
            { label: "Done",   val: Math.round(completedCount/total*100), color: "#10b981", count: completedCount }].map(b => (
            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 10, color: "#ffffff35", width: 34, textTransform: "uppercase" }}>{b.label}</div>
              <div style={{ flex: 1, background: "#ffffff10", borderRadius: 99, height: 6, overflow: "hidden" }}>
                <div style={{ width: `${b.val}%`, height: "100%", background: b.val === 100 ? "#10b981" : `linear-gradient(90deg,${b.color},#f43f5e)`, borderRadius: 99, transition: "width 0.4s" }} />
              </div>
              <div style={{ fontSize: 11, color: "#ffffff40", width: 40, textAlign: "right" }}>{b.count}/20</div>
            </div>
          ))}
        </div>
      </div>

      {/* MACHO Legend */}
      <div style={{ background: "#f59e0b0a", border: "1px solid #f59e0b25", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: "bold", color: "#f59e0b", marginBottom: 8 }}>⭐ MACHO Qualification Guide — aim for 3–5 stars</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[["M","Married"],["A","Age 25–55"],["C","Children"],["H","Homeowner"],["O","Occupation"]].map(([k,v]) => (
            <div key={k} style={{ background: "#ffffff08", borderRadius: 8, padding: "5px 10px", fontSize: 11, color: "#ffffff60" }}>
              <span style={{ color: "#f59e0b", fontWeight: "bold" }}>{k}</span> — {v}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#ffffff40", marginTop: 8 }}>Tap the M·A·C·H·O letters on each contact to score them. 3+ stars = qualified. Set appointments with your best people!</div>
      </div>

      {/* Calendly reminder */}
      <div style={{ background: "#f59e0b0f", border: "1px solid #f59e0b30", borderRadius: 10, padding: "12px 16px", marginBottom: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ fontSize: 18 }}>⚠️</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: "bold", color: "#f59e0b", marginBottom: 4 }}>Add yourself as a guest when scheduling!</div>
          <div style={{ fontSize: 12, color: "#ffffff60", marginBottom: 8 }}>Schedule your training appointments using the link below. Make sure to add yourself as a "guest" on the appointment so you will receive the appointment notifications to your email.</div>
          <a href={trainerLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#f59e0b", textDecoration: "none", fontWeight: "bold" }}>📅 Schedule Training Appointment ↗</a>
        </div>
      </div>

      {/* Appointment cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((appt, idx) => {
          const isFilled = !!appt.name;
          const isComplete = !!appt.completed;
          const cardColor = isComplete ? "#10b981" : isFilled ? "#3b82f6" : "#ffffff";
          const fieldStyle = {
            background: "transparent", border: "none",
            borderBottom: `1px solid ${isComplete ? "#10b98130" : "#ffffff15"}`,
            color: isFilled ? (isComplete ? "#ffffff80" : "#f0ede8") : "#ffffff35",
            fontSize: 13, outline: "none", width: "100%", padding: "4px 2px", fontFamily: "inherit",
            textDecoration: isComplete ? "line-through" : "none",
          };
          return (
            <div key={idx} style={{
              background: isComplete ? "#10b98110" : isFilled ? "#ffffff08" : "#ffffff03",
              border: `1px solid ${isComplete ? "#10b98130" : isFilled ? "#ffffff15" : "#ffffff08"}`,
              borderRadius: 12, padding: "14px 16px", transition: "all 0.2s"
            }}>
              {/* Top row: number + completion checkbox */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: isFilled ? "#ffffff50" : "#ffffff20", fontWeight: "bold", letterSpacing: "0.1em" }}>APPT #{idx + 1}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {isFilled && (
                    <div
                      onClick={() => {
                        updateAppt(idx, "completed", !appt.completed);
                        if (!appt.completed) {
                          spawnConfetti(window.innerWidth / 2, 200);
                          spawnEmoji(window.innerWidth / 2, 180, "📅");
                        }
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                        background: isComplete ? "#10b98120" : "#ffffff10",
                        border: `1px solid ${isComplete ? "#10b98150" : "#ffffff20"}`,
                        borderRadius: 20, padding: "4px 12px",
                        color: isComplete ? "#10b981" : "#ffffff60", fontSize: 12, fontWeight: "bold"
                      }}>
                      {isComplete ? "✓ Completed!" : "Mark Complete"}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", marginBottom: 10 }}>
                {[["name","Name","Contact name"],["phone","Phone","Phone number"],["email","Email","Email address"],["date","Date",null]].map(([field,label,placeholder]) => (
                  <div key={field}>
                    <div style={{ fontSize: 9, color: isComplete ? "#ffffff25" : "#ffffff30", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{label}</div>
                    <input
                      type={field === "date" ? "date" : field === "email" ? "email" : "text"}
                      value={appt[field] || ""}
                      onChange={e => updateAppt(idx, field, field === "phone" ? formatPhone(e.target.value) : e.target.value)}
                      placeholder={field === "phone" ? "111-111-1111" : (placeholder || "")}
                      maxLength={field === "phone" ? 12 : undefined}
                      style={{ ...fieldStyle, fontSize: field === "date" ? 12 : 13, colorScheme: field === "date" ? "dark" : undefined }}
                    />
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div>
                <div style={{ fontSize: 9, color: isComplete ? "#ffffff25" : "#ffffff30", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Notes / Follow-up</div>
                <input
                  value={appt.apptNote || ""}
                  onChange={e => updateAppt(idx, "apptNote", e.target.value)}
                  placeholder="What was discussed? Next steps?"
                  style={{ ...fieldStyle, fontSize: 12 }}
                />
              </div>
              {/* MACHO Qualifier */}
              {isFilled && (
                <MachoQualifier
                  contact={appt}
                  onUpdate={(updated) => {
                    const arr = [...appointments];
                    arr[idx] = updated;
                    onChange(arr);
                  }}
                />
              )}
              {/* MACHO summary display for existing scores */}
              {isFilled && (appt.macho||[]).length > 0 && (
                <div style={{ marginTop: 8, padding: "8px 10px", background: (appt.macho||[]).length >= 3 ? "#10b98110" : "#f59e0b0a", border: `1px solid ${(appt.macho||[]).length >= 3 ? "#10b98130" : "#f59e0b25"}`, borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: "#ffffff40", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>MACHO Score</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["M","A","C","H","O"].map(k => {
                      const active = (appt.macho||[]).includes(k);
                      const labels = {M:"Married",A:"Age 25-55",C:"Children",H:"Homeowner",O:"Occupation"};
                      return (
                        <div key={k} style={{ fontSize: 11, background: active ? "#f59e0b20" : "#ffffff08", border: `1px solid ${active ? "#f59e0b50" : "#ffffff10"}`, borderRadius: 20, padding: "3px 10px", color: active ? "#f59e0b" : "#ffffff25", fontWeight: active ? "bold" : "normal" }}>
                          {active ? "⭐" : "☆"} {k} {active ? `— ${labels[k]}` : ""}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 12, color: (appt.macho||[]).length >= 3 ? "#10b981" : "#f59e0b", fontWeight: "bold", marginTop: 6 }}>
                    {(appt.macho||[]).length} ⭐ — {(appt.macho||[]).length >= 3 ? "✓ Qualified!" : `${3-(appt.macho||[]).length} more stars needed`}
                    {(appt.macho||[]).length === 5 && " 🔥 Top priority!"}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Goal badges */}
      <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        {[["1–4 logged", 4],["5–8 logged", 8],["9–12 logged", 12],["13–15 logged", 15],["🎯 Goal: 15–20!", 15]].map(([label, threshold]) => (
          <div key={label} style={{ background: setCount >= threshold ? "#10b98118" : "#ffffff08", border: `1px solid ${setCount >= threshold ? "#10b98140" : "#ffffff15"}`, borderRadius: 20, padding: "4px 12px", fontSize: 11, color: setCount >= threshold ? "#10b981" : "#ffffff40", fontWeight: setCount >= threshold ? "bold" : "normal" }}>
            {setCount >= threshold ? "✓ " : ""}{label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RVP CHECKLIST ────────────────────────────────────────────────────────────
function RvpChecklist({ completedIds, promotionDate, onToggle, onSetDate, isRepView = false }) {
  const categories = [...new Set(RVP_CHECKLIST.map(i => i.category))];
  const totalDone = completedIds.length;
  const total = RVP_CHECKLIST.length;
  const progress = pct(totalDone, total);
  const graduated = totalDone === total;

  return (
    <div>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#f43f5e15,#f59e0b10)", border: "1px solid #f43f5e30", borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: "#f43f5e", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Becoming an RVP</div>
            <div style={{ fontSize: 18, fontWeight: "bold" }}>👑 RVP Promotion Checklist</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: "bold", color: graduated ? "#10b981" : "#f43f5e" }}>{progress}%</div>
        </div>

        {/* Progress bar */}
        <div style={{ background: "#ffffff10", borderRadius: 99, height: 8, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ width: `${progress}%`, height: "100%", background: graduated ? "#10b981" : "linear-gradient(90deg,#f43f5e,#f59e0b)", borderRadius: 99, transition: "width 0.4s ease" }} />
        </div>
        <div style={{ fontSize: 12, color: "#ffffff40" }}>{totalDone} of {total} requirements complete</div>

        {/* Promotion date */}
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #ffffff10" }}>
          <div style={{ fontSize: 10, color: "#ffffff40", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>🎯 Goal Promotion Date</div>
          <input
            type="date"
            value={promotionDate || ""}
            onChange={e => onSetDate(e.target.value)}
            style={{ background: "transparent", border: "none", borderBottom: "1px solid #f43f5e40", color: promotionDate ? "#f0ede8" : "#ffffff30", fontSize: 15, outline: "none", colorScheme: "dark", fontFamily: "inherit", padding: "4px 2px" }}
          />
          {!promotionDate && <div style={{ fontSize: 11, color: "#ffffff30", marginTop: 4 }}>Set your RVP promotion goal date</div>}
          {promotionDate && <div style={{ fontSize: 12, color: "#f43f5e", marginTop: 4, fontWeight: "bold" }}>🔥 Working toward {promotionDate}</div>}
        </div>

        {graduated && (
          <div style={{ marginTop: 14, background: "#10b98120", border: "1px solid #10b98140", borderRadius: 10, padding: "12px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>👑🎉</div>
            <div style={{ fontSize: 16, fontWeight: "bold", color: "#10b981" }}>All RVP Requirements Complete!</div>
            <div style={{ fontSize: 12, color: "#ffffff60", marginTop: 4 }}>Congratulations — time to claim your promotion!</div>
          </div>
        )}
      </div>

      {/* Categories */}
      {categories.map(cat => {
        const items = RVP_CHECKLIST.filter(i => i.category === cat);
        const color = RVP_CAT_COLORS[cat] || "#ffffff";
        const emoji = RVP_CAT_EMOJIS[cat] || "📌";
        const done = items.filter(i => completedIds.includes(i.id)).length;
        const allDone = done === items.length;
        return (
          <div key={cat} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${color}30` }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color, fontWeight: "bold" }}>{emoji} {cat} {allDone ? "✅" : ""}</div>
              <div style={{ fontSize: 12, color: allDone ? "#10b981" : "#ffffff40", fontWeight: allDone ? "bold" : "normal" }}>{done}/{items.length}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map(item => {
                const done = completedIds.includes(item.id);
                return (
                  <div key={item.id} onClick={() => { onToggle(item.id); if (!done && isRepView) { spawnConfetti(window.innerWidth/2, 300); spawnEmoji(window.innerWidth/2, 280, "👑"); } }}
                    style={{ background: done ? `${color}12` : "#ffffff06", border: `1px solid ${done ? color+"40" : "#ffffff10"}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start", transition: "all 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = done ? `${color}1e` : "#ffffff0e"}
                    onMouseLeave={e => e.currentTarget.style.background = done ? `${color}12` : "#ffffff06"}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1, border: `2px solid ${done ? color : "#ffffff30"}`, background: done ? color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                      {done && <span style={{ color: "#0f0f11", fontSize: 13, fontWeight: "bold" }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: done ? "#ffffff50" : "#f0ede8", textDecoration: done ? "line-through" : "none", lineHeight: 1.5 }}>{item.task}</div>
                      {item.note && <div style={{ fontSize: 11, color: done ? "#ffffff25" : "#ffffff50", marginTop: 4 }}>{item.note}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── TEAM SCHEDULE ────────────────────────────────────────────────────────────
const TYPE_COLORS = { study: "#8b5cf6", training: "#3b82f6", event: "#f59e0b", meeting: "#10b981" };
const TYPE_LABELS = { study: "📖 Study", training: "💪 Training", event: "🎉 Event", meeting: "📋 Meeting" };
const DAYS_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function TeamScheduleView({ schedule, isAdmin, onUpdate, cancellations = {}, onCancel }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(schedule);
  const [newItem, setNewItem] = useState({ day:"Monday", time:"", title:"", type:"training", required:true });

  const sorted = [...(editing ? draft : schedule)].sort((a,b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day) || a.time.localeCompare(b.time));

  const addItem = () => {
    if (!newItem.title.trim() || !newItem.time.trim()) return;
    setDraft(prev => [...prev, { ...newItem, id: Date.now().toString() }]);
    setNewItem({ day:"Monday", time:"", title:"", type:"training", required:true });
  };

  const removeItem = (id) => setDraft(prev => prev.filter(i => i.id !== id));

  const saveSchedule = () => { onUpdate(draft); setEditing(false); };

  const iStyle = { background:"#ffffff0d", border:"1px solid #ffffff20", borderRadius:8, padding:"8px 12px", color:"#f0ede8", fontSize:13, outline:"none", fontFamily:"inherit" };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:"bold", color:"#f59e0b", letterSpacing:"0.05em" }}>📅 Weekly Team Schedule</div>
        {isAdmin && !editing && <button onClick={() => { setDraft(schedule); setEditing(true); }} style={{ background:"none", border:"1px solid #ffffff20", color:"#ffffff60", padding:"5px 12px", borderRadius:8, cursor:"pointer", fontSize:12 }}>Edit Schedule</button>}
        {isAdmin && editing && (
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={saveSchedule} style={{ background:"#f59e0b", border:"none", color:"#0f0f11", padding:"6px 14px", borderRadius:8, cursor:"pointer", fontWeight:"bold", fontSize:12 }}>Save</button>
            <button onClick={() => setEditing(false)} style={{ background:"none", border:"1px solid #ffffff20", color:"#ffffff60", padding:"6px 12px", borderRadius:8, cursor:"pointer", fontSize:12 }}>Cancel</button>
          </div>
        )}
      </div>

      {/* Schedule list */}
      <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom: editing ? 16 : 0 }}>
        {sorted.map(item => {
          const color = TYPE_COLORS[item.type] || "#ffffff50";
          return (
            <div key={item.id} style={{ background:"#ffffff07", border:`1px solid ${color}25`, borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:4, height:40, background:color, borderRadius:99, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:"bold", color:"#f0ede8" }}>{item.title}</div>
                <div style={{ fontSize:11, color:"#ffffff50", marginTop:2 }}>{item.day} · {item.time}</div>
                <div style={{ display:"flex", gap:6, marginTop:4 }}>
                  <div style={{ fontSize:10, color:color, background:`${color}15`, border:`1px solid ${color}30`, borderRadius:20, padding:"2px 8px" }}>{TYPE_LABELS[item.type]||item.type}</div>
    
                </div>
              </div>
              {editing && <button onClick={() => removeItem(item.id)} style={{ background:"none", border:"1px solid #f43f5e30", color:"#f43f5e70", padding:"4px 10px", borderRadius:6, cursor:"pointer", fontSize:12 }}>✕</button>}
              {!editing && isAdmin && onCancel && (() => {
                const todayStr = new Date().toISOString().split("T")[0];
                const cancelKey = item.id + "_" + todayStr;
                const isCanceled = cancellations[cancelKey];
                return (
                  <button onClick={() => onCancel(cancelKey, !isCanceled)}
                    style={{ background:isCanceled?"#f43f5e20":"#ffffff08", border:`1px solid ${isCanceled?"#f43f5e50":"#ffffff20"}`, borderRadius:20, padding:"4px 12px", fontSize:11, color:isCanceled?"#f43f5e":"#ffffff50", cursor:"pointer", fontWeight:isCanceled?"bold":"normal", whiteSpace:"nowrap" }}>
                    {isCanceled ? "Canceled Today" : "Cancel Today"}
                  </button>
                );
              })()}
            </div>
          );
        })}
      </div>

      {/* Add new item — admin edit mode */}
      {editing && (
        <div style={{ background:"#ffffff08", border:"1px solid #ffffff15", borderRadius:12, padding:"16px" }}>
          <div style={{ fontSize:12, color:"#f59e0b", fontWeight:"bold", marginBottom:12 }}>Add Meeting / Event</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div>
              <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Day</div>
              <select value={newItem.day} onChange={e => setNewItem(p=>({...p,day:e.target.value}))} style={{ ...iStyle, width:"100%" }}>
                {DAYS_ORDER.map(d => <option key={d} value={d} style={{ background:"#1a1a2e" }}>{d}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Time</div>
              <input value={newItem.time} onChange={e => setNewItem(p=>({...p,time:e.target.value}))} placeholder="e.g. 7:30 PM CST" style={{ ...iStyle, width:"100%", boxSizing:"border-box" }} />
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Title</div>
              <input value={newItem.title} onChange={e => setNewItem(p=>({...p,title:e.target.value}))} placeholder="Meeting or event title" style={{ ...iStyle, width:"100%", boxSizing:"border-box" }} />
            </div>
            <div>
              <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Type</div>
              <select value={newItem.type} onChange={e => setNewItem(p=>({...p,type:e.target.value}))} style={{ ...iStyle, width:"100%" }}>
                {Object.entries(TYPE_LABELS).map(([k,v]) => <option key={k} value={k} style={{ background:"#1a1a2e" }}>{v}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, paddingTop:20 }}>
              <input type="checkbox" checked={newItem.required} onChange={e => setNewItem(p=>({...p,required:e.target.checked}))} id="req" />
              <label htmlFor="req" style={{ fontSize:13, color:"#ffffff60", cursor:"pointer" }}>Mark as Required</label>
            </div>
          </div>
          <button onClick={addItem} style={{ background:"#f59e0b", border:"none", color:"#0f0f11", padding:"9px 20px", borderRadius:8, cursor:"pointer", fontWeight:"bold", fontSize:13 }}>+ Add to Schedule</button>
        </div>
      )}
    </div>
  );
}

// ─── DAILY BANNER ─────────────────────────────────────────────────────────────
const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const TYPE_EMOJIS = { study:"📖", training:"💪", event:"🎉", meeting:"🎖️" };
const TYPE_BG = { study:"#8b5cf6", training:"#3b82f6", event:"#f59e0b", meeting:"#10b981" };

function DailyBanner({ schedule, appointments = [], cancellations = {} }) {
  const today = DAY_NAMES[new Date().getDay()];
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  const upcomingAppts = appointments.filter(a => a.name && !a.completed && (a.date === todayStr || a.date === tomorrowStr));

  // Today's scheduled meetings
  const todayMeetings = schedule.filter(s => s.day === today);

  // Today's appointments (match date string)
  const todayAppts = appointments.filter(a => {
    if (!a.name || !a.date) return false;
    return a.date === todayStr;
  });

  if (todayMeetings.length === 0 && todayAppts.length === 0) return null;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
      {/* Meeting banners */}
      {todayMeetings.map(meeting => {
        const isCanceled = cancellations[meeting.id + "_" + todayStr];
        const color = isCanceled ? "#f43f5e" : (TYPE_BG[meeting.type] || "#f59e0b");
        const emoji = isCanceled ? "❌" : (TYPE_EMOJIS[meeting.type] || "📅");
        return (
          <div key={meeting.id} style={{
            background: `linear-gradient(135deg, ${color}20, ${color}10)`,
            border: `1px solid ${color}50`,
            borderLeft: `4px solid ${color}`,
            borderRadius: 12,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            animation: isCanceled ? "none" : "pulse 2s ease-in-out infinite",
            opacity: isCanceled ? 0.8 : 1,
          }}>
            <div style={{ fontSize: 28, flexShrink: 0 }}>{emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: color, fontWeight: "bold", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>
                {isCanceled ? "CANCELED FOR TODAY" : "Tonight Meeting"}
              </div>
              <div style={{ fontSize: 15, fontWeight: "bold", color: isCanceled ? "#f43f5e80" : "#f0ede8", textDecoration: isCanceled ? "line-through" : "none" }}>{meeting.title}</div>
              <div style={{ fontSize: 12, color: "#ffffff70", marginTop: 3 }}>🕐 {meeting.time}</div>
            </div>
          </div>
        );
      })}

      {/* Upcoming appointment reminders */}
      {upcomingAppts.map(appt => (
        <div key={appt.id||appt.name} style={{ background:"linear-gradient(135deg,#10b98120,#3b82f610)", border:"1px solid #10b98140", borderLeft:"4px solid #10b981", borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ fontSize:24 }}>📅</div>
          <div>
            <div style={{ fontSize:12, color:"#10b981", fontWeight:"bold", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:2 }}>
              {appt.date === todayStr ? "Training Appointment TODAY" : "Training Appointment TOMORROW"}
            </div>
            <div style={{ fontSize:14, fontWeight:"bold", color:"#f0ede8" }}>{appt.name}</div>
            {appt.apptNote && <div style={{ fontSize:11, color:"#ffffff50", marginTop:2 }}>{appt.apptNote}</div>}
          </div>
        </div>
      ))}

      {/* Appointment reminders */}
      {todayAppts.map((appt, i) => {
        const stars = (appt.macho || []).length;
        return (
          <div key={i} style={{
            background: "linear-gradient(135deg,#3b82f620,#3b82f610)",
            border: "1px solid #3b82f650",
            borderLeft: "4px solid #3b82f6",
            borderRadius: 12,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}>
            <div style={{ fontSize: 26, flexShrink: 0 }}>📅</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "#3b82f6", fontWeight: "bold", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>
                Training Appointment Today
              </div>
              <div style={{ fontSize: 15, fontWeight: "bold", color: "#f0ede8" }}>{appt.name}</div>
              <div style={{ fontSize: 12, color: "#ffffff60", marginTop: 3 }}>
                {appt.phone && `📞 ${appt.phone}`}
                {stars > 0 && <span style={{ marginLeft: 8, color: "#f59e0b" }}>{"⭐".repeat(stars)} MACHO score</span>}
              </div>
            </div>
            <div style={{ background: appt.completed ? "#10b98120" : "#f59e0b20", border: `1px solid ${appt.completed ? "#10b98140" : "#f59e0b40"}`, borderRadius: 20, padding: "4px 12px", fontSize: 11, color: appt.completed ? "#10b981" : "#f59e0b", fontWeight: "bold", flexShrink: 0 }}>
              {appt.completed ? "✓ Done" : "Today!"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── REFERENCES SECTION ───────────────────────────────────────────────────────
const RELATIONSHIP_OPTIONS = ["Friend","Family","Coworker","Neighbor","Church Member","Classmate","Associate","Other"];

function ReferencesSection({ references = [], onChange, readOnly = false }) {
  const total = 5;
  const rows = Array.from({ length: total }, (_, i) =>
    references[i] || { id: `ref-${i}`, name: "", phone: "", relationship: "Friend" }
  );
  const filled = rows.filter(r => r.name).length;

  const updateRef = (idx, field, value) => {
    const updated = [...references];
    if (!updated[idx]) updated[idx] = { id: `ref-${idx}`, name: "", phone: "", relationship: "Friend" };
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ paddingBottom: 8, borderBottom: "1px solid #8b5cf630", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8b5cf6", fontWeight: "bold" }}>👥 My 5 Character References</div>
          <div style={{ fontSize: 12, color: filled >= 5 ? "#10b981" : "#ffffff40", fontWeight: filled >= 5 ? "bold" : "normal" }}>{filled}/5 {filled >= 5 ? "✅" : ""}</div>
        </div>
        <div style={{ fontSize: 11, color: "#ffffff40", marginTop: 4 }}>Enter 5 people your trainer can contact — MACHO people who are most influential in your life</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((ref, idx) => {
          const isFilled = !!ref.name;
          return (
            <div key={idx} style={{ background: isFilled ? "#8b5cf610" : "#ffffff03", border: `1px solid ${isFilled ? "#8b5cf630" : "#ffffff08"}`, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: isFilled ? "#8b5cf6" : "#ffffff20", fontWeight: "bold", marginBottom: 8, letterSpacing: "0.08em" }}>REFERENCE #{idx + 1}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 12px" }}>
                {[["name","Name","Full name"],["phone","Phone","Phone number"]].map(([field, label, placeholder]) => (
                  <div key={field}>
                    <div style={{ fontSize: 9, color: "#ffffff30", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{label}</div>
                    {readOnly
                      ? <div style={{ fontSize: 13, color: isFilled ? "#f0ede8" : "#ffffff20" }}>{ref[field] || "—"}</div>
                      : <input value={ref[field] || ""} onChange={e => updateRef(idx, field, field === "phone" ? formatPhone(e.target.value) : e.target.value)} placeholder={field === "phone" ? "111-111-1111" : placeholder} maxLength={field === "phone" ? 12 : undefined}
                          style={{ background: "transparent", border: "none", borderBottom: "1px solid #ffffff15", color: isFilled ? "#f0ede8" : "#ffffff35", fontSize: 13, outline: "none", width: "100%", padding: "4px 2px", fontFamily: "inherit" }} />
                    }
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: 9, color: "#ffffff30", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Relationship</div>
                  {readOnly
                    ? <div style={{ fontSize: 13, color: isFilled ? "#8b5cf6" : "#ffffff20" }}>{ref.relationship || "—"}</div>
                    : <select value={ref.relationship || "Friend"} onChange={e => updateRef(idx, "relationship", e.target.value)}
                        style={{ background: "#ffffff0d", border: "1px solid #8b5cf630", borderRadius: 6, color: "#f0ede8", fontSize: 12, padding: "4px 8px", outline: "none", width: "100%" }}>
                        {RELATIONSHIP_OPTIONS.map(r => <option key={r} value={r} style={{ background: "#1a1a2e" }}>{r}</option>)}
                      </select>
                  }
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── EXAM DATE CARD ───────────────────────────────────────────────────────────
function ExamDateCard({ examDate, examCompleted, onSetDate, onSetCompleted, readOnly = false }) {
  return (
    <div style={{ background: examCompleted ? "#10b98110" : "#f59e0b10", border: `1px solid ${examCompleted ? "#10b98140" : "#f59e0b40"}`, borderRadius: 14, padding: "16px 20px", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: "bold", color: examCompleted ? "#10b981" : "#f59e0b" }}>📝 Exam Date</div>
        {!readOnly && (
          <div onClick={() => onSetCompleted(!examCompleted)} style={{ background: examCompleted ? "#10b98120" : "#f59e0b20", border: `1px solid ${examCompleted ? "#10b98150" : "#f59e0b50"}`, borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: "bold", color: examCompleted ? "#10b981" : "#f59e0b", cursor: "pointer" }}>
            {examCompleted ? "✓ Passed! 🎉" : "Mark Passed"}
          </div>
        )}
        {readOnly && examCompleted && <div style={{ fontSize: 12, color: "#10b981", fontWeight: "bold" }}>✓ Passed!</div>}
      </div>
      <div>
        <div style={{ fontSize: 10, color: "#ffffff40", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Scheduled Exam Date</div>
        {readOnly
          ? <div style={{ fontSize: 15, fontWeight: "bold", color: examDate ? "#f0ede8" : "#ffffff30" }}>{examDate || "Not scheduled yet"}</div>
          : <>
              <input type="date" value={examDate || ""} onChange={e => onSetDate(e.target.value)}
                style={{ background: "transparent", border: "none", borderBottom: `1px solid ${examCompleted ? "#10b98140" : "#f59e0b40"}`, color: examDate ? "#f0ede8" : "#ffffff30", fontSize: 15, outline: "none", colorScheme: "dark", fontFamily: "inherit", padding: "4px 2px" }} />
              {!examDate && <div style={{ fontSize: 11, color: "#ffffff30", marginTop: 4 }}>Schedule within 5 days of completing your class</div>}
            </>
        }
      </div>
    </div>
  );
}

// ─── SCRIPTS SECTION ─────────────────────────────────────────────────────────
const SCRIPTS = [
  {
    id: "appt_friend",
    title: "Setting Appointments — Friend or Associate (Already knows you)",
    category: "Appointments",
    color: "#3b82f6",
    content: `Hey [Name], how's everything going? (brief small talk) Well I'm not going to keep you. I need a huge favor (wait for acknowledgement).

I know you know I'm in the process of getting my license and certification to work in financial services. I'm now at the point where I need to get some training hours in. I just need you (and your spouse if married) to jump on a 30-minute Zoom with my trainer and I so I can see how to do a presentation. You don't have to join or buy anything. I mainly need the practice. Can you do that for me? (wait for answer)

(If they ask "What is it, or what do I have to do?")
Honestly, I just need you to sit and listen (laugh a little). I'll be licensed within the next few weeks and I need to know how to have a conversation with a potential client. I'd rather practice and mess up with friends & family vs a stranger. Worst case, you'll have a full understanding of what I'm getting certified to do, so you can send referrals my way if you come across anyone in the future. Since we're family/friends, I figured you'd do that for me, right? (wait for answer)

(If "yes") Great, I appreciate it! Would evenings or weekends work better for you? (give 2 day options, then 2 time options)

📅 To schedule, use one of these links:
• Coach Tellis Bolton: calendly.com/tbolton81/meeting-with-rvp-tellis-bolton
• Coach Jacqueline Jones: calendly.com/jacquelinejones81/trainingappointment
  ⚠️ Add yourself as a guest on the appointment!

Thanks! Again, I appreciate the help.`,
    tip: "Remember: the appointment is primarily FOR YOUR TRAINING, not for them to join or become clients. Once the appointment is set — HANG UP! Don't keep talking. People like doing business with busy people.",
  },
  {
    id: "appt_new",
    title: "Setting Appointments — Someone who doesn't know you're in financial services",
    category: "Appointments",
    color: "#3b82f6",
    content: `Hey [Name], how's everything going? (brief small talk) Well I'm not going to keep you. I need a huge favor (wait for acknowledgement).

I'm not sure if you knew, but I'm in the process of getting my license and certification to work in financial services. I'm now at the point where I need to get some training hours in. I just need you (and your spouse if married) to jump on a 30-minute Zoom with my trainer and I so I can see how to do a presentation. You don't have to join or buy anything. I mainly need the practice. Can you do that for me? (wait for answer)

(If "yes") Great, I appreciate it! Would evenings or weekends work better for you? (give 2 day options, then 2 time options)

📅 To schedule, use one of these links:
• Coach Tellis Bolton: calendly.com/tbolton81/meeting-with-rvp-tellis-bolton
• Coach Jacqueline Jones: calendly.com/jacquelinejones81/trainingappointment
  ⚠️ Add yourself as a guest on the appointment!

Thanks! Again, I appreciate the help.`,
    tip: "Scholarship requirement: 3–6 Qualified appointments set",
  },
  {
    id: "opportunity_night",
    title: "Inviting Guests to How Money Works Opportunity Night",
    category: "Events",
    color: "#f59e0b",
    content: `Hey [Name], how's everything going? (brief small talk) How's the family doing? Well I'm not going to keep ya. I need you to do me a favor (wait for acknowledgement).

I'm in the process of getting my license and certifications to work in financial services, and I'm going for a promotion. I need you to be my guest and log onto a webinar tonight (or whenever it is) for about 40 minutes on Zoom so you can see what I'm doing. You don't have to talk, nor show your face. It's just informational. Plus, you may be able to help me out with a promotion in the process. Can you do that for me? (wait for answer)

Thanks, I appreciate it! It's going to be at [time]. What's your email address so I can send you the confirmation and Zoom link? (wait for answer)

Please don't forget — I need you on this one. Thanks again!`,
    tip: "Thursday nights at 7:30 PM CST. Always invite 2–3 people to ensure at least 1 shows up.",
  },
];

function ScriptsSection() {
  const [activeScript, setActiveScript] = useState(null);
  const categories = [...new Set(SCRIPTS.map(s => s.category))];

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: "bold", color: "#f59e0b", marginBottom: 14, letterSpacing: "0.05em" }}>📜 Scripts & Call Guides</div>
      <div style={{ fontSize: 12, color: "#ffffff50", marginBottom: 16 }}>Tap any script to read it. You do not have to say it word for word. Understand the psychology and make it your own!</div>

      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#f59e0b", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: "bold", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #f59e0b25" }}>{cat}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {SCRIPTS.filter(s => s.category === cat).map(script => (
              <div key={script.id}>
                <div onClick={() => setActiveScript(activeScript === script.id ? null : script.id)}
                  style={{ background: activeScript === script.id ? `${script.color}15` : "#ffffff07", border: `1px solid ${activeScript === script.id ? script.color+"40" : "#ffffff12"}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.15s" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: "bold", color: activeScript === script.id ? script.color : "#f0ede8" }}>{script.title}</div>
                    <div style={{ fontSize: 11, color: "#ffffff40", marginTop: 3 }}>Tap to {activeScript === script.id ? "collapse" : "view script"}</div>
                  </div>
                  <div style={{ fontSize: 16, color: activeScript === script.id ? script.color : "#ffffff40" }}>{activeScript === script.id ? "▲" : "▼"}</div>
                </div>
                {activeScript === script.id && (
                  <div style={{ background: "#ffffff05", border: `1px solid ${script.color}25`, borderRadius: "0 0 10px 10px", padding: "16px 18px", marginTop: -1 }}>
                    {script.tip && (
                      <div style={{ background: "#f59e0b0f", border: "1px solid #f59e0b25", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#f59e0b" }}>
                        💡 {script.tip}
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: "#f0ede8", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{script.content}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── REP VIEW ─────────────────────────────────────────────────────────────────
function RepView({ rep, onUpdate, onLogout, isPreview = false, schedule = DEFAULT_SCHEDULE, trainerLink = DEFAULT_APPT_LINK, cancellations = {}, allReps = [], trainers = [] }) {
  const isLicensedRep = rep.track === "licensed" || rep.track === "rvp";
  const tourSteps = isLicensedRep ? LICENSED_TOUR_STEPS : REP_TOUR_STEPS;
  const tourKey = "primerica_tour_rep_" + rep.id + "_" + rep.track;
  const [showTour, setShowTour] = useState(() => { try { return !localStorage.getItem(tourKey); } catch(e) { return false; } });
  const [activeTab, setActiveTab] = useState("checklist");
  const [showConditional, setShowConditional] = useState(false);
  const track = TRACK_INFO[rep.track] || TRACK_INFO["fast"];
  const repChecklist = track.checklist;
  const repCats = [...new Set(repChecklist.map(i => i.category))];
  const rp = pct(rep.repCompleted.length, repChecklist.length);
  const graduated = rep.repCompleted.length === repChecklist.length;
  const apptSet = (rep.appointments||[]).filter(a => a.name).length;
  const apptDone = (rep.appointments||[]).filter(a => a.status==="completed"&&a.name).length;

  const toggleItem = (itemId) => {
    const alreadyDone = rep.repCompleted.includes(itemId);
    const newCompleted = alreadyDone ? rep.repCompleted.filter(x => x !== itemId) : [...rep.repCompleted, itemId];
    const updated = { ...rep, repCompleted: newCompleted, lastActivity: new Date().toISOString() };
    onUpdate(updated);
    // Auto-open RVP tab when rep checks "Request RVP checklist"
    if (!alreadyDone && itemId === "l42") {
      spawnConfetti(window.innerWidth/2, 200);
      spawnEmoji(window.innerWidth/2, 180, "👑");
      setTimeout(() => setActiveTab("rvp"), 600);
    }
  };

  return (
    <div style={{ fontFamily:"'Georgia',serif", minHeight:"100vh", background:"#0f0f11", color:"#f0ede8" }}>
      <div style={{ background:"linear-gradient(135deg,#1a0a2e 0%,#16213e 50%,#0f3460 100%)", borderBottom:"1px solid #ffffff18", padding:"16px 20px", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:600, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          <div>
            <div style={{ fontSize:11, color:"#f59e0b", letterSpacing:"0.15em", textTransform:"uppercase" }}>My Onboarding</div>
            <div style={{ fontSize:18, fontWeight:"bold" }}>{rep.name}</div>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ background:`${track.color}20`, border:`1px solid ${track.color}50`, color:track.color, borderRadius:20, padding:"4px 12px", fontSize:12, fontWeight:"bold" }}>{track.label}</div>
            <TourButton onClick={() => setShowTour(true)} />
            <button onClick={onLogout} style={{ background:"none", border:"1px solid #ffffff20", color:"#ffffff60", padding:"6px 12px", borderRadius:8, cursor:"pointer", fontSize:12 }}>Sign Out</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:600, margin:"0 auto", padding:"20px 16px" }}>
        {showTour && !isPreview && <AppTour steps={tourSteps} onClose={() => setShowTour(false)} storageKey={tourKey} />}
        {isPreview && (
          <div style={{ background:"#8b5cf615", border:"1px solid #8b5cf640", borderRadius:10, padding:"10px 16px", marginBottom:16, fontSize:12, color:"#8b5cf6", textAlign:"center" }}>
            👁 You are previewing this rep’s view as admin. All interactions are live — changes will save.
          </div>
        )}
        <RepPhotoUpload photo={rep.photo||null} onUpdate={(photo) => onUpdate({ ...rep, photo, lastActivity:new Date().toISOString() })} />
        <CheckInStreak checkIns={rep.checkIns||[]} />
        <TeamLeaderboard currentRep={rep} allReps={allReps} trainers={trainers} />
        <DailyBanner schedule={schedule} appointments={rep.appointments||[]} cancellations={cancellations} />
        {!graduated && <RepAccountabilityBanner rep={rep} />}
        {graduated && (
          <div style={{ background:"linear-gradient(135deg,#10b98120,#f59e0b15)", border:"1px solid #10b98130", borderRadius:14, padding:"20px 24px", textAlign:"center", marginBottom:20 }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🎉</div>
            <div style={{ fontSize:20, fontWeight:"bold", color:"#10b981" }}>You’re Graduated!</div>
            <div style={{ fontSize:13, color:"#ffffff60", marginTop:4 }}>All checklist items complete. Amazing work!</div>
          </div>
        )}

        {/* Progress */}
        <div style={{ background:"#ffffff07", border:"1px solid #ffffff12", borderRadius:14, padding:"18px 20px", marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ fontSize:13, fontWeight:"bold" }}>My Progress</div>
            <div style={{ fontSize:22, fontWeight:"bold", color: rp===100?"#10b981":track.color }}>{rp}%</div>
          </div>
          <div style={{ background:"#ffffff10", borderRadius:99, height:10, overflow:"hidden", marginBottom:8 }}>
            <div style={{ width:`${rp}%`, height:"100%", background: rp===100?"#10b981":`linear-gradient(90deg,${track.color},#f43f5e)`, borderRadius:99, transition:"width 0.4s ease" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#ffffff40" }}>
            <span>{rep.repCompleted.length} of {repChecklist.length} tasks complete</span>
            {rep.gradDate && <span>Target: {rep.gradDate}</span>}
          </div>
        </div>

        {/* Appt summary */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
          {[
            { label:"Appointments Set", value:apptSet, target:15, color:"#3b82f6" },
            { label:"Appointments Done", value:apptDone, target:15, color:"#10b981" },
          ].map(s => (
            <div key={s.label} style={{ background:"#ffffff07", border:"1px solid #ffffff12", borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
              <div style={{ fontSize:26, fontWeight:"bold", color:s.value>=s.target?"#10b981":s.color }}>{s.value}</div>
              <div style={{ fontSize:10, color:"#ffffff50", textTransform:"uppercase", letterSpacing:"0.08em", marginTop:3 }}>{s.label}</div>
              <div style={{ fontSize:11, color:"#ffffff30", marginTop:2 }}>Goal: {s.target}</div>
            </div>
          ))}
        </div>

        {/* PAC Counter — shows for all tracks with different messaging */}
        <PacCounter
          pacCount={rep.pacCount||0}
          onChange={count => onUpdate({ ...rep, pacCount:count, lastActivity:new Date().toISOString() })}
          onUpdateClients={clients => onUpdate({ ...rep, investmentClients:clients, lastActivity:new Date().toISOString() })}
          onUpdateBoth={(clients, count) => onUpdate({ ...rep, investmentClients:clients, pacCount:count, lastActivity:new Date().toISOString() })}
          investmentClients={rep.investmentClients||[]}
          isLicensed={rep.track === "licensed" || rep.track === "rvp"}
        />

        {/* Field Training Observation Counter — new reps only */}
        {(rep.track === "fast" || rep.track === "regular") && (
          <FieldObsCounter
            count={rep.fieldObsCount||0}
            onChange={count => onUpdate({ ...rep, fieldObsCount:count, lastActivity:new Date().toISOString() })}
          />
        )}

        {/* Life App Counter — new reps only, goal of 10 during training */}
        {(rep.track === "fast" || rep.track === "regular") && (() => {
          const count = rep.lifeAppCount || 0;
          const goal = 10;
          const p = Math.min(100, Math.round((count/goal)*100));
          return (
            <div style={{ background: count>=goal?"#10b98110":"#3b82f610", border:`1px solid ${count>=goal?"#10b98140":"#3b82f630"}`, borderRadius:14, padding:"18px 20px", marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div style={{ fontSize:14, fontWeight:"bold", color:count>=goal?"#10b981":"#3b82f6" }}>📋 Life Applications</div>
                <div style={{ fontSize:22, fontWeight:"bold", color:count>=goal?"#10b981":"#3b82f6" }}>{count}/{goal}</div>
              </div>
              <div style={{ background:"#ffffff10", borderRadius:99, height:8, overflow:"hidden", marginBottom:8 }}>
                <div style={{ width:`${p}%`, height:"100%", background:count>=goal?"#10b981":"linear-gradient(90deg,#3b82f6,#10b981)", borderRadius:99, transition:"width 0.5s ease" }} />
              </div>
              <div style={{ fontSize:12, color:"#ffffff50", marginBottom:12 }}>Goal: 10 life applications during training</div>
              {count >= goal && <div style={{ background:"#10b98120", border:"1px solid #10b98140", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#10b981", fontWeight:"bold", textAlign:"center", marginBottom:12 }}>Goal reached! Great work! 🎉</div>}
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <button onClick={() => onUpdate({ ...rep, lifeAppCount:Math.max(0,count-1), lastActivity:new Date().toISOString() })} style={{ background:"#ffffff10", border:"none", color:"#f0ede8", width:36, height:36, borderRadius:8, cursor:"pointer", fontSize:20 }}>-</button>
                <div style={{ flex:1, textAlign:"center", fontSize:12, color:"#ffffff50" }}>Tap + each time you complete a life application. Tap - to correct an error.</div>
                <button onClick={() => { onUpdate({ ...rep, lifeAppCount:count+1, lastActivity:new Date().toISOString() }); if (count+1===goal) { spawnConfetti(window.innerWidth/2,200); spawnEmoji(window.innerWidth/2,180,"📋"); } }} style={{ background:"#3b82f630", border:"1px solid #3b82f650", color:"#3b82f6", width:36, height:36, borderRadius:8, cursor:"pointer", fontSize:20, fontWeight:"bold" }}>+</button>
              </div>
            </div>
          );
        })()}

        {/* Business Commitment Card — rep view */}
        {(rep.track === "fast" || rep.track === "regular") && (
          <div style={{ background: rep.businessCommitment ? "#8b5cf610" : "#ffffff07", border: `1px solid ${rep.businessCommitment ? "#8b5cf640" : "#ffffff12"}`, borderRadius: 14, padding: "16px 20px", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: "bold", color: "#8b5cf6", marginBottom: 10 }}>💼 Business Commitment</div>
            <div style={{ fontSize: 11, color: "#ffffff50", marginBottom: 8 }}>Enter the dollar amount you’ve committed to your business — confirm with your trainer</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 20, color: "#8b5cf6", fontWeight: "bold" }}>$</div>
              <input
                type="number"
                value={rep.businessCommitment || ""}
                onChange={e => onUpdate({ ...rep, businessCommitment: e.target.value, lastActivity: new Date().toISOString() })}
                placeholder="Enter amount"
                style={{ background: "transparent", border: "none", borderBottom: "1px solid #8b5cf640", color: rep.businessCommitment ? "#f0ede8" : "#ffffff30", fontSize: 20, fontWeight: "bold", outline: "none", width: "100%", fontFamily: "inherit", padding: "4px 2px" }}
              />
            </div>
            {rep.businessCommitment && <div style={{ fontSize: 12, color: "#10b981", marginTop: 8 }}>✓ Commitment entered: ${Number(rep.businessCommitment).toLocaleString()}</div>}
          </div>
        )}

        {/* DGO Card — rep view */}
        {(rep.track === "fast" || rep.track === "regular") && (
          <div style={{ background: rep.dgoCompleted ? "#10b98110" : "#06b6d410", border: `1px solid ${rep.dgoCompleted ? "#10b98140" : "#06b6d440"}`, borderRadius:14, padding:"16px 20px", marginBottom:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ fontSize:14, fontWeight:"bold", color: rep.dgoCompleted ? "#10b981" : "#06b6d4" }}>🎉 Digital Grand Opening</div>
              <div onClick={() => { const updated = { ...rep, dgoCompleted: !rep.dgoCompleted, lastActivity: new Date().toISOString() }; onUpdate(updated); if (!rep.dgoCompleted) { spawnConfetti(window.innerWidth/2, 200); spawnEmoji(window.innerWidth/2, 200, "🎉"); } }} style={{ background: rep.dgoCompleted ? "#10b98120" : "#06b6d420", border: `1px solid ${rep.dgoCompleted ? "#10b98150" : "#06b6d450"}`, borderRadius:20, padding:"6px 16px", fontSize:13, fontWeight:"bold", color: rep.dgoCompleted ? "#10b981" : "#06b6d4", cursor:"pointer" }}>
                {rep.dgoCompleted ? "✓ Completed! 🎊" : "Mark Complete"}
              </div>
            </div>
            <div>
              <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>My DGO Date</div>
              <input
                type="date"
                value={rep.dgoDate || ""}
                onChange={e => onUpdate({ ...rep, dgoDate: e.target.value, lastActivity: new Date().toISOString() })}
                style={{ background:"transparent", border:"none", borderBottom:"1px solid #06b6d440", color: rep.dgoDate?"#f0ede8":"#ffffff30", fontSize:15, outline:"none", colorScheme:"dark", fontFamily:"inherit", padding:"4px 2px", width:"100%" }}
              />
              {!rep.dgoDate && <div style={{ fontSize:11, color:"#ffffff30", marginTop:4 }}>Enter your confirmed DGO date</div>}
            </div>
          </div>
        )}

        {/* Exam Date Card */}
        {(rep.track === "fast" || rep.track === "regular") && (
          <ExamDateCard
            examDate={rep.examDate||""}
            examCompleted={rep.examCompleted||false}
            onSetDate={date => onUpdate({ ...rep, examDate: date, lastActivity: new Date().toISOString() })}
            onSetCompleted={val => { onUpdate({ ...rep, examCompleted: val, lastActivity: new Date().toISOString() }); if (val) { spawnConfetti(window.innerWidth/2, 200); spawnEmoji(window.innerWidth/2, 180, "🎉"); } }}
          />
        )}

        {/* Class Scheduling Card */}
        {(rep.track === "fast" || rep.track === "regular") && (() => {
          const cardColor = rep.classCompleted ? "#10b981" : "#a78bfa";
          const dateStyle = { background:"transparent", border:"none", borderBottom:`1px solid ${rep.classCompleted?"#10b98130":"#a78bfa40"}`, color:"#f0ede8", fontSize:14, outline:"none", colorScheme:"dark", fontFamily:"inherit", padding:"4px 2px", width:"100%" };
          const classType = rep.classType || "inperson";
          return (
            <div style={{ background: rep.classCompleted ? "#10b98110" : "#a78bfa10", border:`1px solid ${rep.classCompleted?"#10b98140":"#a78bfa40"}`, borderRadius:14, padding:"16px 20px", marginBottom:16 }}>
              {/* Header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:10, color: cardColor, fontWeight:"bold", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:2 }}>Step 1 of 2 — Class</div>
                  <div style={{ fontSize:14, fontWeight:"bold", color: cardColor }}>📚 Pre-Licensing Class</div>
                </div>
                <div onClick={() => { const u = { ...rep, classCompleted: !rep.classCompleted, lastActivity: new Date().toISOString() }; onUpdate(u); if (!rep.classCompleted) { spawnConfetti(window.innerWidth/2, 200); spawnEmoji(window.innerWidth/2, 180, "🎓"); } }}
                  style={{ background: rep.classCompleted?"#10b98120":"#a78bfa20", border:`1px solid ${rep.classCompleted?"#10b98150":"#a78bfa50"}`, borderRadius:20, padding:"6px 16px", fontSize:13, fontWeight:"bold", color: cardColor, cursor:"pointer" }}>
                  {rep.classCompleted ? "✓ Complete! 🎓" : "Mark Complete"}
                </div>
              </div>

              {/* Three-way toggle */}
              <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
                {[["inperson","🏫 In-Person"],["zoom","📹 Zoom"],["online","💻 Online Course"]].map(([val, label]) => (
                  <button key={val} onClick={() => onUpdate({ ...rep, classType: val, classStartDate:"", classCompletionDate:"", lastActivity: new Date().toISOString() })}
                    style={{ flex:1, minWidth:100, padding:"8px 10px", borderRadius:10, border:`2px solid ${classType===val ? cardColor : "#ffffff20"}`, background: classType===val ? `${cardColor}18` : "transparent", color: classType===val ? cardColor : "#ffffff50", cursor:"pointer", fontSize:12, fontWeight:"bold", transition:"all 0.15s" }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* In-Person & Zoom: start + completion dates */}
              {(classType === "inperson" || classType === "zoom") && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  <div>
                    <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>
                      {classType === "zoom" ? "Zoom Class Start Date" : "Class Start Date"}
                    </div>
                    <input type="date" value={rep.classStartDate||""} onChange={e => onUpdate({ ...rep, classStartDate: e.target.value, lastActivity: new Date().toISOString() })} style={dateStyle} />
                    {!rep.classStartDate && <div style={{ fontSize:11, color:"#a78bfa", marginTop:4, fontWeight:"bold" }}>👆 Enter your scheduled class start date here</div>}
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>Completion Date</div>
                    <input type="date" value={rep.classCompletionDate||""} onChange={e => onUpdate({ ...rep, classCompletionDate: e.target.value, lastActivity: new Date().toISOString() })} style={dateStyle} />
                    {!rep.classCompletionDate && <div style={{ fontSize:11, color:"#ffffff30", marginTop:4 }}>Enter when you completed</div>}
                  </div>
                </div>
              )}

              {/* Online Course: link + start date only */}
              {classType === "online" && (
                <div>
                  <div style={{ background:"#a78bfa0f", border:"1px solid #a78bfa30", borderRadius:10, padding:"12px 14px", marginBottom:14 }}>
                    <div style={{ fontSize:12, fontWeight:"bold", color:"#a78bfa", marginBottom:6 }}>💻 Access your online course here:</div>
                    <a href="https://www-ucanpass.examfx.com/default.aspx" target="_blank" rel="noopener noreferrer"
                      style={{ fontSize:13, color:"#a78bfa", textDecoration:"none", fontWeight:"bold" }}>
                      www-ucanpass.examfx.com ↗
                    </a>
                    <div style={{ fontSize:11, color:"#ffffff40", marginTop:6 }}>Log in or create your account to begin your online licensing course.</div>
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>Online Course Start Date</div>
                    <input type="date" value={rep.classStartDate||""} onChange={e => onUpdate({ ...rep, classStartDate: e.target.value, lastActivity: new Date().toISOString() })} style={dateStyle} />
                    {!rep.classStartDate && <div style={{ fontSize:11, color:"#ffffff30", marginTop:4 }}>Enter the date you started your online course</div>}
                  </div>
                </div>
              )}

              {rep.classStartDate && !rep.classCompleted && (
                <div style={{ fontSize:12, color:"#a78bfa", marginTop:12 }}>
                  📌 {classType === "online" ? "Working through your online course" : classType === "zoom" ? "Zoom class scheduled" : "Dates entered"} — tap Mark Complete when you finish!
                </div>
              )}
            </div>
          );
        })()}

        {/* Income Goal Calculator — licensed only */}
        {(rep.track === "licensed" || rep.track === "rvp") && (
          <IncomeGoalCalculator goal={rep.incomeGoal||0} onSave={g => onUpdate({ ...rep, incomeGoal:g, lastActivity:new Date().toISOString() })} />
        )}

        {/* Life App Tracker — standalone card for licensed/RVP reps */}
        {(rep.track === "licensed" || rep.track === "rvp") && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:13, fontWeight:"bold", color:"#3b82f6", marginBottom:12, letterSpacing:"0.05em" }}>📋 Life Application Tracker</div>
            <LifeAppTracker
              apps={rep.lifeApps||[]}
              onChange={apps => onUpdate({ ...rep, lifeApps:apps, lastActivity:new Date().toISOString() })}
            />
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, background:"#ffffff08", borderRadius:10, padding:4, marginBottom:22, overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
          {[
            {key:"checklist",label:"✅ Checklist"},
            {key:"appointments",label:`📅 Appts (${apptSet})`},
            {key:"refs",label:"👥 Refs"},
            {key:"scripts",label:"📜 Scripts"},
            ...(rep.track==="licensed"||rep.track==="rvp" ? [{key:"scorecard",label:"📊 Scorecard"}] : []),
            {key:"rvp",label:"👑 RVP"},
            {key:"schedule",label:"🗓 Schedule"},
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flexShrink:0, padding:"8px 12px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:"bold", transition:"all 0.15s", background:activeTab===tab.key?"#ffffff15":"transparent", color:activeTab===tab.key?"#f0ede8":"#ffffff50", whiteSpace:"nowrap" }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab==="checklist" && (() => {
          const conditionalCats = ["If Already Licensed", "Business Commitment", "Bonus Opportunity"];
          const isLicensedTrackView = rep.track === "licensed" || rep.track === "rvp";
          return (
            <>
              {isLicensedTrackView && (
                <div style={{ marginBottom:20 }}>
                  {/* Alert banner — guides both paths */}
                  <div style={{ background:"#f59e0b0f", border:"1px solid #f59e0b30", borderLeft:"4px solid #f59e0b", borderRadius:10, padding:"14px 16px", marginBottom:12 }}>
                    <div style={{ fontSize:13, fontWeight:"bold", color:"#f59e0b", marginBottom:6 }}>⭐ Did you join already life licensed?</div>
                    <div style={{ fontSize:12, color:"#ffffff70", lineHeight:1.7 }}>
                      If you skipped the new rep training because you came in already licensed — tap below to complete these required onboarding steps. They are specific to you and must be done first.
                    </div>
                    <div style={{ fontSize:12, color:"#ffffff50", marginTop:8, paddingTop:8, borderTop:"1px solid #ffffff10" }}>
                      If you went through the full new rep training process — these steps are not for you. You can skip this section.
                    </div>
                  </div>
                  <button onClick={() => setShowConditional(s => !s)}
                    style={{ width:"100%", background: showConditional?"#f59e0b18":"#ffffff07", border:`1px solid ${showConditional?"#f59e0b40":"#ffffff15"}`, borderRadius:12, padding:"14px 18px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: showConditional ? 12 : 0 }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:"bold", color:"#f59e0b" }}>⭐ Already Licensed Onboarding Steps</div>
                      <div style={{ fontSize:11, color:"#ffffff50", marginTop:3 }}>{showConditional ? "Tap to collapse" : "Tap to expand and complete your steps"}</div>
                    </div>
                    <div style={{ fontSize:16, color:"#f59e0b" }}>{showConditional ? "▲" : "▼"}</div>
                  </button>
                  {/* DGO First — most time sensitive */}
                  {showConditional && (
                    <div style={{ background:"#06b6d410", border:"2px solid #06b6d450", borderRadius:12, padding:"16px 18px", marginBottom:12 }}>
                      <div style={{ fontSize:13, fontWeight:"bold", color:"#06b6d4", marginBottom:4 }}>🎉 Schedule Your DGO — Do This First!</div>
                      <div style={{ fontSize:12, color:"#ffffff60", marginBottom:12 }}>Book your Direction of Growth Objective meeting with your trainer immediately. This is your first priority!</div>
                      <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>DGO Date</div>
                          <input type="date" value={rep.licensedDgoDate||""} onChange={e => onUpdate({ ...rep, licensedDgoDate:e.target.value, lastActivity:new Date().toISOString() })}
                            style={{ background:"transparent", border:"none", borderBottom:"1px solid #06b6d440", color: rep.licensedDgoDate?"#f0ede8":"#ffffff30", fontSize:13, fontWeight:"bold", outline:"none", colorScheme:"dark", fontFamily:"inherit", width:"100%" }} />
                        </div>
                        <div onClick={() => { onUpdate({ ...rep, licensedDgoComplete:!rep.licensedDgoComplete, lastActivity:new Date().toISOString() }); if (!rep.licensedDgoComplete) { spawnConfetti(window.innerWidth/2,200); } }}
                          style={{ background: rep.licensedDgoComplete?"#10b98120":"#06b6d420", border:`1px solid ${rep.licensedDgoComplete?"#10b98150":"#06b6d450"}`, borderRadius:20, padding:"8px 18px", cursor:"pointer", fontSize:13, color: rep.licensedDgoComplete?"#10b981":"#06b6d4", fontWeight:"bold" }}>
                          {rep.licensedDgoComplete ? "✓ DGO Completed!" : "Mark Complete"}
                        </div>
                      </div>
                    </div>
                  )}
                  {showConditional && conditionalCats.map(cat => (
                    <CategorySection key={cat} title={cat}
                      items={repChecklist.filter(i=>i.category===cat)}
                      completedIds={rep.repCompleted}
                      onToggle={toggleItem}
                      isRepView={true}
                      inlineContent={{
                        "l3": <LicensedRefsInput refs={rep.licensedRefs||[]} onChange={refs => onUpdate({ ...rep, licensedRefs:refs, lastActivity:new Date().toISOString() })} />,
                        "l4": <div style={{ background:"#f59e0b10", border:"1px solid #f59e0b30", borderLeft:"3px solid #f59e0b", borderRadius:10, padding:"12px 16px", marginTop:4 }}><div style={{ fontSize:13, color:"#f59e0b", fontWeight:"bold", marginBottom:4 }}>⭐ Ready to build your list?</div><div style={{ fontSize:12, color:"#ffffff60" }}>Head to the <strong style={{ color:"#f0ede8" }}>📅 Appointments tab</strong> to log your 20 MACHO contacts and score them — everything is already set up there!</div></div>,
                      }}
                    />
                  ))}
                  {showConditional && (
                    <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:8 }}>

                    </div>
                  )}
                </div>
              )}
              {repCats.filter(cat => !conditionalCats.includes(cat)).map(cat => (
                <CategorySection key={cat} title={cat} items={repChecklist.filter(i=>i.category===cat)} completedIds={rep.repCompleted} onToggle={toggleItem} isRepView={true} />
              ))}
              {/* Messaging always at bottom of checklist */}
              <RepMessaging rep={rep} onUpdate={onUpdate} isTrainer={false} />
            </>
          );
        })()}
        {activeTab==="appointments" && (
          <div><AppointmentReminderBanner /><RepAppointmentTracker appointments={rep.appointments||[]} onChange={appts => onUpdate({ ...rep, appointments:appts, lastActivity:new Date().toISOString() })} trainerLink={trainerLink} /></div>
        )}
        {activeTab==="schedule" && (
          <TeamScheduleView schedule={schedule} isAdmin={false} onUpdate={() => {}} cancellations={cancellations} />
        )}
        {activeTab==="refs" && (
          <ReferencesSection
            references={rep.references||[]}
            onChange={refs => onUpdate({ ...rep, references: refs, lastActivity: new Date().toISOString() })}
          />
        )}
        {activeTab==="scripts" && <ScriptsSection />}

        {activeTab==="scorecard" && (
          <WeeklyScorecard
            activity={rep.weeklyActivity||{}}
            onChange={act => onUpdate({ ...rep, weeklyActivity:act, lastActivity:new Date().toISOString() })}
            autoLifeApps={(rep.lifeApps||[]).filter(a=>a.clientName).length}
            autoInvestments={rep.pacCount||0}
          />
        )}
        {activeTab==="rvp" && (
          <RvpChecklist
            completedIds={rep.rvpCompleted||[]}
            promotionDate={rep.rvpPromotionDate||""}
            onToggle={(id) => { const updated = { ...rep, rvpCompleted: (rep.rvpCompleted||[]).includes(id) ? (rep.rvpCompleted||[]).filter(x=>x!==id) : [...(rep.rvpCompleted||[]),id], lastActivity: new Date().toISOString() }; onUpdate(updated); }}
            onSetDate={(date) => onUpdate({ ...rep, rvpPromotionDate: date, lastActivity: new Date().toISOString() })}
            isRepView={true}
          />
        )}
      </div>
    </div>
  );
}

const inputStyle = { background: "#ffffff0d", border: "1px solid #ffffff20", borderRadius: 8, padding: "10px 14px", color: "#f0ede8", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" };
const labelStyle = { fontSize: 11, color: "#ffffff60", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, display: "block" };

// ─── TRAINER ACCOUNTABILITY HELPERS ──────────────────────────────────────────
function getTrainerActivityScore(trainerReps) {
  if (!trainerReps.length) return { grade: "N/A", color: "#ffffff40", score: 0 };
  let score = 0;
  let max = 0;
  trainerReps.forEach(rep => {
    max += 3;
    const checkIns = rep.checkIns || [];
    const lastCI = checkIns[0];
    const daysSinceCI = lastCI ? Math.floor((new Date() - new Date(lastCI.date)) / 86400000) : 99;
    if (daysSinceCI <= 1) score += 1;
    else if (daysSinceCI <= 3) score += 0.5;
    const overallPct = Math.round((pct(rep.trainerCompleted.length, TRAINER_CHECKLIST.length) + pct(rep.repCompleted.length, TRACK_INFO[rep.track].checklist.length)) / 2);
    if (overallPct >= 75) score += 1;
    else if (overallPct >= 40) score += 0.5;
    const apptSet = (rep.appointments || []).filter(a => a.name).length;
    if (apptSet >= 15) score += 1;
    else if (apptSet >= 8) score += 0.5;
  });
  const pctScore = max > 0 ? score / max : 0;
  if (pctScore >= 0.85) return { grade: "A", color: "#10b981", score: Math.round(pctScore * 100) };
  if (pctScore >= 0.7) return { grade: "B", color: "#f59e0b", score: Math.round(pctScore * 100) };
  if (pctScore >= 0.5) return { grade: "C", color: "#f97316", score: Math.round(pctScore * 100) };
  return { grade: "F", color: "#f43f5e", score: Math.round(pctScore * 100) };
}

function getCheckInStreak(trainerReps) {
  // Count consecutive days with at least one check-in across all reps
  const allDates = new Set();
  trainerReps.forEach(rep => (rep.checkIns || []).forEach(ci => allDates.add(ci.date)));
  let streak = 0;
  let d = new Date();
  for (let i = 0; i < 30; i++) {
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    if (allDates.has(key)) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

function getOverdueReps(trainerReps) {
  return trainerReps.filter(rep => {
    const checkIns = rep.checkIns || [];
    const lastCI = checkIns[0];
    const days = lastCI ? Math.floor((new Date() - new Date(lastCI.date)) / 86400000) : 99;
    return days >= 3 && !isGraduated(rep);
  });
}

// ─── CHECK-IN SECTION ────────────────────────────────────────────────────────
function CheckInSection({ checkIns = [], onAddCheckIn }) {
  const [noteDraft, setNoteDraft] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const lastCheckIn = checkIns[0];
  const daysSinceLast = lastCheckIn ? Math.floor((new Date() - new Date(lastCheckIn.date)) / 86400000) : null;
  const needsCheckIn = daysSinceLast === null || daysSinceLast >= 3;

  const handleSubmit = () => {
    if (!noteDraft.trim()) return;
    onAddCheckIn(noteDraft.trim());
    setNoteDraft("");
  };

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Reminder banner */}
      {needsCheckIn && (
        <div style={{ background: daysSinceLast === null ? "#f59e0b12" : "#f43f5e10", border: `1px solid ${daysSinceLast === null ? "#f59e0b35" : "#f43f5e35"}`, borderRadius: 10, padding: "10px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 18 }}>{daysSinceLast === null ? "👋" : "⏰"}</div>
          <div style={{ fontSize: 13, color: daysSinceLast === null ? "#f59e0b" : "#f43f5e", fontWeight: "bold" }}>
            {daysSinceLast === null ? "No check-ins yet — log your first one below!" : `Last check-in was ${daysSinceLast} day${daysSinceLast !== 1 ? "s" : ""} ago — time to follow up!`}
          </div>
        </div>
      )}
      {!needsCheckIn && lastCheckIn && (
        <div style={{ background: "#10b98110", border: "1px solid #10b98130", borderRadius: 10, padding: "8px 14px", marginBottom: 12, fontSize: 12, color: "#10b981" }}>
          ✓ Checked in {daysSinceLast === 0 ? "today" : `${daysSinceLast} day${daysSinceLast !== 1 ? "s" : ""} ago`} — "{lastCheckIn.note}"
        </div>
      )}

      {/* Log new check-in */}
      <div style={{ background: "#ffffff07", border: "1px solid #ffffff12", borderRadius: 12, padding: "16px" }}>
        <div style={{ fontSize: 12, fontWeight: "bold", color: "#f59e0b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>📋 Log a Check-In</div>
        <textarea
          value={noteDraft}
          onChange={e => setNoteDraft(e.target.value)}
          placeholder='e.g. "Checked in — reviewed exam simulator progress, on track" or "Reminded rep to complete FNA this week"'
          style={{ background: "#ffffff0d", border: "1px solid #ffffff20", borderRadius: 8, padding: "10px 14px", color: "#f0ede8", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box", resize: "vertical", minHeight: 80, fontFamily: "inherit", marginBottom: 10 }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => setShowHistory(h => !h)}
            style={{ background: "none", border: "none", color: "#ffffff40", cursor: "pointer", fontSize: 12, padding: 0 }}>
            {showHistory ? "Hide" : `View history (${checkIns.length})`}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!noteDraft.trim()}
            style={{ background: noteDraft.trim() ? "#f59e0b" : "#ffffff15", border: "none", color: noteDraft.trim() ? "#0f0f11" : "#ffffff30", padding: "8px 20px", borderRadius: 8, cursor: noteDraft.trim() ? "pointer" : "default", fontWeight: "bold", fontSize: 13, transition: "all 0.15s" }}>
            ✓ Log Check-In
          </button>
        </div>

        {/* History */}
        {showHistory && checkIns.length > 0 && (
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
            {checkIns.map(ci => (
              <div key={ci.id} style={{ background: "#ffffff06", border: "1px solid #ffffff10", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: "bold" }}>{ci.date} · {ci.time}</div>
                  {ci.trainer && <div style={{ fontSize: 11, color: "#ffffff40" }}>{ci.trainer}</div>}
                </div>
                <div style={{ fontSize: 13, color: "#f0ede8", lineHeight: 1.5 }}>{ci.note}</div>
              </div>
            ))}
          </div>
        )}
        {showHistory && checkIns.length === 0 && (
          <div style={{ marginTop: 12, fontSize: 13, color: "#ffffff30", textAlign: "center" }}>No check-ins logged yet.</div>
        )}
      </div>
    </div>
  );
}

// ─── REP ACCOUNTABILITY BANNER ───────────────────────────────────────────────
function RepAccountabilityBanner({ rep }) {
  const track = TRACK_INFO[rep.track];
  const repChecklist = track.checklist;
  const rp = pct(rep.repCompleted.length, repChecklist.length);
  const apptSet = (rep.appointments || []).filter(a => a.name).length;
  const quote = getDailyQuote();

  // Countdown to graduation
  let daysLeft = null;
  let isOverdue = false;
  if (rep.gradDate) {
    daysLeft = Math.ceil((new Date(rep.gradDate) - new Date()) / 86400000);
    isOverdue = daysLeft < 0;
  }

  // Expected progress based on time elapsed
  let behindAlert = null;
  if (rep.startDate && rep.gradDate) {
    const totalDays = Math.ceil((new Date(rep.gradDate) - new Date(rep.startDate)) / 86400000);
    const elapsed = Math.ceil((new Date() - new Date(rep.startDate)) / 86400000);
    const expectedPct = Math.min(100, Math.round((elapsed / totalDays) * 100));
    if (rp < expectedPct - 15) {
      behindAlert = { expected: expectedPct, actual: rp, gap: expectedPct - rp };
    }
  }

  // What's overdue / not started
  const notStarted = repChecklist.filter(i => !rep.repCompleted.includes(i.id));
  const overdueItems = notStarted.slice(0, 3); // show top 3 not done

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Daily quote */}
      <div style={{ background: "linear-gradient(135deg,#1a0a2e,#0f3460)", border: "1px solid #ffffff15", borderRadius: 14, padding: "16px 20px", marginBottom: 12, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "#f59e0b", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>💫 Today’s Motivation</div>
        <div style={{ fontSize: 15, color: "#f0ede8", fontStyle: "italic", lineHeight: 1.6, marginBottom: 6 }}>"{quote.text}"</div>
        <div style={{ fontSize: 12, color: "#ffffff50" }}>— {quote.author}</div>
      </div>

      {/* Countdown */}
      {daysLeft !== null && (
        <div style={{ background: isOverdue ? "#f43f5e12" : daysLeft <= 3 ? "#f59e0b12" : "#10b98112", border: `1px solid ${isOverdue ? "#f43f5e40" : daysLeft <= 3 ? "#f59e0b40" : "#10b98140"}`, borderRadius: 12, padding: "14px 18px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "#ffffff50", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              {isOverdue ? "⚠️ Past Graduation Date!" : "⏳ Days Until Graduation"}
            </div>
            <div style={{ fontSize: 26, fontWeight: "bold", color: isOverdue ? "#f43f5e" : daysLeft <= 3 ? "#f59e0b" : "#10b981" }}>
              {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
            </div>
          </div>
          <div style={{ fontSize: 36 }}>{isOverdue ? "🚨" : daysLeft <= 3 ? "⚡" : "🎯"}</div>
        </div>
      )}

      {/* Behind alert */}
      {behindAlert && (
        <div style={{ background: "#f43f5e0f", border: "1px solid #f43f5e35", borderRadius: 12, padding: "14px 18px", marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: "bold", color: "#f43f5e", marginBottom: 6 }}>📉 You’re behind pace — time to catch up!</div>
          <div style={{ fontSize: 12, color: "#ffffff60", marginBottom: 8 }}>At this point you should be about {behindAlert.expected}% done, but you're at {behindAlert.actual}%. You're {behindAlert.gap}% behind.</div>
          <div style={{ fontSize: 12, color: "#f59e0b" }}>💡 Focus on your top uncompleted tasks and contact your trainer today!</div>
        </div>
      )}

      {/* Overdue tasks reminder */}
      {overdueItems.length > 0 && rp < 100 && (
        <div style={{ background: "#ffffff07", border: "1px solid #ffffff12", borderRadius: 12, padding: "14px 18px", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: "bold", color: "#f59e0b", marginBottom: 10 }}>📌 Still needs your attention:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {overdueItems.map(item => (
              <div key={item.id} style={{ fontSize: 12, color: "#ffffff60", display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ color: "#f43f5e", flexShrink: 0 }}>•</span>
                <span>{item.task}</span>
              </div>
            ))}
            {notStarted.length > 3 && <div style={{ fontSize: 12, color: "#ffffff40" }}>...and {notStarted.length - 3} more tasks remaining</div>}
          </div>
        </div>
      )}

      {/* Appointments reminder */}
      {apptSet < 15 && (rep.track === "fast" || rep.track === "regular") && (
        <div style={{ background: "#3b82f610", border: "1px solid #3b82f630", borderRadius: 12, padding: "12px 16px", marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: "#3b82f6", fontWeight: "bold" }}>📅 Appointments: {apptSet}/15 set</div>
          <div style={{ fontSize: 12, color: "#ffffff50", marginTop: 4 }}>You need 15–20 training appointments. {15 - apptSet} more to go!</div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN ADDER ─────────────────────────────────────────────────────────────
function AdminAdder({ onAdd }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (!name.trim() || pin.length < 4) return;
    onAdd(name, pin);
    setName(""); setPin(""); setShowForm(false);
  };

  if (!showForm) return (
    <button onClick={() => setShowForm(true)} style={{ background:"#f59e0b15", border:"1px dashed #f59e0b40", color:"#f59e0b", borderRadius:10, padding:"10px 16px", cursor:"pointer", fontSize:13, width:"100%", marginBottom:4 }}>
      + Add New Admin
    </button>
  );

  return (
    <div style={{ background:"#f59e0b0a", border:"1px solid #f59e0b30", borderRadius:10, padding:"14px 16px", marginBottom:4 }}>
      <div style={{ fontSize:12, color:"#f59e0b", fontWeight:"bold", marginBottom:12 }}>New Admin</div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Admin name" style={{ background:"#ffffff0d", border:"1px solid #ffffff20", borderRadius:8, padding:"9px 14px", color:"#f0ede8", fontSize:13, outline:"none" }} />
        <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="Set PIN (min 4 digits)" maxLength={6} style={{ background:"#ffffff0d", border:"1px solid #ffffff20", borderRadius:8, padding:"9px 14px", color:"#f0ede8", fontSize:13, outline:"none", letterSpacing:"0.2em" }} />
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={handleAdd} disabled={!name.trim()||pin.length<4} style={{ background:name.trim()&&pin.length>=4?"#f59e0b":"#ffffff15", border:"none", color:name.trim()&&pin.length>=4?"#0f0f11":"#ffffff30", padding:"9px 20px", borderRadius:8, cursor:name.trim()&&pin.length>=4?"pointer":"default", fontWeight:"bold", fontSize:13, flex:1 }}>Create Admin</button>
          <button onClick={() => { setShowForm(false); setName(""); setPin(""); }} style={{ background:"none", border:"1px solid #ffffff20", color:"#ffffff60", padding:"9px 16px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── REP PHOTO UPLOAD ─────────────────────────────────────────────────────────
function RepPhotoUpload({ photo, onUpdate }) {
  const fileRef = React.useRef();
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Photo must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onload = () => onUpdate(reader.result);
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:20 }}>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display:"none" }} />
      <div onClick={() => fileRef.current.click()} style={{ cursor:"pointer", position:"relative" }}>
        {photo
          ? <img src={photo} alt="Profile" style={{ width:90, height:90, borderRadius:"50%", objectFit:"cover", border:"3px solid #f59e0b" }} />
          : <div style={{ width:90, height:90, borderRadius:"50%", background:"#ffffff10", border:"2px dashed #ffffff30", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <div style={{ fontSize:28 }}>📷</div>
              <div style={{ fontSize:10, color:"#ffffff40", marginTop:4 }}>Add Photo</div>
            </div>
        }
        <div style={{ position:"absolute", bottom:0, right:0, background:"#f59e0b", borderRadius:"50%", width:26, height:26, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>✏️</div>
      </div>
      {photo && <button onClick={() => onUpdate(null)} style={{ background:"none", border:"none", color:"#f43f5e80", cursor:"pointer", fontSize:11, marginTop:6 }}>Remove photo</button>}
    </div>
  );
}

// ─── APPOINTMENT REMINDER BANNER ──────────────────────────────────────────────
function AppointmentReminderBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div style={{ background:"linear-gradient(135deg,#f59e0b18,#f43f5e0f)", border:"1px solid #f59e0b40", borderLeft:"4px solid #f59e0b", borderRadius:14, padding:"18px 20px", marginBottom:20, position:"relative" }}>
      <button onClick={() => setDismissed(true)} style={{ position:"absolute", top:10, right:12, background:"none", border:"none", color:"#ffffff40", fontSize:20, cursor:"pointer" }}>x</button>
      <div style={{ fontSize:20, marginBottom:8 }}>🎯</div>
      <div style={{ fontSize:15, fontWeight:"bold", color:"#f59e0b", marginBottom:10 }}>Remember Your Purpose!</div>
      <div style={{ fontSize:13, color:"#ffffff70", lineHeight:1.7, marginBottom:12 }}>
        Your training appointments are primarily for <strong style={{ color:"#f0ede8" }}>YOUR development</strong>, not to recruit or sell.
        If a client or recruit comes out of it — amazing! But your <strong style={{ color:"#f0ede8" }}>#1 goal</strong> is to get in front of your trainer and sharpen your skills.
      </div>
      <div style={{ background:"#ffffff0a", border:"1px solid #ffffff15", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#f59e0b", display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:16 }}>📜</span>
        <span>Need help setting appointments? <strong>Tap the Scripts tab</strong> — it has everything you need to make the call with confidence!</span>
      </div>
    </div>
  );
}

// ─── MONTHLY HISTORY ──────────────────────────────────────────────────────────
function MonthlyHistory({ monthlyData }) {
  const months = getPrevMonths(monthlyData);
  if (months.length === 0) return null;
  return (
    <div style={{ background:"#ffffff07", border:"1px solid #ffffff12", borderRadius:14, padding:"18px 20px", marginBottom:16 }}>
      <div style={{ fontSize:12, color:"#ffffff50", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:14 }}>📅 Monthly History</div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {months.map(key => {
          const m = monthlyData[key];
          return (
            <div key={key} style={{ background:"#ffffff05", border:"1px solid #ffffff10", borderRadius:10, padding:"12px 16px" }}>
              <div style={{ fontSize:13, fontWeight:"bold", color:"#f59e0b", marginBottom:8 }}>{m.label || getMonthLabel(key)}</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                {[
                  { label:"Premium", value:"$"+(m.premium||0).toLocaleString(), color:"#10b981" },
                  { label:"Recruits", value:m.recruits||0, color:"#3b82f6" },
                  { label:"Licensed", value:m.licensed||0, color:"#a78bfa" },
                  { label:"Appts Done", value:m.apptsDone||0, color:"#f43f5e" },
                ].map(s => (
                  <div key={s.label} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:16, fontWeight:"bold", color:s.color }}>{s.value}</div>
                    <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── GOAL BAR ─────────────────────────────────────────────────────────────────
function GoalBar({ label, value, goal, color, prefix, suffix, emoji }) {
  prefix = prefix || "";
  suffix = suffix || "";
  const p = Math.min(100, Math.round((value/goal)*100));
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <div style={{ fontSize:13, fontWeight:"bold", color:"#f0ede8" }}>{emoji} {label}</div>
        <div style={{ fontSize:13, fontWeight:"bold", color:p>=100?"#10b981":color }}>
          {prefix}{value.toLocaleString()}{suffix} <span style={{ color:"#ffffff40", fontWeight:"normal" }}>/ {prefix}{goal.toLocaleString()}{suffix}</span>
        </div>
      </div>
      <div style={{ background:"#ffffff10", borderRadius:99, height:12, overflow:"hidden", position:"relative" }}>
        <div style={{ width:`${p}%`, height:"100%", background:p>=100?"#10b981":`linear-gradient(90deg,${color},${color}cc)`, borderRadius:99, transition:"width 0.6s ease" }} />
      </div>
      {p>=100 && <div style={{ fontSize:11, color:"#10b981", marginTop:4, fontWeight:"bold" }}>Goal reached!</div>}
    </div>
  );
}

// ─── PRODUCTION DASHBOARD ─────────────────────────────────────────────────────
const PROD_GOALS = { premium:10000, recruits:10, licenses:100 };

function ProductionDashboard({ reps, trainers, admins, currentAdminId, isSuperAdmin, onUpdateRep, onSnapshot, monthlyData }) {
  const [activeFilter, setActiveFilter] = useState(currentAdminId || "all");
  const [showRepInput, setShowRepInput] = useState(null);
  const [premiumInput, setPremiumInput] = useState("");
  const [prodOpen, setProdOpen] = useState(false);

  const filteredReps = isSuperAdmin && activeFilter === "all"
    ? reps
    : reps.filter(r => {
        const tr = trainers.find(t => t.id === r.trainerId);
        return tr?.adminId === (isSuperAdmin ? activeFilter : currentAdminId) || r.adminId === (isSuperAdmin ? activeFilter : currentAdminId);
      });

  const totalPremium = filteredReps.filter(r => r.isLicensed || r.examCompleted).reduce((s,r) => s+(Number(r.premiumSubmitted)||0), 0);
  const totalRecruits = filteredReps.filter(r => r.isRecruited).length;
  const totalLicensed = filteredReps.filter(r => r.isLicensed || r.examCompleted).length;
  const apptsDone = filteredReps.reduce((s,r) => s+(r.appointments||[]).filter(a=>a.completed||a.status==="completed").length, 0);

  const trainerStats = trainers
    .filter(t => isSuperAdmin ? (activeFilter==="all"||t.adminId===activeFilter) : t.adminId===currentAdminId)
    .map(t => {
      const tr = filteredReps.filter(r => r.trainerId===t.id);
      return { trainer:t, reps:tr.length, premium:tr.reduce((s,r)=>s+(Number(r.premiumSubmitted)||0),0), licensed:tr.filter(r=>r.isLicensed||r.examCompleted).length, appts:tr.reduce((s,r)=>s+(r.appointments||[]).filter(a=>a.completed||a.status==="completed").length,0) };
    }).sort((a,b) => b.premium-a.premium);

  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <div style={{ fontSize:14, fontWeight:"bold", color:"#f59e0b" }}>📊 Team Production Dashboard</div>
        {isSuperAdmin && (
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            <button onClick={() => setActiveFilter("all")} style={{ padding:"5px 12px", borderRadius:20, border:`1px solid ${activeFilter==="all"?"#f59e0b":"#ffffff20"}`, background:activeFilter==="all"?"#f59e0b18":"transparent", color:activeFilter==="all"?"#f59e0b":"#ffffff50", cursor:"pointer", fontSize:11 }}>All</button>
            {admins.map(a => (
              <button key={a.id} onClick={() => setActiveFilter(a.id)} style={{ padding:"5px 12px", borderRadius:20, border:`1px solid ${activeFilter===a.id?a.color:"#ffffff20"}`, background:activeFilter===a.id?`${a.color}18`:"transparent", color:activeFilter===a.id?a.color:"#ffffff50", cursor:"pointer", fontSize:11 }}>{a.name}</button>
            ))}
          </div>
        )}
      </div>

      {/* New month banner */}
      {onSnapshot && (
        <div style={{ textAlign:"right", marginBottom:12 }}>
          <button onClick={onSnapshot} style={{ background:"none", border:"1px solid #f59e0b40", color:"#f59e0b", padding:"6px 14px", borderRadius:8, cursor:"pointer", fontSize:12 }}>📅 Save Month and Reset</button>
        </div>
      )}

      {/* Monthly History */}
      <MonthlyHistory monthlyData={monthlyData} />

      {/* Goal Bars */}
      <div style={{ background:"#ffffff07", border:"1px solid #ffffff12", borderRadius:14, padding:"20px 22px", marginBottom:16 }}>
        <div style={{ fontSize:12, color:"#ffffff50", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:16 }}>Team Goals</div>
        <GoalBar label="Premium Submitted" value={totalPremium} goal={PROD_GOALS.premium} color="#10b981" prefix="$" emoji="💰" />
        <GoalBar label="New Recruits" value={totalRecruits} goal={PROD_GOALS.recruits} color="#3b82f6" emoji="👥" />
        <GoalBar label="Licensed Agents" value={totalLicensed} goal={PROD_GOALS.licenses} color="#a78bfa" emoji="📜" />
        <div style={{ borderTop:"1px solid #ffffff10", paddingTop:14, marginTop:4, display:"flex", gap:12, flexWrap:"wrap" }}>
          {[
            { label:"Appointments Done", value:apptsDone, color:"#f43f5e", emoji:"📅" },
            { label:"Active Reps", value:filteredReps.length, color:"#f59e0b", emoji:"🌟" },
          ].map(s => (
            <div key={s.label} style={{ flex:1, minWidth:120, background:"#ffffff06", borderRadius:10, padding:"12px 14px", textAlign:"center" }}>
              <div style={{ fontSize:24, fontWeight:"bold", color:s.color }}>{s.value}</div>
              <div style={{ fontSize:11, color:"#ffffff50", marginTop:3 }}>{s.emoji} {s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trainer Leaderboard */}
      {trainerStats.length > 0 && (
        <div style={{ background:"#ffffff07", border:"1px solid #ffffff12", borderRadius:14, padding:"18px 20px", marginBottom:16 }}>
          <div style={{ fontSize:12, color:"#ffffff50", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:14 }}>🏆 Trainer Leaderboard</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {trainerStats.map((ts,idx) => (
              <div key={ts.trainer.id} style={{ background:idx===0?"#f59e0b0a":"#ffffff05", border:`1px solid ${idx===0?"#f59e0b25":"#ffffff10"}`, borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <div style={{ fontSize:18, fontWeight:"bold", color:idx===0?"#f59e0b":"#ffffff30", width:28 }}>{idx===0?"🥇":idx===1?"🥈":idx===2?"🥉":"#"+(idx+1)}</div>
                <div style={{ width:10, height:10, borderRadius:"50%", background:ts.trainer.color, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:"bold" }}>{ts.trainer.name}</div>
                  <div style={{ fontSize:11, color:"#ffffff40", marginTop:2 }}>{ts.reps} reps · {ts.appts} appts done</div>
                </div>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  <div style={{ textAlign:"center" }}><div style={{ fontSize:15, fontWeight:"bold", color:"#10b981" }}>${ts.premium.toLocaleString()}</div><div style={{ fontSize:9, color:"#ffffff40", textTransform:"uppercase" }}>Premium</div></div>
                  <div style={{ textAlign:"center" }}><div style={{ fontSize:15, fontWeight:"bold", color:"#a78bfa" }}>{ts.licensed}</div><div style={{ fontSize:9, color:"#ffffff40", textTransform:"uppercase" }}>Licensed</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rep Production Input — collapsible */}
      <div style={{ background:"#ffffff07", border:"1px solid #ffffff12", borderRadius:14, overflow:"hidden" }}>
            <div onClick={() => setProdOpen(o => !o)} style={{ padding:"14px 20px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:12, color:"#ffffff50", letterSpacing:"0.08em", textTransform:"uppercase", fontWeight:"bold" }}>💼 Update Rep Production ({filteredReps.length} reps)</div>
              <div style={{ fontSize:16, color:"#ffffff40" }}>{prodOpen ? "▲" : "▼"}</div>
            </div>
            {prodOpen && <div style={{ padding:"0 20px 20px", display:"flex", flexDirection:"column", gap:8 }}>
          {filteredReps.map(rep => (
            <div key={rep.id} style={{ background:"#ffffff05", border:"1px solid #ffffff10", borderRadius:10, padding:"10px 14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:"bold" }}>{rep.name}</div>
                  <div style={{ fontSize:11, color:"#ffffff40" }}>
                    Premium: <span style={{ color:"#10b981", fontWeight:"bold" }}>${(Number(rep.premiumSubmitted)||0).toLocaleString()}</span>
                    {(rep.isLicensed||rep.examCompleted) && <span style={{ color:"#a78bfa", marginLeft:8 }}>📜 Licensed</span>}
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                  <div onClick={() => onUpdateRep(rep.id,"isLicensed",!rep.isLicensed)}
                    style={{ background:(rep.isLicensed||rep.examCompleted)?"#a78bfa20":"#ffffff10", border:`1px solid ${(rep.isLicensed||rep.examCompleted)?"#a78bfa50":"#ffffff20"}`, borderRadius:20, padding:"4px 12px", fontSize:11, color:(rep.isLicensed||rep.examCompleted)?"#a78bfa":"#ffffff50", cursor:"pointer", fontWeight:"bold" }}>
                    {(rep.isLicensed||rep.examCompleted) ? "Licensed" : "Mark Licensed"}
                  </div>
                  {(rep.isLicensed||rep.examCompleted) && showRepInput===rep.id ? (
                    <div style={{ display:"flex", gap:6 }}>
                      <input type="number" value={premiumInput} onChange={e=>setPremiumInput(e.target.value)} placeholder="Enter amount"
                        style={{ background:"#ffffff0d", border:"1px solid #10b98140", borderRadius:6, padding:"4px 10px", color:"#f0ede8", fontSize:12, outline:"none", width:120 }} autoFocus />
                      <button onClick={() => { onUpdateRep(rep.id,"premiumSubmitted",Number(premiumInput)||0); setShowRepInput(null); setPremiumInput(""); }}
                        style={{ background:"#10b981", border:"none", color:"#0f0f11", padding:"4px 12px", borderRadius:6, cursor:"pointer", fontSize:12, fontWeight:"bold" }}>Save</button>
                      <button onClick={() => { setShowRepInput(null); setPremiumInput(""); }}
                        style={{ background:"none", border:"1px solid #ffffff20", color:"#ffffff60", padding:"4px 10px", borderRadius:6, cursor:"pointer", fontSize:12 }}>X</button>
                    </div>
                  ) : (rep.isLicensed||rep.examCompleted) ? (
                    <button onClick={() => { setShowRepInput(rep.id); setPremiumInput(rep.premiumSubmitted||""); }}
                      style={{ background:"#10b98115", border:"1px solid #10b98140", color:"#10b981", padding:"4px 12px", borderRadius:6, cursor:"pointer", fontSize:11, fontWeight:"bold" }}>
                      💰 Update Premium
                    </button>
                  ) : (
                    <div style={{ fontSize:11, color:"#ffffff25", fontStyle:"italic" }}>License first</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>}
      </div>
    </div>
  );
}

// ─── LIFE APPLICATION TRACKER ─────────────────────────────────────────────────
const APP_STATUSES = ["Submitted","Approved","Pending","Declined"];
const STATUS_COLORS = { Submitted:"#3b82f6", Approved:"#10b981", Pending:"#f59e0b", Declined:"#f43f5e" };

function LifeAppChecklist({ app, onUpdate, onClose }) {
  const [step, setStep] = useState(1);
  const [beneAnswer, setBeneAnswer] = useState(app.beneCollected || null);
  const [investAnswer, setInvestAnswer] = useState(app.investStatus || null);

  const finish = () => {
    onUpdate({ ...app, beneCollected: beneAnswer, investStatus: investAnswer });
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"#000000cc", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#16213e", border:"1px solid #ffffff20", borderRadius:16, padding:28, width:"100%", maxWidth:420 }}>
        {step === 1 && (
          <>
            <div style={{ fontSize:22, marginBottom:12, textAlign:"center" }}>📋</div>
            <div style={{ fontSize:16, fontWeight:"bold", color:"#f0ede8", marginBottom:8, textAlign:"center" }}>Beneficiary and Emergency Contact</div>
            <div style={{ fontSize:13, color:"#ffffff60", marginBottom:20, textAlign:"center", lineHeight:1.6 }}>
              Did you collect the Beneficiary and Emergency Contact information from your client?
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <button onClick={() => { setBeneAnswer("yes"); setStep(2); }}
                style={{ background: beneAnswer==="yes" ? "#10b98120" : "#ffffff08", border:`2px solid ${beneAnswer==="yes" ? "#10b981" : "#ffffff20"}`, borderRadius:10, padding:"14px 16px", cursor:"pointer", color:"#f0ede8", fontSize:14, fontWeight:"bold", display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:20 }}>✅</span> Yes — collected
              </button>
              <button onClick={() => { setBeneAnswer("followup"); setStep(2); }}
                style={{ background: beneAnswer==="followup" ? "#f59e0b20" : "#ffffff08", border:`2px solid ${beneAnswer==="followup" ? "#f59e0b" : "#ffffff20"}`, borderRadius:10, padding:"14px 16px", cursor:"pointer", color:"#f0ede8", fontSize:14, fontWeight:"bold", display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:20 }}>⏳</span> Not yet — need to follow up
              </button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div style={{ fontSize:22, marginBottom:12, textAlign:"center" }}>💰</div>
            <div style={{ fontSize:16, fontWeight:"bold", color:"#f59e0b", marginBottom:4, textAlign:"center" }}>Buy Term and Invest the Difference</div>
            <div style={{ fontSize:13, color:"#ffffff60", marginBottom:20, textAlign:"center", lineHeight:1.6 }}>
              Every life app should come with an investment. Did you complete or schedule an investment appointment with your client?
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
              {[
                { val:"completed", icon:"✅", label:"Investment completed with client" },
                { val:"scheduled", icon:"📅", label:"Investment appointment scheduled" },
                { val:"followup", icon:"⏳", label:"Not yet — need to follow up" },
              ].map(opt => (
                <button key={opt.val} onClick={() => setInvestAnswer(opt.val)}
                  style={{ background: investAnswer===opt.val ? "#f59e0b20" : "#ffffff08", border:`2px solid ${investAnswer===opt.val ? "#f59e0b" : "#ffffff20"}`, borderRadius:10, padding:"14px 16px", cursor:"pointer", color:"#f0ede8", fontSize:14, fontWeight:"bold", display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:20 }}>{opt.icon}</span> {opt.label}
                </button>
              ))}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setStep(1)} style={{ flex:1, background:"none", border:"1px solid #ffffff20", color:"#ffffff60", padding:"10px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Back</button>
              <button onClick={finish} disabled={!investAnswer}
                style={{ flex:2, background: investAnswer ? "#f59e0b" : "#ffffff15", border:"none", color: investAnswer ? "#0f0f11" : "#ffffff30", padding:"10px", borderRadius:8, cursor: investAnswer ? "pointer" : "default", fontSize:14, fontWeight:"bold" }}>
                Save and Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function LifeAppTracker({ apps = [], onChange, readOnly = false }) {
  const [showChecklist, setShowChecklist] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [pendingNewId, setPendingNewId] = useState(null);

  const addApp = () => {
    const newApp = { id: Date.now().toString(), clientName:"", phone:"", email:"", coverageAmount:"", premium:"", appDate: new Date().toISOString().split("T")[0], status:"Submitted", policyNumber:"", notes:"", beneCollected: null, investStatus: null };
    const updated = [...apps, newApp];
    onChange(updated);
    setExpandedIdx(updated.length - 1);
    setPendingNewId(newApp.id);
  };

  const updateApp = (id, field, value) => {
    const updated = apps.map(a => a.id !== id ? a : { ...a, [field]: value });
    onChange(updated);
    // Show checklist popup when client name is first entered
    if (field === "clientName" && value.trim() && !apps.find(a => a.id === id)?.clientName) {
      setTimeout(() => setShowChecklist(id), 300);
    }
  };

  const submitted = apps.filter(a => a.clientName).length;
  const investmentsDone = apps.filter(a => a.investStatus === "completed").length;
  const needsBene = apps.filter(a => a.clientName && a.beneCollected !== "yes").length;
  const needsInvest = apps.filter(a => a.clientName && a.investStatus !== "completed" && a.investStatus !== "scheduled").length;

  const fieldStyle = { background:"transparent", border:"none", borderBottom:"1px solid #ffffff15", color:"#f0ede8", fontSize:13, outline:"none", width:"100%", padding:"4px 2px", fontFamily:"inherit" };

  return (
    <div>
      {showChecklist && (
        <LifeAppChecklist
          app={apps.find(a => a.id === showChecklist) || {}}
          onUpdate={(updated) => onChange(apps.map(a => a.id !== updated.id ? a : updated))}
          onClose={() => setShowChecklist(null)}
        />
      )}
      {pendingNewId && (() => {
        const pendingApp = apps.find(a => a.id === pendingNewId);
        if (!pendingApp) { setPendingNewId(null); return null; }
        return (
          <div style={{ position:"fixed", inset:0, background:"#000000cc", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
            <div style={{ background:"#16213e", border:"1px solid #ffffff20", borderRadius:16, padding:28, width:"100%", maxWidth:420 }}>
              <div style={{ fontSize:22, marginBottom:12, textAlign:"center" }}>📋</div>
              <div style={{ fontSize:16, fontWeight:"bold", color:"#f0ede8", marginBottom:8, textAlign:"center" }}>New Life Application</div>
              <div style={{ fontSize:13, color:"#ffffff60", marginBottom:20, textAlign:"center" }}>Enter your client name to get started</div>
              <input
                autoFocus
                value={pendingApp.clientName||""}
                onChange={e => { const updated = apps.map(a => a.id !== pendingNewId ? a : { ...a, clientName: e.target.value }); onChange(updated); }}
                placeholder="Future client full name"
                style={{ background:"#ffffff0d", border:"1px solid #ffffff20", borderRadius:8, padding:"12px 14px", color:"#f0ede8", fontSize:15, outline:"none", width:"100%", boxSizing:"border-box", marginBottom:16, fontFamily:"inherit" }}
              />
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => { onChange(apps.filter(a => a.id !== pendingNewId)); setPendingNewId(null); }}
                  style={{ flex:1, background:"none", border:"1px solid #ffffff20", color:"#ffffff60", padding:"12px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Cancel</button>
                <button onClick={() => { if (pendingApp.clientName?.trim()) { setPendingNewId(null); setShowChecklist(pendingNewId); } }}
                  disabled={!pendingApp.clientName?.trim()}
                  style={{ flex:2, background: pendingApp.clientName?.trim()?"#3b82f6":"#ffffff15", border:"none", color: pendingApp.clientName?.trim()?"#fff":"#ffffff30", padding:"12px", borderRadius:8, cursor: pendingApp.clientName?.trim()?"pointer":"default", fontWeight:"bold", fontSize:14 }}>
                  Next — Checklist ➜
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Counter display */}
      <div style={{ background:"#3b82f610", border:"1px solid #3b82f630", borderRadius:14, padding:"18px 20px", marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <div style={{ fontSize:14, fontWeight:"bold", color:"#3b82f6" }}>📋 Life Applications</div>
          <div style={{ fontSize:28, fontWeight:"bold", color:"#3b82f6" }}>{submitted}</div>
        </div>
        <div style={{ background:"#ffffff10", borderRadius:99, height:8, overflow:"hidden", marginBottom:8 }}>
          <div style={{ width:`${Math.min(100,Math.round((submitted/20)*100))}%`, height:"100%", background:"linear-gradient(90deg,#3b82f6,#10b981)", borderRadius:99, transition:"width 0.5s ease" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#ffffff40", marginBottom: (needsBene>0||needsInvest>0) ? 8 : 0 }}>
          <span>{submitted} apps logged · {investmentsDone} investments completed</span>
          <span>Goal: 20/month</span>
        </div>
        {needsBene > 0 && <div style={{ fontSize:12, color:"#f43f5e", marginTop:4 }}>⚠️ {needsBene} client{needsBene!==1?"s":""} still need Beneficiary and Emergency Contact info</div>}
        {needsInvest > 0 && <div style={{ fontSize:12, color:"#f59e0b", marginTop:4 }}>💰 {needsInvest} client{needsInvest!==1?"s":""} still need an investment — Buy Term and Invest the Difference!</div>}
      </div>

      {/* App list */}
      <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
        {apps.filter(a => a.clientName).map((app, idx) => {
          const isExpanded = expandedIdx === idx;
          const statusColor = STATUS_COLORS[app.status] || "#ffffff50";
          return (
            <div key={app.id} style={{ background:"#ffffff07", border:`1px solid ${statusColor}30`, borderRadius:12, overflow:"hidden" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", cursor:"pointer" }} onClick={() => { setExpandedIdx(isExpanded ? null : idx); if (!readOnly && app.clientName && app.beneCollected === null && app.investStatus === null) setShowChecklist(app.id); }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:"bold", color:"#f0ede8" }}>{app.clientName}</div>
                  <div style={{ fontSize:11, color:"#ffffff40", marginTop:2 }}>
                    {app.appDate} · {app.premium ? "$"+Number(app.premium).toLocaleString()+" premium" : "No premium entered"}
                    {app.beneCollected === "yes" && <span style={{ color:"#10b981", marginLeft:8 }}>✓ Bene</span>}
                    {app.beneCollected !== "yes" && app.clientName && <span style={{ color:"#f43f5e", marginLeft:8 }}>⚠ Bene needed</span>}
                    {app.investStatus === "completed" && <span style={{ color:"#10b981", marginLeft:8 }}>✓ Invested</span>}
                    {app.investStatus === "scheduled" && <span style={{ color:"#f59e0b", marginLeft:8 }}>📅 Invest scheduled</span>}
                    {(!app.investStatus || app.investStatus === "followup") && app.clientName && <span style={{ color:"#f59e0b", marginLeft:8 }}>💰 Invest needed</span>}
                  </div>
                </div>
                <div style={{ background:`${statusColor}20`, border:`1px solid ${statusColor}50`, borderRadius:20, padding:"3px 12px", fontSize:11, color:statusColor, fontWeight:"bold" }}>{app.status}</div>
                {!readOnly && <button onClick={e => { e.stopPropagation(); onChange(apps.filter(a => a.id !== app.id)); }} style={{ background:"#f43f5e15", border:"1px solid #f43f5e30", color:"#f43f5e", borderRadius:20, padding:"3px 10px", fontSize:11, cursor:"pointer" }}>✕ Remove</button>}
                <div style={{ fontSize:12, color:"#ffffff30" }}>{isExpanded ? "▲" : "▼"}</div>
              </div>
              {isExpanded && !readOnly && (
                <div style={{ padding:"0 14px 14px", borderTop:"1px solid #ffffff08" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 16px", marginTop:12, marginBottom:10 }}>
                    {[["clientName","Client Name","Full name"],["phone","Phone","Phone number"],["email","Email","Email address"],["appDate","App Date",null],["coverageAmount","Coverage Amount","e.g. 250000"],["premium","Monthly Premium","e.g. 85"]].map(([field,label,placeholder]) => (
                      <div key={field}>
                        <div style={{ fontSize:9, color:"#ffffff30", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:3 }}>{label}</div>
                        <input type={field==="appDate"?"date":field==="email"?"email":"text"} value={app[field]||""} onChange={e => updateApp(app.id, field, field==="phone"?formatPhone(e.target.value):e.target.value)}
                          placeholder={placeholder||""} style={{ ...fieldStyle, colorScheme: field==="appDate"?"dark":undefined }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 16px", marginBottom:10 }}>
                    <div>
                      <div style={{ fontSize:9, color:"#ffffff30", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:3 }}>Status</div>
                      <select value={app.status} onChange={e => updateApp(app.id,"status",e.target.value)} style={{ background:"#ffffff0d", border:"1px solid #ffffff20", borderRadius:6, color:"#f0ede8", fontSize:13, padding:"4px 8px", outline:"none", width:"100%" }}>
                        {APP_STATUSES.map(s => <option key={s} value={s} style={{ background:"#1a1a2e" }}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize:9, color:"#ffffff30", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:3 }}>Policy Number</div>
                      <input value={app.policyNumber||""} onChange={e => updateApp(app.id,"policyNumber",e.target.value)} placeholder="Once approved" style={fieldStyle} />
                    </div>
                  </div>
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:9, color:"#ffffff30", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:3 }}>Notes</div>
                    <input value={app.notes||""} onChange={e => updateApp(app.id,"notes",e.target.value)} placeholder="Any additional notes" style={fieldStyle} />
                  </div>

                  {/* Beneficiary and Emergency Contact Section */}
                  <div style={{ background:"#8b5cf610", border:"1px solid #8b5cf630", borderRadius:10, padding:"14px 16px", marginBottom:10 }}>
                    <div style={{ fontSize:11, color:"#8b5cf6", fontWeight:"bold", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>🚨 Emergency Contacts</div>
                    {[1,2,3].map(num => (
                      <div key={num} style={{ marginBottom: num < 3 ? 14 : 0, paddingBottom: num < 3 ? 14 : 0, borderBottom: num < 3 ? "1px solid #8b5cf620" : "none" }}>
                        <div style={{ fontSize:10, color:"#8b5cf6", marginBottom:8, fontWeight:"bold" }}>Contact {num}</div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 16px" }}>
                          <div>
                            <div style={{ fontSize:9, color:"#ffffff30", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:3 }}>Full Name</div>
                            <input value={app[`emerg${num}Name`]||""} onChange={e => updateApp(app.id,`emerg${num}Name`,e.target.value)} placeholder="Full name" style={fieldStyle} />
                          </div>
                          <div>
                            <div style={{ fontSize:9, color:"#ffffff30", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:3 }}>Relationship to Insured</div>
                            <select value={app[`emerg${num}Relationship`]||""} onChange={e => updateApp(app.id,`emerg${num}Relationship`,e.target.value)}
                              style={{ background:"#ffffff0d", border:"none", borderBottom:"1px solid #ffffff15", color: app[`emerg${num}Relationship`]?"#f0ede8":"#ffffff40", fontSize:13, outline:"none", width:"100%", padding:"4px 2px", fontFamily:"inherit" }}>
                              <option value="" style={{ background:"#1a1a2e" }}>Select relationship</option>
                              {["Spouse","Child","Parent","Sibling","Grandchild","Grandparent","Friend","Other"].map(r => <option key={r} value={r} style={{ background:"#1a1a2e" }}>{r}</option>)}
                            </select>
                          </div>
                          <div>
                            <div style={{ fontSize:9, color:"#ffffff30", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:3 }}>Phone</div>
                            <input value={app[`emerg${num}Phone`]||""} onChange={e => updateApp(app.id,`emerg${num}Phone`,formatPhone(e.target.value))} placeholder="111-111-1111" maxLength={12} style={fieldStyle} />
                          </div>
                          <div>
                            <div style={{ fontSize:9, color:"#ffffff30", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:3 }}>Email</div>
                            <input value={app[`emerg${num}Email`]||""} onChange={e => updateApp(app.id,`emerg${num}Email`,e.target.value)} placeholder="Email address" style={fieldStyle} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checklist status */}
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:8 }}>
                    <div style={{ fontSize:11, background: app.beneCollected==="yes"?"#10b98120":"#f43f5e15", border:`1px solid ${app.beneCollected==="yes"?"#10b98140":"#f43f5e30"}`, borderRadius:20, padding:"4px 12px", color: app.beneCollected==="yes"?"#10b981":"#f43f5e" }}>
                      {app.beneCollected==="yes" ? "✓ Bene and Emergency Contact collected" : "⚠ Bene and Emergency Contact needed"}
                    </div>
                    <div style={{ fontSize:11, background: app.investStatus==="completed"?"#10b98120":app.investStatus==="scheduled"?"#f59e0b20":"#f43f5e15", border:`1px solid ${app.investStatus==="completed"?"#10b98140":app.investStatus==="scheduled"?"#f59e0b40":"#f43f5e30"}`, borderRadius:20, padding:"4px 12px", color: app.investStatus==="completed"?"#10b981":app.investStatus==="scheduled"?"#f59e0b":"#f43f5e" }}>
                      {app.investStatus==="completed" ? "✓ Investment completed" : app.investStatus==="scheduled" ? "📅 Investment scheduled" : "⚠ Investment needed"}
                    </div>
                  </div>
                </div>
              )}
              {isExpanded && readOnly && (
                <div style={{ padding:"0 14px 14px", borderTop:"1px solid #ffffff08" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:12 }}>
                    {[["Phone",app.phone],["Email",app.email],["Coverage","$"+(Number(app.coverageAmount)||0).toLocaleString()],["Premium","$"+(Number(app.premium)||0).toLocaleString()+"/mo"],["Policy",app.policyNumber||"Pending"],["Date",app.appDate]].map(([label,value]) => (
                      <div key={label}>
                        <div style={{ fontSize:9, color:"#ffffff30", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>{label}</div>
                        <div style={{ fontSize:12, color:"#f0ede8" }}>{value||"—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!readOnly && (
        <button onClick={addApp} style={{ background:"#3b82f620", border:"1px dashed #3b82f640", color:"#3b82f6", borderRadius:10, padding:"12px 16px", cursor:"pointer", fontSize:14, fontWeight:"bold", width:"100%" }}>
          + Log New Life Application
        </button>
      )}
    </div>
  );
}

// ─── WEEKLY ACTIVITY SCORECARD ─────────────────────────────────────────────────
function getWeekKey() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  return start.toISOString().split("T")[0];
}

function WeeklyScorecard({ activity = {}, onChange, readOnly = false, autoLifeApps = 0, autoInvestments = 0 }) {
  const weekKey = getWeekKey();
  const rawCurrent = activity[weekKey] || { contacts:0, apptSet:0, apptDone:0, lifeApps:0, investments:0 };
  const current = { ...rawCurrent, lifeApps: autoLifeApps || rawCurrent.lifeApps, investments: autoInvestments || rawCurrent.investments };

  const update = (field, val) => {
    const num = Math.max(0, Number(val)||0);
    onChange({ ...activity, [weekKey]: { ...current, [field]: num } });
  };

  const FIELDS = [
    { key:"contacts",    label:"Contacts Made",           color:"#3b82f6", emoji:"📞", goal:100 },
    { key:"apptSet",     label:"Appointments Set",         color:"#8b5cf6", emoji:"📅", goal:20  },
    { key:"apptDone",    label:"Appointments Completed",   color:"#06b6d4", emoji:"✅", goal:15  },
    { key:"lifeApps",    label:"Life Apps Submitted",      color:"#f59e0b", emoji:"📋", goal:20  },
    { key:"investments", label:"Investments Completed",    color:"#10b981", emoji:"💰", goal:10  },
  ];

  return (
    <div>
      <div style={{ fontSize:12, color:"#ffffff40", marginBottom:14 }}>Week of {weekKey}</div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {FIELDS.map(f => {
          const val = current[f.key] || 0;
          const pct = Math.min(100, Math.round((val/f.goal)*100));
          return (
            <div key={f.key} style={{ background:"#ffffff07", border:"1px solid #ffffff12", borderRadius:10, padding:"12px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div style={{ fontSize:13, fontWeight:"bold", color:"#f0ede8" }}>{f.emoji} {f.label}</div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ fontSize:11, color:"#ffffff40" }}>Goal: {f.goal}</div>
                  {!readOnly ? (
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      {(f.key !== "lifeApps" && f.key !== "investments") && <button onClick={() => update(f.key, val-1)} style={{ background:"#ffffff10", border:"none", color:"#f0ede8", width:26, height:26, borderRadius:6, cursor:"pointer", fontSize:16, lineHeight:1 }}>-</button>}
                      <div style={{ fontSize:18, fontWeight:"bold", color:f.color, minWidth:30, textAlign:"center" }}>{val}</div>
                      {(f.key !== "lifeApps" && f.key !== "investments") && <button onClick={() => update(f.key, val+1)} style={{ background:`${f.color}30`, border:`1px solid ${f.color}50`, color:f.color, width:26, height:26, borderRadius:6, cursor:"pointer", fontSize:16, lineHeight:1 }}>+</button>}
                      {(f.key === "lifeApps" || f.key === "investments") && <div style={{ fontSize:10, color:"#ffffff30", fontStyle:"italic" }}>auto-tracked</div>}
                    </div>
                  ) : (
                    <div style={{ fontSize:18, fontWeight:"bold", color:f.color }}>{val}</div>
                  )}
                </div>
              </div>
              <div style={{ background:"#ffffff10", borderRadius:99, height:6, overflow:"hidden" }}>
                <div style={{ width:`${pct}%`, height:"100%", background:pct>=100?"#10b981":f.color, borderRadius:99, transition:"width 0.4s" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PAC COUNTER ──────────────────────────────────────────────────────────────
function PacCounter({ pacCount = 0, onChange, onUpdateClients, onUpdateBoth, investmentClients = [], isLicensed = false, readOnly = false }) {
  const goal = 10;
  const p = Math.min(100, Math.round((pacCount/goal)*100));
  const [showAddModal, setShowAddModal] = useState(false);
  const [showClients, setShowClients] = useState(false);
  const [newClientName, setNewClientName] = useState("");

  const handleAdd = () => {
    if (!newClientName.trim()) return;
    const entry = { id: Date.now().toString(), name: newClientName.trim(), date: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}), movedOver: false };
    const newClients = [...investmentClients, entry];
    const newCount = pacCount + 1;
    // Single atomic update — prevents race condition overwriting clients
    if (onUpdateBoth) {
      onUpdateBoth(newClients, newCount);
    } else {
      if (onUpdateClients) onUpdateClients(newClients);
      if (onChange) onChange(newCount);
    }
    if (newCount === goal && !isLicensed) {
      spawnConfetti(window.innerWidth/2, 200);
      spawnEmoji(window.innerWidth/2, 180, "💰");
    }
    setNewClientName("");
    setShowAddModal(false);
  };

  const handleRemove = (id) => {
    const newClients = investmentClients.filter(c => c.id !== id);
    const newCount = Math.max(0, pacCount - 1);
    if (onUpdateBoth) {
      onUpdateBoth(newClients, newCount);
    } else {
      if (onUpdateClients) onUpdateClients(newClients);
      if (onChange) onChange(newCount);
    }
  };

  const toggleMoved = (id) => {
    if (onUpdateClients) onUpdateClients(investmentClients.map(c => c.id !== id ? c : { ...c, movedOver: !c.movedOver }));
  };

  return (
    <div style={{ background: (!isLicensed && pacCount >= goal) ? "#10b98110" : "#f59e0b10", border:`1px solid ${(!isLicensed&&pacCount>=goal)?"#10b98140":"#f59e0b40"}`, borderRadius:14, padding:"18px 20px", marginBottom:16 }}>
      {/* Add client modal */}
      {showAddModal && (
        <div style={{ position:"fixed", inset:0, background:"#000000cc", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"#16213e", border:"1px solid #f59e0b40", borderRadius:16, padding:28, width:"100%", maxWidth:400 }}>
            <div style={{ fontSize:20, textAlign:"center", marginBottom:12 }}>💰</div>
            <div style={{ fontSize:16, fontWeight:"bold", color:"#f59e0b", marginBottom:6, textAlign:"center" }}>Log Future Investment Client</div>
            <div style={{ fontSize:13, color:"#ffffff60", marginBottom:20, textAlign:"center", lineHeight:1.6 }}>
              Enter the future client name. This tracks who will need to be moved over to you when you get your investment license.
            </div>
            <input
              autoFocus
              value={newClientName}
              onChange={e => setNewClientName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              placeholder="Future client full name"
              style={{ background:"#ffffff0d", border:"1px solid #ffffff20", borderRadius:8, padding:"12px 14px", color:"#f0ede8", fontSize:15, outline:"none", width:"100%", boxSizing:"border-box", marginBottom:16, fontFamily:"inherit" }}
            />
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => { setShowAddModal(false); setNewClientName(""); }}
                style={{ flex:1, background:"none", border:"1px solid #ffffff20", color:"#ffffff60", padding:"12px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Cancel</button>
              <button onClick={handleAdd} disabled={!newClientName.trim()}
                style={{ flex:2, background: newClientName.trim()?"#f59e0b":"#ffffff15", border:"none", color: newClientName.trim()?"#0f0f11":"#ffffff30", padding:"12px", borderRadius:8, cursor: newClientName.trim()?"pointer":"default", fontWeight:"bold", fontSize:14 }}>
                Log Investment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ fontSize:14, fontWeight:"bold", color: (!isLicensed&&pacCount>=goal)?"#10b981":"#f59e0b" }}>
          {isLicensed ? "💰 Investment Tracker (AUM Building)" : "💰 PAC Investments (AUM Building)"}
        </div>
        <div style={{ fontSize:22, fontWeight:"bold", color: (!isLicensed&&pacCount>=goal)?"#10b981":"#f59e0b" }}>
          {isLicensed ? pacCount : `${pacCount}/${goal}`}
        </div>
      </div>

      {/* Progress bar — new reps only */}
      {!isLicensed && (
        <div style={{ background:"#ffffff10", borderRadius:99, height:10, overflow:"hidden", marginBottom:10 }}>
          <div style={{ width:`${p}%`, height:"100%", background: pacCount>=goal?"#10b981":"linear-gradient(90deg,#f59e0b,#10b981)", borderRadius:99, transition:"width 0.5s ease" }} />
        </div>
      )}

      <div style={{ fontSize:12, color:"#ffffff50", marginBottom:12 }}>
        {isLicensed
          ? "Track every client investment you are responsible for. These will need to be moved over when you get your investment license!"
          : "Every investment you are responsible for builds your future AUM. Goal: 10 during training!"}
      </div>

      {!isLicensed && pacCount >= goal && (
        <div style={{ background:"#10b98120", border:"1px solid #10b98140", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#10b981", fontWeight:"bold", marginBottom:12, textAlign:"center" }}>
          Goal reached! You are building real AUM for your clients!
        </div>
      )}

      {/* Add button */}
      {!readOnly && onChange && (
        <button onClick={() => setShowAddModal(true)}
          style={{ background:"#f59e0b20", border:"1px solid #f59e0b40", color:"#f59e0b", borderRadius:8, padding:"10px 16px", cursor:"pointer", fontWeight:"bold", fontSize:13, width:"100%", marginBottom: investmentClients.length > 0 ? 12 : 0 }}>
          + Log Future Investment Client
        </button>
      )}

      {/* Client list — dropdown */}
      {investmentClients.length > 0 && (
        <div>
          <button onClick={() => setShowClients(s => !s)}
            style={{ background:"none", border:"1px solid #ffffff20", color:"#ffffff60", borderRadius:8, padding:"8px 14px", cursor:"pointer", fontSize:12, width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span>{showClients ? "Hide" : "Show"} Future Investment Clients ({investmentClients.length})</span>
            <span>{showClients ? "▲" : "▼"}</span>
          </button>
          {showClients && (
            <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:6 }}>
              {investmentClients.map(client => (
                <div key={client.id} style={{ background: client.movedOver?"#10b98110":"#ffffff07", border:`1px solid ${client.movedOver?"#10b98130":"#ffffff12"}`, borderRadius:8, padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:"bold", color: client.movedOver?"#ffffff50":"#f0ede8", textDecoration: client.movedOver?"line-through":"none" }}>{client.name}</div>
                    <div style={{ fontSize:10, color:"#ffffff30", marginTop:2 }}>{client.date} {client.movedOver ? "· ✓ Moved over" : ""}</div>
                  </div>
                  {!readOnly && (
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => toggleMoved(client.id)}
                        style={{ fontSize:10, background: client.movedOver?"#10b98120":"#ffffff10", border:`1px solid ${client.movedOver?"#10b98140":"#ffffff20"}`, color: client.movedOver?"#10b981":"#ffffff50", borderRadius:20, padding:"3px 10px", cursor:"pointer" }}>
                        {client.movedOver ? "✓ Moved" : "Mark Moved"}
                      </button>
                      <button onClick={() => handleRemove(client.id)}
                        style={{ fontSize:10, background:"#f43f5e15", border:"1px solid #f43f5e30", color:"#f43f5e", borderRadius:20, padding:"3px 8px", cursor:"pointer" }}>✕</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MY PRODUCTION SECTION ────────────────────────────────────────────────────
function MyProductionSection({ myProduction, onUpdate, trainerName }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("lifeapps");

  const lifeApps = myProduction.lifeApps || [];
  const pacCount = myProduction.pacCount || 0;
  const weeklyActivity = myProduction.weeklyActivity || {};
  const submitted = lifeApps.filter(a => a.clientName).length;
  const investmentsDone = lifeApps.filter(a => a.investStatus === "completed").length;
  const weekKey = getWeekKey();
  const thisWeek = weeklyActivity[weekKey] || {};

  return (
    <div style={{ background:"linear-gradient(135deg,#10b98110,#3b82f610)", border:"1px solid #10b98130", borderRadius:14, marginBottom:20 }}>
      {/* Header — always visible */}
      <div onClick={() => setExpanded(!expanded)} style={{ padding:"16px 20px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:14, fontWeight:"bold", color:"#10b981" }}>📊 My Production</div>
          <div style={{ fontSize:11, color:"#ffffff50", marginTop:3 }}>
            {submitted} life app{submitted!==1?"s":""} · {pacCount} investments · {thisWeek.contacts||0} contacts this week
          </div>
        </div>
        <div style={{ fontSize:18, color:"#10b981" }}>{expanded ? "▲" : "▼"}</div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding:"0 20px 20px" }}>
          {/* Tabs */}
          <div style={{ display:"flex", gap:4, background:"#ffffff08", borderRadius:10, padding:4, marginBottom:18 }}>
            {[
              { key:"lifeapps", label:"📋 Life Apps" },
              { key:"scorecard", label:"📊 Scorecard" },
              { key:"investments", label:"💰 Investments" },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{ flex:1, padding:"8px 10px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:"bold", transition:"all 0.15s", background:activeTab===tab.key?"#ffffff15":"transparent", color:activeTab===tab.key?"#f0ede8":"#ffffff50" }}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "lifeapps" && (
            <LifeAppTracker
              apps={lifeApps}
              onChange={apps => onUpdate({ ...myProduction, lifeApps:apps })}
            />
          )}
          {activeTab === "scorecard" && (
            <WeeklyScorecard
              activity={weeklyActivity}
              onChange={act => onUpdate({ ...myProduction, weeklyActivity:act })}
              autoLifeApps={submitted}
              autoInvestments={pacCount}
            />
          )}
          {activeTab === "investments" && (
            <PacCounter
              pacCount={pacCount}
              onChange={count => onUpdate({ ...myProduction, pacCount:count })}
              onUpdateClients={clients => onUpdate({ ...myProduction, investmentClients:clients })}
              onUpdateBoth={(clients, count) => onUpdate({ ...myProduction, investmentClients:clients, pacCount:count })}
              investmentClients={myProduction.investmentClients||[]}
              isLicensed={true}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── APP TOUR ─────────────────────────────────────────────────────────────────
const REP_TOUR_STEPS = [
  { emoji:"👋", title:"Welcome to Your Training App!", body:"This app guides you through your new rep training. Complete your checklist, log appointments, and track your progress!" },
  { emoji:"🔐", title:"Your PIN is Your Key", body:"You created a 4-digit PIN at login. You need it every time you log in. Keep it private!" },
  { emoji:"✅", title:"My Checklist", body:"Work top to bottom. Check off each item as you complete it. Your trainer can see everything!" },
  { emoji:"📅", title:"Appointments Tab", body:"Log every training appointment here with name, phone, date, and MACHO score. Goal: 15-20 appointments!" },
  { emoji:"⭐", title:"MACHO Qualifier", body:"Rate contacts M-A-C-H-O — Married, Age 25-55, Children, Homeowner, Occupation. 3+ stars = great candidate!" },
  { emoji:"👥", title:"References Tab", body:"Enter your 5 character references. Your trainer will use them to help set training appointments." },
  { emoji:"📜", title:"Scripts Tab", body:"Your appointment setting scripts live here. Practice before every call — understand the message and make it your own!" },
  { emoji:"👁", title:"Field Training Observations", body:"Tap + every time you observe your trainer complete a life app. Goal: 20 observations before licensing!" },
  { emoji:"📋", title:"Life App Counter", body:"Tap + every time you are present for a completed life application during training. Goal: 10!" },
  { emoji:"💰", title:"Future Investment Clients", body:"Tap + and enter a name every time a client gets an investment. These will be moved to you when you pass your investment exam!" },
  { emoji:"🗓", title:"Daily Meeting Banner", body:"A banner shows what meetings are today. Check it every login. Canceled meetings show up here too!" },
  { emoji:"🎯", title:"You Are All Set!", body:"Complete your checklist, set 15-20 appointments, attend every meeting, and check in with your trainer daily!" },
];

const LICENSED_TOUR_STEPS = [
  { emoji:"👋", title:"Welcome — You Are Life Licensed!", body:"Congratulations! This checklist guides you through everything you need to do now that you have your life license!" },
  { emoji:"⭐", title:"Already Licensed When You Joined?", body:"If you joined already licensed and skipped new rep training — tap the gold alert at the top first. Those steps are required for you!" },
  { emoji:"📜", title:"Start Securities License Now!", body:"Start your securities license immediately after life licensing. SIE first, then Series 6, 63, and 26 for RVP!" },
  { emoji:"🏅", title:"Milestones", body:"Track your first policy, first recruit, and key milestones at the top of your checklist. Check them off when you hit them!" },
  { emoji:"📋", title:"Life Application Tracker", body:"Log every life app here. You will be asked about Emergency Contacts and whether you scheduled an investment. Every life app should come with an investment!" },
  { emoji:"💰", title:"Investment Tracker", body:"Log every future investment client by name. Your trainer knows exactly who to move over when you pass your investment exam!" },
  { emoji:"📊", title:"Weekly Scorecard", body:"Track weekly activity — contacts, appointments, life apps, and investments. Keeps you accountable to your goals!" },
  { emoji:"🗓", title:"Daily Meeting Banner", body:"A banner shows what is scheduled today. Check it every login so you never miss a meeting!" },
  { emoji:"👑", title:"RVP Path", body:"Check the RVP Path box on your checklist to unlock your full RVP promotion checklist!" },
  { emoji:"🎯", title:"You Are All Set!", body:"Write business, build your team, log your activity, and work with your trainer daily. Let us go!" },
];

const TRAINER_TOUR_STEPS = [
  { emoji:"👋", title:"Welcome to Your Training Dashboard!", body:"This app helps you manage and track all your reps through their onboarding journey!" },
  { emoji:"👥", title:"Rep Dashboard", body:"See all your reps with progress bars, appointment counts, and stall alerts. Click any rep to open their full profile." },
  { emoji:"📋", title:"Rep Profile Tabs", body:"Each rep has tabs for Checklist, Appointments, References, Life Apps, Investments, Scorecard, Messages, RVP, and Schedule." },
  { emoji:"📊", title:"Rep-Entered Details", body:"When a rep enters their DGO date, class info, exam date, or references it feeds directly into their profile!" },
  { emoji:"💰", title:"Future Investment Clients", body:"When a rep logs a future investment client you see their name right in the rep profile to move over later." },
  { emoji:"👁", title:"Field Training Observations", body:"Update the FTO counter directly from the rep profile. Both you and the rep can tap + after each observation." },
  { emoji:"✅", title:"Check-Ins", body:"Log check-ins with notes on each rep. Get alerts when a rep has not been contacted in 3 or more days!" },
  { emoji:"📊", title:"My Production", body:"Track your own life apps, weekly scorecard, and investments in My Production at the top of your dashboard." },
  { emoji:"🗓", title:"Cancel Meetings", body:"Go to the Schedule tab on any rep and tap Cancel Today. Reps immediately see a CANCELED banner!" },
  { emoji:"⚙️", title:"Manage Trainers", body:"Add trainers, set PINs, and add booking links. Each trainer gets their own booking link for their reps." },
  { emoji:"🎯", title:"You Are All Set!", body:"Check in daily, monitor your reps, log your own production, and build a winning team!" },
];

function AppTour({ steps, onClose, storageKey }) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  const finish = () => {
    try { localStorage.setItem(storageKey, "done"); } catch(e) {}
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"#000000dd", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"linear-gradient(135deg,#1a0a2e,#0f3460)", border:"1px solid #f59e0b40", borderRadius:20, padding:32, width:"100%", maxWidth:420, textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>{current.emoji}</div>
        <div style={{ fontSize:18, fontWeight:"bold", color:"#f59e0b", marginBottom:12 }}>{current.title}</div>
        <div style={{ fontSize:14, color:"#ffffff80", lineHeight:1.7, marginBottom:24 }}>{current.body}</div>
        {/* Step dots */}
        <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:24 }}>
          {steps.map((_,i) => (
            <div key={i} style={{ width:8, height:8, borderRadius:"50%", background: i===step?"#f59e0b":"#ffffff20", transition:"all 0.2s" }} />
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          {step > 0 && <button onClick={() => setStep(s => s-1)} style={{ flex:1, background:"none", border:"1px solid #ffffff20", color:"#ffffff60", padding:"12px", borderRadius:10, cursor:"pointer", fontSize:13 }}>Back</button>}
          {!isLast
            ? <button onClick={() => setStep(s => s+1)} style={{ flex:2, background:"#f59e0b", border:"none", color:"#0f0f11", padding:"12px", borderRadius:10, cursor:"pointer", fontWeight:"bold", fontSize:14 }}>Next →</button>
            : <button onClick={finish} style={{ flex:2, background:"#10b981", border:"none", color:"#0f0f11", padding:"12px", borderRadius:10, cursor:"pointer", fontWeight:"bold", fontSize:14 }}>Get Started! 🚀</button>
          }
        </div>
        <button onClick={finish} style={{ background:"none", border:"none", color:"#ffffff30", cursor:"pointer", fontSize:12, marginTop:12 }}>Skip tour</button>
      </div>
    </div>
  );
}

function TourButton({ onClick }) {
  return (
    <button onClick={onClick} style={{ background:"#f59e0b20", border:"1px solid #f59e0b40", color:"#f59e0b", borderRadius:20, padding:"5px 14px", fontSize:12, cursor:"pointer", fontWeight:"bold" }}>
      ❓ App Tour
    </button>
  );
}

// ─── FIELD TRAINING OBSERVATION COUNTER ──────────────────────────────────────
function FieldObsCounter({ count = 0, onChange }) {
  const goal = 20;
  const p = Math.min(100, Math.round((count/goal)*100));
  return (
    <div style={{ background: count>=goal?"#10b98110":"#8b5cf610", border:`1px solid ${count>=goal?"#10b98140":"#8b5cf640"}`, borderRadius:14, padding:"18px 20px", marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ fontSize:14, fontWeight:"bold", color:count>=goal?"#10b981":"#8b5cf6" }}>👁 Field Training Observations</div>
        <div style={{ fontSize:22, fontWeight:"bold", color:count>=goal?"#10b981":"#8b5cf6" }}>{count}/{goal}</div>
      </div>
      <div style={{ background:"#ffffff10", borderRadius:99, height:8, overflow:"hidden", marginBottom:8 }}>
        <div style={{ width:`${p}%`, height:"100%", background:count>=goal?"#10b981":"linear-gradient(90deg,#8b5cf6,#10b981)", borderRadius:99, transition:"width 0.5s ease" }} />
      </div>
      <div style={{ fontSize:12, color:"#ffffff50", marginBottom:12 }}>
        Every observation prepares you for when you are licensed — pay close attention to the process! Goal: 20 before licensing.
      </div>
      {count >= goal && (
        <div style={{ background:"#10b98120", border:"1px solid #10b98140", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#10b981", fontWeight:"bold", textAlign:"center", marginBottom:12 }}>
          20 observations complete — you are ready for licensing! 🎉
        </div>
      )}
      {onChange && (
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => onChange(Math.max(0, count-1))}
            style={{ background:"#ffffff10", border:"none", color:"#f0ede8", width:36, height:36, borderRadius:8, cursor:"pointer", fontSize:20 }}>-</button>
          <div style={{ flex:1, textAlign:"center", fontSize:12, color:"#ffffff50" }}>Tap + after each life app observation with your trainer. Tap - to correct an error.</div>
          <button onClick={() => { onChange(count+1); if (count+1===goal) { spawnConfetti(window.innerWidth/2,200); spawnEmoji(window.innerWidth/2,180,"👁"); } }}
            style={{ background:"#8b5cf630", border:"1px solid #8b5cf650", color:"#8b5cf6", width:36, height:36, borderRadius:8, cursor:"pointer", fontSize:20, fontWeight:"bold" }}>+</button>
        </div>
      )}
    </div>
  );
}

// ─── LICENSED REFS INPUT ──────────────────────────────────────────────────────
function LicensedRefsInput({ refs = [], onChange }) {
  const REL_OPTIONS = ["Friend","Family","Coworker","Neighbor","Church Member","Business Contact","Other"];
  const slots = Array.from({ length: 5 }, (_, i) => refs[i] || { name:"", phone:"", relationship:"" });
  const update = (idx, field, val) => {
    const updated = slots.map((r, i) => i !== idx ? r : { ...r, [field]: val });
    onChange(updated.filter(r => r.name || r.phone || r.relationship));
  };
  return (
    <div style={{ background:"#ffffff07", border:"1px solid #ffffff12", borderRadius:10, padding:"14px 16px", marginTop:8 }}>
      <div style={{ fontSize:11, color:"#10b981", fontWeight:"bold", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>👥 Enter Your 5 References</div>
      {slots.map((ref, idx) => (
        <div key={idx} style={{ marginBottom: idx < 4 ? 14 : 0, paddingBottom: idx < 4 ? 14 : 0, borderBottom: idx < 4 ? "1px solid #ffffff08" : "none" }}>
          <div style={{ fontSize:10, color:"#ffffff40", marginBottom:6, fontWeight:"bold" }}>Reference {idx+1}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 12px" }}>
            <div>
              <div style={{ fontSize:9, color:"#ffffff30", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>Full Name</div>
              <input value={ref.name||""} onChange={e => update(idx,"name",e.target.value)} placeholder="Full name"
                style={{ background:"transparent", border:"none", borderBottom:"1px solid #ffffff15", color:"#f0ede8", fontSize:13, outline:"none", width:"100%", padding:"4px 2px", fontFamily:"inherit" }} />
            </div>
            <div>
              <div style={{ fontSize:9, color:"#ffffff30", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>Phone</div>
              <input value={ref.phone||""} onChange={e => update(idx,"phone",formatPhone(e.target.value))} placeholder="111-111-1111" maxLength={12}
                style={{ background:"transparent", border:"none", borderBottom:"1px solid #ffffff15", color:"#f0ede8", fontSize:13, outline:"none", width:"100%", padding:"4px 2px", fontFamily:"inherit" }} />
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <div style={{ fontSize:9, color:"#ffffff30", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>Relationship</div>
              <select value={ref.relationship||""} onChange={e => update(idx,"relationship",e.target.value)}
                style={{ background:"#ffffff0d", border:"none", borderBottom:"1px solid #ffffff15", color: ref.relationship?"#f0ede8":"#ffffff40", fontSize:13, outline:"none", width:"100%", padding:"4px 2px", fontFamily:"inherit" }}>
                <option value="" style={{ background:"#1a1a2e" }}>Select relationship</option>
                {REL_OPTIONS.map(r => <option key={r} value={r} style={{ background:"#1a1a2e" }}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── REP MESSAGING ──────────────────────────────────────────────────────────
function RepMessaging({ rep, onUpdate, isTrainer = false }) {
  const [text, setText] = useState("");
  const messages = rep.repMessages || [];

  const send = () => {
    if (!text.trim()) return;
    const msg = { id:Date.now().toString(), text:text.trim(), sender:isTrainer?"trainer":"rep", timestamp:new Date().toISOString(), resolved:false };
    onUpdate({ ...rep, repMessages:[...messages, msg], unreadByTrainer:!isTrainer, unreadByRep:isTrainer, lastActivity:new Date().toISOString() });
    setText("");
  };

  const resolve = (id) => onUpdate({ ...rep, repMessages:messages.map(m=>m.id!==id?m:{...m,resolved:true}), lastActivity:new Date().toISOString() });

  React.useEffect(() => {
    if (isTrainer && rep.unreadByTrainer) onUpdate({ ...rep, unreadByTrainer:false });
    if (!isTrainer && rep.unreadByRep) onUpdate({ ...rep, unreadByRep:false, lastActivity:new Date().toISOString() });
  }, []);

  const active = messages.filter(m=>!m.resolved);
  const resolved = messages.filter(m=>m.resolved);
  const unread = isTrainer ? rep.unreadByTrainer : rep.unreadByRep;

  return (
    <div style={{ background:"#ffffff07", border:"1px solid #ffffff12", borderRadius:14, padding:"16px 18px", marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontSize:13, fontWeight:"bold", color:"#3b82f6" }}>
          💬 {isTrainer?`Messages from ${rep.name}`:"Message My Trainer"}
          {unread && <span style={{ background:"#f43f5e", color:"#fff", borderRadius:"50%", fontSize:10, padding:"1px 6px", marginLeft:8, fontWeight:"bold" }}>NEW</span>}
        </div>
      </div>
      {active.length===0 && <div style={{ fontSize:12, color:"#ffffff30", fontStyle:"italic", marginBottom:14 }}>No active messages</div>}
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:14 }}>
        {active.map(msg => (
          <div key={msg.id} style={{ background:msg.sender==="rep"?"#3b82f610":"#10b98110", border:`1px solid ${msg.sender==="rep"?"#3b82f630":"#10b98130"}`, borderRadius:10, padding:"10px 14px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
              <div style={{ fontSize:10, color:msg.sender==="rep"?"#3b82f6":"#10b981", fontWeight:"bold", textTransform:"uppercase" }}>{msg.sender==="rep"?rep.name:"Trainer"}</div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <div style={{ fontSize:10, color:"#ffffff30" }}>{new Date(msg.timestamp).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}</div>
                <button onClick={()=>resolve(msg.id)} style={{ background:"#ffffff10", border:"1px solid #ffffff20", color:"#ffffff50", borderRadius:20, padding:"2px 10px", fontSize:10, cursor:"pointer" }}>✓ Resolve</button>
              </div>
            </div>
            <div style={{ fontSize:13, color:"#f0ede8", lineHeight:1.6 }}>{msg.text}</div>
          </div>
        ))}
      </div>
      {resolved.length>0 && (
        <details style={{ marginBottom:14 }}>
          <summary style={{ fontSize:11, color:"#ffffff30", cursor:"pointer", marginBottom:8 }}>✓ {resolved.length} resolved message{resolved.length!==1?"s":""}</summary>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:8 }}>
            {resolved.map(msg => (
              <div key={msg.id} style={{ background:"#ffffff05", border:"1px solid #ffffff08", borderRadius:8, padding:"8px 12px", opacity:0.6 }}>
                <div style={{ fontSize:10, color:"#ffffff30", marginBottom:3 }}>{msg.sender==="rep"?rep.name:"Trainer"} · {new Date(msg.timestamp).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
                <div style={{ fontSize:12, color:"#ffffff50" }}>{msg.text}</div>
              </div>
            ))}
          </div>
        </details>
      )}
      <div style={{ display:"flex", gap:8 }}>
        <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={isTrainer?"Reply to rep...":"Send a message to your trainer..."} style={{ flex:1, background:"#ffffff0d", border:"1px solid #ffffff20", borderRadius:8, padding:"10px 14px", color:"#f0ede8", fontSize:13, outline:"none", fontFamily:"inherit" }} />
        <button onClick={send} disabled={!text.trim()} style={{ background:text.trim()?"#3b82f6":"#ffffff15", border:"none", color:text.trim()?"#fff":"#ffffff30", borderRadius:8, padding:"10px 18px", cursor:text.trim()?"pointer":"default", fontWeight:"bold", fontSize:13 }}>Send</button>
      </div>
    </div>
  );
}

// ─── CHECK-IN STREAK ────────────────────────────────────────────────────────
function CheckInStreak({ checkIns = [] }) {
  if (checkIns.length === 0) return (
    <div style={{ background:"#f43f5e10", border:"1px solid #f43f5e30", borderRadius:12, padding:"12px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
      <div style={{ fontSize:22 }}>👋</div>
      <div style={{ fontSize:13, color:"#f43f5e" }}>No check-ins yet — reach out to your trainer today!</div>
    </div>
  );
  const sorted = [...checkIns].sort((a,b) => new Date(b.date)-new Date(a.date));
  const daysSince = Math.floor((new Date()-new Date(sorted[0].date))/86400000);
  let streak = 0;
  const today = new Date(); today.setHours(0,0,0,0);
  for (let i=0; i<sorted.length; i++) {
    const d = new Date(sorted[i].date); d.setHours(0,0,0,0);
    if (Math.floor((today-d)/86400000) <= i+1) streak++;
    else break;
  }
  const color = daysSince===0?"#10b981":daysSince<=2?"#f59e0b":"#f43f5e";
  const emoji = streak>=7?"🔥🔥🔥":streak>=3?"🔥🔥":"🔥";
  return (
    <div style={{ background:`${color}10`, border:`1px solid ${color}30`, borderRadius:12, padding:"12px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:14 }}>
      <div style={{ fontSize:28 }}>{streak>0?emoji:"💤"}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:"bold", color }}>{streak} day check-in streak!</div>
        <div style={{ fontSize:11, color:"#ffffff50", marginTop:2 }}>{daysSince===0?"Checked in today — great work!":daysSince===1?"Last checked in yesterday — keep it up!":`Last checked in ${daysSince} days ago — reach out to your trainer today!`}</div>
      </div>
      {streak>=7 && <div style={{ background:"#f59e0b20", border:"1px solid #f59e0b40", borderRadius:20, padding:"4px 12px", fontSize:11, color:"#f59e0b", fontWeight:"bold" }}>7 day streak!</div>}
    </div>
  );
}

// ─── TEAM LEADERBOARD ───────────────────────────────────────────────────────
function TeamLeaderboard({ currentRep, allReps }) {
  const [expanded, setExpanded] = useState(false);
  const teamReps = [currentRep, ...allReps.filter(r => r.trainerId===currentRep.trainerId && r.id!==currentRep.id)];
  const ranked = teamReps.map(r => ({ id:r.id, name:r.id===currentRep.id?"You":r.name.split(" ")[0], isMe:r.id===currentRep.id, appts:(r.appointments||[]).filter(a=>a.name).length, fto:r.fieldObsCount||0, lifeApps:r.lifeAppCount||0, score:(r.appointments||[]).filter(a=>a.name).length+(r.fieldObsCount||0)+(r.lifeAppCount||0) })).sort((a,b)=>b.score-a.score);
  const myRank = ranked.findIndex(r=>r.isMe)+1;
  const medals = ["🥇","🥈","🥉"];
  return (
    <div style={{ background:"#ffffff07", border:"1px solid #ffffff12", borderRadius:14, marginBottom:16, overflow:"hidden" }}>
      <div onClick={()=>setExpanded(s=>!s)} style={{ padding:"14px 18px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:13, fontWeight:"bold", color:"#f59e0b" }}>🏆 Team Leaderboard</div>
          <div style={{ fontSize:11, color:"#ffffff50", marginTop:2 }}>You are ranked #{myRank} on your team</div>
        </div>
        <div style={{ fontSize:16, color:"#ffffff40" }}>{expanded?"▲":"▼"}</div>
      </div>
      {expanded && (
        <div style={{ padding:"0 18px 16px", display:"flex", flexDirection:"column", gap:8 }}>
          {ranked.map((r,idx) => (
            <div key={r.id} style={{ background:r.isMe?"#f59e0b10":"#ffffff05", border:`1px solid ${r.isMe?"#f59e0b30":"#ffffff10"}`, borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ fontSize:18, width:28, textAlign:"center" }}>{medals[idx]||`#${idx+1}`}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:"bold", color:r.isMe?"#f59e0b":"#f0ede8" }}>{r.name}{r.isMe?" (You)":""}</div>
                <div style={{ fontSize:10, color:"#ffffff40", marginTop:2 }}>{r.appts} appts · {r.fto} FTOs · {r.lifeApps} life apps</div>
              </div>
              <div style={{ fontSize:16, fontWeight:"bold", color:r.isMe?"#f59e0b":"#ffffff50" }}>{r.score}</div>
            </div>
          ))}
          <div style={{ fontSize:10, color:"#ffffff30", textAlign:"center", marginTop:6 }}>Score = appointments + FTO observations + life apps</div>
        </div>
      )}
    </div>
  );
}

// ─── INCOME GOAL CALCULATOR ─────────────────────────────────────────────────
function IncomeGoalCalculator({ goal=0, onSave }) {
  const [input, setInput] = useState(goal?String(goal):"");
  const g = Number(input)||0;
  const appsNeeded = Math.ceil(g/500);
  const apptsNeeded = Math.ceil(appsNeeded*3);
  const apptsPerWeek = Math.ceil(apptsNeeded/4);
  const contactsPerWeek = apptsPerWeek*3;
  return (
    <div style={{ background:"#10b98110", border:"1px solid #10b98130", borderRadius:14, padding:"18px 20px", marginBottom:16 }}>
      <div style={{ fontSize:14, fontWeight:"bold", color:"#10b981", marginBottom:4 }}>🎯 Income Goal Calculator</div>
      <div style={{ fontSize:12, color:"#ffffff50", marginBottom:14 }}>Enter your monthly income goal and see exactly how much activity you need to hit it.</div>
      <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:16 }}>
        <div style={{ fontSize:20, color:"#10b981" }}>$</div>
        <input type="number" value={input} onChange={e=>setInput(e.target.value)} placeholder="Monthly income goal" style={{ flex:1, background:"#ffffff0d", border:"1px solid #10b98140", borderRadius:8, padding:"10px 14px", color:"#f0ede8", fontSize:16, outline:"none", fontFamily:"inherit" }} />
        <button onClick={()=>onSave(g)} style={{ background:"#10b981", border:"none", color:"#0f0f11", borderRadius:8, padding:"10px 16px", cursor:"pointer", fontWeight:"bold", fontSize:13 }}>Save</button>
      </div>
      {g>0 && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[{label:"Life Apps / Month",value:appsNeeded,color:"#3b82f6",emoji:"📋"},{label:"Appts / Month",value:apptsNeeded,color:"#8b5cf6",emoji:"📅"},{label:"Appts / Week",value:apptsPerWeek,color:"#f59e0b",emoji:"🗓"},{label:"Contacts / Week",value:contactsPerWeek,color:"#10b981",emoji:"📞"}].map(s => (
            <div key={s.label} style={{ background:"#ffffff07", border:`1px solid ${s.color}25`, borderRadius:10, padding:"12px 14px", textAlign:"center" }}>
              <div style={{ fontSize:24, fontWeight:"bold", color:s.color }}>{s.value}</div>
              <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", letterSpacing:"0.06em", marginTop:4 }}>{s.emoji} {s.label}</div>
            </div>
          ))}
        </div>
      )}
      {g>0 && <div style={{ fontSize:10, color:"#ffffff30", marginTop:10, textAlign:"center" }}>Based on avg $500 premium per policy and 1 app per 3 appointments.</div>}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
// inject pulse animation
if (typeof document !== 'undefined' && !document.getElementById('pulse-style')) {
  const s = document.createElement('style');
  s.id = 'pulse-style';
  s.textContent = '@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.85} }';
  document.head.appendChild(s);
}

export default function App() {
  const [session, setSession] = useState(() => loadSession());
  const [reps, setReps] = useState(() => load(STORAGE_KEY, []));
  const [trainers, setTrainers] = useState(() => load(TRAINERS_KEY, DEFAULT_TRAINERS));
  const [admins, setAdmins] = useState(() => load(ADMINS_KEY, DEFAULT_ADMINS));
  const [schedule, setSchedule] = useState(() => load(SCHEDULE_KEY, DEFAULT_SCHEDULE));
  const [activeTrainerId, setActiveTrainerId] = useState(() => load(ACTIVE_TRAINER_KEY, "admin"));
  const [view, setView] = useState("dashboard");
  const [selectedRepId, setSelectedRepId] = useState(null);
  const [activeTab, setActiveTab] = useState("trainer");
  const [showAddRep, setShowAddRep] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showTrainerMgr, setShowTrainerMgr] = useState(false);
  const [newRep, setNewRep] = useState({ name: "", phone: "", track: "fast", trainerId: "admin", startDate: "", gradDate: "" });
  const [newTrainerName, setNewTrainerName] = useState("");
  const [newTrainer_adminId, setNewTrainer_adminId] = useState("admin");
  const [saveIndicator, setSaveIndicator] = useState(false);
  const [filterTrack, setFilterTrack] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNotes, setEditingNotes] = useState(false);
  const [previewingRepId, setPreviewingRepId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");

  const [dataLoaded, setDataLoaded] = useState(false);
  const [monthlyData, setMonthlyData] = useState(() => load(MONTHLY_KEY, {}));
  const [showNewMonthBanner, setShowNewMonthBanner] = useState(false);
  const [cancellations, setCancellations] = useState(() => load(CANCEL_KEY, {}));
  const [myProduction, setMyProduction] = useState(() => load("primerica_myproduction_v1", { lifeApps:[], weeklyActivity:{}, pacCount:0 }));
  const trainerTourKey = "primerica_tour_trainer_" + (session?.id||"admin");
  const [showTrainerTour, setShowTrainerTour] = useState(() => { try { return !localStorage.getItem(trainerTourKey); } catch(e) { return false; } });
  const activeAdmin = admins.find(a => a.id === session?.id);
  const activeTrainer = trainers.find(t => t.id === activeTrainerId) || trainers[0];
  const isSuperAdmin = session?.role === "superadmin";
  const isAdmin = session?.role === "admin" || session?.role === "superadmin";
  const currentAdminId = isAdmin ? session?.id : null;

  useEffect(() => { if (!dataLoaded) return; saveToFirebase(STORAGE_KEY, reps); setSaveIndicator(true); const t = setTimeout(() => setSaveIndicator(false), 1500); return () => clearTimeout(t); }, [reps]);
  useEffect(() => { if (!dataLoaded) return; saveToFirebase(TRAINERS_KEY, trainers); }, [trainers]);
  useEffect(() => { if (!dataLoaded) return; saveToFirebase(ADMINS_KEY, admins); }, [admins]);
  useEffect(() => { if (!dataLoaded) return; saveToFirebase(SCHEDULE_KEY, schedule); }, [schedule]);
  useEffect(() => { if (!dataLoaded) return; saveToFirebase(MONTHLY_KEY, monthlyData); }, [monthlyData]);
  useEffect(() => { if (!dataLoaded) return; saveToFirebase(CANCEL_KEY, cancellations); }, [cancellations]);
  useEffect(() => { if (!dataLoaded) return; saveToFirebase("primerica_myproduction_v1", myProduction); }, [myProduction]);
  useEffect(() => { save(ACTIVE_TRAINER_KEY, activeTrainerId); }, [activeTrainerId]);

  // ── FIREBASE REAL-TIME LISTENERS ──────────────────────────────────────────
  useEffect(() => {
    const unsubs = [];
    let loadCount = 0;
    const TOTAL_KEYS = 4;

    const markLoaded = () => {
      loadCount++;
      if (loadCount >= TOTAL_KEYS) setDataLoaded(true);
    };

    // Load initial data from Firebase, fall back to localStorage
    fbLoad(STORAGE_KEY, null).then(data => {
      if (data && Array.isArray(data)) setReps(data);
      markLoaded();
    });
    fbLoad(TRAINERS_KEY, null).then(data => {
      if (data && Array.isArray(data)) setTrainers(data);
      markLoaded();
    });
    fbLoad(ADMINS_KEY, null).then(data => {
      if (data && Array.isArray(data) && data.length > 0) setAdmins(data);
      markLoaded();
    });
    fbLoad(SCHEDULE_KEY, null).then(data => {
      if (data && Array.isArray(data) && data.length > 0) setSchedule(data);
      markLoaded();
    });
    fbLoad(MONTHLY_KEY, {}).then(data => { if (data) setMonthlyData(data); });
    fbLoad(CANCEL_KEY, {}).then(data => { if (data) setCancellations(data); });

    // Listen for real-time updates from other devices
    unsubs.push(fbListen(STORAGE_KEY, data => { if (Array.isArray(data)) setReps(data); }));
    unsubs.push(fbListen(TRAINERS_KEY, data => { if (Array.isArray(data)) setTrainers(data); }));
    unsubs.push(fbListen(ADMINS_KEY, data => { if (Array.isArray(data) && data.length > 0) setAdmins(data); }));
    unsubs.push(fbListen(SCHEDULE_KEY, data => { if (Array.isArray(data) && data.length > 0) setSchedule(data); }));
    unsubs.push(fbListen(MONTHLY_KEY, data => { if (data) setMonthlyData(data); }));
    unsubs.push(fbListen(CANCEL_KEY, data => { if (data) setCancellations(data); }));

    return () => unsubs.forEach(u => u());
  }, []);

  const updateRep = (repId, updater) => setReps(prev => prev.map(r => r.id !== repId ? r : { ...updater(r), lastActivity: new Date().toISOString() }));
  const toggleTrainer = (repId, itemId) => updateRep(repId, r => ({ ...r, trainerCompleted: r.trainerCompleted.includes(itemId) ? r.trainerCompleted.filter(x => x !== itemId) : [...r.trainerCompleted, itemId] }));
  const toggleRep = (repId, itemId) => updateRep(repId, r => {
    const alreadyDone = r.repCompleted.includes(itemId);
    const newCompleted = alreadyDone ? r.repCompleted.filter(x => x !== itemId) : [...r.repCompleted, itemId];
    // Auto-upgrade to Licensed Now What when rep checks Request License
    const unlockItems = ["f24", "r21"];
    const shouldUnlock = !alreadyDone && unlockItems.includes(itemId);
    return { ...r, repCompleted: newCompleted, ...(shouldUnlock ? { track: "licensed" } : {}) };
  });
  const toggleStalled = (repId) => updateRep(repId, r => ({ ...r, stalledManual: !r.stalledManual }));
  const saveNote = (repId, note) => updateRep(repId, r => ({ ...r, notes: note }));
  const updateAppointments = (repId, appts) => updateRep(repId, r => ({ ...r, appointments: appts }));
  const setLastContact = (repId, date) => updateRep(repId, r => ({ ...r, lastContactDate: date }));
  const setDgoDate = (repId, date) => updateRep(repId, r => ({ ...r, dgoDate: date }));
  const toggleRvp = (repId, itemId) => updateRep(repId, r => ({ ...r, rvpCompleted: (r.rvpCompleted||[]).includes(itemId) ? (r.rvpCompleted||[]).filter(x => x !== itemId) : [...(r.rvpCompleted||[]), itemId] }));
  const setRvpPromotionDate = (repId, date) => updateRep(repId, r => ({ ...r, rvpPromotionDate: date }));
  const setExamDate = (repId, date) => updateRep(repId, r => ({ ...r, examDate: date }));
  const setReferences = (repId, refs) => updateRep(repId, r => ({ ...r, references: refs }));
  const setDgoCompleted = (repId, val) => updateRep(repId, r => ({ ...r, dgoCompleted: val }));
  const setBusinessCommitment = (repId, val) => updateRep(repId, r => ({ ...r, businessCommitment: val }));
  const addCheckIn = (repId, note, trainerName) => updateRep(repId, r => ({ ...r, checkIns: [{ id: Date.now(), date: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}), time: new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}), note, trainer: trainerName }, ...(r.checkIns||[])] }));

  const addRep = () => {
    if (!newRep.name.trim()) return;
    setReps(prev => [...prev, { id: Date.now(), name: newRep.name.trim(), phone: newRep.phone.trim(), date: newRep.startDate || new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}), startDate: newRep.startDate, gradDate: newRep.gradDate, track: newRep.track, trainerId: newRep.trainerId || activeTrainerId, adminId: currentAdminId, trainerCompleted: [], repCompleted: [], appointments: [], notes: "", stalledManual: false, lastActivity: new Date().toISOString(), lastContactDate: "", dgoDate: "", dgoCompleted: false, checkIns: [], businessCommitment: "", classStartDate: "", classCompletionDate: "", classCompleted: false, rvpCompleted: [], rvpPromotionDate: "", examDate: "", examCompleted: false, references: [], premiumSubmitted: 0, isLicensed: false, isRecruited: true, pacCount: 0, lifeApps: [], weeklyActivity: {}, investmentClients: [], repPin: "", lifeAppCount: 0, fieldObsCount: 0, licensedRefs: [], licensedDgoDate: "", licensedDgoComplete: false, repMessages: [], unreadByTrainer: false, unreadByRep: false, incomeGoal: 0 }]);
    setNewRep({ name: "", phone: "", track: "fast", trainerId: activeTrainerId, startDate: "", gradDate: "" });
    setShowAddRep(false);
  };

  const addTrainer = () => {
    if (!newTrainerName.trim()) return;
    const colors = ["#3b82f6","#8b5cf6","#ec4899","#06b6d4","#84cc16","#f43f5e"];
    const adminId = isSuperAdmin ? (newTrainer_adminId || "admin") : currentAdminId;
    setTrainers(prev => [...prev, { id: Date.now().toString(), name: newTrainerName.trim(), color: colors[trainers.length % colors.length], isAdmin: false, adminId, pin: "", calendlyLink: "" }]);
    setNewTrainerName("");
  };

  const addAdmin = (name, pin) => {
    if (!name.trim() || !pin.trim()) return;
    const colors = ["#3b82f6","#8b5cf6","#ec4899","#06b6d4","#84cc16","#f43f5e"];
    setAdmins(prev => [...prev, { id: Date.now().toString(), name: name.trim(), color: colors[admins.length % colors.length], pin: pin.trim(), isSuperAdmin: false }]);
  };

  const updateAdminPin = (adminId, pin) => setAdmins(prev => prev.map(a => a.id !== adminId ? a : { ...a, pin }));
  const updateAdminCalendly = (adminId, link) => setAdmins(prev => prev.map(a => a.id !== adminId ? a : { ...a, calendlyLink: link }));
  const updateRepProduction = (repId, field, value) => updateRep(repId, r => ({ ...r, [field]: value }));
  const updateRepPhoto = (repId, photo) => updateRep(repId, r => ({ ...r, photo }));
  const updateLifeApps = (repId, apps) => updateRep(repId, r => ({ ...r, lifeApps: apps }));
  const updateWeeklyActivity = (repId, activity) => updateRep(repId, r => ({ ...r, weeklyActivity: activity }));
  const updatePacCount = (repId, count) => updateRep(repId, r => ({ ...r, pacCount: count }));

  const doSnapshot = () => {
    const monthKey = getMonthKey();
    const snap = {
      month: monthKey,
      label: getMonthLabel(monthKey),
      premium: reps.reduce((s,r) => s + (Number(r.premiumSubmitted)||0), 0),
      recruits: reps.filter(r => r.isRecruited).length,
      licensed: reps.filter(r => r.isLicensed || r.examCompleted).length,
      apptsDone: reps.reduce((s,r) => s + (r.appointments||[]).filter(a=>a.completed||a.status==="completed").length, 0),
      repCount: reps.length,
      savedAt: new Date().toISOString(),
    };
    setMonthlyData(prev => ({ ...prev, [monthKey]: snap }));
    setReps(prev => prev.map(r => ({ ...r, premiumSubmitted: 0, isRecruited: false })));
    setShowNewMonthBanner(false);
  };

  useEffect(() => {
    if (!dataLoaded) return;
    const currentMonth = getMonthKey();
    const months = Object.keys(monthlyData||{});
    if (months.length > 0) {
      const lastMonth = months.sort().reverse()[0];
      if (lastMonth !== currentMonth) setShowNewMonthBanner(true);
    }
  }, [dataLoaded]);

  const updateTrainerPin = (trainerId, pin) => setTrainers(prev => prev.map(t => t.id !== trainerId ? t : { ...t, pin }));

  const handleLogin = (role, id, newPin = null) => {
    const s = { role, id };
    setSession(s);
    saveSession(role, id);
    // If new PIN provided, save it to the rep
    if (newPin && role === "rep") {
      setReps(prev => {
        const updatedReps = prev.map(r => r.id !== id ? r : { ...r, repPin: newPin });
        saveToFirebase(STORAGE_KEY, updatedReps);
        return updatedReps;
      });
    }
  };
  const handleLogout = () => { setSession(null); clearSession(); };
  const updateRepDirect = (updatedRep) => {
    setReps(prev => {
      const updatedReps = prev.map(r => r.id !== updatedRep.id ? r : updatedRep);
      // Save immediately to Firebase so trainer sees changes in real time
      saveToFirebase(STORAGE_KEY, updatedReps);
      return updatedReps;
    });
  };

  const deleteRep = (repId) => { setReps(prev => prev.filter(r => r.id !== repId)); setShowDeleteConfirm(null); if (selectedRepId === repId) setView("dashboard"); };
  const openRep = (rep) => { setSelectedRepId(rep.id); setActiveTab("trainer"); setView("detail"); setEditingNotes(false); };

  const visibleReps = useMemo(() => reps
    .filter(r => isSuperAdmin ? true : isAdmin ? (trainers.filter(t => t.adminId === currentAdminId).map(t => t.id).includes(r.trainerId) || r.adminId === currentAdminId) : r.trainerId === activeTrainerId)
    .filter(r => filterTrack === "all" ? true : r.track === filterTrack)
    .filter(r => !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()) || (r.phone && r.phone.includes(searchQuery)))
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.lastActivity||b.date) - new Date(a.lastActivity||a.date);
      if (sortBy === "progress") { const pa = Math.round((pct(a.trainerCompleted.length,TRAINER_CHECKLIST.length)+pct(a.repCompleted.length,TRACK_INFO[a.track].checklist.length))/2); const pb = Math.round((pct(b.trainerCompleted.length,TRAINER_CHECKLIST.length)+pct(b.repCompleted.length,TRACK_INFO[b.track].checklist.length))/2); return pb-pa; }
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "stalled") return (isStalled(b)?1:0)-(isStalled(a)?1:0);
      return 0;
    }), [reps, isAdmin, activeTrainerId, filterTrack, searchQuery, sortBy]);

  // ── REP PREVIEW MODAL (admin peeking at rep view) ────────────────────────────
  if (previewingRepId) {
    const previewRep = reps.find(r => r.id === previewingRepId);
    if (!previewRep) { setPreviewingRepId(null); return null; }
    const previewTrainer = trainers.find(t => t.id === previewRep.trainerId);
    const previewAdminData = admins.find(a => a.id === previewTrainer?.adminId);
    return (
      <div style={{ position: "fixed", inset: 0, background: "#0f0f11", zIndex: 200, overflowY: "auto" }}>
        <div style={{ background: "linear-gradient(135deg,#1a0a2e,#0f3460)", borderBottom: "1px solid #ffffff18", padding: "14px 20px", position: "sticky", top: 0, zIndex: 210, display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => setPreviewingRepId(null)} style={{ background: "#f59e0b", border: "none", color: "#0f0f11", padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontWeight: "bold", fontSize: 13 }}>← Exit Preview</button>
          <div>
            <div style={{ fontSize: 11, color: "#f59e0b", letterSpacing: "0.15em", textTransform: "uppercase" }}>Admin Preview Mode</div>
            <div style={{ fontSize: 15, fontWeight: "bold", color: "#f0ede8" }}>Viewing as: {previewRep.name}</div>
          </div>
          <div style={{ marginLeft: "auto", background: "#f59e0b20", border: "1px solid #f59e0b40", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "#f59e0b" }}>👁 Read-only preview</div>
        </div>
        <RepView rep={previewRep} onUpdate={(updated) => setReps(prev => prev.map(r => r.id !== updated.id ? r : updated))} onLogout={() => setPreviewingRepId(null)} isPreview={true} trainerLink={getApptLink(previewTrainer, previewAdminData)} schedule={schedule} cancellations={cancellations} allReps={reps} trainers={trainers} />
      </div>
    );
  }

  // ── AUTH GATES ───────────────────────────────────────────────────────────────
  if (!session) return <LoginScreen trainers={trainers} reps={reps} admins={admins} onLogin={handleLogin} />;

  if (session.role === "rep") {
    const repData = reps.find(r => r.id === session.id);
    if (!repData) { handleLogout(); return null; }
    const repTrainerData = trainers.find(t => t.id === repData.trainerId);
    const repAdminData = admins.find(a => a.id === repTrainerData?.adminId);
    const repTrainerLink = getApptLink(repTrainerData, repAdminData);
    return <RepView rep={repData} onUpdate={updateRepDirect} onLogout={handleLogout} trainerLink={repTrainerLink} schedule={schedule} cancellations={cancellations} allReps={reps} trainers={trainers} />;
  }

  // ── DETAIL VIEW ──────────────────────────────────────────────────────────────
  if (view === "detail" && selectedRepId) {
    const rep = reps.find(r => r.id === selectedRepId);
    if (!rep) { setView("dashboard"); return null; }
    const track = TRACK_INFO[rep.track];
    const repChecklist = track.checklist;
    const trainerCats = [...new Set(TRAINER_CHECKLIST.map(i => i.category))];
    const repCats = [...new Set(repChecklist.map(i => i.category))];
    const tp = pct(rep.trainerCompleted.length, TRAINER_CHECKLIST.length);
    const rp = pct(rep.repCompleted.length, repChecklist.length);
    const graduated = isGraduated(rep);
    const stalled = isStalled(rep);
    const repTrainer = trainers.find(t => t.id === rep.trainerId);
    const apptSet = (rep.appointments||[]).filter(a => a.name).length;
    const apptDone = (rep.appointments||[]).filter(a => a.status==="completed"&&a.name).length;
    let daysLeft = rep.gradDate ? Math.ceil((new Date(rep.gradDate)-new Date())/86400000) : null;

    const tabs = [
      { key:"trainer", label:"Trainer" },
      { key:"rep", label: track.shortLabel },
      { key:"appointments", label:`Appts (${apptSet})` },
      { key:"refs", label:`Refs (${(rep.references||[]).filter(r=>r.name).length})` },
      { key:"messages", label:`💬 Messages${rep.unreadByTrainer?" 🔴":""}` },
      { key:"lifeapps", label:`📋 Life Apps (${(rep.lifeApps||[]).filter(a=>a.clientName).length})` },
      { key:"investments", label:`💰 Investments (${(rep.investmentClients||[]).length})` },
      { key:"scorecard", label:"📊 Scorecard" },
      { key:"rvp", label:"👑 RVP" },
      { key:"schedule", label:"Schedule" },
    ];

    return (
      <div style={{ fontFamily:"'Georgia',serif", minHeight:"100vh", background:"#0f0f11", color:"#f0ede8" }}>
        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#1a0a2e 0%,#16213e 50%,#0f3460 100%)", borderBottom:"1px solid #ffffff18", padding:"16px 20px", position:"sticky", top:0, zIndex:50 }}>
          <div style={{ maxWidth:860, margin:"0 auto", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            <button onClick={() => setView("dashboard")} style={{ background:"none", border:"1px solid #ffffff30", color:"#f0ede8", padding:"6px 14px", borderRadius:8, cursor:"pointer", fontSize:13 }}>← Back</button>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ fontSize:18, fontWeight:"bold" }}>{rep.name}</div>
                {graduated && <div style={{ background:"#10b98120", border:"1px solid #10b98150", color:"#10b981", borderRadius:20, padding:"2px 12px", fontSize:12, fontWeight:"bold" }}>🎉 Graduated!</div>}
                {!graduated && stalled && <div style={{ background:"#f43f5e20", border:"1px solid #f43f5e50", color:"#f43f5e", borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:"bold" }}>⚠ Stalled</div>}
              </div>
              <div style={{ fontSize:11, color:"#ffffff50" }}>{repTrainer?.name}{rep.phone && ` · ${rep.phone}`}</div>
            </div>
            <div style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
              {saveIndicator && <div style={{ fontSize:11, color:"#10b981" }}>✓ Saved</div>}
              <button onClick={() => exportRepCSV(rep, trainers)} style={{ background:"none", border:"1px solid #3b82f640", color:"#3b82f6", padding:"5px 12px", borderRadius:8, cursor:"pointer", fontSize:12 }}>⬇ Export CSV</button>
              <button onClick={() => setPreviewingRepId(rep.id)} style={{ background:"#8b5cf620", border:"1px solid #8b5cf640", color:"#8b5cf6", padding:"5px 12px", borderRadius:8, cursor:"pointer", fontSize:12 }}>👁 Preview Rep View</button>
              <div style={{ background:`${track.color}20`, border:`1px solid ${track.color}50`, color:track.color, borderRadius:20, padding:"4px 12px", fontSize:12, fontWeight:"bold" }}>{track.label}</div>
              <button onClick={() => toggleStalled(rep.id)} style={{ background:stalled?"#f43f5e20":"none", border:`1px solid ${stalled?"#f43f5e50":"#ffffff20"}`, color:stalled?"#f43f5e":"#ffffff60", padding:"5px 12px", borderRadius:8, cursor:"pointer", fontSize:12 }}>{stalled?"Unstall":"Mark Stalled"}</button>
              <button onClick={() => setShowDeleteConfirm(rep.id)} style={{ background:"none", border:"1px solid #f43f5e30", color:"#f43f5e80", padding:"5px 12px", borderRadius:8, cursor:"pointer", fontSize:12 }}>Remove</button>
            </div>
          </div>
        </div>

        {showDeleteConfirm===rep.id && (
          <div style={{ background:"#f43f5e15", border:"1px solid #f43f5e40", margin:"12px auto", maxWidth:860, borderRadius:12, padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
            <div style={{ fontSize:14 }}>Remove <strong>{rep.name}</strong> and all their progress?</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => deleteRep(rep.id)} style={{ background:"#f43f5e", border:"none", color:"#fff", padding:"7px 16px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:"bold" }}>Yes, Remove</button>
              <button onClick={() => setShowDeleteConfirm(null)} style={{ background:"none", border:"1px solid #ffffff20", color:"#ffffff80", padding:"7px 16px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Graduation Banner */}
        {graduated && (
          <div style={{ background:"linear-gradient(135deg,#10b98120,#f59e0b15)", border:"1px solid #10b98130", margin:"0 auto 0", maxWidth:860, padding:"18px 24px", textAlign:"center" }}>
            <div style={{ fontSize:28, marginBottom:6 }}>🎉</div>
            <div style={{ fontSize:18, fontWeight:"bold", color:"#10b981" }}>Congratulations, {rep.name}!</div>
            <div style={{ fontSize:13, color:"#ffffff60", marginTop:4 }}>All checklists complete. Fully onboarded!</div>
          </div>
        )}

        <div style={{ maxWidth:860, margin:"0 auto", padding:"20px 16px" }}>
          {/* Dates + last contact */}
          <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
            {/* Start Date */}
            <div style={{ background:"#ffffff07", border:"1px solid #ffffff10", borderRadius:10, padding:"10px 16px", flex:1, minWidth:110 }}>
              <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Start Date</div>
              <div style={{ fontSize:13, fontWeight:"bold", color:"#f0ede8" }}>{rep.startDate||rep.date}</div>
            </div>
            {/* Target Graduation — only for new reps, not licensed */}
            {(rep.track !== "licensed" && rep.track !== "rvp") && (
              <div style={{ background:"#ffffff07", border:"1px solid #ffffff10", borderRadius:10, padding:"10px 16px", flex:1, minWidth:140 }}>
                <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Target Graduation</div>
                <input type="date" value={rep.gradDate||""} onChange={e => updateRep(rep.id, r => ({ ...r, gradDate: e.target.value }))}
                  style={{ background:"transparent", border:"none", color: rep.gradDate?"#f0ede8":"#ffffff30", fontSize:13, fontWeight:"bold", outline:"none", colorScheme:"dark", fontFamily:"inherit", width:"100%" }} />
                {!rep.gradDate && <div style={{ fontSize:10, color:"#ffffff30", marginTop:2 }}>Tap to set date</div>}
              </div>
            )}
            {/* RVP Goal Date — for licensed/RVP only */}
            {(rep.track === "licensed" || rep.track === "rvp") && (
              <div style={{ background:"#f59e0b07", border:"1px solid #f59e0b20", borderRadius:10, padding:"10px 16px", flex:1, minWidth:140 }}>
                <div style={{ fontSize:10, color:"#f59e0b80", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>👑 RVP Goal Date</div>
                <input type="date" value={rep.rvpPromotionDate||""} onChange={e => updateRep(rep.id, r => ({ ...r, rvpPromotionDate: e.target.value }))}
                  style={{ background:"transparent", border:"none", color: rep.rvpPromotionDate?"#f59e0b":"#ffffff30", fontSize:13, fontWeight:"bold", outline:"none", colorScheme:"dark", fontFamily:"inherit", width:"100%" }} />
                {!rep.rvpPromotionDate && <div style={{ fontSize:10, color:"#ffffff30", marginTop:2 }}>Tap to set date</div>}
              </div>
            )}
            {/* Days remaining */}
            {daysLeft !== null && (
              <div style={{ background:"#ffffff07", border:"1px solid #ffffff10", borderRadius:10, padding:"10px 16px", flex:1, minWidth:110 }}>
                <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Days Remaining</div>
                <div style={{ fontSize:13, fontWeight:"bold", color: daysLeft<0?"#f43f5e":daysLeft<=3?"#f59e0b":"#10b981" }}>{daysLeft>0?`${daysLeft} days`:daysLeft===0?"Today!":`${Math.abs(daysLeft)}d overdue`}</div>
              </div>
            )}
            {/* Appointments */}
            <div style={{ background:"#ffffff07", border:"1px solid #ffffff10", borderRadius:10, padding:"10px 16px", flex:1, minWidth:110 }}>
              <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Appointments</div>
              <div style={{ fontSize:13, fontWeight:"bold", color: apptSet>=15?"#10b981":"#f59e0b" }}>{apptSet} set · {apptDone} done</div>
            </div>
          </div>

          {/* Last contact date */}
          <div style={{ background:"#ffffff07", border:"1px solid #ffffff12", borderRadius:12, padding:"14px 16px", marginBottom:14, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
            <div>
              <div style={{ fontSize:11, color:"#ffffff60", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Last Contact Date</div>
              <input type="date" value={rep.lastContactDate||""} onChange={e => setLastContact(rep.id, e.target.value)}
                style={{ background:"transparent", border:"none", borderBottom:"1px solid #ffffff20", color: rep.lastContactDate?"#f0ede8":"#ffffff30", fontSize:14, outline:"none", colorScheme:"dark", fontFamily:"inherit" }} />
            </div>
            {stalled && <div style={{ fontSize:12, color:"#f43f5e", background:"#f43f5e15", border:"1px solid #f43f5e30", borderRadius:8, padding:"6px 14px" }}>⚠ No contact logged in 7+ days</div>}
          </div>

          {/* Rep Data Feed — live info from rep's entries */}
          <div style={{ background:"#ffffff07", border:"1px solid #ffffff12", borderRadius:12, padding:"16px 18px", marginBottom:14 }}>
            <div style={{ fontSize:11, color:"#f59e0b", fontWeight:"bold", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:14 }}>📋 Rep-Entered Details</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, flexWrap:"wrap" }}>

              {/* Business Commitment */}
              <div style={{ background:"#f43f5e0a", border:"1px solid #f43f5e25", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>💼 Business Commitment</div>
                {rep.businessCommitment
                  ? <div style={{ fontSize:18, fontWeight:"bold", color:"#10b981" }}>${Number(rep.businessCommitment).toLocaleString()}</div>
                  : <div style={{ fontSize:13, color:"#ffffff30", fontStyle:"italic" }}>Not entered yet</div>
                }
              </div>

              {/* DGO Date */}
              <div style={{ background:"#06b6d40a", border:"1px solid #06b6d425", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>🎉 DGO Date</div>
                {rep.dgoDate
                  ? <div>
                      <div style={{ fontSize:14, fontWeight:"bold", color: rep.dgoCompleted ? "#10b981" : "#06b6d4" }}>{rep.dgoDate}</div>
                      <div style={{ fontSize:11, color: rep.dgoCompleted ? "#10b981" : "#ffffff50", marginTop:3 }}>{rep.dgoCompleted ? "✓ Completed" : "Upcoming"}</div>
                    </div>
                  : <div style={{ fontSize:13, color:"#ffffff30", fontStyle:"italic" }}>Not scheduled yet</div>
                }
              </div>

              {/* Pre-Licensing Class */}
              <div style={{ background:"#a78bfa0a", border:"1px solid #a78bfa25", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>📚 Pre-Licensing Class</div>
                {rep.classStartDate || rep.classCompletionDate || rep.classCompleted
                  ? <div>
                      <div style={{ fontSize:12, color:"#a78bfa", fontWeight:"bold", marginBottom:4 }}>
                        {rep.classType === "online" ? "💻 Online" : rep.classType === "zoom" ? "📹 Zoom" : "🏫 In-Person"}
                        {rep.classCompleted && <span style={{ color:"#10b981", marginLeft:6 }}>✓ Complete</span>}
                      </div>
                      {rep.classStartDate && <div style={{ fontSize:12, color:"#ffffff60" }}>Start: {rep.classStartDate}</div>}
                      {rep.classCompletionDate && <div style={{ fontSize:12, color:"#ffffff60" }}>Done: {rep.classCompletionDate}</div>}
                      {!rep.classCompleted && !rep.classCompletionDate && <div style={{ fontSize:11, color:"#f59e0b", marginTop:3 }}>In progress</div>}
                    </div>
                  : <div style={{ fontSize:13, color:"#ffffff30", fontStyle:"italic" }}>Not started yet</div>
                }
              </div>

              {/* Exam Date */}
              <div style={{ background:"#f59e0b0a", border:"1px solid #f59e0b25", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>📝 Exam Date</div>
                {rep.examDate
                  ? <div>
                      <div style={{ fontSize:14, fontWeight:"bold", color: rep.examCompleted ? "#10b981" : "#f59e0b" }}>{rep.examDate}</div>
                      <div style={{ fontSize:11, color: rep.examCompleted ? "#10b981" : "#ffffff50", marginTop:3 }}>{rep.examCompleted ? "✓ Passed!" : "Scheduled"}</div>
                    </div>
                  : <div style={{ fontSize:13, color:"#ffffff30", fontStyle:"italic" }}>Not scheduled yet</div>
                }
              </div>
            </div>

            {/* Field Training Observation Counter — trainer can update */}
            {(rep.track === "fast" || rep.track === "regular") && (
              <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid #ffffff10" }}>
                <div style={{ fontSize:10, color:"#8b5cf6", fontWeight:"bold", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>
                  👁 Field Training Observations ({rep.fieldObsCount||0}/10)
                </div>
                <FieldObsCounter
                  count={rep.fieldObsCount||0}
                  onChange={count => updateRep(rep.id, r => ({ ...r, fieldObsCount:count }))}
                />
              </div>
            )}
          </div>

          {/* Licensed DGO, Refs, and MACHO List feed to trainer */}
          {(rep.track === "licensed" || rep.track === "rvp") && (rep.licensedDgoDate || (rep.licensedRefs||[]).length > 0 || (rep.licensedMachoList||[]).length > 0) && (
            <div style={{ background:"#06b6d408", border:"1px solid #06b6d425", borderRadius:12, padding:"16px 18px", marginBottom:14 }}>
              <div style={{ fontSize:11, color:"#06b6d4", fontWeight:"bold", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>⭐ Already Licensed Onboarding Data</div>

              {/* DGO */}
              {rep.licensedDgoDate && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", marginBottom:4 }}>🎉 DGO Date</div>
                  <div style={{ fontSize:13, fontWeight:"bold", color: rep.licensedDgoComplete?"#10b981":"#f59e0b" }}>{rep.licensedDgoDate} {rep.licensedDgoComplete ? "✓ Completed" : "— Scheduled"}</div>
                </div>
              )}

              {/* References */}
              {(rep.licensedRefs||[]).filter(r=>r.name).length > 0 && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", marginBottom:6 }}>👥 References ({(rep.licensedRefs||[]).filter(r=>r.name).length}/5)</div>
                  {(rep.licensedRefs||[]).filter(r=>r.name).map((ref,i) => (
                    <div key={i} style={{ fontSize:12, color:"#f0ede8", marginBottom:3 }}>
                      {i+1}. <strong>{ref.name}</strong> {ref.phone && `· ${ref.phone}`} {ref.relationship && `· ${ref.relationship}`}
                    </div>
                  ))}
                </div>
              )}

              {/* MACHO List */}
              {(rep.licensedMachoList||[]).filter(c=>c.name).length > 0 && (
                <div>
                  <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", marginBottom:6 }}>📝 Training List ({(rep.licensedMachoList||[]).filter(c=>c.name).length}/20)</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 12px" }}>
                    {(rep.licensedMachoList||[]).filter(c=>c.name).map((c,i) => (
                      <div key={i} style={{ fontSize:11, color:"#f0ede8" }}>{i+1}. {c.name} {c.phone && `· ${c.phone}`}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Investment Clients — standalone prominent panel */}
          <div style={{ background:"#f59e0b08", border:"1px solid #f59e0b30", borderRadius:12, padding:"16px 18px", marginBottom:14 }}>
            <div style={{ fontSize:11, color:"#f59e0b", fontWeight:"bold", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>
              💰 Future Investment Clients ({(rep.investmentClients||[]).length}) — to move when investment licensed
            </div>
            {(rep.investmentClients||[]).length === 0
              ? <div style={{ fontSize:13, color:"#ffffff30", fontStyle:"italic" }}>No future investment clients logged yet</div>
              : <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {(rep.investmentClients||[]).map(client => (
                    <div key={client.id} style={{ background:client.movedOver?"#10b98110":"#ffffff06", border:`1px solid ${client.movedOver?"#10b98130":"#ffffff10"}`, borderRadius:8, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:"bold", color:client.movedOver?"#ffffff50":"#f0ede8", textDecoration:client.movedOver?"line-through":"none" }}>{client.name}</div>
                        <div style={{ fontSize:10, color:"#ffffff30", marginTop:2 }}>{client.date}</div>
                      </div>
                      <button onClick={() => updateRep(rep.id, r => ({ ...r, investmentClients:(r.investmentClients||[]).map(c => c.id!==client.id?c:{...c,movedOver:!c.movedOver}) }))}
                        style={{ fontSize:11, background:client.movedOver?"#10b98120":"#ffffff10", border:`1px solid ${client.movedOver?"#10b98140":"#ffffff20"}`, color:client.movedOver?"#10b981":"#ffffff50", borderRadius:20, padding:"4px 12px", cursor:"pointer" }}>
                        {client.movedOver ? "✓ Moved" : "Mark Moved"}
                      </button>
                    </div>
                  ))}
                </div>
            }
          </div>

          {/* References Feed — from rep's entries */}
          {(rep.references||[]).filter(r => r.name).length > 0 && (
            <div style={{ background:"#ffffff07", border:"1px solid #8b5cf630", borderRadius:12, padding:"16px 18px", marginBottom:14 }}>
              <div style={{ fontSize:11, color:"#8b5cf6", fontWeight:"bold", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:14 }}>👥 Rep's Character References ({(rep.references||[]).filter(r=>r.name).length}/5)</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {(rep.references||[]).filter(r => r.name).map((ref, idx) => (
                  <div key={idx} style={{ background:"#8b5cf610", border:"1px solid #8b5cf625", borderRadius:10, padding:"10px 14px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                    <div>
                      <div style={{ fontSize:9, color:"#ffffff30", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>Name</div>
                      <div style={{ fontSize:13, fontWeight:"bold", color:"#f0ede8" }}>{ref.name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:9, color:"#ffffff30", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>Phone</div>
                      <div style={{ fontSize:13, color:"#f0ede8" }}>{ref.phone || "—"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:9, color:"#ffffff30", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>Relationship</div>
                      <div style={{ fontSize:12, color:"#8b5cf6", fontWeight:"bold" }}>{ref.relationship || "—"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(rep.references||[]).filter(r => r.name).length === 0 && (
            <div style={{ background:"#ffffff05", border:"1px solid #8b5cf620", borderRadius:12, padding:"14px 18px", marginBottom:14 }}>
              <div style={{ fontSize:11, color:"#8b5cf6", fontWeight:"bold", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>👥 Character References</div>
              <div style={{ fontSize:13, color:"#ffffff30", fontStyle:"italic" }}>Rep hasn’t entered references yet</div>
            </div>
          )}

          {/* Appointments Feed — from rep's entries including MACHO scores */}
          <div style={{ background:"#ffffff07", border:"1px solid #f43f5e30", borderRadius:12, padding:"16px 18px", marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontSize:11, color:"#f43f5e", fontWeight:"bold", letterSpacing:"0.1em", textTransform:"uppercase" }}>
                📅 Rep's Training Appointments ({(rep.appointments||[]).filter(a=>a.name).length}/20)
              </div>
              <div style={{ fontSize:12, color:"#ffffff40" }}>
                {(rep.appointments||[]).filter(a=>a.completed&&a.name).length} completed · {(rep.appointments||[]).filter(a=>a.name&&(a.macho||[]).length>=3).length} qualified (3+ ⭐)
              </div>
            </div>
            {(rep.appointments||[]).filter(a=>a.name).length === 0 ? (
              <div style={{ fontSize:13, color:"#ffffff30", fontStyle:"italic" }}>Rep hasn’t logged any appointments yet</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {(rep.appointments||[]).filter(a=>a.name).map((appt, idx) => {
                  const stars = (appt.macho||[]).length;
                  const isQualified = stars >= 3;
                  const isComplete = appt.completed || appt.status === "completed";
                  return (
                    <div key={idx} style={{ background: isComplete ? "#10b98110" : isQualified ? "#f59e0b0a" : "#ffffff06", border:`1px solid ${isComplete?"#10b98130":isQualified?"#f59e0b25":"#ffffff10"}`, borderRadius:10, padding:"12px 14px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                        <div style={{ fontSize:13, fontWeight:"bold", color: isComplete?"#ffffff60":"#f0ede8", textDecoration: isComplete?"line-through":"none" }}>{appt.name}</div>
                        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                          {stars > 0 && (
                            <div style={{ fontSize:12, color:"#f59e0b", fontWeight:"bold" }}>
                              {"⭐".repeat(stars)} {isQualified ? "Qualified!" : `${3-stars} more needed`}
                            </div>
                          )}
                          <div style={{ fontSize:11, color: isComplete?"#10b981":"#3b82f6", fontWeight:"bold", background: isComplete?"#10b98120":"#3b82f620", border:`1px solid ${isComplete?"#10b98140":"#3b82f640"}`, borderRadius:20, padding:"2px 10px" }}>
                            {isComplete ? "✓ Done" : "Set"}
                          </div>
                        </div>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                        {appt.phone && <div><div style={{ fontSize:9, color:"#ffffff30", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>Phone</div><div style={{ fontSize:12, color:"#ffffff70" }}>{appt.phone}</div></div>}
                        {appt.email && <div><div style={{ fontSize:9, color:"#ffffff30", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>Email</div><div style={{ fontSize:12, color:"#ffffff70" }}>{appt.email}</div></div>}
                        {appt.date && <div><div style={{ fontSize:9, color:"#ffffff30", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>Date</div><div style={{ fontSize:12, color:"#ffffff70" }}>📅 {appt.date}</div></div>}
                      </div>
                      {(appt.macho||[]).length > 0 && (
                        <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>
                          {["M","A","C","H","O"].map(k => {
                            const active = (appt.macho||[]).includes(k);
                            const labels = {M:"Married",A:"Age 25-55",C:"Children",H:"Homeowner",O:"Occupation"};
                            return active ? (
                              <div key={k} style={{ fontSize:10, background:"#f59e0b20", border:"1px solid #f59e0b40", borderRadius:20, padding:"2px 8px", color:"#f59e0b", fontWeight:"bold" }}>⭐ {k} — {labels[k]}</div>
                            ) : null;
                          })}
                        </div>
                      )}
                      {appt.apptNote && <div style={{ fontSize:11, color:"#ffffff40", marginTop:6, fontStyle:"italic" }}>📝 {appt.apptNote}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Progress cards */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
            {[
              { label:"Trainer Progress", val:tp, color:"#f59e0b", done:rep.trainerCompleted.length, total:TRAINER_CHECKLIST.length },
              { label:`${track.shortLabel} Checklist`, val:rp, color:track.color, done:rep.repCompleted.length, total:repChecklist.length },
            ].map(s => (
              <div key={s.label} style={{ background:"#ffffff07", border:"1px solid #ffffff12", borderRadius:12, padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <div style={{ fontSize:11, color:"#ffffff60", textTransform:"uppercase", letterSpacing:"0.08em" }}>{s.label}</div>
                  <div style={{ fontSize:16, fontWeight:"bold", color:s.val===100?"#10b981":s.color }}>{s.val}%</div>
                </div>
                <ProgressBar value={s.val} color={s.color} />
                <div style={{ fontSize:11, color:"#ffffff30", marginTop:5 }}>{s.done} of {s.total} tasks</div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div style={{ background:"#ffffff07", border:"1px solid #ffffff12", borderRadius:12, padding:"14px 16px", marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <div style={{ fontSize:11, color:"#ffffff60", textTransform:"uppercase", letterSpacing:"0.08em" }}>Notes</div>
              {!editingNotes
                ? <button onClick={() => { setEditingNotes(true); setNoteDraft(rep.notes||""); }} style={{ background:"none", border:"1px solid #ffffff20", color:"#ffffff60", padding:"4px 12px", borderRadius:6, cursor:"pointer", fontSize:12 }}>Edit</button>
                : <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => { saveNote(rep.id,noteDraft); setEditingNotes(false); }} style={{ background:"#f59e0b", border:"none", color:"#0f0f11", padding:"4px 12px", borderRadius:6, cursor:"pointer", fontSize:12, fontWeight:"bold" }}>Save</button>
                    <button onClick={() => setEditingNotes(false)} style={{ background:"none", border:"1px solid #ffffff20", color:"#ffffff60", padding:"4px 12px", borderRadius:6, cursor:"pointer", fontSize:12 }}>Cancel</button>
                  </div>
              }
            </div>
            {editingNotes
              ? <textarea value={noteDraft} onChange={e => setNoteDraft(e.target.value)} placeholder='e.g. "Waiting on license docs" or "DGO rescheduled to June 2nd"' style={{ ...inputStyle, height:90, resize:"vertical", fontFamily:"inherit" }} />
              : <div style={{ fontSize:14, color:rep.notes?"#f0ede8":"#ffffff30", lineHeight:1.6, whiteSpace:"pre-wrap" }}>{rep.notes||"No notes yet. Tap Edit to add one."}</div>
            }
          </div>

          {/* DGO Card */}
          <div style={{ background: rep.dgoCompleted ? "#10b98110" : "#06b6d410", border: `1px solid ${rep.dgoCompleted ? "#10b98140" : "#06b6d440"}`, borderRadius:12, padding:"14px 16px", marginBottom:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontSize:13, fontWeight:"bold", color: rep.dgoCompleted ? "#10b981" : "#06b6d4" }}>🎉 Digital Grand Opening (DGO)</div>
              <div onClick={() => setDgoCompleted(rep.id, !rep.dgoCompleted)} style={{ background: rep.dgoCompleted ? "#10b98120" : "#ffffff10", border: `1px solid ${rep.dgoCompleted ? "#10b98150" : "#ffffff20"}`, borderRadius:20, padding:"4px 14px", fontSize:12, fontWeight:"bold", color: rep.dgoCompleted ? "#10b981" : "#ffffff60", cursor:"pointer" }}>
                {rep.dgoCompleted ? "✓ Completed" : "Mark Complete"}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Scheduled Date</div>
                <input type="date" value={rep.dgoDate||""} onChange={e => setDgoDate(rep.id, e.target.value)}
                  style={{ background:"transparent", border:"none", borderBottom:"1px solid #ffffff20", color: rep.dgoDate ? "#f0ede8" : "#ffffff30", fontSize:14, outline:"none", colorScheme:"dark", fontFamily:"inherit" }} />
              </div>
              {rep.dgoDate && <div style={{ fontSize:12, color:"#ffffff50" }}>📅 {rep.dgoDate}</div>}
            </div>
          </div>

          {/* Check-In Section */}
          <CheckInSection
            checkIns={rep.checkIns||[]}
            onAddCheckIn={(note) => addCheckIn(rep.id, note, activeTrainer?.name || "Trainer")}
          />

          {/* Class Card — trainer view */}
          {(rep.track === "fast" || rep.track === "regular") && (
            <div style={{ background: rep.classCompleted ? "#10b98110" : "#a78bfa10", border: `1px solid ${rep.classCompleted ? "#10b98140" : "#a78bfa40"}`, borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div style={{ fontSize:13, fontWeight:"bold", color: rep.classCompleted ? "#10b981" : "#a78bfa" }}>📚 Pre-Licensing Class {rep.classType === "zoom" ? "· 📹 Zoom" : rep.classType === "online" ? "· 💻 Online" : "· 🏫 In-Person"}</div>
                <div style={{ fontSize:12, color: rep.classCompleted ? "#10b981" : "#ffffff50", fontWeight: rep.classCompleted ? "bold" : "normal" }}>
                  {rep.classCompleted ? "✓ Complete" : "In Progress"}
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div>
                  <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Class Start Date</div>
                  <div style={{ fontSize:14, fontWeight:"bold", color: rep.classStartDate ? "#f0ede8" : "#ffffff30" }}>{rep.classStartDate || "Not entered yet"}</div>
                </div>
                <div>
                  <div style={{ fontSize:10, color:"#ffffff40", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Completion Date</div>
                  <div style={{ fontSize:14, fontWeight:"bold", color: rep.classCompletionDate ? "#f0ede8" : "#ffffff30" }}>{rep.classCompletionDate || "Not entered yet"}</div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display:"flex", gap:4, background:"#ffffff08", borderRadius:10, padding:4, marginBottom:22 }}>
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flex:1, padding:"9px 10px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:"bold", transition:"all 0.15s", background:activeTab===tab.key?"#ffffff15":"transparent", color:activeTab===tab.key?"#f0ede8":"#ffffff50" }}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab==="trainer" && trainerCats.map(cat => (
            <CategorySection key={cat} title={cat} items={TRAINER_CHECKLIST.filter(i=>i.category===cat)} completedIds={rep.trainerCompleted} onToggle={id=>toggleTrainer(rep.id,id)} />
          ))}
          {activeTab==="rep" && repCats.map(cat => (
            <CategorySection key={cat} title={cat} items={repChecklist.filter(i=>i.category===cat)} completedIds={rep.repCompleted} onToggle={id=>toggleRep(rep.id,id)} />
          ))}
          {activeTab==="appointments" && (
            <RepAppointmentTracker appointments={rep.appointments||[]} onChange={appts=>updateAppointments(rep.id,appts)} />
          )}
          {activeTab==="refs" && (
            <ReferencesSection
              references={rep.references||[]}
              onChange={(refs) => setReferences(rep.id, refs)}
              readOnly={false}
            />
          )}
          {activeTab==="schedule" && (
            <TeamScheduleView schedule={schedule} isAdmin={isAdmin} onUpdate={(updated) => setSchedule(updated)} cancellations={cancellations} onCancel={(key, val) => setCancellations(prev => ({ ...prev, [key]: val }))} />
          )}
          {activeTab==="messages" && (
            <RepMessaging rep={rep} onUpdate={(updated) => updateRep(rep.id, r => ({ ...r, ...updated }))} isTrainer={true} />
          )}
          {activeTab==="lifeapps" && (
            <LifeAppTracker
              apps={rep.lifeApps||[]}
              onChange={apps => updateRep(rep.id, r => ({ ...r, lifeApps:apps }))}
              readOnly={true}
            />
          )}
          {activeTab==="scorecard" && (
            <WeeklyScorecard
              activity={rep.weeklyActivity||{}}
              onChange={() => {}}
              readOnly={true}
              autoLifeApps={(rep.lifeApps||[]).filter(a=>a.clientName).length}
              autoInvestments={rep.pacCount||0}
            />
          )}
          {activeTab==="investments" && (
            <PacCounter
              pacCount={rep.pacCount||0}
              onChange={null}
              investmentClients={rep.investmentClients||[]}
              onUpdateClients={(clients) => updateRep(rep.id, r => ({ ...r, investmentClients:clients }))}
              isLicensed={rep.track === "licensed" || rep.track === "rvp"}
              readOnly={false}
            />
          )}
          {activeTab==="rvp" && (
            <RvpChecklist
              completedIds={rep.rvpCompleted||[]}
              promotionDate={rep.rvpPromotionDate||""}
              onToggle={(id) => toggleRvp(rep.id, id)}
              onSetDate={(date) => setRvpPromotionDate(rep.id, date)}
            />
          )}
        </div>
      </div>
    );
  }

  // ── DASHBOARD ────────────────────────────────────────────────────────────────
  const graduatedCount = visibleReps.filter(r => isGraduated(r)).length;
  const stalledCount = visibleReps.filter(r => isStalled(r)).length;
  const totalDone = reps.reduce((s,r) => s+r.trainerCompleted.length+r.repCompleted.length, 0);

  return (
    <div style={{ fontFamily:"'Georgia',serif", minHeight:"100vh", background:"#0f0f11", color:"#f0ede8" }}>
      <div style={{ background:"linear-gradient(135deg,#1a0a2e 0%,#16213e 50%,#0f3460 100%)", borderBottom:"1px solid #ffffff18", padding:"16px 24px" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
            <div>
              <div style={{ fontSize:11, letterSpacing:"0.2em", color:"#f59e0b", textTransform:"uppercase", marginBottom:4 }}>Primerica Field Training</div>
              <div style={{ fontSize:20, fontWeight:"bold" }}>Rep Onboarding Tracker</div>
              <div style={{ fontSize:12, color:"#ffffff50", marginTop:2 }}>Goal: 3×$3,000 · $750 Bonus · DM Promotion</div>
            </div>
            <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
              {saveIndicator && <div style={{ fontSize:11, color:"#10b981" }}>✓ Saved</div>}
              <select value={activeTrainerId} onChange={e => setActiveTrainerId(e.target.value)} style={{ background:"#ffffff10", border:"1px solid #ffffff20", color:"#f0ede8", borderRadius:8, padding:"7px 12px", fontSize:13, cursor:"pointer", outline:"none" }}>
                {trainers.map(t => <option key={t.id} value={t.id} style={{ background:"#1a1a2e" }}>{t.name}</option>)}
              </select>
              <TourButton onClick={() => setShowTrainerTour(true)} />
              <button onClick={() => setShowTrainerMgr(true)} style={{ background:"none", border:"1px solid #ffffff20", color:"#ffffff60", padding:"7px 12px", borderRadius:8, cursor:"pointer", fontSize:12 }}>Manage Trainers</button>
              <button onClick={handleLogout} style={{ background:"none", border:"1px solid #ffffff20", color:"#ffffff60", padding:"7px 12px", borderRadius:8, cursor:"pointer", fontSize:12 }}>Sign Out</button>
            </div>
          </div>
        </div>
      </div>

      {showTrainerMgr && (
        <div style={{ position:"fixed", inset:0, background:"#000000cc", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20, overflowY:"auto" }}>
          <div style={{ background:"#16213e", border:"1px solid #ffffff18", borderRadius:16, padding:28, width:"100%", maxWidth:540, maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div style={{ fontSize:16, fontWeight:"bold" }}>Manage Admins & Trainers</div>
              <button onClick={() => setShowTrainerMgr(false)} style={{ background:"none", border:"none", color:"#ffffff60", fontSize:20, cursor:"pointer" }}>×</button>
            </div>

            {/* ADMINS SECTION */}
            <div style={{ fontSize:11, color:"#f59e0b", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>Admins</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
              {admins.map(a => (
                <div key={a.id} style={{ background:"#ffffff08", borderRadius:10, padding:"10px 14px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: a.isSuperAdmin ? 0 : 8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:a.color }} />
                      <div style={{ fontSize:14, fontWeight:"bold" }}>{a.name}</div>
                      {a.isSuperAdmin && <div style={{ fontSize:10, color:"#f59e0b", letterSpacing:"0.1em", background:"#f59e0b15", border:"1px solid #f59e0b30", borderRadius:10, padding:"2px 8px" }}>SUPER ADMIN</div>}
                    </div>
                    <div style={{ fontSize:12, color:"#ffffff40" }}>{trainers.filter(t=>t.adminId===a.id).length} trainers</div>
                  </div>
                  {!a.isSuperAdmin && (
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ fontSize:11, color:"#ffffff40" }}>PIN:</div>
                        <input
                          type="password" value={a.pin} onChange={e => updateAdminPin(a.id, e.target.value)}
                          placeholder="Set PIN" maxLength={6}
                          style={{ background:"#ffffff0d", border:"1px solid #ffffff20", borderRadius:6, padding:"5px 10px", color:"#f0ede8", fontSize:13, outline:"none", width:100, letterSpacing:"0.2em" }}
                        />
                        <div style={{ fontSize:11, color:"#ffffff30" }}>(reps: {reps.filter(r => trainers.filter(t=>t.adminId===a.id).map(t=>t.id).includes(r.trainerId)).length})</div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ fontSize:11, color:"#ffffff40", whiteSpace:"nowrap" }}>Booking Link:</div>
                        <input
                          value={a.calendlyLink||""} onChange={e => updateAdminCalendly(a.id, e.target.value)}
                          placeholder="Paste your appointment booking link here"
                          style={{ background:"#ffffff0d", border:"1px solid #ffffff20", borderRadius:6, padding:"5px 10px", color:"#f0ede8", fontSize:11, outline:"none", flex:1 }}
                        />
                      </div>
                    </div>
                  )}
                  {a.isSuperAdmin && (
                    <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:8 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ fontSize:11, color:"#ffffff40" }}>PIN:</div>
                        <input
                          type="password" value={a.pin} onChange={e => updateAdminPin(a.id, e.target.value)}
                          placeholder="Change PIN" maxLength={6}
                          style={{ background:"#ffffff0d", border:"1px solid #ffffff20", borderRadius:6, padding:"5px 10px", color:"#f0ede8", fontSize:13, outline:"none", width:100, letterSpacing:"0.2em" }}
                        />
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ fontSize:11, color:"#ffffff40", whiteSpace:"nowrap" }}>Booking Link:</div>
                        <input
                          value={a.calendlyLink||""} onChange={e => updateAdminCalendly(a.id, e.target.value)}
                          placeholder="Paste your appointment booking link here"
                          style={{ background:"#ffffff0d", border:"1px solid #ffffff20", borderRadius:6, padding:"5px 10px", color:"#f0ede8", fontSize:11, outline:"none", flex:1 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add new admin — super admin only */}
            {isSuperAdmin && <AdminAdder onAdd={addAdmin} />}

            <div style={{ borderTop:"1px solid #ffffff15", margin:"20px 0" }} />

            {/* TRAINERS SECTION */}
            <div style={{ fontSize:11, color:"#3b82f6", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>Trainers</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
              {trainers.map(t => {
                const ownerAdmin = admins.find(a => a.id === t.adminId);
                return (
                  <div key={t.id} style={{ background:"#ffffff08", borderRadius:10, padding:"10px 14px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:10, height:10, borderRadius:"50%", background:t.color }} />
                        <div style={{ fontSize:14 }}>{t.name}</div>
                        {ownerAdmin && <div style={{ fontSize:10, color:ownerAdmin.color, background:`${ownerAdmin.color}15`, border:`1px solid ${ownerAdmin.color}30`, borderRadius:10, padding:"2px 8px" }}>{ownerAdmin.name}</div>}
                      </div>
                      <div style={{ fontSize:12, color:"#ffffff40" }}>{reps.filter(r=>r.trainerId===t.id).length} reps</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                      <div style={{ fontSize:11, color:"#ffffff40" }}>PIN:</div>
                      <input
                        type="password" value={t.pin||""} onChange={e => updateTrainerPin(t.id, e.target.value)}
                        placeholder="Set PIN" maxLength={6}
                        style={{ background:"#ffffff0d", border:"1px solid #ffffff20", borderRadius:6, padding:"5px 10px", color:"#f0ede8", fontSize:13, outline:"none", width:100, letterSpacing:"0.2em" }}
                      />
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ fontSize:11, color:"#ffffff40", whiteSpace:"nowrap" }}>Booking Link:</div>
                      <input
                        value={t.calendlyLink||""} onChange={e => setTrainers(prev => prev.map(tr => tr.id !== t.id ? tr : { ...tr, calendlyLink: e.target.value }))}
                        placeholder="Paste your appointment booking link here"
                        style={{ background:"#ffffff0d", border:"1px solid #ffffff20", borderRadius:6, padding:"5px 10px", color:"#f0ede8", fontSize:11, outline:"none", flex:1 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <input value={newTrainerName} onChange={e => setNewTrainerName(e.target.value)} placeholder="New trainer name" style={{ ...inputStyle, flex:1 }} onKeyDown={e => e.key==="Enter"&&addTrainer()} />
              {isSuperAdmin && (
                <select value={newTrainer_adminId} onChange={e => setNewTrainer_adminId(e.target.value)} style={{ background:"#ffffff10", border:"1px solid #ffffff20", color:"#f0ede8", borderRadius:8, padding:"0 10px", fontSize:13, outline:"none" }}>
                  {admins.map(a => <option key={a.id} value={a.id} style={{ background:"#1a1a2e" }}>{a.name}</option>)}
                </select>
              )}
              <button onClick={addTrainer} style={{ background:"#f59e0b", border:"none", color:"#0f0f11", padding:"10px 18px", borderRadius:8, cursor:"pointer", fontWeight:"bold", fontSize:13 }}>Add</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth:860, margin:"0 auto", padding:"20px 16px" }}>

        {showTrainerTour && <AppTour steps={TRAINER_TOUR_STEPS} onClose={() => setShowTrainerTour(false)} storageKey={trainerTourKey} />}
      {/* Unread messages banner */}
      {(() => {
        const unreadCount = visibleReps.filter(r => r.unreadByTrainer).length;
        if (unreadCount === 0) return null;
        return (
          <div style={{ background:"#f43f5e15", border:"1px solid #f43f5e40", borderRadius:12, padding:"12px 18px", marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ fontSize:20 }}>💬</div>
            <div style={{ fontSize:13, color:"#f43f5e", fontWeight:"bold" }}>{unreadCount} rep{unreadCount!==1?"s have":" has"} sent you a new message — check their Messages tab!</div>
          </div>
        );
      })()}

      {/* New Month Banner */}
        {showNewMonthBanner && isAdmin && (
          <div style={{ background:"linear-gradient(135deg,#10b98120,#f59e0b15)", border:"1px solid #10b98140", borderRadius:14, padding:"20px 24px", marginBottom:20, textAlign:"center" }}>
            <div style={{ fontSize:28, marginBottom:8 }}>🎉</div>
            <div style={{ fontSize:18, fontWeight:"bold", color:"#10b981", marginBottom:6 }}>New Month — Fresh Start!</div>
            <div style={{ fontSize:13, color:"#ffffff60", marginBottom:16 }}>Save last months numbers then reset the counters for a new month.</div>
            <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
              <button onClick={doSnapshot} style={{ background:"#10b981", border:"none", color:"#0f0f11", padding:"10px 24px", borderRadius:8, cursor:"pointer", fontWeight:"bold", fontSize:14 }}>Save and Reset for New Month</button>
              <button onClick={() => setShowNewMonthBanner(false)} style={{ background:"none", border:"1px solid #ffffff20", color:"#ffffff60", padding:"10px 20px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Remind me later</button>
            </div>
          </div>
        )}

        {/* Production Dashboard */}
        {isAdmin && (
          <ProductionDashboard
            reps={visibleReps}
            trainers={trainers}
            admins={admins}
            currentAdminId={currentAdminId}
            isSuperAdmin={isSuperAdmin}
            onUpdateRep={(repId, field, value) => updateRepProduction(repId, field, value)}
            onSnapshot={doSnapshot}
            monthlyData={monthlyData}
          />
        )}

        {/* My Production — for trainers and admins writing their own business */}
        <MyProductionSection
          myProduction={myProduction}
          onUpdate={setMyProduction}
          trainerName={activeAdmin?.name || activeTrainer?.name || "Me"}
        />

        {/* How to Access the App */}
        <div style={{ background:"linear-gradient(135deg,#3b82f610,#8b5cf610)", border:"1px solid #3b82f630", borderRadius:14, padding:"18px 20px", marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:"bold", color:"#3b82f6", letterSpacing:"0.05em", marginBottom:12 }}>📱 How New Reps Access This App</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:14 }}>
            {[
              { step:"1", title:"Get the Link", desc:"Your field trainer will send you the app URL when you join the team. Ask them for it if you haven't received it." },
              { step:"2", title:"Open in Browser", desc:"Open the link in your phone's browser (Safari on iPhone, Chrome on Android). No download or app store needed." },
              { step:"3", title:"Save to Home Screen", desc:"On iPhone: tap the Share button → 'Add to Home Screen'. On Android: tap the menu → 'Add to Home Screen'. It will look just like an app!" },
            ].map(s => (
              <div key={s.step} style={{ background:"#ffffff08", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:"#3b82f620", border:"1px solid #3b82f640", color:"#3b82f6", fontSize:12, fontWeight:"bold", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:8 }}>{s.step}</div>
                <div style={{ fontSize:12, fontWeight:"bold", color:"#f0ede8", marginBottom:4 }}>{s.title}</div>
                <div style={{ fontSize:11, color:"#ffffff50", lineHeight:1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ background:"#f59e0b0f", border:"1px solid #f59e0b25", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#f59e0b" }}>
            💡 <strong>Trainers:</strong> Once your app is hosted, copy the URL and send it to every new rep on day one. Have them bookmark it or save it to their home screen to track their own checklist progress.
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
          {[
            { label:"Active Reps", value:visibleReps.length, color:"#f59e0b" },
            { label:"🎉 Graduated", value:graduatedCount, color:"#10b981" },
            { label:"Tasks Done", value:totalDone, color:"#3b82f6" },
            { label:"Stalled", value:stalledCount, color:stalledCount>0?"#f43f5e":"#ffffff30" },
          ].map(s => (
            <div key={s.label} style={{ background:"#ffffff08", border:`1px solid ${s.label==="Stalled"&&s.value>0?"#f43f5e20":"#ffffff12"}`, borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
              <div style={{ fontSize:24, fontWeight:"bold", color:s.color }}>{s.value}</div>
              <div style={{ fontSize:10, color:"#ffffff50", letterSpacing:"0.08em", textTransform:"uppercase", marginTop:3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Trainer Leaderboard + Overdue Alerts */}
        {isSuperAdmin && trainers.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "#ffffff50", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>🏆 Trainer Leaderboard</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {trainers.filter(t => !t.isAdmin).map(trainer => {
                const tReps = reps.filter(r => r.trainerId === trainer.id);
                const scoreData = getTrainerActivityScore(tReps);
                const streak = getCheckInStreak(tReps);
                const overdue = getOverdueReps(tReps);
                return (
                  <div key={trainer.id} style={{ background: "#ffffff07", border: "1px solid #ffffff12", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: trainer.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: "bold" }}>{trainer.name}</div>
                      <div style={{ fontSize: 11, color: "#ffffff40", marginTop: 2 }}>
                        {tReps.length} rep{tReps.length !== 1 ? "s" : ""}
                        {streak > 0 && <span style={{ color: "#f59e0b" }}> · 🔥 {streak}-day streak</span>}
                        {overdue.length > 0 && <span style={{ color: "#f43f5e" }}> · ⚠ {overdue.length} overdue check-in{overdue.length !== 1 ? "s" : ""}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: "bold", color: scoreData.color }}>{scoreData.grade}</div>
                      <div style={{ fontSize: 10, color: "#ffffff40", textTransform: "uppercase" }}>Activity</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: "bold", color: "#ffffff70" }}>{scoreData.score}%</div>
                      <div style={{ fontSize: 10, color: "#ffffff40", textTransform: "uppercase" }}>Score</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Overdue check-in alerts for current trainer */}
        {!isAdmin && (() => {
          const myReps = reps.filter(r => r.trainerId === activeTrainerId);
          const overdue = getOverdueReps(myReps);
          const streak = getCheckInStreak(myReps);
          const score = getTrainerActivityScore(myReps);
          return (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 10, marginBottom: overdue.length > 0 ? 10 : 0, flexWrap: "wrap" }}>
                <div style={{ background: "#ffffff07", border: "1px solid #ffffff12", borderRadius: 10, padding: "10px 16px", flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: "bold", color: score.color }}>{score.grade}</div>
                  <div style={{ fontSize: 10, color: "#ffffff40", textTransform: "uppercase" }}>Activity Grade</div>
                </div>
                <div style={{ background: "#ffffff07", border: "1px solid #ffffff12", borderRadius: 10, padding: "10px 16px", flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: "bold", color: streak > 0 ? "#f59e0b" : "#ffffff30" }}>{streak > 0 ? `🔥${streak}` : "0"}</div>
                  <div style={{ fontSize: 10, color: "#ffffff40", textTransform: "uppercase" }}>Check-in Streak</div>
                </div>
                <div style={{ background: "#ffffff07", border: `1px solid ${overdue.length > 0 ? "#f43f5e30" : "#ffffff12"}`, borderRadius: 10, padding: "10px 16px", flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: "bold", color: overdue.length > 0 ? "#f43f5e" : "#10b981" }}>{overdue.length}</div>
                  <div style={{ fontSize: 10, color: "#ffffff40", textTransform: "uppercase" }}>Overdue</div>
                </div>
              </div>
              {overdue.length > 0 && (
                <div style={{ background: "#f43f5e0f", border: "1px solid #f43f5e30", borderRadius: 10, padding: "12px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: "bold", color: "#f43f5e", marginBottom: 8 }}>⚠️ These reps need a check-in now:</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {overdue.map(r => {
                      const lastCI = (r.checkIns||[])[0];
                      const days = lastCI ? Math.floor((new Date()-new Date(lastCI.date))/86400000) : null;
                      return <div key={r.id} style={{ fontSize: 12, color: "#ffffff60" }}>• {r.name} — {days === null ? "never checked in" : `last check-in ${days} days ago`}</div>;
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Search + Filter + Sort */}
        <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="🔍 Search reps by name or phone..."
            style={{ ...inputStyle, flex:2, minWidth:200, padding:"8px 14px", fontSize:13 }} />
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
            {[["all","All"],["fast","Fast"],["regular","Regular"],["licensed","Licensed"]].map(([val,label]) => (
              <button key={val} onClick={() => setFilterTrack(val)} style={{ padding:"7px 12px", borderRadius:20, border:`1px solid ${filterTrack===val?"#f59e0b":"#ffffff20"}`, background:filterTrack===val?"#f59e0b18":"transparent", color:filterTrack===val?"#f59e0b":"#ffffff50", cursor:"pointer", fontSize:12, fontWeight:filterTrack===val?"bold":"normal" }}>{label}</button>
            ))}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background:"#ffffff10", border:"1px solid #ffffff20", color:"#f0ede8", borderRadius:8, padding:"7px 10px", fontSize:12, cursor:"pointer", outline:"none" }}>
            <option value="date" style={{ background:"#1a1a2e" }}>Recent Activity</option>
            <option value="progress" style={{ background:"#1a1a2e" }}>Progress</option>
            <option value="name" style={{ background:"#1a1a2e" }}>Name A–Z</option>
            <option value="stalled" style={{ background:"#1a1a2e" }}>Stalled First</option>
          </select>
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div style={{ fontSize:13, color:"#ffffff60", letterSpacing:"0.1em", textTransform:"uppercase" }}>{isAdmin?"All Reps":`${activeTrainer?.name}'s Reps`}{searchQuery&&` · "${searchQuery}"`}</div>
          <button onClick={() => setShowAddRep(true)} style={{ background:"#f59e0b", border:"none", color:"#0f0f11", padding:"8px 18px", borderRadius:8, cursor:"pointer", fontWeight:"bold", fontSize:13 }}>+ Add New Rep</button>
        </div>

        {showAddRep && (
          <div style={{ background:"#ffffff0a", border:"1px solid #f59e0b40", borderRadius:12, padding:20, marginBottom:20 }}>
            <div style={{ fontSize:14, fontWeight:"bold", marginBottom:16, color:"#f59e0b" }}>New Recruit</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
              <div><label style={labelStyle}>Full Name</label><input value={newRep.name} onChange={e => setNewRep(p=>({...p,name:e.target.value}))} placeholder="Full Name" style={inputStyle} /></div>
              <div><label style={labelStyle}>Phone Number</label><input value={newRep.phone} onChange={e => setNewRep(p=>({...p,phone:formatPhone(e.target.value)}))} placeholder="111-111-1111" maxLength={12} style={inputStyle} /></div>
              <div><label style={labelStyle}>Start Date</label><input type="date" value={newRep.startDate} onChange={e => setNewRep(p=>({...p,startDate:e.target.value}))} style={inputStyle} /></div>
              <div><label style={labelStyle}>Target Graduation Date</label><input type="date" value={newRep.gradDate} onChange={e => setNewRep(p=>({...p,gradDate:e.target.value}))} style={inputStyle} /></div>
            </div>
            {isAdmin&&trainers.length>1&&(
              <div style={{ marginBottom:12 }}>
                <label style={labelStyle}>Assign to Trainer</label>
                <select value={newRep.trainerId} onChange={e => setNewRep(p=>({...p,trainerId:e.target.value}))} style={inputStyle}>
                  {trainers.map(t => <option key={t.id} value={t.id} style={{ background:"#1a1a2e" }}>{t.name}</option>)}
                </select>
              </div>
            )}
            <div style={{ marginBottom:16 }}>
              <label style={labelStyle}>Select Track</label>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {Object.entries(TRACK_INFO).map(([key,info]) => (
                  <button key={key} onClick={() => setNewRep(p=>({...p,track:key}))} style={{ flex:1, minWidth:120, padding:"10px 12px", borderRadius:10, border:`2px solid ${newRep.track===key?info.color:"#ffffff20"}`, background:newRep.track===key?`${info.color}18`:"transparent", color:newRep.track===key?info.color:"#ffffff60", cursor:"pointer", fontWeight:"bold", fontSize:12, transition:"all 0.15s" }}>
                    <div>{info.label}</div>
                    <div style={{ fontSize:10, fontWeight:"normal", marginTop:2 }}>{info.days}</div>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={addRep} style={{ background:"#f59e0b", border:"none", color:"#0f0f11", padding:"9px 20px", borderRadius:8, cursor:"pointer", fontWeight:"bold", fontSize:13 }}>Add Rep</button>
              <button onClick={() => setShowAddRep(false)} style={{ background:"none", border:"1px solid #ffffff20", color:"#ffffff80", padding:"9px 20px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Cancel</button>
            </div>
          </div>
        )}

        {visibleReps.length===0&&!showAddRep&&(
          <div style={{ textAlign:"center", padding:"50px 20px", color:"#ffffff30", fontSize:14 }}>
            {searchQuery ? `No reps found for "${searchQuery}"` : <>No reps yet. Hit <strong style={{ color:"#f59e0b" }}>+ Add New Rep</strong> to get started.</>}
          </div>
        )}

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {visibleReps.map(rep => {
            const track = TRACK_INFO[rep.track];
            const tp = pct(rep.trainerCompleted.length, TRAINER_CHECKLIST.length);
            const rp = pct(rep.repCompleted.length, track.checklist.length);
            const overall = Math.round((tp+rp)/2);
            const graduated = isGraduated(rep);
            const stalled = isStalled(rep);
            const repTrainer = trainers.find(t=>t.id===rep.trainerId);
            const apptSet = (rep.appointments||[]).filter(a=>a.name).length;
            const apptDone = (rep.appointments||[]).filter(a=>a.status==="completed"&&a.name).length;
            let daysInfo = null;
            if (rep.gradDate) { const diff=Math.ceil((new Date(rep.gradDate)-new Date())/86400000); daysInfo={ label:diff>0?`${diff}d left`:diff===0?"Due today":`${Math.abs(diff)}d over`, color:diff<0?"#f43f5e":diff<=3?"#f59e0b":"#ffffff50" }; }

            return (
              <div key={rep.id} onClick={() => openRep(rep)} style={{ background:graduated?"#10b98108":stalled?"#f43f5e08":"#ffffff07", border:`1px solid ${graduated?"#10b98125":stalled?"#f43f5e25":"#ffffff12"}`, borderRadius:14, padding:"16px 20px", cursor:"pointer", transition:"all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background=graduated?"#10b98112":stalled?"#f43f5e12":"#ffffff0f"}
                onMouseLeave={e => e.currentTarget.style.background=graduated?"#10b98108":stalled?"#f43f5e08":"#ffffff07"}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12, flexWrap:"wrap", gap:8 }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      <div style={{ fontWeight:"bold", fontSize:15 }}>{rep.name}</div>
                      {graduated && <div style={{ background:"#10b98120", color:"#10b981", border:"1px solid #10b98140", borderRadius:20, padding:"1px 10px", fontSize:10, fontWeight:"bold" }}>🎉 GRADUATED</div>}
                      {!graduated&&stalled && <div style={{ background:"#f43f5e20", color:"#f43f5e", border:"1px solid #f43f5e40", borderRadius:20, padding:"1px 8px", fontSize:10, fontWeight:"bold" }}>⚠ STALLED</div>}
                    </div>
                    <div style={{ fontSize:11, color:"#ffffff40", marginTop:2 }}>
                      {isAdmin&&repTrainer&&<span style={{ color:repTrainer.color }}>{repTrainer.name} · </span>}
                      Started {rep.date}
                      <span style={{ color:apptSet>=15?"#10b981":"#f59e0b" }}> · {apptSet} appts, {apptDone} done</span>
                      {rep.dgoDate&&<span style={{ color:rep.dgoCompleted?"#10b981":"#06b6d4" }}> · DGO {rep.dgoCompleted?"✓":"📅"} {rep.dgoDate}</span>}
                      {(() => { const ci = (rep.checkIns||[])[0]; if (!ci) return <span style={{color:"#f43f5e"}}> · ⚠ No check-ins</span>; const d = Math.floor((new Date()-new Date(ci.date))/86400000); return <span style={{color:d>=3?"#f43f5e":"#10b981"}}> · Checked in {d===0?"today":`${d}d ago`}</span>; })()}
                      {rep.notes&&<span style={{ color:"#ffffff30" }}> · 📝</span>}
                      {rep.unreadByTrainer&&<span style={{ color:"#f43f5e", fontWeight:"bold" }}> · 💬 New message</span>}
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                    {daysInfo&&<div style={{ color:daysInfo.color, fontSize:11, fontWeight:"bold" }}>{daysInfo.label}</div>}
                    <div style={{ background:`${track.color}20`, border:`1px solid ${track.color}50`, color:track.color, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:"bold" }}>{track.shortLabel}</div>
                    <div style={{ background:graduated?"#10b98120":"#ffffff10", color:graduated?"#10b981":"#f0ede8", border:`1px solid ${graduated?"#10b98140":"#ffffff20"}`, borderRadius:20, padding:"3px 10px", fontSize:13, fontWeight:"bold" }}>
                      {graduated?"🎉 Done":`${overall}%`}
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  {[{label:"Trainer",val:tp,color:"#f59e0b"},{label:"Rep",val:rp,color:track.color}].map(bar => (
                    <div key={bar.label} style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ fontSize:10, color:"#ffffff35", width:46, textAlign:"right", textTransform:"uppercase", letterSpacing:"0.06em" }}>{bar.label}</div>
                      <div style={{ flex:1 }}><ProgressBar value={bar.val} color={bar.color} /></div>
                      <div style={{ fontSize:11, color:"#ffffff40", width:30 }}>{bar.val}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
