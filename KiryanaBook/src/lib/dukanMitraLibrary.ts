/**
 * 🏪 Dukaan Mitra — 300 Q&A Library
 * Expert advice and app guidance for Kiryana shop owners.
 */

export interface QnaItem {
  q: string;
  a: string;
  category: string;
}

export const DUKAAN_MITRA_LIBRARY: QnaItem[] = [
  // 💬 AI Chat & Advice
  { q: "Roman Urdu mein baat kaise karta hai agent?", a: "Agent ko Urdu/Roman Urdu mein train kiya jata hai. Jab tu likhta hai \"stock khatam ho raha hai\" toh woh seedha samajh ke jawab deta hai bina English ke.", category: "AI Chat & Advice" },
  { q: "Sales advice kaise milegi?", a: "Agent ko puchho \"aaj kya bechun zyada?\" — woh current stock, season, aur weather dekh ke suggest karta hai jaise \"garmi hai toh Coke aur Sprite push karo.\"", category: "AI Chat & Advice" },
  { q: "Pricing strategy kaise set karein?", a: "Buying price daalo, agent margin calculate karta hai. Suggest karta hai 15–25% margin rakho FMCG pe, 30–40% loose items pe.", category: "AI Chat & Advice" },
  { q: "Offer aur discount plan kaise banayein?", a: "Agent template deta hai — jaise \"Buy 2 Tapal 200g, get Rs 20 off.\" Occasion pe offer suggest karta hai automatically.", category: "AI Chat & Advice" },
  { q: "Seasonal sales tips kya hain?", a: "Ramzan mein — dates, juices, atta zyada rakho. Eid mein — mithai, soft drinks, sheer khurma ingredients. School season mein — chips, biscuits, juice boxes.", category: "AI Chat & Advice" },
  { q: "Slow-moving items ki strategy kya hai?", a: "Near-expiry ya slow items ko counter ke paas rakho, discount lagao, ya bundle karo fast item ke saath. Agent remind karta hai weekly.", category: "AI Chat & Advice" },
  { q: "Naya product launch kaise karein?", a: "Pehle ek dozen mangwao, trial karo. Agent track karta hai — agar 2 hafte mein nahi bika toh alert deta hai.", category: "AI Chat & Advice" },
  { q: "Competitor se comparison kaise karein?", a: "Apne rates daalo, competitor ke rates daalo — agent batata hai kahan tum saste ho, kahan mehnge. Strategy suggest karta hai.", category: "AI Chat & Advice" },
  { q: "Bulk buy kab karna chahiye?", a: "Jab supplier ka scheme ho (buy 10 get 1), ya Ramzan se pehle. Agent alert karta hai \"ye items stock kar lo abhi sasta hai.\"", category: "AI Chat & Advice" },
  { q: "Customer complaint handle kaise karein?", a: "Agent script deta hai — \"Bhai ji maafi chahta hun, ye lijiye replacement ya refund.\" Complain record hoti hai history mein.", category: "AI Chat & Advice" },
  { q: "Staff ko kya bolein — script kya ho?", a: "\"Assalam o Alaikum, kya lenge?\" — greeting. \"Kuch aur chahiye?\" — upsell. Agent specific scripts banata hai har situation ke liye.", category: "AI Chat & Advice" },
  { q: "Daily sales target kaise set karein?", a: "Last month ki average lo, 10% badha do — woh target hai. Agent subah remind karta hai aur sham ko update deta hai.", category: "AI Chat & Advice" },
  { q: "Supplier se negotiation kaise karein?", a: "Agent tips deta hai — \"Cash mein doon toh kya rate milega?\", \"Agar 50 carton lun toh discount?\", \"Last price kya hai final?\"", category: "AI Chat & Advice" },
  { q: "Loss-leader strategy kya hai?", a: "Ek cheez bilkul saste mein becho (jaise anda) taake grahak aaye — baaki cheezein normal rate pe becho. Agent identify karta hai kaun si item use karein.", category: "AI Chat & Advice" },
  { q: "Product bundling kaise karein?", a: "Chai + Cheeni + Doodh = \"Chai Bundle Rs 350\" — agent suggest karta hai profitable combos jo grahak ko value lagein.", category: "AI Chat & Advice" },

  // 📦 Stock & Inventory
  { q: "Current stock kaise dekhein?", a: "Stock section mein jao — har item ki quantity, threshold, aur status (OK/Low/Critical) dikhti hai real time mein.", category: "Stock & Inventory" },
  { q: "Low stock alert kaise kaam karta?", a: "Har item ka minimum level set karo (jaise 15 units). Jab stock us se neeche jaye — yellow alert aata hai.", category: "Stock & Inventory" },
  { q: "Critical stock warning kab aati hai?", a: "Jab stock threshold se aadha bhi reh jaye — red alert. Agent kehta hai \"ABHI order karo.\"", category: "Stock & Inventory" },
  { q: "Order list automatically kaise banti hai?", a: "Agent low aur critical items ek saath le ke supplier-wise order list banata hai — WhatsApp pe bhejna easy ho jata hai.", category: "Stock & Inventory" },
  { q: "Expiry date kaise track karein?", a: "Har item add karte waqt expiry date daalo. 30 din pehle alert, 7 din pehle urgent alert aata hai.", category: "Stock & Inventory" },
  { q: "Dead stock kaise identify karein?", a: "Jo item 30 din se nahi bika — agent flag karta hai \"ye item slow hai, action lo.\"", category: "Stock & Inventory" },
  { q: "Fast-moving items kaise pata chalein?", a: "Sales history se agent top 10 fast movers dikhata hai — inhe hamesha stock mein rakhna chahiye.", category: "Stock & Inventory" },
  { q: "Category-wise stock breakdown kaise dekhein?", a: "Beverages, Dairy, Masalay, Cleaning — har category alag dikhti hai with total value aur item count.", category: "Stock & Inventory" },
  { q: "Brand-wise inventory kaise dekhein?", a: "Nestle ke saare items ek jagah, Tapal ke alag — brand filter lagao aur pura stock dekho.", category: "Stock & Inventory" },
  { q: "Reorder frequency kaise set karein?", a: "Agent history dekh ke suggest karta hai — \"Tapal 200g har 3 din mein khatam hoti hai, har mangal order karo.\"", category: "Stock & Inventory" },
  { q: "Ramzan mein kya stock karein?", a: "Agent list deta hai — Rooh Afza, Dates, Vermicelli, Oil, Atta, Tang, Juices. 2 hafte pehle stock karo.", category: "Stock & Inventory" },
  { q: "Wastage kaise track karein?", a: "Damaged ya expired item remove karte waqt reason daalo — mahine ke end mein wastage report milti hai.", category: "Stock & Inventory" },
  { q: "Stock received vs sold comparison kaise karein?", a: "GRN (maal aaya) aur sales compare karta hai agent — difference dikhat hai (theft ya wastage ka pata chalta hai).", category: "Stock & Inventory" },
  { q: "Supplier-wise stock log kaise dekhein?", a: "Har supplier se kya aaya, kab aaya, kitna aaya — poori history ek jagah.", category: "Stock & Inventory" },
  { q: "Barcode se stock update kaise karein?", a: "Phone camera se scan karo — item automatically identify ho jata hai, quantity update ho jati hai.", category: "Stock & Inventory" },
  { q: "Stock audit kab karein?", a: "Agent remind karta hai — har mahine ki 1 tarikh ko physical count karo aur system se match karo.", category: "Stock & Inventory" },
  { q: "Duplicate products kaise merge karein?", a: "\"Tapal 200g\" aur \"Tapal Danedar 200g\" same hain — agent suggest karta hai merge karo confusion se bachao.", category: "Stock & Inventory" },
  { q: "Weight/unit tracking kaise kaam karta hai?", a: "Kg, litre, pcs, dozen — har item ka unit set karo. Loose daal \"per kg\" mein track hoti hai.", category: "Stock & Inventory" },
  { q: "Storage space kaise manage karein?", a: "Agent suggest karta hai — heavy items neeche, fast-moving items saamne, expiry ke hisaab se arrange karo (FIFO).", category: "Stock & Inventory" },
  { q: "Cold storage items alag kaise track karein?", a: "Fridge section alag hota hai — doodh, makkhan, yogurt, cold drinks sab alag category mein.", category: "Stock & Inventory" },

  // 📋 Udhar Management
  { q: "Customer ka udhar kaise add karein?", a: "Customer ka naam, amount, aur date daalo — record ban jata hai. Agle din se aging shuru.", category: "Udhar Management" },
  { q: "Udhar baaki kaise dekhein?", a: "Udhar section mein jao — har customer ka naam aur total baaki amount clearly dikhta hai.", category: "Udhar Management" },
  { q: "Udhar kitne din se hai kaise pata chale?", a: "Aging report mein — 0-7 din (green), 8-30 din (yellow), 30+ din (red) color coding se pata chalta hai.", category: "Udhar Management" },
  { q: "Overdue udhar ka alert kaise aata hai?", a: "30 din se zyada purana udhar automatically red ho jata hai aur agent daily remind karta hai.", category: "Udhar Management" },
  { q: "WhatsApp reminder kaise bhejein?", a: "Agent ready-made message banata hai — \"Bhai Ahmed, aapka Rs 2,450 ka udhar 12 din se baaki hai, please clear karein.\"", category: "Udhar Management" },
  { q: "Udhar ki limit kaise set karein?", a: "Har customer ke liye maximum udhar set karo (jaise Rs 3,000). Us se zyada agent allow nahi karta.", category: "Udhar Management" },
  { q: "Udhar wapas aane par kaise update karein?", a: "Customer naam dhundho, payment amount daalo — balance update ho jata hai, history mein record rehta hai.", category: "Udhar Management" },
  { q: "Total udhar amount kaise dekhein?", a: "Dashboard pe total outstanding amount dikhta hai — aaj kitna bahar gaya hai pura.", category: "Udhar Management" },
  { q: "Customer ki full udhar history kaise dekhein?", a: "Customer ka naam click karo — kab kab udhar liya, kab kab diya, har transaction detail mein.", category: "Udhar Management" },
  { q: "Partial payment kaise record karein?", a: "Full amount nahi diya — jo diya woh daalo, baki automatically calculate ho jata hai.", category: "Udhar Management" },
  { q: "Sabse zyada udhar wale top 10 kaise dekhein?", a: "Udhar report mein \"Sort by Amount\" karo — sabse zyada baaki wale upar aa jate hain.", category: "Udhar Management" },
  { q: "Udhar chukane ka schedule kaise banayein?", a: "Customer se baat karo — \"Rs 500 har hafte dena\" — yeh schedule agent mein set karo, reminder automatic aata hai.", category: "Udhar Management" },
  { q: "Trust score kya hota hai?", a: "Jo customer waqt pe deta hai — high trust. Jo delay karta hai — low trust. Agent score dikhata hai 1-5 stars mein.", category: "Udhar Management" },
  { q: "Monthly udhar report kya hoti hai?", a: "Is mahine kitna naya udhar diya, kitna wapas aaya, net change kya raha — ek page summary.", category: "Udhar Management" },
  { q: "Udhar vs cash sales ratio kaise dekhein?", a: "70% cash 30% udhar — healthy hai. Agar udhar zyada ho toh agent warn karta hai \"cash flow mein masla ho sakta hai.\"", category: "Udhar Management" },

  // 📊 Sales & Reports
  { q: "Aaj ki total sales kaise dekhein?", a: "Dashboard pe sabse pehle aaj ki sales dikhti hai — real time update hoti rehti hai din mein.", category: "Sales & Reports" },
  { q: "Kal se comparison kaise hota hai?", a: "Agent automatically batata hai — \"Aaj Rs 18,500 — kal se 21% zyada.\" Green arrow up, red arrow down.", category: "Sales & Reports" },
  { q: "Is hafte ki sales kaise dekhein?", a: "Reports section mein \"This Week\" filter lagao — Monday se aaj tak ki daily breakdown milti hai.", category: "Sales & Reports" },
  { q: "Is mahine ki sales report kaise milegi?", a: "Monthly view mein — har din ki sales bar chart mein dikhti hai, total aur average bhi.", category: "Sales & Reports" },
  { q: "Best selling items top 10 kaise dekhein?", a: "\"Top Products\" report mein — quantity sold aur revenue dono ke hisaab se ranking milti hai.", category: "Sales & Reports" },
  { q: "Worst selling items kaise identify karein?", a: "Bottom 10 report — jo items sabse kam bikin un pe action lo (discount, return, ya hatao).", category: "Sales & Reports" },
  { q: "Category-wise sales breakdown kaise dekhein?", a: "Pie chart mein — Beverages 35%, Dairy 20%, Masalay 15% — kahan se zyada aa raha hai pata chalta hai.", category: "Sales & Reports" },
  { q: "Brand-wise sales report kaise milegi?", a: "Nestle ne kitna revenue diya, Unilever ne kitna — brand filter se exact numbers milte hain.", category: "Sales & Reports" },
  { q: "Time-of-day analysis kaise hoti hai?", a: "Subah 8-10 baje zyada bika ya shaam 5-7 baje — agent graph dikhat hai peak aur slow hours ka.", category: "Sales & Reports" },
  { q: "Peak hours kaise identify karein?", a: "Last 30 din ki hourly data dekho — agent batata hai \"aapki peak 6-8 PM hai, staff zyada rakhein tab.\"", category: "Sales & Reports" },
  { q: "Profit margin per item kaise dekhein?", a: "Buying price vs selling price — agent calculate karta hai Rs aur percentage dono mein margin.", category: "Sales & Reports" },
  { q: "Gross profit report kya hoti hai?", a: "Total sales minus total buying cost — yeh gross profit hai. Agent daily, weekly, monthly dikhat hai.", category: "Sales & Reports" },
  { q: "Expenses kaise track karein?", a: "Bijli, kiraya, staff salary, transport — har expense category mein daalo, monthly total milta hai.", category: "Sales & Reports" },
  { q: "Net profit kaise calculate hota hai?", a: "Gross Profit minus Total Expenses = Net Profit. Agent end of month automatically calculate karta hai.", category: "Sales & Reports" },
  { q: "Monthly P&L report kaise milegi?", a: "Ek page mein — Total Sales, Cost of Goods, Gross Profit, Expenses, Net Profit — print bhi kar sakte ho.", category: "Sales & Reports" },

  // 👥 Customer Management
  { q: "Regular customers ki list kaise banayein?", a: "Jo customer mahine mein 8+ baar aaye — agent automatically \"Regular\" tag lagata hai unhe.", category: "Customer Management" },
  { q: "Customer purchase history kaise dekhein?", a: "Customer ka naam search karo — kab aaya, kya kharida, kitna kharch kiya — sab history mein hai.", category: "Customer Management" },
  { q: "VIP customer kaise tag karein?", a: "Monthly Rs 5,000+ kharch karne wale — agent suggest karta hai VIP banao, special treatment do.", category: "Customer Management" },
  { q: "Naya customer kaise record karein?", a: "Naam, number, address — basic info daalo. Pehli purchase se history shuru ho jati hai.", category: "Customer Management" },
  { q: "Birthday ya Eid par offer kaise dein?", a: "Customer ka birthday save karo — agent 3 din pehle remind karta hai \"Ahmed Bhai ka birthday kal hai, WhatsApp karo.\"", category: "Customer Management" },
  { q: "Loyalty points system kaise kaam karta hai?", a: "Har Rs 100 pe 1 point. 100 points = Rs 50 discount. Agent automatically calculate karta hai.", category: "Customer Management" },
  { q: "Customer feedback kaise note karein?", a: "\"Aaj Ahmed Bhai ne kaha Tapal ki quality giri hai\" — note daalo, pattern identify hota hai.", category: "Customer Management" },
  { q: "Credit-worthy customers kaise identify karein?", a: "Jo hamesha waqt pe deta hai, trust score 4-5 star hai — agent green mark karta hai unhe.", category: "Customer Management" },
  { q: "Lost customers kaise pata chalein?", a: "Jo 30 din se nahi aaya — agent alert karta hai \"Fatima Bibi 35 din se nahi aayin, call karein.\"", category: "Customer Management" },
  { q: "Customer ki pasandeeda cheezein kaise yaad rahe?", a: "Purchase history se agent automatically note karta hai — \"Ahmed Bhai hamesha Tapal aur Olpers leta hai.\"", category: "Customer Management" },

  // 🧾 Billing & Payments
  { q: "Bill kaise banayein?", a: "Items scan karo ya daalo — bill automatically calculate hota hai with GST option bhi.", category: "Billing & Payments" },
  { q: "Cash payment kaise record karein?", a: "Amount daalo — system cash drawer update karta hai, sale record hoti hai.", category: "Billing & Payments" },
  { q: "Easypaisa/JazzCash payment kaise track karein?", a: "Digital payment select karo — alag record rehta hai cash se, month end mein compare kar sako.", category: "Billing & Payments" },
  { q: "Daily cash closing kaise karein?", a: "Raat ko \"Close Day\" dabao — system poora din ka summary deta hai, cash expected vs actual.", category: "Billing & Payments" },
  { q: "Petty cash kaise manage karein?", a: "Chhote kharche (chai, rickshaw) — petty cash register mein daalo, monthly total milta hai.", category: "Billing & Payments" },
  { q: "Tax/GST ka hisaab kaise hota hai?", a: "GST-able items mark karo — bill mein automatically calculate ho jata hai, FBR ke liye record ready.", category: "Billing & Payments" },
  { q: "Discount kaise apply karein?", a: "Bill mein percentage ya fixed amount discount daalo — reason bhi note karo (VIP customer, damaged item).", category: "Billing & Payments" },
  { q: "Return/refund kaise record karein?", a: "Item return section mein — customer naam, item, reason daalo. Stock wapas aa jata hai automatically.", category: "Billing & Payments" },

  // 📅 Planning & Reminders
  { q: "Supplier ko order reminder kaise set karein?", a: "\"Har Mangal Tapal ka order dena hai\" — set karo, agent Monday raat ko remind karta hai.", category: "Planning & Reminders" },
  { q: "Kiraya payment reminder kaise lagayein?", a: "Month ki 5 tarikh — kiraya reminder set karo, agent 2 din pehle notify karta hai.", category: "Planning & Reminders" },
  { q: "Staff salary reminder kab aata hai?", a: "Month end 28 tarikh — agent remind karta hai \"Kal salary deni hai, cash ready rakhein.\"", category: "Planning & Reminders" },
  { q: "Expiry check reminder kaise kaam karta hai?", a: "Har Jumma — agent list deta hai jin items ki expiry 30 din mein hai, action lo.", category: "Planning & Reminders" },
  { q: "Stock audit schedule kaise set karein?", a: "Har mahine ki 1 tarikh — \"Aaj physical count karo\" reminder aata hai subah.", category: "Planning & Reminders" },
  { q: "Ramzan stock planning kaise karein?", a: "3 hafte pehle agent checklist deta hai — kya kya order karna hai, kitna rakhna hai.", category: "Planning & Reminders" },
  { q: "Price revision reminder kab aata hai?", a: "Jab supplier ne rate badha diya — agent suggest karta hai \"ye 5 items ki price update karo.\"", category: "Planning & Reminders" },
  { q: "License renewal alert kaise lagayein?", a: "Trade license, FSSAI expiry date daalo — 60 din pehle agent remind karta hai.", category: "Planning & Reminders" },
  { q: "Bank deposit reminder kaise set karein?", a: "\"Har 3 din mein bank deposit karo\" — agent remind karta hai zyada cash dukaan pe na rakho.", category: "Planning & Reminders" },

  // 📱 Smart Suggestions
  { q: "\"Aaj ye offer lagao\" suggestion kaise aati hai?", a: "Agent weather, day of week, aur stock dekh ke suggest karta hai — \"Aaj Sunday hai, family pack offers lagao.\"", category: "Smart Suggestions" },
  { q: "Smart reorder suggestion kaise kaam karta hai?", a: "Agent history dekh ke batata hai \"ye 5 items 2 din mein khatam honge, abhi order karo.\"", category: "Smart Suggestions" },
  { q: "Weather-based tip kya hoti hai?", a: "Garmi mein — \"Cold drinks, ice cream, ORS push karo.\" Sardi mein — \"Kahwa, soup, warm drinks.\"", category: "Smart Suggestions" },
  { q: "Inflation ke waqt kya karein?", a: "Agent suggest karta hai — \"Local brands promote karo, value packs highlight karo, loose items push karo.\"", category: "Smart Suggestions" },
  { q: "Daily 3 profit tips kaise milein?", a: "Har subah agent 3 tips deta hai specific to your dukaan data — actionable aur practical.", category: "Smart Suggestions" },
  { q: "WhatsApp offer message kaise banayein?", a: "Agent ready message banata hai — \"🎉 Aaj ka Offer! Tapal 200g sirf Rs 95 — limited time. Jaldi aayen!\"", category: "Smart Suggestions" },
  { q: "Supplier compare kaise karein?", a: "2 suppliers ke rates daalo — agent table banata hai kahan se sasta, kahan quality better.", category: "Smart Suggestions" },
  { q: "Monthly business health score kya hota hai?", a: "Agent 1-100 score deta hai — sales trend, udhar ratio, stock turnover, profit margin sab milake.", category: "Smart Suggestions" },

  // 🛒 Roz Ka Kaam
  { q: "Dukaan khulne ka time note karne ka kya faida hai?", a: "Pattern pata chalta hai — late khuli toh sales kam hoti hai. Agent suggest karta hai consistent time rakho.", category: "Roz Ka Kaam" },
  { q: "Dukaan band karne ka time track karna kyun zaroori hai?", a: "Overtime ka pata chalta hai, staff cost calculate hoti hai, aur security risk assess hota hai.", category: "Roz Ka Kaam" },
  { q: "Roz subah cash count karna kaise karein?", a: "Drawer mein jo cash hai gino — system mein \"Opening Cash\" daalo. Kal ki closing se match karo.", category: "Roz Ka Kaam" },
  { q: "Opening balance kaise record karein?", a: "Har subah pehla kaam — cash + digital payments ka total daalo. Yeh din ka starting point hai.", category: "Roz Ka Kaam" },
  { q: "Closing balance kaise record karein?", a: "Din end mein — cash count karo, expected se match karo. Difference hua toh investigate karo.", category: "Roz Ka Kaam" },
  { q: "Roz ka target kaise set karein?", a: "Last 7 din ki average nikalo, 10% add karo — yeh realistic daily target hai.", category: "Roz Ka Kaam" },
  { q: "Target achieve hua ya nahi kaise check karein?", a: "Dashboard pe progress bar dikhta hai — subah 0%, din mein badhta hai, sham ko result.", category: "Roz Ka Kaam" },
  { q: "Kal ka plan aaj raat kaise banayein?", a: "Agent 5 min mein plan deta hai — kya stock karna hai, koi special event hai, kya offer lagana hai.", category: "Roz Ka Kaam" },
  { q: "GRN kya hota hai aur kaise banate hain?", a: "Goods Received Note — maal aaya, supplier ka invoice dekh ke quantity verify karo, system mein enter karo.", category: "Roz Ka Kaam" },
  { q: "Delivery driver ka record kyun rakhein?", a: "Koi cheez gum ho ya damage ho — driver ka naam record se accountability aati hai.", category: "Roz Ka Kaam" },
  { q: "Supplier invoice kaise save karein?", a: "Photo khincho — system mein attach karo. Tax ya dispute ke waqt kaam aata hai.", category: "Roz Ka Kaam" },
  { q: "Damage maal kaise check karein?", a: "Delivery ke waqt kholo, check karo — damaged items alag rakho, supplier ko same din inform karo.", category: "Roz Ka Kaam" },
  { q: "Damaged maal wapas karne ka process kya hai?", a: "Damage record karo system mein, supplier ko call karo, return note banao, credit note lo.", category: "Roz Ka Kaam" },
  { q: "Roz ki sale ka summary kaise milti hai?", a: "Din end mein agent ek line deta hai — \"Aaj Rs 18,500 bika, 245 items, top seller Tapal.\"", category: "Roz Ka Kaam" },
  { q: "Cash drawer balance kaise maintain karein?", a: "Hamesha Rs 2,000-3,000 chutta rakho. Agent warn karta hai jab chutta kam ho.", category: "Roz Ka Kaam" },
  { q: "Chutta manage karne ki tip kya hai?", a: "Rs 500, 100, 50, 20, 10 notes alag alag rakhein. Bank se chutta lena schedule mein rakho.", category: "Roz Ka Kaam" },
  { q: "Bijli bill kaise record karein?", a: "Amount aur date daalo expense section mein — monthly average agent track karta hai.", category: "Roz Ka Kaam" },
  { q: "Internet bill track karne ka kya faida?", a: "Monthly fixed cost pata rehta hai — profit calculation accurate hoti hai.", category: "Roz Ka Kaam" },
  { q: "Pani ka bill kaise track karein?", a: "Monthly expense mein daalo — annual total agent calculate karta hai overhead cost ke liye.", category: "Roz Ka Kaam" },
  { q: "Staff attendance kaise track karein?", a: "Har roz present/absent mark karo — month end mein salary calculation mein kaam aata hai.", category: "Roz Ka Kaam" },
  { q: "Late aane wale staff ka kya karein?", a: "Note karo system mein — 3 baar late = warning, agent remind karta hai policy enforce karo.", category: "Roz Ka Kaam" },
  { q: "Overtime record kaise karein?", a: "Normal hours ke baad jo kaam kiya — extra hours note karo, salary mein add karo.", category: "Roz Ka Kaam" },
  { q: "Dukaan saaf karne ka schedule kaise set karein?", a: "Daily sweep, weekly mopping, monthly deep clean — agent schedule deta hai aur remind karta hai.", category: "Roz Ka Kaam" },
  { q: "Fridge temperature kaise monitor karein?", a: "Subah aur sham temperature note karo — 2-4°C honi chahiye. Agent record rakhta hai.", category: "Roz Ka Kaam" },
  { q: "Bijli bachane ki tips kya hain?", a: "Agent suggest karta hai — AC 26°C pe rakho, raat ko extra lights band karo, fridge door kam kholo.", category: "Roz Ka Kaam" },
  { q: "CCTV working hai ya nahi kaise check karein?", a: "Har subah 2 min mein footage dekho — agent weekly reminder deta hai \"CCTV check karo.\"", category: "Roz Ka Kaam" },
  { q: "Raat ko dukaan lock check karna kyun zaroori hai?", a: "Checklist agent deta hai — shutter, back door, safe, CCTV on — sab tick karo band karte waqt.", category: "Roz Ka Kaam" },
  { q: "Emergency contact list mein kya hona chahiye?", a: "Police (15), Fire (16), Ambulance (1122), Supplier numbers, Electrician, Plumber — agent list ready rakhta hai.", category: "Roz Ka Kaam" },
  { q: "Najdiki police station ka number kaise save karein?", a: "Agent location se najdiki station dhundh ke number save karta hai emergency section mein.", category: "Roz Ka Kaam" },
  { q: "Fire extinguisher check kab karein?", a: "Har 3 mahine mein — agent remind karta hai, expiry date bhi track karta hai.", category: "Roz Ka Kaam" },

  // 🧴 Products & Pricing
  { q: "Naya product kaise add karein?", a: "Naam, barcode, category, buying price, selling price daalo — product ready. Photo bhi add kar sakte ho.", category: "Products & Pricing" },
  { q: "Buying price kaise update karein?", a: "Supplier ne rate badha diya — product dhundo, new buying price daalo, margin automatically recalculate.", category: "Products & Pricing" },
  { q: "Selling price update karne ka process kya hai?", a: "Buying price update ke baad agent suggest karta hai new selling price — approve karo, done.", category: "Products & Pricing" },
  { q: "Margin automatically kaise calculate hoti hai?", a: "(Selling Price - Buying Price) / Buying Price × 100 — agent formula apply karta hai, percentage dikhat hai.", category: "Products & Pricing" },
  { q: "Price increase alert kaise kaam karta hai?", a: "Jab buying price 5%+ badhe — agent red alert deta hai \"selling price update karo, loss ho raha hai.\"", category: "Products & Pricing" },
  { q: "Competitor ka price kaise note karein?", a: "Competitor price field mein daalo — agent batata hai tum saste ho ya mehnge, aur kitne.", category: "Products & Pricing" },
  { q: "Same product alag brands compare kaise karein?", a: "\"Compare\" feature mein dono select karo — price, margin, sales speed sab ek table mein.", category: "Products & Pricing" },
  { q: "Loose item ka rate kaise set karein?", a: "Per kg ya per 100g rate daalo — customer ne 250g manga toh agent automatically calculate karta hai.", category: "Products & Pricing" },
  { q: "Packed vs loose same item kaise track karein?", a: "\"Daal Maash Packed 500g\" aur \"Daal Maash Loose per kg\" — alag items, alag tracking.", category: "Products & Pricing" },
  { q: "Import vs local product alag kaise track karein?", a: "Tag lagao \"Imported\" ya \"Local\" — report mein filter kar sako kaun zyada bik raha hai.", category: "Products & Pricing" },
  { q: "Halal certified products kaise mark karein?", a: "Product mein \"Halal Certified\" toggle on karo — filter se customers ko bata sako.", category: "Products & Pricing" },
  { q: "Sugar-free items alag kaise rakhhein?", a: "\"Diet/Sugar-Free\" category banao — diabetic customers ke liye easy dhundna.", category: "Products & Pricing" },
  { q: "Baby products separately kaise track karein?", a: "Separate category — Cerelac, Nido, diapers, wipes — alag stock aur sales report milti hai.", category: "Products & Pricing" },
  { q: "Cleaning products ki alag category kyun?", a: "Food items se alag rakhna zaroori hai — storage mein bhi alag, system mein bhi alag category.", category: "Products & Pricing" },
  { q: "Personal care items kaise categorize karein?", a: "Shampoo, soap, toothpaste — \"Personal Care\" category mein — beauty products alag sub-category.", category: "Products & Pricing" },
  { q: "Frozen items ki list kaise manage karein?", a: "Freezer section alag — chicken, ice cream, frozen paratha — temperature alert bhi set karo.", category: "Products & Pricing" },
  { q: "Fresh items daily kaise update karein?", a: "Roz subah fresh items (bread, eggs, dahi) ki quantity update karo — end of day remaining note karo.", category: "Products & Pricing" },
  { q: "Bakery items ki daily stock kaise rakhein?", a: "Bread, bun, rusk — supplier kitne deta hai, kitne wapas gaye, kitne bika — daily track.", category: "Products & Pricing" },
  { q: "Eggs ka daily count kaise rakhein?", a: "Dozen mein track karo — subah aaya kitna, bika kitna, tota kitna, bacha kitna.", category: "Products & Pricing" },
  { q: "Seasonal items kaise handle karein?", a: "Start date aur end date set karo — agent automatically deactivate karta hai season ke baad.", category: "Products & Pricing" },
  { q: "Discontinued product kaise mark karein?", a: "\"Discontinued\" tag lagao — stock khatam hone ke baad automatically hide ho jata hai.", category: "Products & Pricing" },
  { q: "New arrival products kaise highlight karein?", a: "\"New\" badge lagao product pe — 30 din tak dikhta hai, customers ko attract karta hai.", category: "Products & Pricing" },
  { q: "\"Aaj ka special\" item kaise set karein?", a: "Ek item daily feature karo — agent WhatsApp status ke liye image bhi banata hai.", category: "Products & Pricing" },
  { q: "Bulk pack vs single pack alag rate kaise set karein?", a: "Dono alag products hain — alag buying price, alag margin set karo. Agent link karta hai inhe.", category: "Products & Pricing" },
  { q: "Buy 2 Get 1 offer kaise set karein?", a: "Promotion section mein — item select karo, \"Buy 2 Get 1\" choose karo, dates set karo, done.", category: "Products & Pricing" },
  { q: "Happy hour pricing kaise set karein?", a: "Time-based discount — 6 PM se 8 PM tak 10% off — agent automatically apply aur remove karta hai.", category: "Products & Pricing" },
  { q: "Near-expiry items discount kaise karein?", a: "Expiry 7 din mein — agent suggest karta hai \"30% discount lagao, nuksaan se bachao.\"", category: "Products & Pricing" },
  { q: "Minimum selling price kyun set karein?", a: "Loss mein na biko — buying price se kam sell karne se agent rokta hai, warning deta hai.", category: "Products & Pricing" },
  { q: "Maximum selling price set karna kyun zaroori hai?", a: "Overcharging se bachao — agent warn karta hai agar koi market rate se zyada price daale.", category: "Products & Pricing" },
  { q: "Price tag print kaise karein?", a: "Product select karo, \"Print Tag\" dabao — A4 pe multiple tags print hote hain, size choose karo.", category: "Products & Pricing" },

  // 🚚 Supplier & Purchasing
  { q: "Supplier list kaise banayein?", a: "Naam, company, phone, address, products jo deta hai — ek baar add karo, hamesha available.", category: "Supplier & Purchasing" },
  { q: "Supplier ka phone number save karne ka tareeqa?", a: "Supplier profile mein multiple numbers — mobile, office, WhatsApp — sab alag alag.", category: "Supplier & Purchasing" },
  { q: "Supplier ka WhatsApp se directly order kaise karein?", a: "Agent order list banata hai — \"WhatsApp pe bhejo\" dabao, automatically supplier ko jaata hai.", category: "Supplier & Purchasing" },
  { q: "Supplier visit schedule kaise track karein?", a: "Har supplier aata hai specific din — agent calendar mein mark karta hai, ek din pehle reminder.", category: "Supplier & Purchasing" },
  { q: "Order kab dena hai kaise set karein?", a: "\"Nestle ka order har Mangal\" — set karo. Agent Monday raat remind karta hai list ke saath.", category: "Supplier & Purchasing" },
  { q: "Minimum order quantity kahan note karein?", a: "Supplier profile mein MOQ daalo — agent order banate waqt warn karta hai agar kam ho.", category: "Supplier & Purchasing" },
  { q: "Credit days kya hote hain aur kaise track karein?", a: "Supplier ne 14 din ka credit diya — invoice date se 14 din baad payment due. Agent remind karta hai.", category: "Supplier & Purchasing" },
  { q: "Supplier ko kitna dena hai kaise dekhein?", a: "Payables section mein — har supplier ka outstanding amount, due date ke saath dikhta hai.", category: "Supplier & Purchasing" },
  { q: "Supplier payment history kaise dekhein?", a: "Supplier profile mein — kab kab payment ki, kitni, koi discount mila ya nahi — puri history.", category: "Supplier & Purchasing" },
  { q: "Best supplier per category kaise identify karein?", a: "Rating, price, delivery time, quality — agent score karta hai har supplier ko, best suggest karta hai.", category: "Supplier & Purchasing" },
  { q: "Supplier ki rating kaise karein?", a: "Delivery ke baad 1-5 star do — time pe aaya? Quality theek thi? Agent average track karta hai.", category: "Supplier & Purchasing" },
  { q: "Late delivery note karna kyun zaroori hai?", a: "Pattern dikhta hai — agar supplier baar baar late aaye toh agent suggest karta hai alternative dhundo.", category: "Supplier & Purchasing" },
  { q: "Short delivery kya hoti hai aur kaise record karein?", a: "100 units order kiye, 90 aaye — 10 short delivery. Record karo, supplier se credit note lo.", category: "Supplier & Purchasing" },
  { q: "Free sample kaise track karein?", a: "Supplier ne sample diya — record karo, test karo, feedback note karo, order dene ka decide karo.", category: "Supplier & Purchasing" },
  { q: "Supplier scheme kaise note karein?", a: "\"Buy 10 carton Tapal get 1 free\" — scheme record karo, agent remind karta hai avail karne ko.", category: "Supplier & Purchasing" },
  { q: "Advance payment kaise record karein?", a: "Supplier ko pehle paise diye — advance record karo, jab maal aaye toh adjust ho jata hai.", category: "Supplier & Purchasing" },
  { q: "Supplier return policy kahan note karein?", a: "Supplier profile mein — \"7 din mein return accept karta hai damaged items\" — note save karo.", category: "Supplier & Purchasing" },
  { q: "New supplier evaluate kaise karein?", a: "Agent checklist deta hai — price compare karo, sample mangwao, pehla order chhota do, rate karo.", category: "Supplier & Purchasing" },
  { q: "Local wholesaler vs company direct kaunsa better hai?", a: "Agent comparison karta hai — company direct sasta hai lekin MOQ zyada. Wholesaler flexible hai.", category: "Supplier & Purchasing" },
  { q: "Transport cost kaise track karein?", a: "Delivery charge jo supplier leta hai — per order note karo, item cost mein add karo accurate margin ke liye.", category: "Supplier & Purchasing" },

  // 👨‍👩‍👧 Staff & Personal
  { q: "Staff member kaise add karein?", a: "Naam, CNIC, phone, address, role, salary — basic info daalo, profile ready.", category: "Staff & Personal" },
  { q: "Staff ki salary kaise set karein?", a: "Fixed monthly amount ya daily wage — set karo, agent end of month automatically calculate karta hai.", category: "Staff & Personal" },
  { q: "Advance salary kaise record karein?", a: "Staff ne advance manga — amount aur date daalo, next salary mein automatically deduct ho jata hai.", category: "Staff & Personal" },
  { q: "Duty timing kaise set karein?", a: "Morning shift 8 AM–2 PM, Evening 2 PM–9 PM — set karo, attendance usi ke hisaab se track ho.", category: "Staff & Personal" },
  { q: "Part-time vs full-time staff alag kaise track karein?", a: "Employment type set karo — part-time ke liye hourly rate, full-time ke liye monthly salary.", category: "Staff & Personal" },
  { q: "Sales commission kaise set karein?", a: "\"Jo staff member zyada bechay use 1% commission\" — set karo, agent automatically calculate karta hai.", category: "Staff & Personal" },
  { q: "Staff training record kaise rakhein?", a: "Kya sikhaya, kab sikhaya, kaun ne sikhaya — note karo. New staff ke liye checklist bhi agent banata hai.", category: "Staff & Personal" },
  { q: "Staff complaint kaise note karein?", a: "Incident date, kya hua, kaun involved — record karo. Baar baar repeat ho toh agent flag karta hai.", category: "Staff & Personal" },
  { q: "Leave record kaise rakhein?", a: "Sick leave, casual leave, annual leave — type select karo, date daalo, salary impact automatic.", category: "Staff & Personal" },
  { q: "Eid bonus kaise calculate aur track karein?", a: "1 mahine ki salary ya fixed amount — agent calculate karta hai, payment record karta hai.", category: "Staff & Personal" },
  { q: "Staff ki emergency contact kahan save karein?", a: "Staff profile mein — ghar ka phone, ghar ka address — emergency mein kaam aata hai.", category: "Staff & Personal" },
  { q: "CNIC copy record karne ka process?", a: "Photo khinch ke staff profile mein attach karo — legal requirement aur security ke liye zaroori.", category: "Staff & Personal" },
  { q: "Staff performance kaise measure karein?", a: "Sales amount, attendance, customer complaints — agent monthly score deta hai har staff member ko.", category: "Staff & Personal" },
  { q: "Apna personal drawing kaise track karein?", a: "Dukaan se apne liye jo paise nikale — \"Owner Drawing\" mein record karo, profit calculation mein minus ho.", category: "Staff & Personal" },
  { q: "Family member jo dukaan mein help kare uska record?", a: "Unpaid helper bhi track karo — hours note karo, eid pe bonus decide karne mein kaam aata hai.", category: "Staff & Personal" },

  // 📱 WhatsApp & Communication
  { q: "Grahak ko offer message kaise bhejein?", a: "Agent template banata hai — \"🎉 Aaj ka Special! [Item] sirf [Price] mein. Jaldi aayen dukaan pe!\" — copy karo aur bhejo.", category: "WhatsApp & Communication" },
  { q: "Supplier ko order message kaise bhejein?", a: "Agent professional order message banata hai items, quantities, aur delivery date ke saath — ek click mein WhatsApp pe.", category: "WhatsApp & Communication" },
  { q: "Udhar reminder message kaise bhejein?", a: "Agent polite message banata hai — \"Bhai [Naam], aapka Rs [Amount] ka udhar [X] din se pending hai. Waqt mile toh clear karein. Shukriya.\"", category: "WhatsApp & Communication" },
  { q: "New arrival announcement kaise karein?", a: "Naya product aaya — agent announcement message banata hai with emoji aur price — WhatsApp broadcast ke liye ready.", category: "WhatsApp & Communication" },
  { q: "Monthly sale announcement kaise karein?", a: "Month end sale message — \"Is mahine ki khaas peshkash! [Items list] pe [X]% discount — sirf [Date] tak!\" Agent complete message banata hai.", category: "WhatsApp & Communication" },
];

export function searchDukaanMitra(query: string): QnaItem | null {
  const q = query.toLowerCase();
  
  // Try exact match first (after removing punctuation)
  const cleanQ = q.replace(/[^\w\s]/g, '').trim();
  
  let bestMatch: QnaItem | null = null;
  let highestScore = 0;

  for (const item of DUKAAN_MITRA_LIBRARY) {
    const cleanQuestion = item.q.toLowerCase().replace(/[^\w\s]/g, '').trim();
    
    // Exact match
    if (cleanQuestion === cleanQ) return item;

    // Keyword overlap score
    const qWords = cleanQ.split(' ');
    const itemWords = cleanQuestion.split(' ');
    
    let score = 0;
    qWords.forEach(word => {
      if (word.length > 2 && itemWords.includes(word)) {
        score += 1;
      }
    });

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  // Return best match only if it's significant (at least 2 words or 40% of query)
  if (highestScore >= 2 || (highestScore / cleanQ.split(' ').length) > 0.4) {
    return bestMatch;
  }

  return null;
}
