// 21-Day Heart & Metabolism Reset — tracker logic.
// Everything is saved only in this browser's localStorage. Nothing is sent anywhere.
// Language comes from site.js (html[data-lang]); static page text is bilingual in the HTML,
// and only the strings that change at runtime live in `translations` below.

const STORAGE_KEY = "supplescience-reset-v1";
const TOTAL_DAYS = 21;

const translations = {
  zh: {
    complete: "完成",
    days: "天",
    readyStatus: "準備開始",
    startMessage: "從一次誠實的紀錄開始。",
    startSubmessage: "持續，比完美更重要。",
    progressStatusDone: "持續中",
    progressStatusComplete: "21 天完成",
    progressMessageMid: "你正在建立自己的節奏。",
    progressMessageDone: "你完成了這一輪。",
    progressSubmessageMid: "回頭看看哪些行動最容易持續。",
    progressSubmessageDone: "下一步，是把一個習慣帶進日常。",
    dayLabel: "第 {day} 天",
    dayAria: "第 {day} 天",
    dayCompleted: "已完成",
    dayCurrent: "目前選擇",
    dayUpcoming: "尚未完成",
    completeDay: "完成今天的行動",
    completedDay: "這一天已完成",
    nextDay: "前往第 {day} 天 →",
    checkinSaved: "已儲存在這台裝置的瀏覽器中。",
    bpInvalid: "血壓請用「收縮壓/舒張壓」格式，例如 120/80。",
    resetConfirm: "確定要清除這台裝置上的所有 21 天紀錄嗎？此動作無法復原。",
    resetDone: "本機紀錄已清除。",
    roundLabel: "第 {day} 輪",
    newRound: "開始第 {day} 輪",
    newRoundConfirm: "開始新一輪？這一輪的紀錄會保留在這台裝置上，進度會從第 1 天重新開始。",
    reminderSaved: "已下載。打開檔案即可加入行事曆。",
    reminderMissing: "請先選擇開始日期與時間。",
    reminderTitle: "實證補給：今天的 21 天小行動",
    reminderBody: "打開 21 天計畫，完成今天 2–10 分鐘的小行動：",
  },
  en: {
    complete: "complete",
    days: "days",
    readyStatus: "Ready",
    startMessage: "Start with one honest check-in.",
    startSubmessage: "Consistency matters more than perfection.",
    progressStatusDone: "In rhythm",
    progressStatusComplete: "21 days done",
    progressMessageMid: "You are building your own rhythm.",
    progressMessageDone: "You completed this round.",
    progressSubmessageMid: "Notice which actions feel easiest to repeat.",
    progressSubmessageDone: "Next, carry one habit into daily life.",
    dayLabel: "DAY {day}",
    dayAria: "Day {day}",
    dayCompleted: "completed",
    dayCurrent: "currently selected",
    dayUpcoming: "not completed",
    completeDay: "Mark today complete",
    completedDay: "Day completed",
    nextDay: "Go to day {day} →",
    checkinSaved: "Saved in this browser on this device.",
    bpInvalid: "Enter blood pressure as systolic/diastolic, e.g. 120/80.",
    resetConfirm: "Clear all 21-day records on this device? This cannot be undone.",
    resetDone: "Local records cleared.",
    roundLabel: "Round {day}",
    newRound: "Start round {day}",
    newRoundConfirm: "Start a new round? This round stays saved on this device and progress restarts at day 1.",
    reminderSaved: "Downloaded. Open the file to add it to your calendar.",
    reminderMissing: "Choose a start date and time first.",
    reminderTitle: "SuppleScience: today’s 21-day action",
    reminderBody: "Open the 21-day reset and do today’s 2–10 minute action: ",
  },
};

// Daily content clinically reviewed and approved by the owner (2026-09-27).
const dayContent = [
  {
    tag: { zh: "起點", en: "FOUNDATION" },
    title: { zh: "開始之前，先了解自己的起點", en: "Before changing anything, notice your starting point" },
    lesson: { zh: "今天不需要追求完美。先寫下你想從這 21 天得到什麼，以及目前最想照顧的一件事。", en: "You do not need a perfect start. Write down what you want from these 21 days and the one thing you most want to care for right now." },
    evidence: { zh: "具體、可觀察的目標，比模糊的「我要更健康」更容易轉化成下一步。", en: "A specific, observable intention is easier to turn into a next step than a vague goal like “be healthier.”" },
    action: { zh: "用一句話寫下你的起點；也可以只在心裡想清楚。", en: "Write one sentence about your starting point—or simply name it to yourself." },
    tasks: { zh: ["寫下一個你想照顧的健康面向", "選一個今天可以完成的小行動"], en: ["Name one health area you want to care for", "Choose one small action you can complete today"] },
    reflection: { zh: "今天的我，最需要的是更多資訊，還是更簡單的下一步？", en: "Today, do I need more information—or a simpler next step?" },
  },
  {
    tag: { zh: "活動", en: "MOVEMENT" },
    title: { zh: "讓餐後的身體動一動", en: "Give your body a short post-meal reset" },
    lesson: { zh: "把活動放進既有的生活節點，通常比等待「有空」更容易持續。", en: "Attaching movement to an existing part of your day is often easier to repeat than waiting until you “have time.”" },
    evidence: { zh: "短時間、可重複的活動也能成為日常節奏的一部分；不必把每次活動都變成訓練。", en: "Short, repeatable movement can become part of a daily rhythm; every bout does not need to become a workout." },
    action: { zh: "在一餐之後，依自己的狀況走動或伸展約 10 分鐘。", en: "After one meal, walk or stretch for about 10 minutes if that is safe and comfortable for you." },
    tasks: { zh: ["選一餐後安排一段短暫活動", "注意活動前後的身體感受"], en: ["Choose one meal to anchor a short activity break", "Notice how your body feels before and after"] },
    reflection: { zh: "哪一個生活節點最適合放入短暫活動？", en: "Which part of my day is the easiest place to attach a short movement break?" },
  },
  {
    tag: { zh: "飲食型態", en: "FOOD PATTERN" },
    title: { zh: "先增加一樣，而不是先禁止一樣", en: "Add one supportive food before banning one" },
    lesson: { zh: "今天觀察一餐，想想能不能多放入一份蔬菜、水果、豆類或全穀類食物。", en: "Look at one meal today and consider whether you can add a serving of vegetables, fruit, beans, or whole grains." },
    evidence: { zh: "以增加有益食物取代一開始就列出長長的禁止清單，通常比較容易形成正向選擇。", en: "Starting with supportive additions can make positive choices easier than beginning with a long list of prohibitions." },
    action: { zh: "在一餐中多加一種富含纖維的食物。", en: "Add one fiber-rich food to a meal." },
    tasks: { zh: ["先看今天的一餐可以增加什麼", "吃完後記錄飽足感或滿意度"], en: ["Choose what you can add to one meal today", "Notice fullness or satisfaction after the meal"] },
    reflection: { zh: "哪一種「增加」比「避免」更容易成為我的習慣？", en: "Which addition feels easier to repeat than an avoidance rule?" },
  },
  {
    tag: { zh: "睡眠", en: "SLEEP" },
    title: { zh: "為今晚設定一個睡眠錨點", en: "Give tonight one sleep anchor" },
    lesson: { zh: "睡眠不是意志力考試；穩定的睡前節奏，可以讓身體比較容易辨識休息時間。", en: "Sleep is not a test of willpower. A repeatable wind-down cue can help your body recognize when it is time to rest." },
    evidence: { zh: "睡眠、壓力、食慾與活動彼此影響；先固定一個可行的睡前節點即可。", en: "Sleep, stress, appetite, and movement influence one another. Start with one practical wind-down cue." },
    action: { zh: "在預計睡前 30 分鐘，安排一個低刺激活動。", en: "Thirty minutes before your intended bedtime, choose a low-stimulation activity." },
    tasks: { zh: ["選定一個今晚的睡前錨點", "把手機或工作移離這段時間"], en: ["Choose one wind-down anchor for tonight", "Move your phone or work away from that window"] },
    reflection: { zh: "什麼事情最容易讓我從忙碌切換到休息？", en: "What helps me shift from busy mode into rest?" },
  },
  {
    tag: { zh: "測量", en: "MEASUREMENT" },
    title: { zh: "讓測量變得一致，而不是頻繁", en: "Make measurements consistent, not constant" },
    lesson: { zh: "如果你平常已有血壓計，今天可以檢視自己的測量方式；不用為了這個計畫額外購買設備。台灣的高血壓指引建議居家血壓可參考「722」原則：連續 7 天、早晚各量 1 次、每次量 2 遍。", en: "If you already use a blood-pressure monitor, review how you measure today; you do not need to buy equipment for this program. Taiwan’s hypertension guidance suggests the “722” approach for home readings: 7 days in a row, morning and evening, 2 readings each time." },
    evidence: { zh: "同一項數值在不同時間、姿勢與情境下可能不同；一致的流程有助於看懂自己的紀錄。", en: "The same measure can vary with timing, posture, and context. A consistent routine makes a record easier to understand." },
    action: { zh: "記下你平常測量前會做的準備；不需要追求一個特定數字。", en: "Note your usual preparation before a measurement; do not chase a particular number." },
    tasks: { zh: ["測量前先坐著安靜休息幾分鐘", "把數值和當時情境一起記下"], en: ["Sit and rest quietly for a few minutes before measuring", "Record the context alongside the number"] },
    reflection: { zh: "我記錄數字，是為了觀察趨勢還是增加焦慮？", en: "Am I recording a number to notice a pattern—or to increase worry?" },
  },
  {
    tag: { zh: "食品標示", en: "LABELS" },
    title: { zh: "看懂一個食品標示", en: "Read one food label with fresh eyes" },
    lesson: { zh: "今天挑一個你常買的食品，看看份量、糖、鈉與纖維；只做觀察，不需要立刻換掉。", en: "Choose one food you buy often and look at serving size, sugar, sodium, and fiber. Observe first; you do not need to replace it today." },
    evidence: { zh: "了解份量與營養標示，有助於讓選擇更符合自己的目標，而不是只靠包裝正面的字樣。", en: "Understanding serving size and the nutrition panel can make choices more aligned with your goal than relying on front-of-package claims." },
    action: { zh: "拍下或記住一個標示上的資訊，稍後和下一次購買比較。", en: "Capture one detail from the label and compare it with a future choice." },
    tasks: { zh: ["選一個平常會買的食品", "找出一個你以前較少注意的欄位"], en: ["Choose one food you regularly buy", "Find one label field you usually overlook"] },
    reflection: { zh: "哪一個標示資訊最能幫助我做出實際選擇？", en: "Which label detail would actually help me make a real-world choice?" },
  },
  {
    tag: { zh: "回顧", en: "REFLECT" },
    title: { zh: "回顧第一週，保留有效的部分", en: "Review week one and keep what worked" },
    lesson: { zh: "第一週的目的不是累積分數，而是找出哪一個小行動最適合你的生活。", en: "Week one is not about collecting points; it is about finding the small action that fits your life." },
    evidence: { zh: "能夠被重複的行動，才有機會成為健康行為的一部分。", en: "An action that can be repeated has a better chance of becoming part of a health routine." },
    action: { zh: "從前 6 天選出一個最容易持續的行動，今天只做它。", en: "Choose the easiest action from the first six days and do only that today." },
    tasks: { zh: ["選出一個最容易持續的行動", "寫下阻礙你完成其他行動的原因"], en: ["Choose the action that was easiest to repeat", "Name one barrier that made another action harder"] },
    reflection: { zh: "如果只保留一個行動，我會選哪一個？", en: "If I kept only one action, which one would I choose?" },
  },
  {
    tag: { zh: "鈉", en: "SODIUM" },
    title: { zh: "在加鹽之前，先試一口", en: "Taste first, then decide about salt" },
    lesson: { zh: "今天吃一餐時，先感受原本的味道，再決定是否需要額外調味。", en: "At one meal today, taste the food before deciding whether it needs additional seasoning." },
    evidence: { zh: "降低鈉攝取可以從覺察常見來源開始，而不是把所有食物都變得無味。", en: "Awareness of common sodium sources can be a more practical starting point than making every meal bland." },
    action: { zh: "選一個平常會額外加醬料或調味的情境，先停一下再選擇。", en: "Pause once before adding a sauce or seasoning you usually reach for." },
    tasks: { zh: ["找出今天一個可能的鈉來源", "先試味道，再決定是否加調味"], en: ["Notice one possible sodium source today", "Taste first, then decide about extra seasoning"] },
    reflection: { zh: "哪些味道其實不需要靠額外醬料來完成？", en: "Which flavors do not actually need an extra sauce to feel complete?" },
  },
  {
    tag: { zh: "肌力", en: "STRENGTH" },
    title: { zh: "給肌肉一個溫和的訊號", en: "Give your muscles a gentle signal" },
    lesson: { zh: "肌力活動可以很簡單；今天只觀察自己是否能安全地做幾個日常動作。", en: "Strength work can be simple. Today, notice whether you can safely practice a few everyday movements." },
    evidence: { zh: "肌力與日常活動能力有關；適合自己的低門檻練習，比突然增加強度更容易持續。", en: "Strength relates to everyday function. A low-barrier practice that suits you is easier to repeat than a sudden jump in intensity." },
    action: { zh: "若安全且適合你，做一組簡單的坐站、靠牆推或提踵。", en: "If safe and appropriate for you, try one gentle set of sit-to-stands, wall push-ups, or heel raises." },
    tasks: { zh: ["選一個你熟悉且安全的動作", "活動後記錄舒適度，而不是次數排名"], en: ["Choose a familiar, safe movement", "Record comfort afterward, not a performance score"] },
    reflection: { zh: "哪一個動作能自然放進我的生活，而不是額外的任務？", en: "Which movement could fit naturally into my life instead of becoming another task?" },
  },
  {
    tag: { zh: "壓力", en: "STRESS" },
    title: { zh: "在反應之前，留兩分鐘", en: "Create two minutes before reacting" },
    lesson: { zh: "今天練習把一個忙碌的片刻變慢；不需要把壓力完全消除。", en: "Practice slowing down one busy moment today; you do not need to eliminate stress completely." },
    evidence: { zh: "可辨識自己的狀態，是做出較符合長期目標選擇的前提。", en: "Recognizing your state is a first step toward choices that fit your longer-term goals." },
    action: { zh: "用兩分鐘慢慢呼吸，或離開螢幕短暫走動。", en: "Take two minutes for slow breathing or a short screen-free walk." },
    tasks: { zh: ["找一個今天可以停下來的時間點", "觀察停下來後的下一個選擇"], en: ["Choose one moment to pause today", "Notice the next choice after the pause"] },
    reflection: { zh: "我通常在什麼狀態下最容易放棄原本的計畫？", en: "In what state am I most likely to abandon my original plan?" },
  },
  {
    tag: { zh: "點心", en: "BALANCE" },
    title: { zh: "讓一份點心更有支撐", en: "Give one snack more staying power" },
    lesson: { zh: "今天觀察一份點心是否能同時提供你需要的滿足感與方便性。", en: "Notice whether one snack can provide both the satisfaction and convenience you need." },
    evidence: { zh: "把選擇放回真實情境，比追求一個完美食物清單更有幫助。", en: "Putting choices in a real-life context is more useful than chasing a perfect food list." },
    action: { zh: "在一份點心中搭配一項你喜歡的食物與一項能增加飽足感的食物。", en: "Pair one food you enjoy with one food that helps it feel more satisfying." },
    tasks: { zh: ["辨識一個最常發生的點心情境", "預先想好一個較有支撐的選擇"], en: ["Identify your most common snack situation", "Plan one more satisfying option in advance"] },
    reflection: { zh: "方便、喜歡與滿足感之間，我最在意哪一個？", en: "Which matters most in this moment: convenience, enjoyment, or satisfaction?" },
  },
  {
    tag: { zh: "飲品", en: "DRINKS" },
    title: { zh: "觀察飲品與睡眠的關係", en: "Notice how drinks meet your sleep" },
    lesson: { zh: "今天不需要做出永久決定，只要觀察飲酒或含咖啡因飲品與睡眠之間的關係。", en: "You do not need a permanent decision today. Simply notice how alcohol or caffeinated drinks relate to your sleep." },
    evidence: { zh: "把飲品、時間與隔天感受一起觀察，可能比單獨看某一項更有意義。", en: "Looking at the drink, timing, and next-day experience together can be more informative than looking at one item alone." },
    action: { zh: "若今天有飲品，記下時間與隔天可能想觀察的感受。", en: "If you have a drink today, note the timing and what you may want to observe tomorrow." },
    tasks: { zh: ["記下今天一種飲品與時間", "不以單日感受下結論"], en: ["Note one drink and its timing today", "Avoid drawing a conclusion from one day"] },
    reflection: { zh: "哪些生活因素會讓我誤以為自己只是「睡不好」？", en: "Which daily factors might I mistake for simply “bad sleep”?" },
  },
  {
    tag: { zh: "用藥清單", en: "MEDICATION LIST" },
    title: { zh: "整理一份下次看診可用的清單", en: "Prepare a useful medication list" },
    lesson: { zh: "今天的任務不是調整藥物，而是讓下次和醫療人員討論時，資訊更完整。", en: "Today is not about changing medication. It is about making the next conversation with a clinician more complete." },
    evidence: { zh: "藥名、劑量、服用方式與保健食品一起整理，能幫助醫療人員理解全貌。", en: "A list that includes medicines, doses, how you take them, and supplements can help a clinician see the full picture." },
    action: { zh: "把你目前使用的藥物與保健食品放在同一份清單；不要自行更改。", en: "Place your current medicines and supplements on one list; do not change them yourself." },
    tasks: { zh: ["找出藥袋或目前的用藥清單", "記下想在下次看診詢問的一個問題"], en: ["Find your medication labels or current list", "Write one question for your next clinical visit"] },
    reflection: { zh: "我希望醫療人員更了解我的哪一個生活情境？", en: "Which part of my daily life do I want my clinician to understand better?" },
  },
  {
    tag: { zh: "回顧", en: "REFLECT" },
    title: { zh: "完成一半，不代表要加速", en: "Halfway does not mean you need to accelerate" },
    lesson: { zh: "第 14 天是檢查方向的時間：保留有幫助的，降低讓你負擔過大的要求。", en: "Day 14 is a chance to check direction: keep what helps and reduce what creates too much burden." },
    evidence: { zh: "適度調整計畫，是讓它更符合生活的一部分，而不是失敗。", en: "Adjusting a plan to fit real life is part of the process, not a failure." },
    action: { zh: "從今天開始，把一個過高的要求改成最低可行版本。", en: "From today, turn one overly ambitious requirement into a minimum viable version." },
    tasks: { zh: ["選出一個可以降低門檻的行動", "保留一個你真正想繼續的行動"], en: ["Choose one action whose threshold you can lower", "Keep one action you genuinely want to continue"] },
    reflection: { zh: "什麼樣的版本，才是我忙碌時仍能做到的版本？", en: "What version could I still do on a busy day?" },
  },
  {
    tag: { zh: "久坐", en: "SITTING" },
    title: { zh: "在久坐中放入一個轉場", en: "Add one transition to a long sitting block" },
    lesson: { zh: "不用一次改變整天的坐姿；先找出一段最常久坐的時間，加入一個轉場。", en: "You do not need to change the whole day. Find one long sitting block and add a transition." },
    evidence: { zh: "短暫起身、走動或伸展，可以讓日常活動更有節點。", en: "Brief standing, walking, or stretching breaks can add useful transitions to a sedentary day." },
    action: { zh: "在一段工作或追劇時間中，安排一次起身活動。", en: "During one work or screen block, schedule one brief movement transition." },
    tasks: { zh: ["找出今天最長的一段坐著時間", "在那段時間中預先安排一次起身"], en: ["Identify your longest sitting block today", "Plan one standing or movement break inside it"] },
    reflection: { zh: "什麼提醒方式不會打斷我，卻能幫我記得起身？", en: "What reminder could help me stand without feeling disruptive?" },
  },
  {
    tag: { zh: "環境", en: "ENVIRONMENT" },
    title: { zh: "讓好選擇更容易被看見", en: "Make a supportive choice easier to see" },
    lesson: { zh: "環境會影響選擇的摩擦力；今天只改變一個你常看到的地方。", en: "Your environment changes the friction around a choice. Change one thing you see often today." },
    evidence: { zh: "把希望重複的行動放在更容易看見、拿到或開始的位置，可以減少對意志力的依賴。", en: "Making a desired action easier to see, reach, or start can reduce reliance on willpower." },
    action: { zh: "把一個你希望常做的選擇放到更容易看見的位置。", en: "Put one choice you want to repeat somewhere easier to see." },
    tasks: { zh: ["選一個要調整的環境位置", "讓下一步少一個需要思考的障礙"], en: ["Choose one environment to adjust", "Remove one decision point from the next step"] },
    reflection: { zh: "我希望哪個健康行動變得「順手」？", en: "Which health action do I want to feel more automatic?" },
  },
  {
    tag: { zh: "恢復", en: "RECOVERY" },
    title: { zh: "把恢復也算進計畫", en: "Count recovery as part of the plan" },
    lesson: { zh: "健康節奏不是每天都加碼；恢復與休息也是維持長期行動的一部分。", en: "A healthy rhythm is not about adding more every day. Recovery supports long-term action too." },
    evidence: { zh: "注意疲勞、疼痛與睡眠等訊號，有助於避免把短期衝刺誤當成長期策略。", en: "Noticing fatigue, pain, and sleep can help distinguish a short sprint from a sustainable strategy." },
    action: { zh: "今天留意一個需要恢復的訊號，並安排一段真正的休息。", en: "Notice one sign that you need recovery and make space for genuine rest." },
    tasks: { zh: ["辨識一個身體或心理的疲勞訊號", "安排一段不以效率為目標的休息"], en: ["Name one physical or mental fatigue signal", "Schedule rest that is not measured by productivity"] },
    reflection: { zh: "我把什麼誤認為偷懶，其實可能是恢復？", en: "What do I call laziness that may actually be recovery?" },
  },
  {
    tag: { zh: "提問", en: "QUESTIONS" },
    title: { zh: "準備一個更好的健康問題", en: "Prepare one better health question" },
    lesson: { zh: "好的問題不一定有標準答案，但能讓你和醫療人員更快聚焦在真正重要的事情。", en: "A good question does not need a standard answer; it can help you and your clinician focus on what matters." },
    evidence: { zh: "把症狀、時間、情境與自己的疑問整理起來，可以提升溝通的清楚度。", en: "Organizing symptoms, timing, context, and your question can make communication clearer." },
    action: { zh: "用「我注意到……我想知道……」寫下一個問題。", en: "Write one question using: “I noticed… and I want to understand…”" },
    tasks: { zh: ["寫下一個真實的健康疑問", "補上它發生的時間或情境"], en: ["Write one genuine health question", "Add when or in what context it happens"] },
    reflection: { zh: "什麼資訊能讓我下一次更有把握地討論？", en: "What information would help me have a more confident next conversation?" },
  },
  {
    tag: { zh: "規律", en: "ROUTINE" },
    title: { zh: "為明天預留一個小空間", en: "Leave one small space for tomorrow" },
    lesson: { zh: "比起每天重新決定，提前安排一個小空間，通常更容易讓行動發生。", en: "Leaving a small planned space is often easier than deciding from scratch every day." },
    evidence: { zh: "事前規劃能降低開始行動時的摩擦，但規劃仍應保留彈性。", en: "Planning ahead can reduce friction at the moment of action while still leaving room for flexibility." },
    action: { zh: "在明天的行程中放入一個 5–10 分鐘的健康空間。", en: "Put one 5–10 minute health space into tomorrow’s schedule." },
    tasks: { zh: ["選一個明天可行的時間點", "準備好開始所需的最少物品"], en: ["Choose a realistic time tomorrow", "Prepare the minimum you need to begin"] },
    reflection: { zh: "明天的我，最可能在哪個時間點有餘裕？", en: "At what point tomorrow am I most likely to have a little room?" },
  },
  {
    tag: { zh: "模式", en: "PATTERN" },
    title: { zh: "找出一個重複出現的模式", en: "Notice one pattern that keeps returning" },
    lesson: { zh: "今天回看你的紀錄，不需要解釋每一個數字，只找一個可能重複的時間、情境或感受。", en: "Review your records without explaining every number. Look for one repeated time, context, or feeling." },
    evidence: { zh: "模式可以成為提問的起點，但單一紀錄不能用來自我診斷。", en: "A pattern can start a better question, but one record should not be used for self-diagnosis." },
    action: { zh: "寫下你注意到的一個模式，並標註「需要更多觀察」。", en: "Write one pattern you noticed and label it “needs more observation.”" },
    tasks: { zh: ["回顧一項你已記錄的資料", "找出一個可能的重複情境"], en: ["Review one piece of data you recorded", "Name one context that may be repeating"] },
    reflection: { zh: "我能提出哪一個問題，而不是急著下結論？", en: "What question can I ask instead of rushing to a conclusion?" },
  },
  {
    tag: { zh: "展望", en: "LOOK AHEAD" },
    title: { zh: "設計下一個 21 天，而不是結束它", en: "Design the next 21 days instead of ending here" },
    lesson: { zh: "這個計畫的價值不在於完成一次，而在於你更清楚知道下一步要保留什麼。", en: "The value of this plan is not finishing once; it is knowing more clearly what to keep next." },
    evidence: { zh: "把學到的內容轉成一個小而明確的下一階段，比同時追求很多新目標更可行。", en: "Turning what you learned into one clear next phase is more workable than chasing many new goals at once." },
    action: { zh: "選一個想保留的行動、一個想調整的行動，以及一個想和醫療人員討論的問題。", en: "Choose one action to keep, one to adjust, and one question to discuss with a clinician." },
    tasks: { zh: ["保留一個最有價值的行動", "寫下下一階段的一個健康問題"], en: ["Keep one action with the most value", "Write one health question for the next phase"] },
    reflection: { zh: "如果把這 21 天帶進日常，我最想守住什麼？", en: "If I carry these 21 days into daily life, what do I most want to protect?" },
  },
];

