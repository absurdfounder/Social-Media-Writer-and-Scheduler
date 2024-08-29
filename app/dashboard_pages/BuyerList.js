import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronDown, ChevronUp, Search,
  RefreshCcw, Home, Plus, X, Users,
  Flame, Trophy, HelpCircle, Frown,
  DollarSign, PenTool, Megaphone, Zap,
  Newspaper, Lightbulb, Check, ArrowLeft,
  TrendingUp, Shuffle, Eye, MessageCircle,
  AlertTriangle, ExternalLink
} from 'lucide-react';

const Tab = ({ label, active, onClick, icon: Icon }) => (
  <button
    className={`px-2 sm:px-4 py-2 ${active ? 'bg-blue-200 text-blue-800' : 'bg-gray-50 text-gray-700 hover:bg-gray-300'
      } rounded-t-lg transition-colors duration-200 flex items-center text-xs sm:text-sm`}
    onClick={onClick}
  >
    <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const LinkPreview = ({ url }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        setPreview(data);
      } catch (error) {
        console.error('Error fetching link preview:', error);
      }
    };

    fetchPreview();
  }, [url]);

  if (!preview) return null;

  return (
    <div className="border rounded-md overflow-hidden mt-2">
      {preview.image && <img src={preview.image} alt={preview.title} className="w-full h-32 object-cover" />}
      <div className="p-2">
        <h3 className="font-bold">{preview.title}</h3>
        <p className="text-sm text-gray-600">{preview.description}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
          {url}
        </a>
      </div>
    </div>
  );
};

