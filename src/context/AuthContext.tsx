import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { User } from "../types";

// Create Axios Instance
export const api = axios.create({
  baseURL: "/api",
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("temple_trust_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: "read" | "write" | "update" | "delete", moduleName?: string) => boolean;
  language: "en" | "mr";
  setLanguage: (lang: "en" | "mr") => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  t: (key: string) => string;
}

const translations: Record<"en" | "mr", Record<string, string>> = {
  en: {
    "nav.dashboard": "Home Dashboard",
    "nav.receipts": "Donation Receipts",
    "nav.expenses": "Expense Ledger",
    "nav.yearly": "Yearly Festivals",
    "nav.monthly": "Monthly MOM",
    "nav.trustees": "Manage Trustees",
    "nav.zone": "Trustee Zone",
    "nav.login": "Trustee Login",
    "nav.logout": "Sign Out",
    "brand.title": "Shree Bhairavnath Mandir Devastan Trust",
    "brand.subtitle": "Official Trust Management & Accounts Audit System • Reg. No. E-14023",
    "brand.prassana": "॥ श्री भैरवनाथ प्रसन्न ॥",
    "brand.footer1": "॥ शुभं भवतु • कल्याणमस्तु ॥",
    "brand.footer2": "© 2026 Shree Bhairavnath Mandir Devastan Trust, Pune. All Rights Reserved.",
    "brand.footer3": "Managed & Certified under Central Devastan Public Trust Act.",
    "action.add": "Add New",
    "action.edit": "Edit",
    "action.delete": "Delete",
    "action.view": "View",
    "action.save": "Save Changes",
    "action.cancel": "Cancel",
    "action.close": "Close",
    "action.saving": "Saving...",
    "action.reset": "Reset Password",
    "action.status": "Toggle Status",
    "field.id": "ID",
    "field.uuid": "UUID",
    "field.name": "Name",
    "field.reason": "Reason",
    "field.amount": "Amount",
    "field.foodName": "Food Name",
    "field.foodQty": "Food Qty",
    "field.image": "Photo / Image",
    "field.createdDate": "Created Date",
    "field.createdBy": "Created By",
    "field.category": "Category",
    "field.description": "Description",
    "field.date": "Date",
    "field.bill": "Bill Receipt",
    "field.title": "Title",
    "field.location": "Location / Venue",
    "field.status": "Status",
    "field.actions": "Actions",
    "field.username": "Username",
    "field.password": "Password",
    "field.email": "Email",
    "field.mobile": "Mobile Number",
    "field.designation": "Designation",
    "field.photo": "Profile Photo",
    "field.permissions": "Permissions",
    "dashboard.loading": "Loading Shree Bhairavnath Mandir Trust Portal...",
    "dashboard.upcoming": "Upcoming Mahotsav",
    "dashboard.sliderDesc": "Join us with family & devotees at Shree Bhairavnath Mandir to seek divine blessings.",
    "dashboard.announceTitle": "Important Mandir announcement",
    "dashboard.announceDesc": "Daily Maha Abhishek Aarti timings: 5:30 AM (Pratahkaal) & 7:30 PM (Sandhyakaal). Devotees can book Pooja Receipts online or at the Mandir Trust counter.",
    "dashboard.totalReceipts": "Total Receipts",
    "dashboard.securedDonations": "Secured Donations",
    "dashboard.totalExpenses": "Total Expenses",
    "dashboard.maintenance": "Temple Maintenance & Care",
    "dashboard.yearlyEvents": "Yearly Events",
    "dashboard.grandChariot": "Grand Chariot & Festivals",
    "dashboard.monthlyEvents": "Monthly Events",
    "dashboard.devotionalHavan": "Regular Devotional Havan",
    "dashboard.bannerDesc": "Contribute generously to support ancient Vedic traditions and shrine upkeep.",
    "dashboard.noBanners": "No active announcements or scheme banners.",
    "dashboard.activityLog": "Trust Activity Log",
    "dashboard.noActivities": "No recent trust actions recorded.",
    "dashboard.celebration": "Celebration",
    "dashboard.celebrations": "Celebrations",
    "dashboard.pooja": "Pooja Ritual",
    "dashboard.poojas": "Pooja Rituals",
    "dashboard.by": "By",
    "receipt.no": "Receipt No",
    "receipt.donorName": "Donor Name",
    "receipt.foodQty": "Qty (KG)",
    "receipt.image": "Receipt Image",
    "receipt.detailsTitle": "Receipt Details",
    "receipt.donor": "Donor / Devotee",
    "receipt.reason": "Pooja Reason",
    "receipt.dateRegistered": "Date Registered",
    "receipt.authorizedOfficer": "Trust Authorized Officer",
    "receipt.contribution": "Receipt Contribution",
    "receipt.verification": "Verification",
    "receipt.verifiedBadge": "Trusted & Certified",
    "receipt.proofDoc": "Original Receipt Proof / Scan Document",
    "receipt.noReceipts": "No receipts found matching the filters or query.",
    "receipt.grainQty": "Grain quantity contributed",
    "receipt.viewProof": "View Receipt Proof",
    "receipt.viewDetails": "View Details",
    "receipt.edit": "Edit Receipt",
    "receipt.delete": "Delete Receipt",
    "expense.details": "Expense Details",
    "expense.amountPaid": "Amount Paid",
    "expense.voucherBill": "Voucher Bill",
    "expense.noExpenses": "No expense records found.",
    "expense.auditTitle": "Expense Voucher Audit",
    "expense.detailsVendor": "Expense details / Vendor",
    "expense.noDesc": "No descriptions available.",
    "expense.category": "Payment Category",
    "expense.date": "Date of Expense",
    "expense.outflow": "Total Outflow Amount",
    "expense.authorized": "Authorized By",
    "expense.proofTitle": "Original Bill Voucher Preview",
    "expense.closeBtn": "Close Audit Voucher",
    "expense.viewBillTitle": "View Official Bill",
    "expense.edit": "Edit Expense",
    "expense.delete": "Delete Expense",
    "event.photo": "Event Photo",
    "event.title": "Event Title",
    "event.venue": "Location / Venue",
    "event.status": "Status",
    "event.noEvents": "No events registered.",
    "event.upcomingText": "upcoming event",
    "event.completedText": "completed event",
    "event.dateTitle": "Celebration Date",
    "event.venueTitle": "Venue Location",
    "event.closeBtn": "Close View",
    "event.edit": "Edit Event",
    "event.delete": "Delete Event",
    "Food": "Food Donation",
    "Renovation Scheme": "Renovation Fund",
    "Abhishek Pooja": "Abhishek Pooja",
    "General Donation": "General Donation",
    "Rituals & Poojas": "Rituals & Poojas",
    "Temple Maintenance": "Temple Maintenance",
    "Kitchen (Mahaprasad)": "Kitchen (Mahaprasad)",
    "Salaries & Dakshina": "Salaries & Dakshina",
    "Electricity & Utilities": "Electricity & Utilities",
    "Prasad / Flowers": "Prasad / Flowers",
    "Festival Celebrations": "Festival Celebrations",
    "Decoration & Lighting": "Decoration & Lighting",
    "Construction & Repairs": "Construction & Repairs",
    "Administrative Expenses": "Administrative Expenses",
    "Charity & Social Work": "Charity & Social Work",
    "Office & Stationeries": "Office & Stationeries",
    "Shree Bhairavnath Annual Palkhi Sohala": "Shree Bhairavnath Annual Palkhi Sohala",
    "Maha Shivratri Grand Abhishek": "Maha Shivratri Grand Abhishek",
    "Kaalbhairav Ashtami Havan": "Kaalbhairav Ashtami Havan",
    "Monthly Mahaprasad Distribution": "Monthly Mahaprasad Distribution",
    "Mandir Main Precincts to Village Square": "Mandir Main Precincts to Village Square",
    "Garbhgruha (Inner Sanctum)": "Garbhgruha (Inner Sanctum)",
    "Yajna Shala": "Yajna Shala",
    "Annachhatra Hall": "Annachhatra Hall",
    "The grand annual processional chariot ceremony with thousands of devotees matching holy beats of Dhol-Tasha.": "The grand annual processional chariot ceremony with thousands of devotees matching holy beats of Dhol-Tasha.",
    "Rudra-Abhishek of Shree Bhairavnath with continuous chanting of vedic hymns and distributing Mahaprasad.": "Rudra-Abhishek of Shree Bhairavnath with continuous chanting of vedic hymns and distributing Mahaprasad.",
    "Special powerful monthly havan ritual performed during Ashtami Tithi for divine protections.": "Special powerful monthly havan ritual performed during Ashtami Tithi for divine protections.",
    "Free community kitchen serving hot, nutritious meals to over 5,000 pilgrims on Amavasya.": "Free community kitchen serving hot, nutritious meals to over 5,000 pilgrims on Amavasya.",
    "upcoming": "Upcoming",
    "completed": "Completed",
    "cancelled": "Cancelled",
    "active": "Active",
    "inactive": "Inactive",
    "Wheat": "Wheat",
    "Rice": "Rice",
    "Dal": "Dal",
    "Sugar": "Sugar",
    "Other": "Other",
    "trustee.title": "Trustee User Management",
    "trustee.subtitle": "Create logins, view active trustees, allocate role-based module permissions, reset passwords, and manage administrative accounts.",
    "trustee.addAccount": "Add Trustee Account",
    "trustee.searchLabel": "Search Trustee accounts",
    "trustee.searchPlaceholder": "Search by name, username, designation...",
    "trustee.statusFilterLabel": "Status filter",
    "trustee.allStatuses": "All Statuses",
    "trustee.activeOnly": "Active Only",
    "trustee.inactiveOnly": "Inactive Only",
    "trustee.loading": "Loading trustee list...",
    "trustee.noTrustees": "No trustees found matching the query.",
    "trustee.contactDetails": "Contact Details",
    "trustee.noAccess": "No module access",
    "receipt.managementTitle": "Receipt Management",
    "receipt.managementSubtitle": "Browse, search and audit all official Pooja contributions, food grains, and donation receipts.",
    "receipt.add": "Add Receipt",
    "receipt.searchLabel": "Search Donor, No. or Item",
    "receipt.searchPlaceholder": "Search donor name, receipt number, food grains...",
    "receipt.filterReason": "Pooja/Reason Filter",
    "receipt.allTypes": "All Contribution Types",
    "receipt.loading": "Loading contributions...",
    "field.fromDate": "From Date",
    "field.toDate": "To Date",
    "field.address": "Address",
    "field.donationType": "Donation Type",
    "field.amountInWords": "Amount In Words",
    "receipt.signature": "Signature",
    "receipt.stamp": "Trust Stamp",
    "receipt.thankYou": "Thank You For Your Valuable Contribution",
    "Pooja & Vidhi": "Pooja & Vidhi",
    "Rituals & Pooja": "Pooja & Vidhi",
    "Annadan Kharcha": "Annadan Kharcha",
    "Annachhatra Kitchen": "Annadan Kharcha",
    "Cash": "Cash",
    "Check": "Check",
    "UPI": "UPI",
    "Abhishek Pooja Sewa": "Abhishek Pooja Sewa",
    "Temple Renovation Fund": "Temple Renovation Fund"
  },
  mr: {
    "nav.dashboard": "मुख्य डॅशबोर्ड",
    "nav.receipts": "देणगी पावती",
    "nav.expenses": "खर्च वही",
    "nav.yearly": "वार्षिक उत्सव",
    "nav.monthly": "मासिक पूजा",
    "nav.trustees": "विश्वस्त व्यवस्थापन",
    "nav.zone": "विश्वस्त विभाग",
    "nav.login": "विश्वस्त लॉगिन",
    "nav.logout": "बाहेर पडा",
    "brand.title": "श्री भैरवनाथ मंदिर देवस्थान ट्रस्ट",
    "brand.subtitle": "अधिकृत ट्रस्ट व्यवस्थापन आणि खाते लेखापरीक्षण प्रणाली • नोंदणी क्र. E-14023",
    "brand.prassana": "॥ श्री भैरवनाथ प्रसन्न ॥",
    "brand.footer1": "॥ शुभं भवतु • कल्याणमस्तु ॥",
    "brand.footer2": "© २०२६ श्री भैरवनाथ मंदिर देवस्थान ट्रस्ट, पुणे. सर्व हक्क सुरक्षित.",
    "brand.footer3": "केंद्रीय देवस्थान सार्वजनिक ट्रस्ट कायद्यांतर्गत व्यवस्थापित आणि प्रमाणित.",
    "action.add": "नवीन जोडा",
    "action.edit": "सुधारणे",
    "action.delete": "रद्द करा",
    "action.view": "पहा",
    "action.save": "बदल जतन करा",
    "action.cancel": "रद्द करा",
    "action.close": "बंद करा",
    "action.saving": "जतन करत आहे...",
    "action.reset": "पासवर्ड बदला",
    "action.status": "स्थिती बदला",
    "field.id": "आयडी",
    "field.uuid": "युनिक आयडी",
    "field.name": "नाव",
    "field.reason": "कारण",
    "field.amount": "रक्कम",
    "field.foodName": "अन्नाचे नाव",
    "field.foodQty": "अन्न प्रमाण",
    "field.image": "फोटो / प्रतिमा",
    "field.createdDate": "तयार केलेली तारीख",
    "field.createdBy": "द्वारे तयार केलेले",
    "field.category": "वर्ग",
    "field.description": "वर्णन",
    "field.date": "तारीख",
    "field.bill": "बिल पावती",
    "field.title": "शीर्षक",
    "field.location": "स्थान / ठिकाण",
    "field.status": "स्थिती",
    "field.actions": "क्रिया",
    "field.username": "वापरकर्ता नाव",
    "field.password": "पासवर्ड",
    "field.email": "ईमेल",
    "field.mobile": "मोबाईल नंबर",
    "field.designation": "पद",
    "field.photo": "प्रोफाइल फोटो",
    "field.permissions": "परवानग्या",
    "dashboard.loading": "श्री भैरवनाथ मंदिर ट्रस्ट पोर्टल लोड होत आहे...",
    "dashboard.upcoming": "आगामी महोत्सव",
    "dashboard.sliderDesc": "कृपा मिळवण्यासाठी श्री भैरवनाथ मंदिरात सहकुटुंब सहपरिवार उपस्थित राहा.",
    "dashboard.announceTitle": "महत्त्वाची मंदिर घोषणा",
    "dashboard.announceDesc": "दैनिक महा अभिषेक आरती वेळा: पहाटे ५:३० (प्रातःकाळ) आणि संध्याकाळी ७:३० (संध्याकाळ). भक्त देणगी काउंटरवर पूजा पावती बुक करू शकतात.",
    "dashboard.totalReceipts": "एकूण जमा देणगी",
    "dashboard.securedDonations": "सुरक्षित देणगी जमा",
    "dashboard.totalExpenses": "एकूण खर्च",
    "dashboard.maintenance": "मंदिर व्यवस्थापन व निगा",
    "dashboard.yearlyEvents": "वार्षिक उत्सव",
    "dashboard.grandChariot": "भव्य रथोत्सव व सोहळे",
    "dashboard.monthlyEvents": "मासिक पूजा व विधी",
    "dashboard.devotionalHavan": "नियमित धार्मिक हवन",
    "dashboard.bannersTitle": "मंदिर योजना आणि सूचना फलक",
    "dashboard.bannerDesc": "प्राचीन वैदिक परंपरा आणि मंदिराच्या संवर्धनासाठी सढळ हाताने मदत करा.",
    "dashboard.noBanners": "सध्या कोणतीही योजना किंवा सूचना उपलब्ध नाही.",
    "dashboard.activityLog": "विश्वस्त व्यवहार नोंदणी",
    "dashboard.noActivities": "नुकत्याच झालेल्या कोणत्याही नोंदी आढळल्या नाहीत.",
    "dashboard.celebration": "उत्सव",
    "dashboard.celebrations": "उत्सव",
    "dashboard.pooja": "पूजा विधी",
    "dashboard.poojas": "पूजा विधी",
    "dashboard.by": "द्वारे",
    "receipt.no": "पावती क्रमांक",
    "receipt.donorName": "देणगीदाराचे नाव",
    "receipt.foodQty": "प्रमाण (कि.ग्रॅ.)",
    "receipt.image": "पावती फोटो",
    "receipt.detailsTitle": "पावती तपशील",
    "receipt.donor": "देणगीदार / भक्त",
    "receipt.reason": "पूजेचे कारण",
    "receipt.dateRegistered": "नोंदणी तारीख",
    "receipt.authorizedOfficer": "अधिकृत विश्वस्त अधिकारी",
    "receipt.contribution": "देणगी योगदान",
    "receipt.verification": "सत्यापन",
    "receipt.verifiedBadge": "विश्वासार्ह आणि प्रमाणित",
    "receipt.proofDoc": "मूळ पावती पुरावा / स्कॅन दस्तऐवज",
    "receipt.noReceipts": "शोध निकषांशी जुळणारी कोणतीही पावती आढळली नाही.",
    "receipt.grainQty": "धान्य दान प्रमाण",
    "receipt.viewProof": "पावतीचा पुरावा पहा",
    "receipt.viewDetails": "तपशील पहा",
    "receipt.edit": "पावती सुधारा",
    "receipt.delete": "पावती रद्द करा",
    "expense.details": "खर्चाचा तपशील",
    "expense.amountPaid": "दिलेली रक्कम",
    "expense.voucherBill": "खर्च व्हाउचर बिल",
    "expense.noExpenses": "कोणत्याही खर्चाच्या नोंदी आढळल्या नाहीत.",
    "expense.auditTitle": "खर्च व्हाउचर लेखापरीक्षण",
    "expense.detailsVendor": "खर्च तपशील / विक्रेता",
    "expense.noDesc": "कोणतेही वर्णन उपलब्ध नाही.",
    "expense.category": "देयकाचा वर्ग",
    "expense.date": "खर्चाची तारीख",
    "expense.outflow": "एकूण खर्च रक्कम",
    "expense.authorized": "द्वारे अधिकृत",
    "expense.proofTitle": "मूळ बिल व्हाउचर पूर्वावलोकन",
    "expense.closeBtn": " व्हाउचर बंद करा",
    "expense.viewBillTitle": "अधिकृत बिल पहा",
    "expense.edit": "खर्च सुधारा",
    "expense.delete": "खर्च रद्द करा",
    "event.photo": "कार्यक्रम फोटो",
    "event.title": "कार्यक्रमाचे नाव",
    "event.venue": "स्थान / ठिकाण",
    "event.status": "स्थिती",
    "event.noEvents": "कोणतेही कार्यक्रम नोंदवलेले नाहीत.",
    "event.upcomingText": "आगामी कार्यक्रम",
    "event.completedText": "पूर्ण झालेला कार्यक्रम",
    "event.dateTitle": "उत्सव तारीख",
    "event.venueTitle": "कार्यक्रम स्थळ",
    "event.closeBtn": "बंद करा",
    "event.edit": "कार्यक्रम सुधारा",
    "event.delete": "कार्यक्रम रद्द करा",
    "Food": "अन्न दान",
    "Renovation Scheme": "जीर्णोद्धार योजना",
    "Abhishek Pooja": "अभिषेक पूजा",
    "General Donation": "साधारण देणगी",
    "Rituals & Poojas": "धार्मिक विधी आणि पूजा",
    "Temple Maintenance": "मंदिर व्यवस्थापन व निगा",
    "Kitchen (Mahaprasad)": "महाप्रसाद स्वयंपाकघर",
    "Salaries & Dakshina": "वेतन आणि मानधन",
    "Electricity & Utilities": "वीज आणि इतर पाणी देयके",
    "Prasad / Flowers": "प्रasad आणि फुले",
    "Festival Celebrations": "उत्सव सोहळे",
    "Decoration & Lighting": "सजावट आणि रोषणाई",
    "Construction & Repairs": "बांधकाम आणि दुरुस्ती",
    "Administrative Expenses": "प्रशासकीय खर्च",
    "Charity & Social Work": "देणगी आणि समाजकार्य",
    "Office & Stationeries": "कार्यालय आणि स्टेशनरी",
    "Shree Bhairavnath Annual Palkhi Sohala": "श्री भैरवनाथ वार्षिक पालखी सोहळा",
    "Maha Shivratri Grand Abhishek": "महाशिवरात्री भव्य अभिषेक",
    "Kaalbhairav Ashtami Havan": "काळभैरव अष्टमी हवन",
    "Monthly Mahaprasad Distribution": "मासिक महाप्रसाद वाटप",
    "Mandir Main Precincts to Village Square": "मंदिर परिसर ते गावचा चावडी चौक",
    "Garbhgruha (Inner Sanctum)": "गाभारा (गर्भगृह)",
    "Yajna Shala": "यज्ञ शाळा",
    "Annachhatra Hall": "अन्नछत्र हॉल",
    "The grand annual processional chariot ceremony with thousands of devotees matching holy beats of Dhol-Tasha.": "हजारो भाविकांच्या उपस्थितीत आणि ढोल-ताशांच्या गजरात होणारा भव्य वार्षिक पालखी रथोत्सव सोहळा.",
    "Rudra-Abhishek of Shree Bhairavnath with continuous chanting of vedic hymns and distributing Mahaprasad.": "वेदमंत्रांच्या गजरात श्री भैरवनाथांचा रुद्र-अभिषेक आणि महाप्रसाद वाटप.",
    "Special powerful monthly havan ritual performed during Ashtami Tithi for divine protections.": "अष्टमी तिथीनिमित्त सुख, समृद्धी आणि संरक्षणासाठी केला जाणारा विशेष मासिक हवन विधी.",
    "Free community kitchen serving hot, nutritious meals to over 5,000 pilgrims on Amavasya.": "अमावास्येनिमित्त ५००0 हून अधिक भाविकांसाठी मोफत गरम आणि पौष्टिक महाप्रसाद भोजन सेवा.",
    "upcoming": "आगामी",
    "completed": "पूर्ण झाले",
    "cancelled": "रद्द झाले",
    "active": "सक्रिय",
    "inactive": "निष्क्रिय",
    "Wheat": "गहू",
    "Rice": "तांदूळ",
    "Dal": "डाळ",
    "Sugar": "साखर",
    "Other": "इतर",
    "trustee.title": "विश्वस्त वापरकर्ता व्यवस्थापन",
    "trustee.subtitle": "लॉगिन तयार करा, सक्रिय विश्वस्त पहा, भूमिका-आधारित परवानगी द्या, पासवर्ड रीसेट करा आणि प्रशासकीय खाती व्यवस्थापित करा.",
    "trustee.addAccount": "नवीन विश्वस्त खाते जोडा",
    "trustee.searchLabel": "विश्वस्त खाती शोधा",
    "trustee.searchPlaceholder": "नाव, वापरकर्ता नाव, पदावरून शोधा...",
    "trustee.statusFilterLabel": "स्थिती फिल्टर",
    "trustee.allStatuses": "सर्व स्थिती",
    "trustee.activeOnly": "फक्त सक्रिय",
    "trustee.inactiveOnly": "फक्त निष्क्रिय",
    "trustee.loading": "विश्वस्त यादी लोड होत आहे...",
    "trustee.noTrustees": "शोध निकषांशी जुळणारा कोणताही विश्वस्त आढळला नाही.",
    "trustee.contactDetails": "संपर्क तपशील",
    "trustee.noAccess": "कोणतीही परवानगी नाही",
    "receipt.managementTitle": "पावती व्यवस्थापन",
    "receipt.managementSubtitle": "सर्व अधिकृत पूजा योगदान, अन्नधान्य आणि देणगी पावत्या शोधा, पहा आणि लेखापरीक्षण करा.",
    "receipt.add": "नवीन पावती जोडा",
    "receipt.searchLabel": "दाता, पावती क्र. किंवा वस्तू शोधा",
    "receipt.searchPlaceholder": "देणगीदाराचे नाव, पावती क्रमांक, अन्नधान्य शोधा...",
    "receipt.filterReason": "पूजा/कारण फिल्टर",
    "receipt.allTypes": "सर्व योगदानाचे प्रकार",
    "receipt.loading": "पावत्या लोड होत आहेत...",
    "field.fromDate": "या तारखेपासून",
    "field.toDate": "या तारखेपर्यंत",
    "field.address": "पत्ता",
    "field.donationType": "देणगीचा प्रकार",
    "field.amountInWords": "अक्षरी रक्कम",
    "receipt.signature": "स्वाक्षरी",
    "receipt.stamp": "ट्रस्ट शिक्का",
    "receipt.thankYou": "तुमच्या मौल्यवान योगदानाबद्दल धन्यवाद",
    "Pooja & Vidhi": "पूजा आणि विधी",
    "Rituals & Pooja": "पूजा आणि विधी",
    "Annadan Kharcha": "अन्नदान खर्च",
    "Annachhatra Kitchen": "अन्नदान खर्च",
    "Cash": "रोख (Cash)",
    "Check": "चेक (Check)",
    "UPI": "युपीआय (UPI)",
    "Abhishek Pooja Sewa": "अभिषेक पूजा सेवा",
    "Temple Renovation Fund": "मंदिर जीर्णोद्धार निधी"
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

const clearSession = () => {
  localStorage.removeItem("temple_trust_token");
  localStorage.removeItem("temple_trust_user");
  localStorage.removeItem("temple_trust_login_time");
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [language, setLanguageState] = useState<"en" | "mr">(() => {
    return (localStorage.getItem("temple_trust_lang") as "en" | "mr") || "en";
  });

  const [isDarkMode, setIsDarkModeState] = useState<boolean>(() => {
    return localStorage.getItem("temple_trust_dark") === "true";
  });

  // Apply dark class to html on load and changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const setLanguage = (lang: "en" | "mr") => {
    localStorage.setItem("temple_trust_lang", lang);
    setLanguageState(lang);
  };

  const setIsDarkMode = (dark: boolean) => {
    localStorage.setItem("temple_trust_dark", dark ? "true" : "false");
    setIsDarkModeState(dark);
  };

  const t = (key: string): string => {
    const langDict = translations[language];
    return langDict?.[key] || key;
  };

  // Auto-logout handler (defined early so it can be used in useEffect below)
  const performAutoLogout = () => {
    clearSession();
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("temple_trust_token");
    const savedUser = localStorage.getItem("temple_trust_user");
    const loginTime = localStorage.getItem("temple_trust_login_time");

    if (savedToken && savedUser) {
      const elapsed = loginTime ? Date.now() - parseInt(loginTime, 10) : SESSION_DURATION_MS;
      const remaining = SESSION_DURATION_MS - elapsed;

      if (remaining <= 0) {
        // Session already expired — force clear immediately
        clearSession();
      } else {
        // Session still valid — restore and schedule auto-logout
        setToken(savedToken);
        setUser(JSON.parse(savedUser));

        const timer = setTimeout(() => {
          performAutoLogout();
        }, remaining);

        setLoading(false);
        return () => clearTimeout(timer);
      }
    }

    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post("/login", { username, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      const loginTimestamp = Date.now().toString();
      localStorage.setItem("temple_trust_token", receivedToken);
      localStorage.setItem("temple_trust_user", JSON.stringify(receivedUser));
      localStorage.setItem("temple_trust_login_time", loginTimestamp);

      setToken(receivedToken);
      setUser(receivedUser);

      // Schedule auto-logout exactly 12 hours from now
      setTimeout(() => {
        performAutoLogout();
      }, SESSION_DURATION_MS);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid login credentials";
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout").catch(() => {});
    } finally {
      clearSession();
      setToken(null);
      setUser(null);
    }
  };

  const hasPermission = (permission: "read" | "write" | "update" | "delete", moduleName?: string): boolean => {
    if (!user) return false;
    if (user.role === "super_admin") return true;

    if (user.role === "trustee") {
      if (!moduleName) return false;
      const tPerms = user.trusteePermissions || {};
      const mod = moduleName.toLowerCase();
      const modPerm = tPerms[mod];
      if (!modPerm) return false;

      if (permission === "read") return !!modPerm.read;
      if (permission === "write") return !!modPerm.write;
      if (permission === "update") return !!modPerm.update;
      if (permission === "delete") {
        return false;
      }
      return false;
    }

    const permsList = (user.permissions || "").split(",");
    return permsList.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasPermission, language, setLanguage, isDarkMode, setIsDarkMode, t }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