let state = loadState();

function emptyState() {
  return { activeDay: 1, completed: [], tasks: {}, checkins: {}, round: 1, history: [] };
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (parsed && Array.isArray(parsed.completed)) {
      const validDay = (day) => Number.isInteger(day) && day >= 1 && day <= TOTAL_DAYS;
      return {
        activeDay: validDay(parsed.activeDay) ? parsed.activeDay : 1,
        completed: parsed.completed.filter(validDay),
        tasks: parsed.tasks && typeof parsed.tasks === "object" ? parsed.tasks : {},
        checkins: parsed.checkins && typeof parsed.checkins === "object" ? parsed.checkins : {},
        round: Number.isInteger(parsed.round) && parsed.round >= 1 ? parsed.round : 1,
        history: Array.isArray(parsed.history) ? parsed.history : [],
      };
    }
  } catch (error) {
    console.warn("Could not read local reset data", error);
  }
  return emptyState();
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Could not save local reset data", error);
  }
}

function currentLanguage() {
  return document.documentElement.dataset.lang === "en" ? "en" : "zh";
}

function translate(key, day) {
  const text = translations[currentLanguage()][key] || translations.zh[key] || key;
  return day === undefined ? text : text.replace("{day}", day);
}

function contentFor(value) {
  return value[currentLanguage()] || value.zh;
}

