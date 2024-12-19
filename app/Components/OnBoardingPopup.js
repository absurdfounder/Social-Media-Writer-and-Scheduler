"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle2, Check, Sparkles,
  GithubIcon, Infinity
} from 'lucide-react';
import { Login } from './Login';

const OnBoardingPopup = ({ isOpen: propIsOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(propIsOpen);

  const plans = [
    {
      name: "Curious Cat",
      price: "$22/month",
      billedAs: "Billed $264 yearly",
      description: "Unlimited AI web scraping",
      features: [
        "Unlimited scraping requests",
        "AI-powered data extraction",
        "Multi-format exports",
        "API access",
        "Standard support",
        "Open AI Key Support"
      ]
    },
    {
      name: "Lifetime Kitten",
      popular: true,
      price: "$69",
      billedAs: "One-time payment forever",
      description: "Most popular - endless scraping power",
      features: [
        "Everything in yearly plan",
        "Priority queue processing",
        "Advanced parsing rules",
        "Premium support",
        "Future updates included",
        "Open AI Key Support"
      ]
    }
  ];

  useEffect(() => {
    // Check authentication status on mount and when localStorage changes
    const checkAuth = () => {
      const userData = localStorage.getItem('userData');
      const parsedUser = userData ? JSON.parse(userData) : null;
      setUser(parsedUser);

      // If user is logged in, close the popup
      if (parsedUser) {
        setIsOpen(false);
        onClose();
      }
    };

    // Initial check
    checkAuth();

    // Listen for changes in localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'userData') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom login event
    const handleLoginEvent = () => {
      checkAuth();
    };

    window.addEventListener('userLoggedIn', handleLoginEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleLoginEvent);
    };
  }, [onClose]);

  // Set isOpen based on prop changes
  useEffect(() => {
    // Only update if user is not logged in
    if (!user) {
      setIsOpen(propIsOpen);
    }
  }, [propIsOpen, user]);

  // Handle close - only allow if user is logged in
  const handleClose = () => {
    if (user) {
      setIsOpen(false);
      onClose();
    }
  };

  // Prevent click propagation on modal content
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  // Don't render anything if user is logged in and popup is closed
  if (user && !isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      {(isOpen || !user) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-scroll"
          style={{ pointerEvents: !user ? 'all' : 'auto' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-blue-100 via-white to-indigo-100 text-gray-800 rounded-xl shadow-lg max-w-6xl w-full h-screen overflow-scroll mt-8 p-8 py-2"
            onClick={handleContentClick}
          >
            <div className="p-6 text-center mt-8 space-y-4">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-2 w-full m-auto">
                  <img src="/logo.png" alt="big mouth logo" className="w-fit h-16 m-auto" />
                </div>
                {user && (
                  <button
                    onClick={handleClose}
                    className="fixed top-4 right-4 text-gray-400 hover:text-gray-500"
                  >
                    <X size={24} />
                  </button>
                )}
              </div>

              <div>

<section>
  <h2
    className="text-center text-slate-700 max-w-2xl mx-auto sm:text-3xl md:text-5xl"
    style={{ lineHeight: "1.5" }}
  >
    <span>
      Get <b className="text-blue-500">more customers</b>
    </span>
    <span> from</span>
    <br />
  </h2>
  <div className="flex flex-wrap justify-center gap-4 mt-4 ">
    <span className="font-bold text-blue-400 bg-blue-100 border-blue-400 border rounded-full px-4 py-2 font-sans flex items-center whitespace-nowrap sm:text-xl md:text-4xl leading-none">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/X_logo.jpg/768px-X_logo.jpg"
        alt="X logo"
        className="w-8 h-8 rounded-lg mr-2"
      />
      X
    </span>
    <span className="font-bold text-pink-500 bg-pink-100 border-pink-500 border rounded-full px-4 py-2 font-sans flex items-center whitespace-nowrap sm:text-xl md:text-4xl leading-none">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/1200px-Instagram_icon.png"
        alt="Instagram logo"
        className="w-8 h-8 rounded-lg mr-2"
      />
      IG
    </span>
    <span className="font-bold text-gray-600 bg-gray-200 border-gray-800 border rounded-full px-4 py-2 font-sans flex items-center whitespace-nowrap sm:text-xl md:text-4xl leading-none">
      <img
        src="https://p16-va-tiktok.ibyteimg.com/obj/musically-maliva-obj/a45cf75986e5f90595049b68725bfd87.png"
        alt="TikTok logo"
        className="w-8 h-8 rounded-lg mr-2"
      />
      TikTok
    </span>
    <span className="font-bold text-red-500 bg-red-100 border-red-400 border rounded-full px-4 py-2 font-sans flex items-center whitespace-nowrap sm:text-xl md:text-4xl leading-none">
      <img
        src="https://seeklogo.com/images/R/reddit-logo-23F13F6A6A-seeklogo.com.png"
        alt="Reddit logo"
        className="w-8 h-8 rounded-lg mr-2"
      />
      Reddit
    </span>
  </div>
  <h2 className="mt-4 text-center text-slate-700 max-w-2xl mx-auto sm:text-3xl md:text-5xl mb-6">
    using <b className="text-blue-500">AI trained</b> on <b className="text-blue-500">your brand</b>.
  </h2>
</section>


                <p className="text-lg text-gray-500 mb-8 flex gap-4 m-auto justify-center mt-2">
                  <CheckCircle2 size={18} className='m-auto mx-0 text-green-500' />Train a robot in 2 mins
                  <CheckCircle2 size={18} className='m-auto mx-0 text-green-500' /> No-Code Required
                </p>
              </div>

              <div className='flex gap-4 mx-auto justify-center w-full'>


                <Login />


              </div>

              <div className="text-center grid text-sm text-gray-500 w-full m-auto">
                <p>Join 1000+ creators & companies</p>
                <div className="flex items-center gap-0 z-0 w-full justify-center mt-4">
                  <div className="relative w-[30px] h-[30px] rounded-[30px] overflow-hidden -mr-1 z-[-1] shadow-[0px_0px_0px_2px_var(--bg0)]">
                    <div className="absolute inset-0 rounded-[30px] border border-black/10"></div>
                    <img className="bg-typ-c4 w-[30px] h-[30px] rounded-[30px]" loading="lazy" alt="@SahilBloom" src="https://avatars.typefully.com/SahilBloom" />
                  </div>
                  <div className="relative w-[30px] h-[30px] rounded-[30px] overflow-hidden -mr-1 z-[-1] shadow-[0px_0px_0px_2px_var(--bg0)]">
                    <div className="absolute inset-0 rounded-[30px] border border-black/10"></div>
                    <img className="bg-typ-c4 w-[30px] h-[30px] rounded-[30px]" loading="lazy" alt="@blakeaburge" src="https://avatars.typefully.com/blakeaburge" />
                  </div>
                  <div className="relative w-[30px] h-[30px] rounded-[30px] overflow-hidden -mr-1 z-[-1] shadow-[0px_0px_0px_2px_var(--bg0)]">
                    <div className="absolute inset-0 rounded-[30px] border border-black/10"></div>
                    <img className="bg-typ-c4 w-[30px] h-[30px] rounded-[30px]" loading="lazy" alt="@david_perell" src="https://avatars.typefully.com/david_perell" />
                  </div>
                  <div className="relative w-[30px] h-[30px] rounded-[30px] overflow-hidden -mr-1 z-[-1] shadow-[0px_0px_0px_2px_var(--bg0)]">
                    <div className="absolute inset-0 rounded-[30px] border border-black/10"></div>
                    <img className="bg-typ-c4 w-[30px] h-[30px] rounded-[30px]" loading="lazy" alt="@marc_louvion" src="https://avatars.typefully.com/marc_louvion" />
                  </div>
                  <div className="relative w-[30px] h-[30px] rounded-[30px] overflow-hidden -mr-1 z-[-1] shadow-[0px_0px_0px_2px_var(--bg0)]">
                    <div className="absolute inset-0 rounded-[30px] border border-black/10"></div>
                    <img className="bg-typ-c4 w-[30px] h-[30px] rounded-[30px]" loading="lazy" alt="@svpino" src="https://avatars.typefully.com/svpino" />
                  </div>
                  <div className="relative w-[30px] h-[30px] rounded-[30px] overflow-hidden -mr-1 z-[-1] shadow-[0px_0px_0px_2px_var(--bg0)]">
                    <div className="absolute inset-0 rounded-[30px] border border-black/10"></div>
                    <img className="bg-typ-c4 w-[30px] h-[30px] rounded-[30px]" loading="lazy" alt="@heyeaslo" src="https://avatars.typefully.com/heyeaslo" />
                  </div>
                  <div className="relative w-[30px] h-[30px] rounded-[30px] overflow-hidden -mr-1 z-[-1] shadow-[0px_0px_0px_2px_var(--bg0)]">
                    <div className="absolute inset-0 rounded-[30px] border border-black/10"></div>
                    <img className="bg-typ-c4 w-[30px] h-[30px] rounded-[30px]" loading="lazy" alt="@aaditsh" src="https://avatars.typefully.com/aaditsh" />
                  </div>
                  <div className="relative w-[30px] h-[30px] rounded-[30px] overflow-hidden -mr-1 z-[-1] shadow-[0px_0px_0px_2px_var(--bg0)]">
                    <div className="absolute inset-0 rounded-[30px] border border-black/10"></div>
                    <img className="bg-typ-c4 w-[30px] h-[30px] rounded-[30px]" loading="lazy" alt="@LinusEkenstam" src="https://avatars.typefully.com/LinusEkenstam" />
                  </div>
                  <div className="relative w-[30px] h-[30px] rounded-[30px] overflow-hidden -mr-1 z-[-1] shadow-[0px_0px_0px_2px_var(--bg0)]">
                    <div className="absolute inset-0 rounded-[30px] border border-black/10"></div>
                    <img className="bg-typ-c4 w-[30px] h-[30px] rounded-[30px]" loading="lazy" alt="@marckohlbrugge" src="https://avatars.typefully.com/marckohlbrugge" />
                  </div>
                </div>



              </div>
            </div>




            <section className="relative">
              <div className="relative max-w-6xl mx-auto px-8 sm:px-6">

                <div className='p-4'>


                  <section className="py-12 mt-8 mb-8 md:flex sm:grid">
                    <div className="md:w-1/2 sm:w-full">
                      <div className="text-start mt-6 w-full p-4">
                        <h2 className="h2 text-4xl font-semibold mb-4 font-bold font-normal">Finds & extracts urls <span className="font-source-serif-4 font-normal text-blue-600 border-b-4 border-blue-200">in seconds.</span></h2>
                        <p className="text-gray-700">
                          Moving your Blog or Directory to another CMS like <a href='boringsites.com'>BoringSites</a> or Ghost , we got you covered just dump the whole sitemap with all the urls, it will structure all the urls.
                        </p>
                        <p className="text-lg text-gray-500 mb-8 grid gap-4 m-auto justify-start mt-4">
                          <span className='flex gap-4'><CheckCircle2 size={18} className='m-auto mx-0 text-green-500' />Curation of URLs</span>
                          <span className='flex gap-4'><CheckCircle2 size={18} className='m-auto mx-0 text-green-500' /> Sitemap Imports</span>
                        </p>
                        <div className="max-w-xs mx-auto sm:max-w-none sm:flex aos-init aos-animate mt-6" data-aos="zoom-y-out" data-aos-delay="300">
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-start mt-6 md:w-1/2 sm:w-full rounded">
                      <div><img alt="image" loading="lazy" width="80" height="100" decoding="async" data-nimg="1" className="w-full rounded" src="https://dazzling-cat.netlify.app/seograph.png" /></div>
                    </div>
                  </section>

                  <section className="py-12 mt-8 mb-8 md:flex sm:grid">
                    <div className="md:w-1/2 sm:w-full">
                      <div className="text-start mt-6 w-full p-4">
                        <h2 className="h2 text-4xl font-semibold mb-4 font-bold font-normal">Scrape content <span className="font-source-serif-4 font-normal text-blue-600 border-b-4 border-blue-200">without worrying about bots.</span></h2>
                        <p className="text-gray-700">
                          With JavaScript rendering, no worries all the scraping is done in your own browser. No need for a headless browser. Or worried about getting blocked by Bot Protection. Making sure your data pipeline is unhindered.
                        </p>

                        <p className="text-lg text-gray-500 mb-8 grid gap-4 m-auto justify-start mt-4">
                          <span className='flex gap-4'><CheckCircle2 size={18} className='m-auto mx-0 text-green-500' />Deep-Scraping</span>
                          <span className='flex gap-4'><CheckCircle2 size={18} className='m-auto mx-0 text-green-500' />IP Proxy Rotation - not needed</span>
                        </p>


                      </div>
                    </div>
                    <div className="flex justify-start mt-6 md:w-1/2 sm:w-full rounded">
                      <div><img alt="image" loading="lazy" width="80" height="100" decoding="async" data-nimg="1" className="w-full rounded" src="https://dazzling-cat.netlify.app/notion%20to%20website.png" /></div>
                    </div>
                  </section>
                  <section className="py-12 mt-8 mb-8 md:flex sm:grid">
                    <div className="md:w-1/2 sm:w-full">
                      <div className="text-start mt-6 w-full p-4">
                        <h2 className="h2 text-4xl font-semibold mb-4 font-bold font-normal">Cleaning AI agent <span className="font-source-serif-4 font-normal text-blue-600 border-b-4 border-blue-200">that follows what you asked.</span></h2>
                        <p className="text-gray-700">
                          Focus on extracting the data you need, not dealing with inefficient formatting in data.  We use OpenAI Assistants so that you can control what you want to extract and how you want it to be written for you.
                        </p>
                        <p className="text-lg text-gray-500 mb-8 grid gap-4 m-auto justify-start mt-4">
                          <span className='flex gap-4'><CheckCircle2 size={18} className='m-auto mx-0 text-green-500' />Open AI Key Supported</span>
                          <span className='flex gap-4'><CheckCircle2 size={18} className='m-auto mx-0 text-green-500' />Rewrite the content using AI</span>
                        </p>


                      </div>
                    </div>
                    <div className="flex justify-start mt-6 md:w-1/2 sm:w-full rounded">
                      <div><img alt="image" loading="lazy" width="80" height="100" decoding="async" data-nimg="1" className="w-full rounded" src="https://dazzling-cat.netlify.app/notion to website.png" /></div>
                    </div>
                  </section>
                  <section className="py-12 mt-8 mb-8 md:flex sm:grid">
                    <div className="md:w-1/2 sm:w-full">
                      <div className="text-start mt-6 w-full p-4">
                        <h2 className="h2 text-4xl font-semibold mb-4 font-bold font-normal">World-class <span className="font-source-serif-4 font-normal text-blue-600 border-b-4 border-blue-200">Speed & Performance</span></h2>
                        <p className="text-gray-700">
                          As we use your own browser to scrape, which is why there is zero latency and everyhting is blazingly fast.
                        </p>
                        <p className="text-lg text-gray-500 mb-8 grid gap-4 m-auto justify-start mt-4">
                          <span className='flex gap-4'><CheckCircle2 size={18} className='m-auto mx-0 text-green-500' />Scrape in Seconds</span>
                          <span className='flex gap-4'><CheckCircle2 size={18} className='m-auto mx-0 text-green-500' />Your browser, Real Human!</span>
                        </p>

                      </div>
                    </div>
                    <div className="flex justify-start mt-6 md:w-1/2 sm:w-full rounded">
                      <div><img alt="image" loading="lazy" width="80" height="100" decoding="async" data-nimg="1" className="w-full rounded" src="https://dazzling-cat.netlify.app/performancewebsite.png" /></div>
                    </div>
                  </section>
                  <section className="py-12 mt-8 mb-8 md:flex sm:grid">
                    <div className="md:w-1/2 sm:w-full">
                      <div className="text-start mt-6 w-full p-4">
                        <h2 className="h2 text-4xl font-semibold mb-4 font-bold font-normal">Publish cleaned content <span className="font-source-serif-4 font-normal text-blue-600 border-b-4 border-blue-200">on <b className='font-bold text-gray-900'>Notion</b> with a click.</span></h2>
                        <p className="text-gray-700">
                          After cleaning the data accordingly to specifications, pulish content directly on a notion database and build your own listicles or curated database and share it with the world.
                        </p>

                        <p className="text-lg text-gray-500 mb-8 grid gap-4 m-auto justify-start mt-4">
                          <span className='flex gap-4'><CheckCircle2 size={18} className='m-auto mx-0 text-green-500' />Deep-Scraping</span>
                          <span className='flex gap-4'><CheckCircle2 size={18} className='m-auto mx-0 text-green-500' />All JavaScript libraries supported</span>
                        </p>

                        <div className="max-w-xs mx-auto sm:max-w-none sm:flex aos-init aos-animate mt-6" data-aos="zoom-y-out" data-aos-delay="300">
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-start mt-6 md:w-1/2 sm:w-full rounded">
                      <div><img alt="image" loading="lazy" width="80" height="100" decoding="async" data-nimg="1" className="w-full rounded" src="https://dazzling-cat.netlify.app/write%20on%20notion.png" /></div>
                    </div>
                  </section>

                  <section className="py-12 mt-8 mb-8 md:flex sm:grid">
                    <div className="md:w-1/2 sm:w-full">
                      <div className="text-start mt-6 w-full p-4">
                        <h2 className="h2 text-4xl font-semibold mb-4 font-bold font-normal">Download  <span className="font-source-serif-4 font-normal text-blue-600 border-b-4 border-blue-200">or <b className='text-gray-900'>Export data</b> wherever you want.</span></h2>
                        <p className="text-gray-700">
                          With big mouth you can either have the data on notion and host it on Boring Sites, or export and host it on other website builders like Unicorn Platform, Webflow, or even move to Google Sheets.
                        </p>
                        <p className="text-lg text-gray-500 mb-8 grid gap-4 m-auto justify-start mt-4">
                          <span className='flex gap-4'><CheckCircle2 size={18} className='m-auto mx-0 text-green-500' />Download Scrapped Content</span>
                          <span className='flex gap-4'><CheckCircle2 size={18} className='m-auto mx-0 text-green-500' /><span>Host your curation on <a href="boringsites.com" className='text-blue-600'>BoringSites</a>.</span></span>
                        </p>

                        <div className="max-w-xs mx-auto sm:max-w-none sm:flex aos-init aos-animate mt-6" data-aos="zoom-y-out" data-aos-delay="300">
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-start mt-6 md:w-1/2 sm:w-full rounded">
                      <div><img alt="image" loading="lazy" width="80" height="100" decoding="async" data-nimg="1" className="w-full rounded" src="https://dazzling-cat.netlify.app/integrationsdb.png" /></div>
                    </div>
                  </section>



                  <section>
                    {/* Content */}
                    <div className="p-6">
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700">
                          Choose Your Purrfect Plan
                        </h3>
                        <p className="text-gray-600 mt-2">Unlimited AI-Powered Web Scraping</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8 max-w-4xl m-auto">
                        {plans.map((plan) => (
                          <div
                            key={plan.name}
                            className={`relative rounded-lg border p-6 transition-all hover:shadow-lg bg-white
                                 ${plan.popular ? 'border-2 border-blue-500' : ''}`}
                          >
                            {plan.popular && (
                              <div className="absolute top-4 right-4 flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-3 py-1 rounded-full">
                                <Sparkles className="h-4 w-4" />
                                <span className="text-sm font-medium">Most Popular</span>
                              </div>
                            )}

                            <div className="mb-4">
                              <h3 className="text-xl font-semibold flex items-center gap-2">
                                {plan.name}
                                <Infinity className="h-5 w-5 text-blue-500" />
                              </h3>
                              <p className="text-gray-500">{plan.description}</p>
                            </div>

                            <div className="mb-6">
                              <p className="text-3xl font-bold">{plan.price}</p>
                              <p className="text-sm text-gray-500">{plan.billedAs}</p>
                            </div>

                            <ul className="space-y-3 mb-6">
                              {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center gap-2">
                                  <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Check className="h-3 w-3 text-blue-600" />
                                  </div>
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>

                            <button
                              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors
                                  ${plan.popular
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-500 hover:to-blue-800 text-white'
                                  : 'bg-blue-100 hover:bg-blue-200 text-blue-700'}`}
                            >
                              Get Started
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                </div>
              </div>
              <br />
              <br />
            </section>
            <footer>
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="grid sm:grid-cols-12 gap-8 py-8 md:py-12 border-t border-gray-200 p-8">
                  <div className="sm:col-span-12 lg:col-span-4">
                    <a className="mb-2 bg-slate-700 rounded-full" href="0">
                      <img src="/logo.png" alt="big mouth logo" className="w-fit h-12" />

                      <p className="text-sm text-gray-600 mt-4 mb-4">big mouth is an easy-to-use scapper and cleaner for busy founders. Lead by <a className="text-blue-600" href="https://twitter.com/absurdfounder">@absurdfounder</a>.</p>
                      <p className="mb-2 text-sm text-gray-400">big mouth is not related with Notion™ the company in any way.</p>
                    </a>
                    <div className="text-sm text-gray-600">
                      <a className="text-gray-600 hover:text-gray-900 hover:underline transition duration-150 ease-in-out" href="/terms">Terms</a> ·
                      <a className="text-gray-600 hover:text-gray-900 hover:underline transition duration-150 ease-in-out" href="/privacy">Privacy Policy</a>
                    </div>
                  </div>
                  <div className="sm:col-span-6 md:col-span-3 lg:col-span-3">
                    <h6 className="text-gray-800 font-medium mb-2">Product</h6>
                    <ul className="text-sm">
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="https://bigmouth.dev">big mouth App</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="https://bigmouth.dev/blog">Blog</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="https://bigmouth.dev/changelog">Changelog</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/integration">Pre-Built Robo Agents</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/pricing">Pricing</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/pricing">Helpdesk</a></li>
                    </ul>
                  </div>
                  <div className="sm:col-span-6 md:col-span-3 lg:col-span-5">
                    <h6 className="text-gray-800 font-medium mb-2">Use Cases</h6>
                    <ul className="text-sm">
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/agency">Extract data from any website just point and click</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/migrating-to-big mouth">Migrate data to Boring Sites</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/agency">Turn websites into APIs</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/create-a-blog-notion">Price monitoring</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/create-a-directory-notion">Product data extraction</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/create-a-documentation-notion">Lead generation</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/create-a-helpdesk-servicedesk-notion">Sentiment analysis</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/create-a-knowledge-base-notion">News and content aggregation</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/create-a-marketplace-notion">Job post curation and monitoring</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/create-a-company-wiki-notion">Stock and financial data extraction</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/create-a-company-wiki-notion">Travel and hospitality data collection</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/create-a-company-wiki-notion">Monitoring patent and trademark databases</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/create-a-company-wiki-notion">Retail store and location data</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/create-a-company-wiki-notion">Data extraction for recruitment</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/create-a-company-wiki-notion">Data extraction for law firms</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/create-a-company-wiki-notion">Data extraction for investorst</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/create-a-company-wiki-notion">Data extraction for real estate companies</a></li>

                    </ul>
                  </div>

                </div>
                <div className="md:flex md:items-center md:justify-between py-4 md:py-8 border-t border-gray-200">
                  <ul className="flex mb-4 md:order-1 md:ml-4 md:mb-0">
                    <li>
                      <a
                        className="flex justify-center items-center text-gray-600 hover:text-gray-900 bg-white hover:bg-white-100 rounded-full shadow transition duration-150 ease-in-out border px-4"
                        aria-label="Twitter"
                        href="https://twitter.com/absurdfounder"
                      >
                        <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                          <path d="m13.063 9 3.495 4.475L20.601 9h2.454l-5.359 5.931L24 23h-4.938l-3.866-4.893L10.771 23H8.316l5.735-6.342L8 9h5.063Zm-.74 1.347h-1.457l8.875 11.232h1.36l-8.778-11.232Z"></path>
                        </svg>
                        <span className="mr-2">Lets connect on X</span>
                      </a>
                    </li>
                    <li className="ml-4">
                      <a
                        className="flex justify-center items-center text-gray-600 hover:text-gray-900 bg-white hover:bg-white-100 rounded-full shadow transition duration-150 ease-in-out border px-4"
                        aria-label="Github"
                        href="https://github.com/SuperHuman12"
                      >
                        <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M16 8.2c-4.4 0-8 3.6-8 8 0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4V22c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.7 3.9.3.4.6.9.6 1.6v2.2c0 .2.1.5.6.4 3.2-1.1 5.5-4.1 5.5-7.6-.1-4.4-3.7-8-8.1-8z"
                          ></path>
                        </svg>
                        <span className="mr-2">Track my commits</span>
                      </a>
                    </li>
                  </ul>
                  <div className="text-sm text-gray-600 mr-4">© Boring Sites LLC. All rights reserved.</div>
                </div>
              </div>
            </footer>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnBoardingPopup;