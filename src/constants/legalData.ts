export const COURT_FEES_DATA = {
  states: [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
  ],
  caseTypes: [
    {
      id: "property",
      name: "Property Dispute",
      baseFee: 500,
      percentage: 0.01,
      stampDuty: 0.05,
      penaltyRange: "₹5,000 - ₹50,000"
    },
    {
      id: "criminal",
      name: "Criminal Case",
      baseFee: 200,
      percentage: 0,
      stampDuty: 0,
      penaltyRange: "₹1,000 - ₹1,00,000 (or imprisonment)"
    },
    {
      id: "civil",
      name: "Civil Suit",
      baseFee: 300,
      percentage: 0.005,
      stampDuty: 0.02,
      penaltyRange: "₹2,000 - ₹20,000"
    },
    {
      id: "consumer",
      name: "Consumer Complaint",
      baseFee: 100,
      percentage: 0.001,
      stampDuty: 0,
      penaltyRange: "₹500 - ₹10,000"
    },
    {
      id: "family",
      name: "Family/Matrimonial",
      baseFee: 250,
      percentage: 0,
      stampDuty: 0.01,
      penaltyRange: "₹1,000 - ₹15,000"
    }
  ]
};

export const EMERGENCY_CARDS_DATA = [
  {
    id: "police-stop",
    title: "Police stopped my car",
    icon: "ShieldAlert",
    whatToSay: [
      "Ask politely: 'Officer, may I know the reason for stopping me?'",
      "If asked for documents, say: 'Here are my license, registration, and insurance.'",
      "If they ask to search without a warrant: 'I do not consent to a search without a legal warrant.'"
    ],
    whatToDo: [
      "Stay calm and keep your hands visible on the steering wheel.",
      "Do not argue or get aggressive.",
      "Record the officer's name and badge number if possible.",
      "If issued a challan, you can pay it online or in court later."
    ]
  },
  {
    id: "workplace-harassment",
    title: "Workplace Harassment",
    icon: "Briefcase",
    whatToSay: [
      "Tell the harasser clearly: 'Your behavior is unprofessional and makes me uncomfortable. Please stop.'",
      "Inform HR: 'I want to formally report an incident of harassment under the POSH Act/Company Policy.'"
    ],
    whatToDo: [
      "Document every incident with date, time, location, and witnesses.",
      "Save all emails, messages, or physical evidence.",
      "Check your company's Internal Complaints Committee (ICC) procedure.",
      "Consult a lawyer if the company fails to take action."
    ]
  },
  {
    id: "illegal-eviction",
    title: "Illegal Eviction",
    icon: "Home",
    whatToSay: [
      "To the landlord: 'Under the Rent Control Act, you cannot evict me without a court order and proper notice.'",
      "To the police (if forced): 'This is a civil matter, and I have a valid tenancy. I am being illegally dispossessed.'"
    ],
    whatToDo: [
      "Keep a copy of your rent agreement and latest rent receipts safe.",
      "File a police complaint for criminal trespass if they try to enter forcibly.",
      "Approach the Rent Controller or Civil Court for an injunction (stay order).",
      "Do not leave the premises voluntarily if you want to contest the eviction."
    ]
  },
  {
    id: "cyber-fraud",
    title: "Cyber Fraud/Scam",
    icon: "Globe",
    whatToSay: [
      "To the bank: 'I suspect a fraudulent transaction on my account. Please freeze it immediately.'",
      "To the fraudster: Do not engage. Hang up or block immediately."
    ],
    whatToDo: [
      "Report immediately on the National Cyber Crime Reporting Portal (1930).",
      "Notify your bank within 72 hours to limit your liability.",
      "Save screenshots of the transaction, messages, and the fraudster's details.",
      "Change all your passwords and enable Two-Factor Authentication (2FA)."
    ]
  }
];