const pad = (n) => String(n).padStart(2, "0");
const localDate = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function renderProgress() {
  const completedCount = state.completed.length;
  const percentage = Math.round((completedCount / TOTAL_DAYS) * 100);
  const ring = document.getElementById("progressRing");
  ring.style.setProperty("--progress", `${percentage}%`);
  ring.setAttribute("aria-label", `${percentage}% ${translate("complete")}`);
  document.getElementById("progressPercent").textContent = `${percentage}%`;
  document.getElementById("progressRingLabel").textContent = translate("complete");
  const roundText = state.round > 1 ? `${translate("roundLabel", state.round)} · ` : "";
  document.getElementById("progressCaption").textContent = `${roundText}${completedCount} / ${TOTAL_DAYS} ${translate("days")}`;
  document.getElementById("roundBox").hidden = completedCount < TOTAL_DAYS;
  document.getElementById("newRoundButton").textContent = translate("newRound", state.round + 1);
  document.getElementById("mapCount").textContent = `${completedCount} / ${TOTAL_DAYS}`;

  let stage = "Mid";
  if (completedCount === 0) stage = "Start";
  if (completedCount === TOTAL_DAYS) stage = "Done";
  const copy = {
    Start: ["readyStatus", "startMessage", "startSubmessage"],
    Mid: ["progressStatusDone", "progressMessageMid", "progressSubmessageMid"],
    Done: ["progressStatusComplete", "progressMessageDone", "progressSubmessageDone"],
  }[stage];
  document.getElementById("progressStatus").textContent = translate(copy[0]);
  document.getElementById("progressMessage").textContent = translate(copy[1]);
  document.getElementById("progressSubmessage").textContent = translate(copy[2]);
}