const RedditExplorer = () => {
  const [activeTab, setActiveTab] = useState('groups');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [communities, setCommunities] = useState([]);
  const [displayedCommunities, setDisplayedCommunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubreddit, setSelectedSubreddit] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [postContent, setPostContent] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showGroupPopup, setShowGroupPopup] = useState(false);
  const [selectedSubredditsForGroup, setSelectedSubredditsForGroup] = useState([]);
  const [analyzedPosts, setAnalyzedPosts] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [comments, setComments] = useState([]);

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
  
  const [productInfo, setProductInfo] = useState(null);
  const [postIdeas, setPostIdeas] = useState([]);
  const [commentSuggestions, setCommentSuggestions] = useState({});
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  const observer = useRef();
  const lastCommunityElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && displayedCommunities.length < communities.length) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, displayedCommunities.length, communities.length]);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const filtered = communities.filter(community =>
      community.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setDisplayedCommunities(filtered.slice(0, page * 20));
  }, [communities, searchTerm, page]);

  useEffect(() => {
    const savedGroups = localStorage.getItem('redditGroups');
    if (savedGroups) {
      try {
        const parsedGroups = JSON.parse(savedGroups);
        if (Array.isArray(parsedGroups) && parsedGroups.every(group => group.name && Array.isArray(group.subreddits))) {
          const mergedGroups = [...predefinedGroups];
          parsedGroups.forEach(savedGroup => {
            const index = mergedGroups.findIndex(g => g.name === savedGroup.name);
            if (index !== -1) {
              mergedGroups[index] = savedGroup;
            } else {
              mergedGroups.push(savedGroup);
            }
          });
          setGroups(mergedGroups);
        } else {
          throw new Error('Invalid group structure');
        }
      } catch (error) {
        console.error('Error parsing saved groups:', error);
        setGroups(predefinedGroups);
      }
    } else {
      setGroups(predefinedGroups);
    }
  }, []);

  useEffect(() => {
    if (JSON.stringify(groups) !== JSON.stringify(predefinedGroups)) {
      localStorage.setItem('redditGroups', JSON.stringify(groups));
    }
  }, [groups]);

  useEffect(() => {
    const savedProductInfo = localStorage.getItem('productQuestionnaire');
    if (savedProductInfo) {
      setProductInfo(JSON.parse(savedProductInfo));
    }
  }, []);

  useEffect(() => {
    generatePostIdeasAfterRender();
  }, [analyzedPosts]);

  const fetchData = async (tab) => {
    setLoading(true);
    setError(null);
    setErrorMessage(null);
    try {
      let endpoint;
      switch (tab) {
        case 'popular':
          endpoint = 'https://www.reddit.com/subreddits/popular.json?limit=100';
          break;
        case 'trending':
          endpoint = 'https://www.reddit.com/trending_subreddits.json';
          break;
        case 'new':
          endpoint = 'https://www.reddit.com/subreddits/new.json?limit=100';
          break;
        default:
          endpoint = 'https://www.reddit.com/subreddits/popular.json?limit=100';
      }

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      let mappedCommunities;
      if (tab === 'trending') {
        mappedCommunities = data.subreddit_names.map(name => ({
          id: name,
          name: name,
          url: `https://reddit.com/r/${name}`,
          subscribersCount: 0,
          growthPerWeek: 0,
          growthPerMonth: 0,
        }));
      } else {
        if (!data || !data.data || !data.data.children) {
          throw new Error('Unexpected data structure from Reddit API');
        }
        mappedCommunities = data.data.children.map(child => ({
          id: child.data.id,
          name: child.data.display_name,
          url: `https://reddit.com${child.data.url}`,
          subscribersCount: child.data.subscribers || 0,
          growthPerWeek: Math.floor(Math.random() * 1000),
          growthPerMonth: Math.floor(Math.random() * 4000),
        }));
      }

      setCommunities(mappedCommunities);
      setDisplayedCommunities(mappedCommunities.slice(0, 20));
      setPage(1);
    } catch (err) {
      setError(`Failed to fetch data from Reddit API: ${err.message}`);
      setErrorMessage(`Failed to fetch data from Reddit API: ${err.message}`);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubredditPosts = async (subreddit) => {
    setLoading(true);
    setError(null);
    setErrorMessage(null);
    try {
      const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=10`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data || !data.data || !data.data.children) {
        throw new Error('Unexpected data structure from Reddit API');
      }
      const fetchedPosts = data.data.children.map(child => ({
        id: child.data.id,
        title: child.data.title,
        url: `https://reddit.com${child.data.permalink}`,
        author: child.data.author,
        score: child.data.score,
        numComments: child.data.num_comments,
        created: new Date(child.data.created_utc * 1000).toLocaleDateString(),
        selftext: child.data.selftext,
        subreddit: child.data.subreddit
      }));
      setPosts(fetchedPosts);
    } catch (err) {
      setError(`Failed to fetch posts for r/${subreddit}: ${err.message}`);
      setErrorMessage(`Failed to fetch posts for r/${subreddit}: ${err.message}`);
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePostIdeas = async (posts) => {
    if (!productInfo) return;

    const topPosts = posts.sort((a, b) => b.score - a.score).slice(0, 5);

    try {
      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          temperature: 0.7,
          max_tokens: 8192,
          messages: [{ role: "user", content: `Generate 5 engaging post ideas for Reddit based on these top-performing posts and our product information. Follow these guidelines:

1. Add value: Focus on sharing insights, asking questions, or providing useful information.
2. Stay humble: Don't oversell or claim superiority.
3. Share your process: Consider "How I do it" style posts that provide value to the community.
4. Be slightly controversial (but not offensive): Present unique perspectives to spark discussion.
5. Encourage engagement: End with a question or call for opinions.

Top Posts:
${topPosts.map(post => `- ${post.title}`).join('\n')}

Product Info:
${JSON.stringify(productInfo, null, 2)}

Provide 5 post ideas in the following format:
1. [Post Title]
   [Brief description and engagement prompt]
2. [Post Title]
   [Brief description and engagement prompt]
...` }],
          model: "claude-3-5-sonnet-20240620",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const ideas = data.content[0].text.split('\n\n').filter(idea => idea.trim() !== '').map(idea => {
        const [title, description] = idea.split('\n');
        return { title: title.substring(3), description };
      });
      setPostIdeas(ideas);
    } catch (error) {
      console.error('Error generating post ideas:', error);
    }
  };

  const generateCommentSuggestion = async (postId, postTitle, postContent) => {
    if (!productInfo) return;

    try {
      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          temperature: 0.7,
          max_tokens: 8192,
          messages: [{ role: "user", content: `Generate an engaging comment for this Reddit post that subtly promotes our product. Follow these guidelines:

1. Add value: Focus on contributing to the discussion genuinely.
2. Stay humble: Don't oversell or claim superiority.
3. Be relevant: Ensure the comment naturally fits the context of the post.
4. Encourage further engagement: End with a question or call for opinions.
5. Subtle promotion: Mention the product only if it's highly relevant and adds value to the discussion.

Post Title: ${postTitle}
Post Content: ${postContent}

Product Info:
${JSON.stringify(productInfo, null, 2)}

Provide a comment suggestion that follows these guidelines and naturally fits the context of the post.` }],
          model: "claude-3-5-sonnet-20240620",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const suggestion = data.content[0].text.trim();
      setCommentSuggestions(prev => ({ ...prev, [postId]: suggestion }));
    } catch (error) {
      console.error('Error generating comment suggestion:', error);
    }
  };

  const analyzePostContent = async (post) => {
    try {
      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          temperature: 0.7,
          max_tokens: 8192,
          messages: [{ role: "user", content: `Analyze the following Reddit post. Extract keywords, provide a brief summary, and categorize it into one or more of the following categories: Hot Discussions, Top Content, Advice Requests, Pain & Anger, Money Talk, Solution Requests, Self-Promotion, Opportunities, News, Ideas.

Title: ${post.title}
Content: ${post.selftext}` }],
          system: `You are an AI assistant that analyzes Reddit posts. Your task is to extract keywords, provide a brief summary, and categorize each post into one or more predefined categories. Use the following format for your response:

Keywords: [comma-separated list of keywords]
Summary: [A brief 1-2 sentence summary of the post]
Categories: [comma-separated list of categories from the following options: Hot Discussions, Top Content, Advice Requests, Pain & Anger, Money Talk, Solution Requests, Self-Promotion, Opportunities, News, Ideas]

Ensure that your analysis is concise and accurately captures the essence of the post. Assign categories based on the content and tone of the post, and you may assign multiple categories if appropriate.`,
          model: "claude-3-5-sonnet-20240620",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const analysisResult = data.content[0].text;

      const keywordsMatch = analysisResult.match(/Keywords: (.*)/);
      const summaryMatch = analysisResult.match(/Summary: (.*)/);
      const categoriesMatch = analysisResult.match(/Categories: (.*)/);

      return {
        ...post,
        keywords: keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : [],
        summary: summaryMatch ? summaryMatch[1].trim() : '',
        categories: categoriesMatch ? categoriesMatch[1].split(',').map(c => c.trim()) : [],
      };
    } catch (error) {
      console.error('Error analyzing post:', error);
      return post;
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleSubredditClick = (subreddit) => {
    setSelectedSubreddit(subreddit);
    fetchSubredditPosts(subreddit.name);
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      const newGroup = {
        name: newGroupName.trim(),
        subreddits: selectedSubredditsForGroup
      };
      setGroups([...groups, newGroup]);
      setNewGroupName('');
      setSelectedSubredditsForGroup([]);
      setShowGroupPopup(false);
    }
  };

  const handleAddToGroup = (group, subreddit) => {
    const updatedGroups = groups.map(g => {
      if (g.name === group.name && !g.subreddits.some(s => s.id === subreddit.id)) {
        return { ...g, subreddits: [...g.subreddits, subreddit] };
      }
      return g;
    });
    setGroups(updatedGroups);
  };

  const handleRemoveFromGroup = (groupName, subredditId) => {
    const updatedGroups = groups.map(group => {
      if (group.name === groupName) {
        return {
          ...group,
          subreddits: group.subreddits.filter(s => s.id !== subredditId)
        };
      }
      return group;
    });
    setGroups(updatedGroups);
  };

  const handleGroupClick = async (group) => {
    setSelectedGroup(group);
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const postsData = await Promise.all(group.subreddits.map(subreddit =>
        fetch(`https://www.reddit.com/r/${subreddit.name}/hot.json?limit=5`)
          .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          })
          .then(data => {
            if (!data || !data.data || !data.data.children) {
              throw new Error('Unexpected data structure from Reddit API');
            }
            return data.data.children.map(child => ({
              id: child.data.id,
              title: child.data.title,
              url: `https://reddit.com${child.data.permalink}`,
              author: child.data.author,
              score: child.data.score,
              numComments: child.data.num_comments,
              created: new Date(child.data.created_utc * 1000).toLocaleDateString(),
              subreddit: subreddit.name,
              selftext: child.data.selftext
            }));
          })
          .catch(error => {
            console.error(`Error fetching posts for r/${subreddit.name}:`, error);
            return []; // Return an empty array if there's an error, so other subreddits can still load
          })
      ));

      const flattenedPosts = postsData.flat();
      setPosts(flattenedPosts);

      // Only analyze posts if there are any
      if (flattenedPosts.length > 0) {
        const analyzedPostsData = await Promise.all(flattenedPosts.map(analyzePostContent));
        setAnalyzedPosts(analyzedPostsData);
      } else {
        setAnalyzedPosts([]);
        setPostIdeas([]);
        setErrorMessage("No posts were fetched. There might be an issue with the Reddit API or the selected subreddits.");
      }
    } catch (err) {
      setError(`Failed to fetch and analyze posts for group: ${err.message}`);
      setErrorMessage(`Failed to fetch and analyze posts for group: ${err.message}`);
      console.error('Error fetching and analyzing group posts:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchComments = async (postId, subreddit) => {
    try {
      const response = await fetch(`https://www.reddit.com/r/${subreddit}/comments/${postId}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data[1] && data[1].data && data[1].data.children) {
        const fetchedComments = data[1].data.children
          .filter(child => child.kind === 't1')
          .map(child => ({
            id: child.data.id,
            author: child.data.author,
            body: child.data.body,
            score: child.data.score,
            created: new Date(child.data.created_utc * 1000).toLocaleDateString()
          }));
        setComments(fetchedComments);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const handlePostClick = async (post) => {
    setSelectedPost(post);
    setPostContent(post.selftext);
    fetchComments(post.id, post.subreddit);
    generateCommentSuggestion(post.id, post.title, post.selftext);
  };

  const handleSubredditSelection = (subreddit) => {
    setSelectedSubredditsForGroup(prev =>
      prev.some(s => s.id === subreddit.id)
        ? prev.filter(s => s.id !== subreddit.id)
        : [...prev, subreddit]
    );
  };

  const generatePostIdeasAfterRender = async () => {
    if (analyzedPosts.length > 0 && postIdeas.length === 0) {
      setIsGeneratingIdeas(true);
      try {
        await generatePostIdeas(analyzedPosts);
      } finally {
        setIsGeneratingIdeas(false);
      }
    }
  };

  const filterBadges = [
    { label: 'All', icon: Home, description: 'All posts' },
    { label: 'Hot Discussions', icon: Flame, description: 'Popular discussions this week' },
    { label: 'Top Content', icon: Trophy, description: 'Best-performing content of past month' },
    { label: 'Advice Requests', icon: HelpCircle, description: 'People asking for advice & resources' },
    { label: 'Pain & Anger', icon: Frown, description: 'People expressing pain points & frustrations' },
    { label: 'Money Talk', icon: DollarSign, description: 'People talking about spending money' },
    { label: 'Solution Requests', icon: PenTool, description: 'People asking for tools & solutions' },
    { label: 'Self-Promotion', icon: Megaphone, description: 'People launching products & services' },
    { label: 'Opportunities', icon: Zap, description: 'Conversations about things that can be improved' },
    { label: 'News', icon: Newspaper, description: 'Conversations about current news & events' },
    { label: 'Ideas', icon: Lightbulb, description: 'People suggesting ideas' },
  ];

  const sortedCommunities = [...displayedCommunities].sort((a, b) => {
    if (sortColumn) {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const renderPostIdeas = () => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Post Ideas</h3>
      {isGeneratingIdeas ? (
        <div className="text-center p-4">
          <p className="text-gray-600">Generating post ideas for these subreddits...please wait...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {postIdeas.map((idea, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4">
              <h4 className="font-semibold text-blue-600">{idea.title}</h4>
              <p className="text-sm text-gray-600 mt-2">{idea.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderComments = () => (
    <div>
      <h3 className="text-lg font-semibold mb-2">Comments</h3>
      {commentSuggestions[selectedPost.id] && (
        <div className="bg-blue-100 border border-blue-500 text-blue-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Suggested Comment: </strong>
          <span className="block sm:inline">{commentSuggestions[selectedPost.id]}</span>
        </div>
      )}
      {comments.length > 0 ? (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="border-b pb-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>u/{comment.author}</span>
                <span>{comment.created}</span>
              </div>
              <p className="text-sm">{comment.body}</p>
              <div className="text-xs text-gray-500 mt-1">
                Score: {comment.score}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No comments available.</p>
      )}
    </div>
  );

  if (loading && communities.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCcw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && communities.length === 0) {
    return (
      <div className="text-center p-4 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}
      <div>
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
          <Tab label="Audiences" icon={Users} active={activeTab === 'groups'} onClick={() => setActiveTab('groups')} />
          <Tab label="Popular" icon={Flame} active={activeTab === 'popular'} onClick={() => setActiveTab('popular')} />
          <Tab label="Trending" icon={TrendingUp} active={activeTab === 'trending'} onClick={() => setActiveTab('trending')} />
          <Tab label="New" icon={Shuffle} active={activeTab === 'new'} onClick={() => setActiveTab('new')} />
        </div>

        <div className='bg-gray-50 border p-2 sm:p-4'>
          {activeTab !== 'groups' && (
            <div className="mb-4 sm:mb-6 relative">
              <input
                type="text"
                placeholder="Search subreddits..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-3 sm:px-4 py-2 pl-8 sm:pl-10 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          )}

          {activeTab !== 'groups' && !selectedSubreddit && !selectedGroup && (
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    {['Community', 'Members', 'Weekly', 'Monthly'].map((header) => (
                      <th
                        key={header}
                        className="px-2 sm:px-4 py-2 sm:py-3 text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort(header.toLowerCase().replace(' ', ''))}
                      >
                        <div className="flex items-center">
                          {header}
                          <SortIcon column={header.toLowerCase().replace(' ', '')} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedCommunities.map((community, index) => (
                    <tr
                      key={community.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                      ref={index === sortedCommunities.length - 1 ? lastCommunityElementRef : null}
                    ><td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900">
                    <button onClick={() => handleSubredditClick(community)} className="hover:underline">
                      {community.name}
                    </button>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-500">
                    {community.subscribersCount.toLocaleString()}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-green-600">
                    +{community.growthPerWeek.toLocaleString()}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-green-600">
                    +{community.growthPerMonth.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'groups' && !selectedGroup && (
        <div>
          <div className='items-center flex justify-between mb-4'>
            <h6 className='font-bold text-lg sm:text-xl flex items-center'>
            <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Curated Audiences
            </h6>
            <button
              onClick={() => setShowGroupPopup(true)}
              className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center text-xs sm:text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Create Group
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <div
                key={group.name}
                className="bg-white rounded-lg shadow p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                onClick={() => handleGroupClick(group)}
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 flex items-center justify-between">
                  <span>{group.name}</span>
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  {group.subreddits.length} subreddit{group.subreddits.length !== 1 ? 's' : ''}
                </p>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {group.subreddits.slice(0, 5).map((subreddit) => (
                    <span key={subreddit.id} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                      {subreddit.name}
                    </span>
                  ))}
                  {group.subreddits.length > 5 && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                      +{group.subreddits.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(selectedSubreddit || selectedGroup) && (
        <div className="mt-4 sm:mt-8">
          <button
            onClick={() => {
              setSelectedSubreddit(null);
              setSelectedGroup(null);
              setSelectedPost(null);
            }}
            className="mb-4 px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center text-xs sm:text-sm"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Back to {activeTab === 'groups' ? 'Groups' : 'Communities'}
          </button>
          {selectedGroup ? (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                {selectedGroup.name} Group
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedGroup.subreddits.map((subreddit) => (
                  <a
                    key={subreddit.id}
                    href={`https://reddit.com/r/${subreddit.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm hover:bg-blue-200 transition-colors duration-200 flex items-center"
                  >
                    r/{subreddit.name}
                    <ExternalLink className="w-3 h-3 ml-1 inline-block" />
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
              r/{selectedSubreddit.name}
            </h2>
          )}
          <div className="mb-4 sm:mb-6 flex flex-wrap gap-1 sm:gap-2">
            {filterBadges.map((badge) => (
              <button
                key={badge.label}
                onClick={() => setActiveFilter(badge.label === 'All' ? 'all' : badge.label)}
                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center ${
                  activeFilter === (badge.label === 'All' ? 'all' : badge.label)
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-white border text-gray-700'
                }`}
              >
                <badge.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {badge.label}
              </button>
            ))}
          </div>
          {isAnalyzing && (
            <div className="text-center p-4">
              <RefreshCcw className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-600 mx-auto" />
              <p className="mt-2 text-gray-600 text-sm sm:text-base">Fetching and Analyzing posts...</p>
            </div>
          )}
          {!isAnalyzing && !selectedPost && (
            <>
              {renderPostIdeas()}
              <ul className="space-y-4">
                {(analyzedPosts.length > 0 ? analyzedPosts : posts)
                  .filter(post => activeFilter === 'all' || (post.categories && post.categories.includes(activeFilter)))
                  .map((post) => (
                    <li key={post.id} className="bg-white rounded-lg shadow p-3 sm:p-4">
                      <button onClick={() => handlePostClick(post)} className="w-full text-left hover:bg-gray-50 transition-colors duration-200 p-2 rounded">
                        <div className="flex justify-between text-xs sm:text-sm text-gray-500 mb-2">
                          <span>Posted by u/{post.author} {selectedGroup && `in r/${post.subreddit}`}</span>
                          <span>{post.created}</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">{post.title}</h3>
                        {post.summary && <p className="text-xs sm:text-sm text-gray-600 mb-2">{post.summary}</p>}
                        {post.categories && (
                          <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                            {post.categories.map((category, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {category}
                              </span>
                            ))}
                          </div>
                        )}
                        {post.keywords && (
                          <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                            {post.keywords.slice(0, 5).map((keyword, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center text-xs sm:text-sm text-gray-600">
                          <span className="mr-4 flex items-center"><Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> {post.score}</span>
                          <span className="flex items-center"><MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> {post.numComments}</span>
                        </div>
                      </button>
                    </li>
                  ))}
              </ul>
            </>
          )}
          {selectedPost && (
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <button
                onClick={() => setSelectedPost(null)}
                className="mb-4 text-blue-500 hover:text-blue-600 flex items-center text-sm sm:text-base"
              >
                <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Back to posts
              </button>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">{selectedPost.title}</h2>
              <div className="flex justify-between text-xs sm:text-sm text-gray-500 mb-4">
                <span>Posted by u/{selectedPost.author} {selectedGroup && `in r/${selectedPost.subreddit}`}</span>
                <span>{selectedPost.created}</span>
              </div>
              <div className="prose text-sm sm:text-base mb-4">
                {postContent}
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <span className="mr-4 flex items-center"><Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> {selectedPost.score}</span>
                  <span className="flex items-center"><MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> {selectedPost.numComments}</span>
                </div>
                <a
                  href={selectedPost.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center text-xs sm:text-sm"
                >
                  View on Reddit
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                </a>
              </div>
              {renderComments()}
            </div>
          )}
        </div>
      )}
    </div>
  </div>

  {showGroupPopup && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full sm:w-3/4 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Create New Group</h2>
          <button onClick={() => setShowGroupPopup(false)} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        <input
          type="text"
          placeholder="Group name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 text-sm sm:text-base"
        />
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Search subreddits..."
            value={groupSearchTerm}
            onChange={(e) => setGroupSearchTerm(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 pl-8 sm:pl-10 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
          <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <div className="bg-white rounded-lg shadow overflow-x-auto mb-4">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Select
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Subreddit
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Members
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {communities
                    .filter(community => community.name.toLowerCase().includes(groupSearchTerm.toLowerCase()))
                    .map((community) => (
                      <tr key={community.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedSubredditsForGroup.some(s => s.id === community.id)}
                            onChange={() => handleSubredditSelection(community)}
                            className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-blue-600"
                          />
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900">
                          {community.name}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-500">
                        {community.subscribersCount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end space-x-2 sticky bottom-0 bg-white py-4">
              <button
                onClick={() => setShowGroupPopup(false)}
                className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center text-xs sm:text-sm"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center text-xs sm:text-sm"
              >
                <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Save Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedditExplorer;

                    