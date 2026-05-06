export type ShortSeed = {
  url: string;
  title: string;
  channel: string;
  likes: number;
  hashtags: string[];
  personas: string[];
};

const SEED_SHORTS: ShortSeed[] = [
  { url: "https://www.youtube.com/shorts/fO0AwNEnN3I", title: "She Refused to Leave Them Behind—So She Went Back Even for Those Not Her Own", channel: "@naturaloop", likes: 341000, hashtags: [], personas: ["film-snob", "overthinker"] },
  { url: "https://www.youtube.com/shorts/mCRGP2D6x-s", title: "How to Survive in a monkey forest 😳😳", channel: "@Mystery00001", likes: 15000, hashtags: ["#viralshorts"], personas: ["chaos-gremlin", "vintage-hipster", "conspiracy-theorist"] },
  { url: "https://www.youtube.com/shorts/UhpfNjijCds", title: "Phillies land All-Star closer Jhoan Duran ahead of MLB trade deadline 👀🔥", channel: "@WhetsAloys", likes: 1500000, hashtags: ["#JhoanDuran"], personas: ["hype-beast", "overthinker"] },
  { url: "https://www.youtube.com/shorts/wBVfUF3mhIM", title: "Gentle parenting doesn’t always work", channel: "@ViralDailyLifes", likes: 264000, hashtags: ["#gentleparenting", "#parentingfails", "#funny", "#kids", "#fyp"], personas: ["corporate-girlie"] },
  { url: "https://www.youtube.com/shorts/F0wK4izLJ3M", title: "Gnochis 🍝 🇮🇹", channel: "@surthycooks", likes: 1600000, hashtags: [], personas: ["hype-beast"] },
  { url: "https://www.youtube.com/shorts/ik5PYr1MjBY", title: "Daddy is mommy's hero", channel: "@HenryGray-s1y", likes: 23000, hashtags: ["#foryou", "#funny", "#baby", "#fyp", "#dad"], personas: ["vintage-hipster", "corporate-girlie", "theater-kid", "boomer-dad"] },
  { url: "https://www.youtube.com/shorts/iTaqRNOxZEU", title: "Why Small Creators Are Not Getting Support 🥹 | Reality of you tube 📈", channel: "@STFSTORY", likes: 0, hashtags: ["#shorts"], personas: ["vintage-hipster", "conspiracy-theorist", "overthinker"] },
  { url: "https://www.youtube.com/shorts/LgkHkyY-bco", title: "Dream is HUNTING You! 💀", channel: "@MysticueMC", likes: 124000, hashtags: ["#minecraft"], personas: ["hype-beast", "chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/PadaSdeXC-w", title: "The last one😂😂", channel: "@Iamtituscody", likes: 853, hashtags: ["#viral", "#shorts", "#funny"], personas: ["vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/VdlTIzexAQA", title: "Phillies land All-Star closer Jhoan Duran ahead of MLB trade deadline 👀🔥", channel: "@fhibh-s2t", likes: 96, hashtags: ["#JhoanDuran"], personas: ["hype-beast", "vintage-hipster", "overthinker"] },
  { url: "https://www.youtube.com/shorts/Mc2lru72NYk", title: "Ranking funniest Cold weather moments.", channel: "@MojoRankings", likes: 17000, hashtags: [], personas: ["vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/cuU2iUIllcY", title: "Interesting monkey core.", channel: "@hendog249", likes: 20000, hashtags: ["#funny", "#funnyvideos", "#animals", "#monkey", "#fypage", "#funnyshorts"], personas: ["chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/Olh_dshUxhM", title: "Man Saves Cute Puppy!", channel: "@RealHistoryFactsss", likes: 4000, hashtags: ["#shorts", "#puppy", "#cute"], personas: ["vintage-hipster", "boomer-dad"] },
  { url: "https://www.youtube.com/shorts/PAA4PvUCpHw", title: "do you guys like my tower of blocks? ￼", channel: "@UncleDijonSurvives", likes: 369000, hashtags: [], personas: ["hype-beast", "chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/cb4SEAV0JPY", title: "Ranking Funniest Chicken Screaming😭😭", channel: "@ChhumShaper", likes: 18000, hashtags: [], personas: ["vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/rJ7yvEFJQ00", title: "3 Animal Behaviors Scientists Still Can’t Explain", channel: "@WildBlip", likes: 433, hashtags: [], personas: ["vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/KJPSu1VC9AI", title: "Ranking funny baby moments", channel: "@amusedbyzainnu", likes: 623, hashtags: [], personas: ["vintage-hipster", "corporate-girlie"] },
  { url: "https://www.youtube.com/shorts/kgAfcueURA8", title: "Punch update: Punch started waving to visitors  🐒", channel: "@shockingzones", likes: 64000, hashtags: ["#shocking", "#viralvideo", "#animals", "#monkey"], personas: ["film-snob"] },
  { url: "https://www.youtube.com/shorts/hprQ1h5c5go", title: "Ranking Best Military Moments", channel: "@Rofl_ON", likes: 2200000, hashtags: [], personas: ["hype-beast"] },
  { url: "https://www.youtube.com/shorts/jqZCelhSg9Y", title: "Why did LEGO stop putting real rubber tires on car sets?", channel: "@Bricksterlego", likes: 68000, hashtags: ["#shorts"], personas: ["gym-rat", "overthinker"] },
  { url: "https://www.youtube.com/shorts/AjsDkrdHg_c", title: "Ranking The Best Perfectly Fit Videos", channel: "@MrPurifiedWater", likes: 275000, hashtags: [], personas: ["hype-beast", "chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/8Jlmr6TUgs4", title: "find animals that eat jackfruit", channel: "@SadikTV-j7b", likes: 3700, hashtags: ["#explore", "#nature", "#birds"], personas: ["vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/I-VPo0ZUolc", title: "#typography", channel: "@AlphaGyan_Official", likes: 0, hashtags: ["#typography"], personas: ["vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/y6-OeJoClxM", title: "The monkey is afraid to take the banana when he sees the toy.", channel: "@TheBossWildlife", likes: 868, hashtags: ["#thebosswildlife", "#monkey", "#animals"], personas: ["chaos-gremlin", "vintage-hipster", "overthinker"] },
  { url: "https://www.youtube.com/shorts/7DVvzSNgWRM", title: "The most beautiful last trip", channel: "@DOUshi-n9p", likes: 16000, hashtags: [], personas: ["film-snob", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/Qi5gBBtt__c", title: "This Little Monkey Became a Hero of the Day🐒❤️‍🩹", channel: "@Baisyshort", likes: 0, hashtags: ["#shorts"], personas: ["chaos-gremlin", "vintage-hipster", "theater-kid"] },
  { url: "https://www.youtube.com/shorts/dn30PLjSndM", title: "DC-10 landing on highway...😯✈️|", channel: "@TurtleAirlines", likes: 30000, hashtags: ["#aviation", "#edit"], personas: ["vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/bcKWXDc1XPU", title: "Phillies land All-Star closer Jhoan Duran ahead of MLB trade deadline 👀🔥", channel: "@huhz67", likes: 67, hashtags: [], personas: ["hype-beast", "vintage-hipster", "overthinker"] },
  { url: "https://www.youtube.com/shorts/1Z6kNR_XFHU", title: "#typography", channel: "@Factopilaone", likes: 0, hashtags: ["#typography"], personas: ["vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/gs6xt7S8Puw", title: "Phillies land All-Star closer Jhoan Duran ahead of MLB trade deadline 👀🔥", channel: "@ghxskdldo", likes: 1800, hashtags: ["#JhoanDuran"], personas: ["hype-beast", "vintage-hipster", "overthinker"] },
  { url: "https://www.youtube.com/shorts/F9l0DypYVTc", title: "RANKING MARIO KART IRL", channel: "@Rofl_ON", likes: 459, hashtags: [], personas: ["film-snob", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/7ZCRBMlX9OY", title: "some skills are better than technology 😌❤", channel: "@LetsRomantic", likes: 3700000, hashtags: ["#funny", "#funnymusic", "#explore", "#amazingmemes"], personas: ["hype-beast", "theater-kid"] },
  { url: "https://www.youtube.com/shorts/te1a2-zzI0o", title: "He Saved a Grieving Baby Monkey—She Now Sees Him as Her Mom!", channel: "@ATTshorts-n", likes: 868, hashtags: [], personas: ["chaos-gremlin", "vintage-hipster", "corporate-girlie"] },
  { url: "https://www.youtube.com/shorts/kHmzRnd23Ns", title: "This Grandpa Completed A Huge Milestone...🎉✨", channel: "@ComfortCircleTV", likes: 3500, hashtags: [], personas: ["vintage-hipster", "corporate-girlie", "boomer-dad"] },
  { url: "https://www.youtube.com/shorts/NNJ_pitjVo0", title: "When the monkey has a lot of fun.", channel: "@TheBossWildlife", likes: 211, hashtags: ["#thebosswildlife", "#monkey", "#animals"], personas: ["chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/P1lUFop_zwo", title: "His reaction time 😳", channel: "@DriveWithPassion", likes: 95000, hashtags: [], personas: ["gym-rat"] },
  { url: "https://www.youtube.com/shorts/4DTsXIJOBZc", title: "The monkey is afraid to take the banana when he sees the game.", channel: "@TheBossWildlife", likes: 3200, hashtags: ["#thebosswildlife"], personas: ["chaos-gremlin", "vintage-hipster", "overthinker"] },
  { url: "https://www.youtube.com/shorts/90T2FyjZXRs", title: "#typography 😵‍💫", channel: "@ZapXmemes", likes: 0, hashtags: ["#typography"], personas: ["vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/H6fy_JtNcdQ", title: "Not all dogs are friendly.. and some are trained to bite.", channel: "@It_Stormed", likes: 2200, hashtags: [], personas: ["chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/SrPl6ZblpKg", title: "Ranking Best Disneyland Moments", channel: "@rankwarrioryt", likes: 247000, hashtags: [], personas: ["hype-beast", "chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/uj--1dz7-a8", title: "Cat Gets Revenge After Bike Hits Him 😾💥🚲", channel: "@ValuetainmentComedy", likes: 1400, hashtags: [], personas: ["chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/qTc_2ZJtkeY", title: "\"Why Don’t Gorillas Attack Tourists?\"", channel: "@Faurix09", likes: 43000, hashtags: [], personas: ["vintage-hipster", "overthinker"] },
  { url: "https://www.youtube.com/shorts/hnrhyWseNeg", title: "Happy Corgi Walking Along Water Ditch", channel: "@tigertheapex", likes: 612, hashtags: ["#corgi", "#cute"], personas: ["vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/t552_vBpdbM", title: "How a clever monkey earned a sweet surprise ❤️", channel: "@Funny.AniClub", likes: 122000, hashtags: ["#monkey"], personas: ["chaos-gremlin"] },
  { url: "https://www.youtube.com/shorts/nH3gcElqMis", title: "Chinese Soldier Sleep Test 🪖", channel: "@StoryInner", likes: 4000, hashtags: [], personas: ["vintage-hipster", "gym-rat"] },
  { url: "https://www.youtube.com/shorts/mFL1WWlNuqw", title: "Look at this monkeys funny moment🤣😂", channel: "@MonkeyNature2025", likes: 76, hashtags: [], personas: ["chaos-gremlin", "film-snob", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/Y8YtUAfWtRo", title: "He set him up 🤣", channel: "@DriveWithPassion", likes: 102000, hashtags: [], personas: ["gym-rat"] },
  { url: "https://www.youtube.com/shorts/6JxlNr3XTAo", title: "Claim your gift card from byo 🌟", channel: "@LilWildThings", likes: 47000, hashtags: ["#animallife", "#animals", "#wildlife", "#nature", "#birds", "#birdtrend"], personas: ["vintage-hipster", "gym-rat"] },
  { url: "https://www.youtube.com/shorts/48_FAQfWgXE", title: "10 years experience at 16 🤣", channel: "@longfamilyfarms", likes: 17000, hashtags: [], personas: ["vintage-hipster", "gym-rat"] },
  { url: "https://www.youtube.com/shorts/kZYDJULq8Xo", title: "Big Monkey’s Funny Reaction to the Pipe.", channel: "@thebosswildlife77", likes: 91, hashtags: ["#theboss", "#funnyanimal", "#funnymonkey"], personas: ["chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/qDl7YXrL-ao", title: "How do Astronauts shower in Space? 🚿🛰️", channel: "@cosmobytesx", likes: 128000, hashtags: ["#space", "#science", "#universe", "#facts", "#moon", "#iss", "#artemis", "#fyp"], personas: ["film-snob"] },
  { url: "https://www.youtube.com/shorts/RPhtlRqbMW8", title: "Finding Skulls Was Top Tier Fun", channel: "@TheA174Marine", likes: 4000, hashtags: ["#halo", "#haloclips", "#nostalgia"], personas: ["vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/8EzBVOyj72Y", title: "Ranking The BEST Monkey Moments 🙉", channel: "@Wtfsbenji", likes: 4400, hashtags: [], personas: ["chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/2FyJ2SvZtK0", title: "She didn't hesitate 😭", channel: "@DriveWithPassion", likes: 711000, hashtags: [], personas: ["hype-beast", "gym-rat"] },
  { url: "https://www.youtube.com/shorts/i8HYSUDDubU", title: "When the monkeys get scared.", channel: "@TheBossWildlife", likes: 925, hashtags: ["#thebosswildlife", "#monkey", "#funny"], personas: ["chaos-gremlin", "vintage-hipster", "gym-rat"] },
  { url: "https://www.youtube.com/shorts/1CyRjtvJ-rI", title: "Driver fled on foot, leaving car and brother behind", channel: "@PowerUp-e8h", likes: 97000, hashtags: ["#funny", "#humor", "#shorts"], personas: ["gym-rat", "overthinker"] },
  { url: "https://www.youtube.com/shorts/G97UZQ9KoUI", title: "🐵😂 Ranking the Funniest Monkey Moments Ever!", channel: "@PAWLARIOUS-67", likes: 309, hashtags: ["#funny", "#monkey", "#animals"], personas: ["chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/xnIF76CO7Ps", title: "THAT makes sense…", channel: "@HerrTriplets", likes: 6500, hashtags: ["#babyfeet", "#triplets", "#funnybaby", "#babywagon", "#familyfun"], personas: ["vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/iz5dMEECdL8", title: "Nature’s Sweet Treasure 🍇 | Stunning Grapes Garden & Harvesting", channel: "@BetoSeeWithMe", likes: 23000, hashtags: [], personas: ["film-snob", "vintage-hipster", "overthinker"] },
  { url: "https://www.youtube.com/shorts/ZEp6bmjnQcc", title: "The SMARTEST way to remove snow from your Car", channel: "@Daily_vroom", likes: 2000, hashtags: ["#driving", "#shorts"], personas: ["film-snob", "vintage-hipster", "gym-rat"] },
  { url: "https://www.youtube.com/shorts/9gBOmO6_YkU", title: "Yellow glass bottle!", channel: "@ABPKASMR", likes: 407000, hashtags: [], personas: ["hype-beast", "chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/SPrXJPRuVGc", title: "#typography", channel: "@polin-shorts", likes: 4100, hashtags: ["#typography"], personas: ["vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/IDvdV8Qe1ZI", title: "Mango 🥭 Farming", channel: "@idealfarming", likes: 50000, hashtags: ["#agriculture", "#asmr", "#farmlife", "#automobile", "#yummy", "#agro", "#garden", "#farming", "#fruit", "#me"], personas: ["gym-rat"] },
  { url: "https://www.youtube.com/shorts/MsFSqPpCthU", title: "Costco Rage", channel: "@whosagoodlizard", likes: 2600, hashtags: [], personas: ["vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/OR0ceU9BOQg", title: "stop struggling to draw a lips ✏️✨️", channel: "@pradanaewingArt", likes: 50000, hashtags: ["#sketching", "#drawing", "#art", "#artwork", "#artist"], personas: ["film-snob"] },
  { url: "https://www.youtube.com/shorts/sk4U2zQPEZk", title: "Ever seen a cat do this so calmly 😭😭😭", channel: "@Dopp300", likes: 1000000, hashtags: [], personas: ["hype-beast", "chaos-gremlin"] },
  { url: "https://www.youtube.com/shorts/yyWTxgJtagc", title: "Buying a Rolex with my daddy’s card 🤷‍♀️💸 Wanna see Part 2 where I show my watch collection?", channel: "@AleevaRocheire", likes: 12000, hashtags: [], personas: ["film-snob", "vintage-hipster", "gym-rat", "corporate-girlie", "boomer-dad", "overthinker"] },
  { url: "https://www.youtube.com/shorts/f3uP-X4SUsU", title: "This guy might just be the best mule handler of all time with the way he still managed to load him", channel: "@SFCountry", likes: 11000, hashtags: [], personas: ["vintage-hipster", "overthinker"] },
  { url: "https://www.youtube.com/shorts/Q6TsyykVOwo", title: "I Broke This Rock… What Was Inside Is INSANE 😳", channel: "@LeonAgateAI", likes: 61000, hashtags: ["#crystals", "#gemstone", "#satisfying", "#asmr", "#shorts"], personas: ["hype-beast", "chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/69UzVWRXYa8", title: "*Shrek voice* “DOnkeyyyyy” #donkeylife #shrekislove #funnyfarm (Credit: our.farm.and.us )", channel: "@CheezburgerOfficial", likes: 1400, hashtags: ["#donkeylife", "#shrekislove", "#funnyfarm"], personas: ["vintage-hipster", "gym-rat", "theater-kid", "overthinker"] },
  { url: "https://www.youtube.com/shorts/D7lxBuBwBnA", title: "Gold Ring Making", channel: "@Aakashgolddesign", likes: 733000, hashtags: ["#akashgolddesign", "#gold", "#jewelry", "#ring", "#making", "#shorts", "#new", "#reels", "#short", "#viral", "#video"], personas: ["hype-beast", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/x1_nx6l9ccc", title: "Woman fails her first driving test", channel: "@Daily_vroom", likes: 72000, hashtags: ["#driving", "#shorts", "#usa", "#funny"], personas: ["chaos-gremlin", "gym-rat"] },
  { url: "https://www.youtube.com/shorts/OGiFLJ39C8E", title: "Blacksmith work short video", channel: "@BlacksmithOfAsia", likes: 101000, hashtags: ["#shorts", "#shortvideo", "#america", "#10millionview", "#foryou"], personas: ["film-snob"] },
  { url: "https://www.youtube.com/shorts/pV27XQjviMA", title: "When a Horse Owner Went Up Against a Karen...", channel: "@DropTactics", likes: 2300, hashtags: [], personas: ["vintage-hipster", "gym-rat"] },
  { url: "https://www.youtube.com/shorts/UBckwKdOGqM", title: "how long is a day on each planet in solarballs? ⁨@SolarBalls⁩", channel: "@susb.e", likes: 780000, hashtags: ["#solarballs", "#fyp"], personas: ["hype-beast", "overthinker"] },
  { url: "https://www.youtube.com/shorts/e2JuShJQZRk", title: "Scary void", channel: "@TizzyUS", likes: 0, hashtags: [], personas: ["vintage-hipster", "gym-rat"] },
  { url: "https://www.youtube.com/shorts/L7YAJaOhdOA", title: "Baptism of Steel Apr 17", channel: "@MayeFactory", likes: 160000, hashtags: [], personas: ["hype-beast", "chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/PW4_8ZfOjR0", title: "The First Days of a Baby Whale’s Life 🐋 Emotional Ocean Moment", channel: "@NaturesEliteWild", likes: 429, hashtags: [], personas: ["vintage-hipster", "corporate-girlie", "overthinker"] },
  { url: "https://www.youtube.com/shorts/tOWtdJX9UDo", title: "#chicken #animals #shortvideo #greenscreen #snake #pets #lovelypet", channel: "@cothoahaydi_88", likes: 47000, hashtags: ["#chicken", "#animals", "#shortvideo", "#greenscreen", "#snake", "#pets", "#lovelypet"], personas: ["vintage-hipster", "theater-kid", "overthinker"] },
  { url: "https://www.youtube.com/shorts/G2WVKeXIsTU", title: "#funny #dothingsyoudontwanttodo #pets #butifyoucloseyoureyes #puppy #helpmemakethismakesense", channel: "@ThatGirlEebe", likes: 2700, hashtags: ["#funny", "#dothingsyoudontwanttodo", "#pets", "#butifyoucloseyoureyes", "#puppy", "#helpmemakethismakesense"], personas: ["vintage-hipster", "overthinker"] },
  { url: "https://www.youtube.com/shorts/noURmAiC3-4", title: "Beautiful Water Lilies", channel: "@Iowawaterscapes", likes: 2, hashtags: [], personas: ["film-snob", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/jme-hF7jOoA", title: "3 Br*tal Ways To Eliminate Clones In Hitman 3 | Hitman World of Assassination", channel: "@Fallen-On-YT", likes: 302000, hashtags: [], personas: ["overthinker"] },
  { url: "https://www.youtube.com/shorts/nqbeBhqa6io", title: "The baby monkey is very smart and plays tricks on its mother until its mother doesn't ...Ep 2.....!!", channel: "@adorable_monkey", likes: 50, hashtags: [], personas: ["chaos-gremlin", "film-snob", "vintage-hipster", "corporate-girlie", "overthinker"] },
  { url: "https://www.youtube.com/shorts/7YkjMJCPT5I", title: "عرض السهره4 ك وراك 400 ج توصيل مجاني", channel: "@elnoor.dawagen", likes: 60000, hashtags: [], personas: ["hype-beast", "chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/iweRHYTjJEg", title: "Bro missed the most crucial step 😅", channel: "@DriveWithPassion", likes: 112000, hashtags: [], personas: ["gym-rat"] },
  { url: "https://www.youtube.com/shorts/IXZSaq0tLvw", title: "Link in Bio to order 😍🛍️ #harrypotter #hufflepuff #potterhead #handmade bag de", channel: "@PotterBags", likes: 34000, hashtags: ["#harrypotter", "#hufflepuff", "#potterhead", "#handmade"], personas: ["chaos-gremlin", "film-snob", "vintage-hipster", "overthinker"] },
  { url: "https://www.youtube.com/shorts/sFCUyy08whc", title: "When we understand that each day", channel: "@JohnMotivationYT", likes: 1500, hashtags: ["#quotes", "#shortfeed", "#shortsviral", "#quotesaboutlife", "#motivation", "#usa"], personas: ["vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/2xZ8g2eIfSc", title: "Super Fast Chicken Plucker Machine, Defeather 5 Birds in Under 20 Seconds! ⚡🐔", channel: "@MasDino123", likes: 147000, hashtags: ["#ChickenPlucker"], personas: ["chaos-gremlin", "gym-rat", "overthinker"] },
  { url: "https://www.youtube.com/shorts/oslXsKqh6gQ", title: "Strange black bubbles in the pond… what were those?", channel: "@CiudadRescate", likes: 35000, hashtags: [], personas: ["vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/bgFNjBkv3V8", title: "Curious big monkey’s funny reaction.", channel: "@thebosswildlife77", likes: 197, hashtags: ["#theboss", "#monkey", "#animals"], personas: ["chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/0AdXN4lcMdI", title: "My dog is getting paid for this trust", channel: "@DCessa", likes: 15, hashtags: ["#dssa", "#essa", "#puppy"], personas: ["chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/htPJKB0fOGw", title: "Always keep safe to go into River like this 🙏", channel: "@limseditingtutorialtv4735", likes: 74000, hashtags: [], personas: ["hype-beast", "chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/X4WObwxB9I4", title: "Bird Bath 🐦‍⬛", channel: "@Iowawaterscapes", likes: 125, hashtags: [], personas: ["chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/AURXaCE9XjY", title: "Tea cutting machine | tea harvesting machine", channel: "@Teakingblog", likes: 123000, hashtags: ["#cuttingmachine", "#shortvideo", "#agriculture", "#teagarden"], personas: ["hype-beast", "chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/qQ9ZpX9wAkE", title: "He will crunch every corner 🏆🍊", channel: "@dextheorangecat", likes: 43000, hashtags: [], personas: ["vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/TuuIksZMnac", title: "KEPUNI Heat Exchanger Pipeline Automatic Welder for Stainless Steel U-Tube Welding", channel: "@KEPUNIorbitalweldingmachine", likes: 23000, hashtags: [], personas: ["vintage-hipster", "overthinker"] },
  { url: "https://www.youtube.com/shorts/IEYRWg4QyUs", title: "#monkey #. cute        funny 😍 short viral videos monkey 🐵", channel: "@gopalji47861", likes: 190, hashtags: ["#monkey"], personas: ["hype-beast", "chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/wNwOakfx6ts", title: "PUNCH-KUN MONKEY | 30-04-26 | UPDATES @dailylifeofpunch", channel: "@DailyLifeOfPunch", likes: 811, hashtags: ["#PunchMonkey", "#japan", "#india", "#instagram", "#viral"], personas: ["chaos-gremlin", "vintage-hipster", "overthinker"] },
  { url: "https://www.youtube.com/shorts/30YlIhk6XZY", title: "Monkey Attitude is on Another Level 😂🐒", channel: "@sunny.0061", likes: 333, hashtags: ["#monkeyshorts", "#funnymonkey", "#monkeylove", "#bandar", "#animals"], personas: ["chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/v1vSNRV4ifQ", title: "Survival Skill in Red Dead Redemption 2 P 1419", channel: "@Redhunter110", likes: 99, hashtags: ["#gameplay", "#gaming", "#shorts", "#rdr2"], personas: ["vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/BGEHfIQF4rk", title: "Rumi and Jinu vs Funniest GTA Mom (Crazy Barrier Gate)", channel: "@ssvinesanimation", likes: 35000, hashtags: ["#shorts", "#kpopdemonhunters"], personas: ["chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/CuIpt6u_exA", title: "ASMR Cat Care Routine 🐱♥️", channel: "@Pestothefluff", likes: 7000, hashtags: [], personas: ["chaos-gremlin", "vintage-hipster", "gym-rat", "corporate-girlie"] },
  { url: "https://www.youtube.com/shorts/NpTo-WR32f0", title: "Funniest GTA Mom vs Rumi Mira and Zoey", channel: "@ssvinesanimation", likes: 528000, hashtags: ["#shorts", "#kpopdemonhunters"], personas: ["hype-beast"] },
  { url: "https://www.youtube.com/shorts/hxQ8ZQyYQxc", title: "Is this the smartest dad😂", channel: "@MainTalks095", likes: 2200, hashtags: [], personas: ["film-snob", "vintage-hipster", "boomer-dad"] },
  { url: "https://www.youtube.com/shorts/zseMltAQM6A", title: "Smart Agriculture: The Secret to Perfect Vegetable Watering Systems", channel: "@Localfarms", likes: 33, hashtags: [], personas: ["film-snob", "vintage-hipster", "gym-rat", "conspiracy-theorist", "overthinker"] },
  { url: "https://www.youtube.com/shorts/ByW0BIJq1yA", title: "The puppy loved it", channel: "@Male_Wisdom", likes: 0, hashtags: [], personas: ["vintage-hipster", "theater-kid", "overthinker"] },
  { url: "https://www.youtube.com/shorts/2EHZFRf3r2I", title: "Hey Monkey Xingxing", channel: "@fengchun681", likes: 1200, hashtags: ["#Monkey", "#Cute", "#Monkeyxingxing", "#Lovely", "#Animals"], personas: ["chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/wBhZbedSkRU", title: "#diybuild", channel: "@ottershortss", likes: 0, hashtags: ["#diybuild"], personas: ["chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/O5omKPyZew4", title: "She Didn't Remove The Protective Film from The Nutella! 😳", channel: "@MartaAndRustam", likes: 324000, hashtags: [], personas: ["film-snob"] },
  { url: "https://www.youtube.com/shorts/7QNE1xsDEIU", title: "Aivituvin Heated Cat House gives stray cats a safe, warm refuge in any weather.", channel: "@Aivituvinpets", likes: 23000, hashtags: ["#catshelter", "#feralcat"], personas: ["chaos-gremlin", "vintage-hipster", "overthinker"] },
  { url: "https://www.youtube.com/shorts/BDT8wZViOFY", title: "CHINESE FAIRY WALK DITO SA CAMBUGAHAY FALLS! GANDA NG SALO NI KUYA", channel: "@FrancisCualesVlogs", likes: 11000, hashtags: ["#fyp", "#travel", "#viral", "#swimming"], personas: ["vintage-hipster", "overthinker"] },
  { url: "https://www.youtube.com/shorts/EpwrY47yAWE", title: "ayam besar melindungi anakan", channel: "@AhmadBedowi-y3d", likes: 41000, hashtags: ["#nature", "#shortvideo"], personas: ["vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/23fyeHjKjEk", title: "Investing early 🤣", channel: "@DriveWithPassion", likes: 4800, hashtags: [], personas: ["vintage-hipster", "gym-rat"] },
  { url: "https://www.youtube.com/shorts/yqIbkGn990s", title: "Best Transition In Gaming History 💀", channel: "@carnagerespawn", likes: 135000, hashtags: ["#shorts"], personas: ["theater-kid", "boomer-dad"] },
  { url: "https://www.youtube.com/shorts/A6Unjic_uh8", title: "RC Heavy machinery", channel: "@radioRCcontrol", likes: 2900, hashtags: ["#heavyduty", "#heavyequipment", "#rchobby", "#rc"], personas: ["vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/Lby_ZwwFvWM", title: "El peluche divertido", channel: "@RodolfoIbarbo", likes: 191000, hashtags: [], personas: ["hype-beast", "chaos-gremlin", "vintage-hipster"] },
  { url: "https://www.youtube.com/shorts/l-R_987QUyw", title: "thirsty crow getting water frim a human", channel: "@ecosystem786", likes: 842, hashtags: ["#zoo", "#baby", "#trending", "#trend", "#animalworld"], personas: ["vintage-hipster"] },
];

export type ValidatedShortUrl =
  | { ok: true; normalizedUrl: string }
  | { ok: false; reason: string };

export function validateYouTubeShortUrl(url: string): ValidatedShortUrl {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return { ok: false, reason: "Invalid URL" };
  }

  const host = u.hostname.replace(/^www\./, "");
  const isYouTube = host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be";
  if (!isYouTube) return { ok: false, reason: "Only YouTube URLs are allowed" };

  if (host === "youtu.be") {
    const id = u.pathname.split("/").filter(Boolean)[0];
    if (!id) return { ok: false, reason: "Missing video id" };
    return { ok: true, normalizedUrl: `https://www.youtube.com/watch?v=${id}` };
  }

  const path = u.pathname;
  if (path.startsWith("/shorts/")) {
    const id = path.replace("/shorts/", "").split("/")[0];
    if (!id) return { ok: false, reason: "Missing shorts id" };
    return { ok: true, normalizedUrl: `https://www.youtube.com/shorts/${id}` };
  }

  if (path === "/watch") {
    const id = u.searchParams.get("v");
    if (!id) return { ok: false, reason: "Missing v= video id" };
    return { ok: true, normalizedUrl: `https://www.youtube.com/watch?v=${id}` };
  }

  return { ok: false, reason: "URL must be a YouTube Shorts or watch URL" };
}

export function searchShorts(args: { query?: string; persona?: string; limit?: number }): ShortSeed[] {
  const q = args.query?.trim().toLowerCase();
  const limit = Math.max(1, Math.min(50, args.limit ?? 10));
  let pool = SEED_SHORTS;
  if (args.persona) {
    const personaPool = SEED_SHORTS.filter((s) => s.personas.includes(args.persona!));
    if (personaPool.length > 0) pool = personaPool;
  }
  if (q) {
    pool = pool.filter((s) =>
      `${s.title} ${s.channel} ${s.hashtags.join(" ")}`.toLowerCase().includes(q),
    );
  }
  // shuffle so different runs surface different choices even within a small persona pool
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}