function renderDayMap() {
  const grid = document.getElementById("dayGrid");
  grid.innerHTML = "";
  for (let dayNumber = 1; dayNumber <= TOTAL_DAYS; dayNumber += 1) {
    const done = state.completed.includes(dayNumber);
    const active = state.activeDay === dayNumber;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "day-button";
    button.classList.toggle("done", done);
    button.classList.toggle("active", active);
    button.textContent = pad(dayNumber);
    const statusText = [done ? translate("dayCompleted") : translate("dayUpcoming"), active ? translate("dayCurrent") : ""]
      .filter(Boolean)
      .join(", ");
    button.setAttribute("aria-label", `${translate("dayAria", dayNumber)} — ${statusText}`);
    if (active) button.setAttribute("aria-current", "step");
    button.addEventListener("click", () => goToDay(dayNumber));
    grid.appendChild(button);
  }
}

function goToDay(dayNumber) {
  state.activeDay = dayNumber;
  saveState();
  renderAll();
  document.getElementById("todayCard").scrollIntoView({ behavior: "smooth", block: "start" });
}

function getTaskState(dayNumber) {
  if (!Array.isArray(state.tasks[dayNumber])) state.tasks[dayNumber] = [false, false];
  return state.tasks[dayNumber];
}

function renderDay() {
  const dayNumber = state.activeDay;
  const item = dayContent[dayNumber - 1];
  const isComplete = state.completed.includes(dayNumber);

  document.getElementById("dayNumber").textContent = translate("dayLabel", pad(dayNumber));
  document.getElementById("dayTag").textContent = contentFor(item.tag);
  document.getElementById("dayTitle").textContent = contentFor(item.title);
  document.getElementById("dayLesson").textContent = contentFor(item.lesson);
  document.getElementById("dayEvidence").textContent = contentFor(item.evidence);
  document.getElementById("dayAction").textContent = contentFor(item.action);
  document.getElementById("dayReflection").textContent = contentFor(item.reflection);

  // Each task is a <label> wrapping its checkbox, so the whole row is a touch target.
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";
  const taskState = getTaskState(dayNumber);
  contentFor(item.tasks).forEach((task, index) => {
    const row = document.createElement("label");
    row.className = "task-item";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isComplete || Boolean(taskState[index]);
    checkbox.addEventListener("change", () => {
      taskState[index] = checkbox.checked;
      state.tasks[dayNumber] = taskState;
      saveState();
    });
    const text = document.createElement("span");
    text.textContent = task;
    row.append(checkbox, text);
    taskList.appendChild(row);
  });

  const saved = state.checkins[dayNumber] || {};
  document.getElementById("weightInput").value = saved.weight || "";
  document.getElementById("bpInput").value = saved.bp || "";
  document.getElementById("sleepInput").value = saved.sleep || "";
  document.getElementById("movementInput").value = saved.movement || "";

  const completeButton = document.getElementById("completeButton");
  completeButton.disabled = isComplete;
  document.getElementById("completeButtonText").textContent = translate(isComplete ? "completedDay" : "completeDay");

  const nextButton = document.getElementById("nextDayButton");
  const showNext = isComplete && dayNumber < TOTAL_DAYS;
  nextButton.hidden = !showNext;
  if (showNext) nextButton.textContent = translate("nextDay", dayNumber + 1);
}

