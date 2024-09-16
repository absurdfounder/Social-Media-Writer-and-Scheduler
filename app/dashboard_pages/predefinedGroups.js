const predefinedGroups = [
    {
      name: "English Learners",
      subreddits: [
        { id: "LearnEnglishFree", name: "LearnEnglishFree" },
        { id: "LearnEnglishOnReddit", name: "LearnEnglishOnReddit" },
        { id: "EnglishStudy", name: "EnglishStudy" },
        { id: "learnEnglishOnline", name: "learnEnglishOnline" },
        { id: "Learn_English", name: "Learn_English" },
        { id: "languagelearning", name: "languagelearning" },
        { id: "language_exchange", name: "language_exchange" },
        { id: "EnglishLearning", name: "EnglishLearning" }
      ]
    },
    {
      name: "Software Developers",
      subreddits: [
        { id: "software", name: "software" },
        { id: "coding", name: "coding" },
        { id: "linux", name: "linux" },
        { id: "softwaredevelopment", name: "softwaredevelopment" },
        { id: "Development", name: "Development" },
        { id: "javascript", name: "javascript" },
        { id: "elixir", name: "elixir" },
        { id: "SoftwareEngineering", name: "SoftwareEngineering" },
        { id: "iOSProgramming", name: "iOSProgramming" },
        { id: "learnjavascript", name: "learnjavascript" },
        { id: "AskComputerScience", name: "AskComputerScience" },
        { id: "rust", name: "rust" },
        { id: "csharp", name: "csharp" },
        { id: "ExperiencedDevs", name: "ExperiencedDevs" },
        { id: "devops", name: "devops" },
        { id: "coolgithubprojects", name: "coolgithubprojects" },
        { id: "Python", name: "Python" },
        { id: "reactjs", name: "reactjs" },
        { id: "reactnative", name: "reactnative" },
        { id: "computerscience", name: "computerscience" },
        { id: "AskEngineers", name: "AskEngineers" },
        { id: "learnpython", name: "learnpython" },
        { id: "webdev", name: "webdev" },
        { id: "programming", name: "programming" },
        { id: "cscareerquestions", name: "cscareerquestions" },
        { id: "learnprogramming", name: "learnprogramming" }
      ]
    },
    {
      name: "Marketers",
      subreddits: [
        { id: "MarketingResearch", name: "MarketingResearch" },
        { id: "Affiliatemarketing", name: "Affiliatemarketing" },
        { id: "InstagramMarketing", name: "InstagramMarketing" },
        { id: "googleads", name: "googleads" },
        { id: "FacebookAds", name: "FacebookAds" },
        { id: "bigseo", name: "bigseo" },
        { id: "OnlineMarketing", name: "OnlineMarketing" },
        { id: "Emailmarketing", name: "Emailmarketing" },
        { id: "advertising", name: "advertising" },
        { id: "socialmedia", name: "socialmedia" },
        { id: "AskMarketing", name: "AskMarketing" },
        { id: "affiliate_marketing", name: "affiliate_marketing" },
        { id: "PPC", name: "PPC" },
        { id: "content_marketing", name: "content_marketing" },
        { id: "SEO", name: "SEO" },
        { id: "marketing", name: "marketing" },
        { id: "digital_marketing", name: "digital_marketing" },
        { id: "DigitalMarketing", name: "DigitalMarketing" }
      ]
    },
    {
      name: "AirBnB Hosts",
      subreddits: [
        { id: "ShortTermRentals", name: "ShortTermRentals" },
        { id: "AirBnBHosts", name: "AirBnBHosts" },
        { id: "learnairbnb", name: "learnairbnb" },
        { id: "rentalproperties", name: "rentalproperties" },
        { id: "AirBnBInvesting", name: "AirBnBInvesting" },
        { id: "airbnb_hosts", name: "airbnb_hosts" }
      ]
    },
    {
      name: "Fitness Enthusiasts",
      subreddits: [
        { id: "weightroom", name: "weightroom" },
        { id: "strength_training", name: "strength_training" },
        { id: "fitness30plus", name: "fitness30plus" },
        { id: "GymMotivation", name: "GymMotivation" },
        { id: "GYM", name: "GYM" },
        { id: "Health", name: "Health" },
        { id: "Fitness", name: "Fitness" },
        { id: "workout", name: "workout" },
        { id: "physicaltherapy", name: "physicaltherapy" },
        { id: "yoga", name: "yoga" },
        { id: "loseit", name: "loseit" },
        { id: "personaltraining", name: "personaltraining" }
      ]
    },
    {
      name: "Self-Promoters",
      subreddits: [
        { id: "youtubepromotion", name: "youtubepromotion" },
        { id: "AppIdeas", name: "AppIdeas" },
        { id: "ProductHunters", name: "ProductHunters" },
        { id: "selfpromotion", name: "selfpromotion" },
        { id: "IMadeThis", name: "IMadeThis" },
        { id: "TestMyApp", name: "TestMyApp" },
        { id: "betatests", name: "betatests" },
        { id: "alphaandbetausers", name: "alphaandbetausers" },
        { id: "InternetIsBeautiful", name: "InternetIsBeautiful" },
        { id: "SideProject", name: "SideProject" }
      ]
    },
    {
      name: "NFT Collectors",
      subreddits: [
        { id: "NFTMarketplace", name: "NFTMarketplace" },
        { id: "OpenseaMarket", name: "OpenseaMarket" },
        { id: "DigitalItems", name: "DigitalItems" },
        { id: "CryptoArt", name: "CryptoArt" },
        { id: "OpenSeaNFT", name: "OpenSeaNFT" },
        { id: "NFTmarket", name: "NFTmarket" },
        { id: "opensea", name: "opensea" },
        { id: "NFTExchange", name: "NFTExchange" },
        { id: "NFTsMarketplace", name: "NFTsMarketplace" },
        { id: "NFT", name: "NFT" }
      ]
    },
    {
      name: "Gardeners",
      subreddits: [
        { id: "succulents", name: "succulents" },
        { id: "UrbanGardening", name: "UrbanGardening" },
        { id: "whatsthisplant", name: "whatsthisplant" },
        { id: "flowers", name: "flowers" },
        { id: "GardenersWorld", name: "GardenersWorld" },
        { id: "SavageGarden", name: "SavageGarden" },
        { id: "GardeningUK", name: "GardeningUK" },
        { id: "vegetablegardening", name: "vegetablegardening" },
        { id: "Permaculture", name: "Permaculture" },
        { id: "mycology", name: "mycology" },
        { id: "gardening", name: "gardening" }
      ]
    },
    {
      name: "Financial Independence",
      subreddits: [
        { id: "UKPersonalFinance", name: "UKPersonalFinance" },
        { id: "Frugal", name: "Frugal" },
        { id: "Fire", name: "Fire" },
        { id: "FinancialPlanning", name: "FinancialPlanning" },
        { id: "FIREUK", name: "FIREUK" },
        { id: "personalfinance", name: "personalfinance" },
        { id: "fatFIRE", name: "fatFIRE" },
        { id: "financialindependence", name: "financialindependence" }
      ]
    },
    {
      name: "Parents",
      subreddits: [
        { id: "SingleParents", name: "SingleParents" },
        { id: "raisingkids", name: "raisingkids" },
        { id: "toddlers", name: "toddlers" },
        { id: "Parents", name: "Parents" },
        { id: "daddit", name: "daddit" },
        { id: "parentsofmultiples", name: "parentsofmultiples" },
        { id: "beyondthebump", name: "beyondthebump" },
        { id: "NewParents", name: "NewParents" },
        { id: "Parenting", name: "Parenting" }
      ]
    },
    {
      name: "Advertisers",
      subreddits: [
        { id: "FacebookAds", name: "FacebookAds" },
        { id: "marketing", name: "marketing" },
        { id: "advertising", name: "advertising" },
        { id: "SEO", name: "SEO" },
        { id: "googleads", name: "googleads" },
        { id: "PPC", name: "PPC" }
      ]
    },
    {
      name: "3D Printers",
      subreddits: [
        { id: "3Dprintmything", name: "3Dprintmything" },
        { id: "3dprinter", name: "3dprinter" },
        { id: "FixMyPrint", name: "FixMyPrint" },
        { id: "3Dmodeling", name: "3Dmodeling" },
        { id: "blender", name: "blender" },
        { id: "functionalprint", name: "functionalprint" },
        { id: "ender3", name: "ender3" },
        { id: "3Dprinting", name: "3Dprinting" }
      ]
    },
    {
      name: "Freelancers",
      subreddits: [
        { id: "freelance_forhire", name: "freelance_forhire" },
        { id: "Fiverr", name: "Fiverr" },
        { id: "WorkOnline", name: "WorkOnline" },
        { id: "forhire", name: "forhire" },
        { id: "Freelancers", name: "Freelancers" },
        { id: "freelanceWriters", name: "freelanceWriters" },
        { id: "freelance", name: "freelance" },
        { id: "Upwork", name: "Upwork" }
      ]
    },
    {
      name: "Remote Workers",
      subreddits: [
        { id: "work", name: "work" },
        { id: "workfromhome", name: "workfromhome" },
        { id: "RemoteJobs", name: "RemoteJobs" },
        { id: "digitalnomad", name: "digitalnomad" },
        { id: "remotework", name: "remotework" },
        { id: "WorkOnline", name: "WorkOnline" }
      ]
    },
    {
      name: "Startup Founders",
      subreddits: [
        { id: "Entrepreneurs", name: "Entrepreneurs" },
        { id: "Entrepreneurship", name: "Entrepreneurship" },
        { id: "advancedentrepreneur", name: "advancedentrepreneur" },
        { id: "startup_resources", name: "startup_resources" },
        { id: "ycombinator", name: "ycombinator" },
        { id: "growmybusiness", name: "growmybusiness" },
        { id: "startup", name: "startup" },
        { id: "indiebiz", name: "indiebiz" },
        { id: "business", name: "business" },
        { id: "indiehackers", name: "indiehackers" },
        { id: "startups", name: "startups" },
        { id: "EntrepreneurRideAlong", name: "EntrepreneurRideAlong" },
        { id: "smallbusiness", name: "smallbusiness" },
        { id: "SaaS", name: "SaaS" },
        { id: "Entrepreneur", name: "Entrepreneur" },
        { id: "SideProject", name: "SideProject" }
      ]
    },
    {
      name: "No-code",
      subreddits: [
        { id: "Airtable", name: "Airtable" },
        { id: "webflow", name: "webflow" },
        { id: "Adalo", name: "Adalo" },
        { id: "NoCodeMovement", name: "NoCodeMovement" },
        { id: "nocodelowcode", name: "nocodelowcode" },
        { id: "nocodedevelopers", name: "nocodedevelopers" },
        { id: "NoCodeSaaS", name: "NoCodeSaaS" },
        { id: "lowcode", name: "lowcode" },
        { id: "nocode", name: "nocode" }
      ]
    },
    {
      name: "Ecommerce",
      subreddits: [
        { id: "Random_Acts_of_Etsy", name: "Random_Acts_of_Etsy" },
        { id: "ecommerce_growth", name: "ecommerce_growth" },
        { id: "reviewmyshopify", name: "reviewmyshopify" },
        { id: "ecommercemarketing", name: "ecommercemarketing" },
        { id: "AmazonSeller", name: "AmazonSeller" },
        { id: "dropship", name: "dropship" },
        { id: "EtsySellers", name: "EtsySellers" },
        { id: "Etsy", name: "Etsy" },
        { id: "ecommerce", name: "ecommerce" },
        { id: "shopify", name: "shopify" }
      ]
    },
    {
      name: "Pet Lovers",
      subreddits: [
        { id: "doggrooming", name: "doggrooming" },
        { id: "cat", name: "cat" },
        { id: "Dogowners", name: "Dogowners" },
        { id: "DogTrainingTips", name: "DogTrainingTips" },
        { id: "PetAdvice", name: "PetAdvice" },
        { id: "DogAdvice", name: "DogAdvice" },
        { id: "CatAdvice", name: "CatAdvice" },
        { id: "turtle", name: "turtle" },
        { id: "dogswithjobs", name: "dogswithjobs" },
        { id: "DogBreeds101", name: "DogBreeds101" },
        { id: "puppy101", name: "puppy101" },
        { id: "dogbreed", name: "dogbreed" },
        { id: "dogpictures", name: "dogpictures" },
        { id: "DOG", name: "DOG" },
        { id: "Dogtraining", name: "Dogtraining" },
        { id: "germanshepherds", name: "germanshepherds" },
        { id: "lookatmydog", name: "lookatmydog" },
        { id: "herpetology", name: "herpetology" },
        { id: "Ornithology", name: "Ornithology" },
        { id: "Aquariums", name: "Aquariums" },
        { id: "cockatiel", name: "cockatiel" },
        { id: "birding", name: "birding" },
        { id: "parrots", name: "parrots" },
        { id: "BeardedDragons", name: "BeardedDragons" },
        { id: "leopardgeckos", name: "leopardgeckos" },
        { id: "ballpython", name: "ballpython" },
        { id: "reptiles", name: "reptiles" },
        { id: "RATS", name: "RATS" },
        { id: "Pets", name: "Pets" },
        { id: "dogs", name: "dogs" },
        { id: "cats", name: "cats" }
      ]
    },
    {
      name: "Designers",
      subreddits: [
        { id: "UXResearch", name: "UXResearch" },
        { id: "userexperience", name: "userexperience" },
        { id: "product_design", name: "product_design" },
        { id: "UX_Design", name: "UX_Design" },
        { id: "typography", name: "typography" },
        { id: "logodesign", name: "logodesign" },
        { id: "learndesign", name: "learndesign" },
        { id: "uidesign", name: "uidesign" },
        { id: "UXDesign", name: "UXDesign" },
        { id: "Design", name: "Design" },
        { id: "UI_Design", name: "UI_Design" },
        { id: "web_design", name: "web_design" },
        { id: "graphic_design", name: "graphic_design" }
      ]
    },
    {
      name: "B2B Sales",
      subreddits: [
        { id: "salestechniques", name: "salestechniques" },
        { id: "B_2_B_Selling_Tips", name: "B_2_B_Selling_Tips" },
        { id: "b2b_sales", name: "b2b_sales" },
        { id: "B2BSales", name: "B2BSales" },
        { id: "sales", name: "sales" }
      ]
    },
    {
      name: "Photographers",
      subreddits: [
        { id: "AnalogCommunity", name: "AnalogCommunity" },
        { id: "analog", name: "analog" },
        { id: "canon", name: "canon" },
        { id: "SonyAlpha", name: "SonyAlpha" },
        { id: "streetphotography", name: "streetphotography" },
        { id: "postprocessing", name: "postprocessing" },
        { id: "Nikon", name: "Nikon" },
        { id: "Beginning_Photography", name: "Beginning_Photography" },
        { id: "AskPhotography", name: "AskPhotography" },
        { id: "WeddingPhotography", name: "WeddingPhotography" },
        { id: "photography", name: "photography" }
      ]
    },
    {
      name: "Stock Investors",
      subreddits: [
        { id: "dividends", name: "dividends" },
        { id: "StocksAndTrading", name: "StocksAndTrading" },
        { id: "Trading", name: "Trading" },
        { id: "swingtrading", name: "swingtrading" },
        { id: "Daytrading", name: "Daytrading" },
        { id: "options", name: "options" },
        { id: "finance", name: "finance" },
        { id: "technicalanalysis", name: "technicalanalysis" },
        { id: "SecurityAnalysis", name: "SecurityAnalysis" },
        { id: "Forex", name: "Forex" },
        { id: "FinancialCareers", name: "FinancialCareers" },
        { id: "ValueInvesting", name: "ValueInvesting" },
        { id: "StockMarket", name: "StockMarket" },
        { id: "investing", name: "investing" },
        { id: "stocks", name: "stocks" }
      ]
    },
    {
      name: "Productivity",
      subreddits: [
        { id: "getdisciplined", name: "getdisciplined" },
        { id: "lifehack", name: "lifehack" },
        { id: "LifeHack_Pro", name: "LifeHack_Pro" },
        { id: "lifehacks", name: "lifehacks" },
        { id: "LifeProTips", name: "LifeProTips" },
        { id: "productivity", name: "productivity" }
      ]
    },
    {
      name: "Data Scientists",
      subreddits: [
        { id: "data", name: "data" },
        { id: "dataanalytics", name: "dataanalytics" },
        { id: "dataanalysis", name: "dataanalysis" },
        { id: "bigdata_analytics", name: "bigdata_analytics" },
        { id: "statistics", name: "statistics" },
        { id: "analytics", name: "analytics" },
        { id: "datascientists", name: "datascientists" },
        { id: "datasets", name: "datasets" },
        { id: "BusinessIntelligence", name: "BusinessIntelligence" },
        { id: "MachineLearning", name: "MachineLearning" },
        { id: "bigdata", name: "bigdata" },
        { id: "datascience", name: "datascience" },
        { id: "dataengineering", name: "dataengineering" }
      ]
    },
    {
      name: "Product Managers",
      subreddits: [
        { id: "Product_Management", name: "Product_Management" },
        { id: "ProductManager", name: "ProductManager" },
        { id: "ProductMgmt", name: "ProductMgmt" },
        { id: "ProductOwner", name: "ProductOwner" },
        { id: "prodmgmt", name: "prodmgmt" },
        { id: "ProductManagement", name: "ProductManagement" }
      ]
    },
    {
      name: "Cold Email",
      subreddits: [
        { id: "b2b_sales", name: "b2b_sales" },
        { id: "OutreachHacks", name: "OutreachHacks" },
        { id: "LeadGeneration", name: "LeadGeneration" },
        { id: "EmailOutreach", name: "EmailOutreach" },
        { id: "B2BSaaS", name: "B2BSaaS" },
        { id: "coldemail", name: "coldemail" },
        { id: "copywriting", name: "copywriting" },
        { id: "Emailmarketing", name: "Emailmarketing" },
        { id: "sales", name: "sales" }
      ]
    },
    {
      name: "Copywriters",
      subreddits: [
        { id: "SEO", name: "SEO" },
        { id: "KeepWriting", name: "KeepWriting" },
        { id: "Write2Publish", name: "Write2Publish" },
        { id: "content_marketing", name: "content_marketing" },
        { id: "ContentHacks", name: "ContentHacks" },
        { id: "writers", name: "writers" },
        { id: "freelanceWriters", name: "freelanceWriters" },
        { id: "copywriting", name: "copywriting" }
      ]
    },
    {
      name: "Newsletter Creators",
      subreddits: [
        { id: "Emailmarketing", name: "Emailmarketing" },
        { id: "Substack", name: "Substack" },
        { id: "Newsletters", name: "Newsletters" }
      ]
    },
    {
      name: "Restaurant Owners",
      subreddits: [
        { id: "BarOwners", name: "BarOwners" },
        { id: "restaurateur", name: "restaurateur" },
        { id: "restaurant", name: "restaurant" },
        { id: "restaurantowners", name: "restaurantowners" }
      ]
    },
    {
      name: "Notion Users",
      subreddits: [
        { id: "BestNotionTemplates", name: "BestNotionTemplates" },
        { id: "NotionGeeks", name: "NotionGeeks" },
        { id: "AskNotion", name: "AskNotion" },
        { id: "notioncreations", name: "notioncreations" },
        { id: "FreeNotionTemplates", name: "FreeNotionTemplates" },
        { id: "NotionPromote", name: "NotionPromote" },
        { id: "Notiontemplates", name: "Notiontemplates" },
        { id: "Notion", name: "Notion" }
      ]
    },
    {
      name: "Video Editors",
      subreddits: [
        { id: "gopro", name: "gopro" },
        { id: "finalcutpro", name: "finalcutpro" },
        { id: "Youtubevideo", name: "Youtubevideo" },
        { id: "youtubers", name: "youtubers" },
        { id: "iMovie", name: "iMovie" },
        { id: "postproduction", name: "postproduction" },
        { id: "videomaker", name: "videomaker" },
        { id: "buildapcvideoediting", name: "buildapcvideoediting" },
        { id: "premiere", name: "premiere" },
        { id: "editing", name: "editing" },
        { id: "NewTubers", name: "NewTubers" },
        { id: "VideoEditors", name: "VideoEditors" },
        { id: "videography", name: "videography" },
        { id: "editors", name: "editors" },
        { id: "VideoEditing", name: "VideoEditing" }
      ]
    },
    {
      name: "Influencers",
      subreddits: [
        { id: "InstagramGrowthTips", name: "InstagramGrowthTips" },
        { id: "Instagram", name: "Instagram" },
        { id: "SocialMediaMarketing", name: "SocialMediaMarketing" },
        { id: "socialmedia", name: "socialmedia" },
        { id: "InstagramMarketing", name: "InstagramMarketing" },
        { id: "influencermarketing", name: "influencermarketing" },
        { id: "BeautyGuruChatter", name: "BeautyGuruChatter" }
      ]
    },
    {
      name: "Generative AI",
      subreddits: [
        { id: "ChatGPT", name: "ChatGPT" },
        { id: "PromptEngineering", name: "PromptEngineering" },
        { id: "nightcafe", name: "nightcafe" },
        { id: "DreamBooth", name: "DreamBooth" },
        { id: "weirddalle", name: "weirddalle" },
        { id: "starryai", name: "starryai" },
        { id: "sdforall", name: "sdforall" },
        { id: "StableDiffusion", name: "StableDiffusion" },
        { id: "aiArt", name: "aiArt" },
        { id: "LanguageTechnology", name: "LanguageTechnology" },
        { id: "deepdream", name: "deepdream" },
        { id: "midjourney", name: "midjourney" },
        { id: "OpenAI", name: "OpenAI" },
        { id: "GPT3", name: "GPT3" },
        { id: "dalle2", name: "dalle2" }
      ]
    },
    {
      name: "Crypto",
      subreddits: [
        { id: "CryptoNews", name: "CryptoNews" },
        { id: "ethstaker", name: "ethstaker" },
        { id: "Crypto_Currency_News", name: "Crypto_Currency_News" },
        { id: "0xPolygon", name: "0xPolygon" },
        { id: "solana", name: "solana" },
        { id: "defi_", name: "defi_" },
        { id: "defiblockchain", name: "defiblockchain" },
        { id: "BitcoinBeginners", name: "BitcoinBeginners" },
        { id: "CryptoCurrencies", name: "CryptoCurrencies" },
        { id: "ethdev", name: "ethdev" },
        { id: "web3", name: "web3" },
        { id: "ethfinance", name: "ethfinance" },
        { id: "Crypto_General", name: "Crypto_General" },
        { id: "ethereum", name: "ethereum" },
        { id: "Bitcoin", name: "Bitcoin" },
        { id: "defi", name: "defi" },
        { id: "ethtrader", name: "ethtrader" },
        { id: "CryptoCurrencyTrading", name: "CryptoCurrencyTrading" },
        { id: "CryptoMarkets", name: "CryptoMarkets" }
      ]
    },
    {
      name: "SaaS founders",
      subreddits: [
        { id: "B2BSaaS", name: "B2BSaaS" },
        { id: "SaaS_Email_Marketing", name: "SaaS_Email_Marketing" },
        { id: "NoCodeSaaS", name: "NoCodeSaaS" },
        { id: "microsaas", name: "microsaas" },
        { id: "SaaSSales", name: "SaaSSales" },
        { id: "SaaS", name: "SaaS" }
      ]
    },
    {
      name: "DevOps",
      subreddits: [
        { id: "Terraform", name: "Terraform" },
        { id: "sre", name: "sre" },
        { id: "ExperiencedDevs", name: "ExperiencedDevs" },
        { id: "computing", name: "computing" },
        { id: "aws_cdk", name: "aws_cdk" },
        { id: "AWS_Certified_Experts", name: "AWS_Certified_Experts" },
        { id: "AWS_cloud", name: "AWS_cloud" },
        { id: "AZURE", name: "AZURE" },
        { id: "googlecloud", name: "googlecloud" },
        { id: "cloudcomputing", name: "cloudcomputing" },
        { id: "PlatformEngineers", name: "PlatformEngineers" },
        { id: "platformengineering", name: "platformengineering" },
        { id: "DevOpsSec", name: "DevOpsSec" },
        { id: "Docker_DevOps", name: "Docker_DevOps" },
        { id: "ExperiencedDevOps", name: "ExperiencedDevOps" },
        { id: "aws", name: "aws" },
        { id: "azuredevops", name: "azuredevops" },
        { id: "DevOpsLinks", name: "DevOpsLinks" },
        { id: "Cloud", name: "Cloud" },
        { id: "devopsjobs", name: "devopsjobs" },
        { id: "devops", name: "devops" }
      ]
    },
    {
      name: "SEOs",
      subreddits: [
        { id: "GoogleSearchConsole", name: "GoogleSearchConsole" },
        { id: "Local_SEO", name: "Local_SEO" },
        { id: "SEO_Talk", name: "SEO_Talk" },
        { id: "SEO_Digital_Marketing", name: "SEO_Digital_Marketing" },
        { id: "SEO_cases", name: "SEO_cases" },
        { id: "TechSEO", name: "TechSEO" },
        { id: "seogrowth", name: "seogrowth" },
        { id: "The_SEO", name: "The_SEO" },
        { id: "bigseo", name: "bigseo" },
        { id: "SEO", name: "SEO" }
      ]
    }
  ];