function setFormNote(key) {
  document.getElementById("formNote").textContent = key ? translate(key) : "";
}

function renderAll() {
  renderProgress();
  renderDayMap();
  renderDay();
}

function saveCheckin(event) {
  event.preventDefault();
  const bp = document.getElementById("bpInput").value.trim();
  if (bp && !/^\d{2,3}\s*\/\s*\d{2,3}$/.test(bp)) {
    setFormNote("bpInvalid");
    document.getElementById("bpInput").focus();
    return;
  }
  state.checkins[state.activeDay] = {
    weight: document.getElementById("weightInput").value.trim(),
    bp: bp.replace(/\s+/g, ""),
    sleep: document.getElementById("sleepInput").value.trim(),
    movement: document.getElementById("movementInput").value.trim(),
  };
  saveState();
  setFormNote("checkinSaved");
}

function completeDay() {
  if (!state.completed.includes(state.activeDay)) state.completed.push(state.activeDay);
  state.completed.sort((a, b) => a - b);
  state.tasks[state.activeDay] = [true, true];
  saveState();
  renderAll();
  document.getElementById("nextDayButton").hidden || document.getElementById("nextDayButton").focus();
}

function resetAll() {
  if (!window.confirm(translate("resetConfirm"))) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Could not clear local reset data", error);
  }
  state = emptyState();
  renderAll();
  setFormNote("resetDone");
}

function startNewRound() {
  if (!window.confirm(translate("newRoundConfirm"))) return;
  state.history.push({
    round: state.round,
    endedOn: localDate(),
    completed: state.completed,
    tasks: state.tasks,
    checkins: state.checkins,
  });
  state = { ...state, activeDay: 1, completed: [], tasks: {}, checkins: {}, round: state.round + 1 };
  saveState();
  renderAll();
  document.getElementById("todayCard").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---- Calendar reminder (.ics) — generated in the browser, nothing is sent anywhere ----
function icsEscape(text) {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

// RFC 5545 lines must be folded at 75 octets; fold on UTF-8 byte length without splitting characters.
function icsFold(line) {
  const encoder = new TextEncoder();
  const parts = [];
  let current = "";
  let limit = 75;
  for (const char of line) {
    if (encoder.encode(current + char).length > limit) {
      parts.push(current);
      current = char;
      limit = 74;
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts.join("\r\n ");
}

function downloadReminder() {
  const date = document.getElementById("reminderDate").value;
  const time = document.getElementById("reminderTime").value;
  const note = document.getElementById("reminderNote");
  if (!date || !time) {
    note.textContent = translate("reminderMissing");
    return;
  }
  const remaining = Math.max(1, TOTAL_DAYS - state.completed.length);
  const url = new URL("./reset.html", window.location.href).href;
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const start = `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SuppleScience//21-Day Reset//ZH-TW",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:reset-${Date.now()}@supplescience`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    "DURATION:PT10M",
    `RRULE:FREQ=DAILY;COUNT=${remaining}`,
    `SUMMARY:${icsEscape(translate("reminderTitle"))}`,
    `DESCRIPTION:${icsEscape(translate("reminderBody") + url)}`,
    `URL:${url}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "TRIGGER:PT0M",
    `DESCRIPTION:${icsEscape(translate("reminderTitle"))}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const blob = new Blob([lines.map(icsFold).join("\r\n") + "\r\n"], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "supplescience-21-day-reminder.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  note.textContent = translate("reminderSaved");
}

// ---- Printable 21-day summary (rebuilt into #resetPrint right before printing) ----
function buildSummary() {
  const sheet = document.getElementById("resetPrint");
  sheet.innerHTML = "";
  const add = (tag, text, className) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    sheet.appendChild(el);
    return el;
  };
  const head = add("div", undefined, "print-head");
  const h1 = document.createElement("h1");
  h1.textContent = `21 天心臟代謝重整・第 ${state.round} 輪摘要`;
  const meta = document.createElement("p");
  meta.textContent = `列印日期：${localDate()}　完成：${state.completed.length} / ${TOTAL_DAYS} 天`;
  head.append(h1, meta);

  const table = add("table");
  const header = document.createElement("tr");
  ["天", "主題", "完成", "體重 kg", "血壓 mmHg", "睡眠 hr", "活動 min"].forEach((label) => {
    const th = document.createElement("th");
    th.textContent = label;
    header.appendChild(th);
  });
  table.appendChild(header);
  dayContent.forEach((item, index) => {
    const day = index + 1;
    const checkin = state.checkins[day] || {};
    const tasks = state.tasks[day] || [];
    const done = state.completed.includes(day) ? "✓" : tasks.some(Boolean) ? "部分" : "";
    const row = document.createElement("tr");
    [pad(day), item.title.zh, done, checkin.weight || "", checkin.bp || "", checkin.sleep || "", checkin.movement || ""].forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      row.appendChild(td);
    });
    table.appendChild(row);
  });

  add("h2", "我想保留的行動");
  const lines1 = add("div", undefined, "print-lines");
  for (let i = 0; i < 2; i += 1) lines1.appendChild(document.createElement("span"));
  add("h2", "想和醫師討論的問題");
  const lines2 = add("div", undefined, "print-lines");
  for (let i = 0; i < 3; i += 1) lines2.appendChild(document.createElement("span"));
  add("p", "紀錄的數字只供自己觀察與和醫療人員討論，本表不做任何解讀，也不能用來自我診斷。實證補給 SuppleScience", "print-foot");
}

document.addEventListener("DOMContentLoaded", () => {
  const tomorrow = new Date(Date.now() + 86400000);
  document.getElementById("reminderDate").value = localDate(tomorrow);
  document.getElementById("reminderButton").addEventListener("click", downloadReminder);
  document.getElementById("printSummaryButton").addEventListener("click", () => {
    buildSummary();
    window.print();
  });
  window.addEventListener("beforeprint", buildSummary);
  document.getElementById("newRoundButton").addEventListener("click", startNewRound);
  document.getElementById("checkinForm").addEventListener("submit", saveCheckin);
  document.getElementById("checkinForm").addEventListener("input", () => setFormNote(""));
  document.getElementById("completeButton").addEventListener("click", completeDay);
  document.getElementById("nextDayButton").addEventListener("click", () => goToDay(state.activeDay + 1));
  document.getElementById("resetButton").addEventListener("click", resetAll);
  document.addEventListener("langchange", () => {
    renderAll();
    setFormNote("");
  });
  renderAll();
});
