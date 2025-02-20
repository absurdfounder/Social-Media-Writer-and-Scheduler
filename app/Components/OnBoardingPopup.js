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
      name: "Content Creator",
      price: "$29/month",
      billedAs: "Billed $348 yearly",
      description: "Perfect for growing creators",
      features: [
        "AI-powered content generation",
        "Custom voice training",
        "Multi-platform optimization",
        "Content calendar tools",
        "Basic analytics",
        "Email support"
      ]
    },
    {
      name: "Creator Suite",
      popular: true,
      price: "$89",
      billedAs: "One-time payment forever",
      description: "Everything you need to go viral",
      features: [
        "Everything in monthly plan",
        "Priority content generation",
        "Advanced trend analysis",
        "Viral hooks generator",
        "Performance analytics",
        "Priority support"
      ]
    }
  ];

  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('userData');
      const parsedUser = userData ? JSON.parse(userData) : null;
      setUser(parsedUser);

      if (parsedUser) {
        setIsOpen(false);
        onClose();
      }
    };

    checkAuth();

    const handleStorageChange = (e) => {
      if (e.key === 'userData') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedIn', checkAuth);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', checkAuth);
    };
  }, [onClose]);

  useEffect(() => {
    if (!user) {
      setIsOpen(propIsOpen);
    }
  }, [propIsOpen, user]);

  const handleClose = () => {
    if (user) {
      setIsOpen(false);
      onClose();
    }
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

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
                  <img src="/logo.png" alt="Big Mouth AI" className="w-fit h-16 m-auto" />
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
                    className="text-center text-slate-700 max-w-2xl mx-auto sm:text-3xl md:text-4xl"
                    style={{ lineHeight: "1.5" }}
                  >
                    <span>
                      Get <b className="text-blue-500">more customers</b> from
                    </span>
                    <br />
                  </h2>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    <span className="font-bold text-blue-400 bg-blue-100 border-blue-400 border rounded-full px-4 py-2 font-sans flex items-center whitespace-nowrap sm:text-xl md:text-3xl leading-none">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/X_logo.jpg/768px-X_logo.jpg"
                        alt="X logo"
                        className="w-8 h-8 rounded-lg mr-2"
                      />
                      X
                    </span>
                    <span className="font-bold text-pink-500 bg-pink-100 border-pink-500 border rounded-full px-4 py-2 font-sans flex items-center whitespace-nowrap sm:text-xl md:text-3xl leading-none">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/1200px-Instagram_icon.png"
                        alt="Instagram logo"
                        className="w-8 h-8 rounded-lg mr-2"
                      />
                      Instagram
                    </span>
                    <span className="font-bold text-gray-600 bg-gray-200 border-gray-800 border rounded-full px-4 py-2 font-sans flex items-center whitespace-nowrap sm:text-xl md:text-3xl leading-none">
                      <img
                        src="https://p16-va-tiktok.ibyteimg.com/obj/musically-maliva-obj/a45cf75986e5f90595049b68725bfd87.png"
                        alt="TikTok logo"
                        className="w-8 h-8 rounded-lg mr-2"
                      />
                      TikTok
                    </span>
                    <span className="font-bold text-red-500 bg-red-100 border-red-400 border rounded-full px-4 py-2 font-sans flex items-center whitespace-nowrap sm:text-xl md:text-3xl leading-none">
                      <img
                        src="https://seeklogo.com/images/R/reddit-logo-23F13F6A6A-seeklogo.com.png"
                        alt="Reddit logo"
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      Reddit
                    </span>
                  </div>
                  <h2 className="mt-4 text-center text-slate-700 max-w-2xl mx-auto sm:text-3xl md:text-4xl mb-6">
                    using <b className="text-blue-500">AI trained</b> on <b className="text-blue-500">your brand</b>.
                  </h2>
                </section>

                <p className="text-lg text-gray-500 mb-8 flex gap-4 m-auto justify-center mt-2">
                  <CheckCircle2 size={18} className='m-auto mx-0 text-green-500' />2-minute AI training
                  <CheckCircle2 size={18} className='m-auto mx-0 text-green-500' />No coding needed
                </p>
              </div>

              <div className='flex gap-4 mx-auto justify-center w-full'>
                <Login />
              </div>

              <div className="text-center grid text-sm text-gray-500 w-full m-auto">
                <p>Trusted by 10,000+ creators & brands</p>
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

            <div className="max-w-6xl px-4 mx-auto mt-20 sm:px-6">
              <h3 className="my-3 font-medium text-4xl text-center"><strong>BUT</strong>... Creating Viral Content Is <span className="pt-1 text-blue-600 border-b-2 border-blue-500 font-semibold">Hard</span></h3>
              <div className="max-w-xl mx-auto mt-10 space-y-3 leading-6 text-gray-800 sm:text-xl">
                <ul className="space-y-8">
                  <li className="flex items-start justify-start leading-7 text-left sm:leading-10 sm:block relative">
                    <span className="relative top-1 inline-flex flex-shrink-0 text-blue-700 items-center justify-center size-9 mr-3 sm:mr-1.5 text-[16px] bg-blue-50 border-2 border-blue-500/50 rounded-full">
                      <Check className="w-5 h-5" />
                    </span>
                    <span>
                      Creating consistent, high-quality content across multiple platforms takes hours each day. Most creators spend <span className="border-b-4 border-blue-200 pb-0.5">20+ hours per week</span> just on content creation. Our AI helps you create a weeks worth of content in minutes.
                    </span>
                  </li>

                  <li className="flex items-start justify-start leading-7 text-left sm:leading-10 sm:block relative">
                    <span className="relative top-0.5 inline-flex flex-shrink-0 text-blue-700 items-center justify-center size-9 mr-3 sm:mr-2 text-[16px] bg-blue-50 border-2 border-blue-500/50 rounded-full">
                      <Check className="w-5 h-5" />
                    </span>
                    <span>
                      It is challenging to maintain your authentic voice while scaling content. Most AI tools produce <span className="border-b-4 border-blue-200 pb-0.5">generic, robotic content</span>. Our AI learns your unique style and voice to create content that truly sounds like you.
                    </span>
                  </li>

                  <li className="flex items-start justify-start leading-7 text-left sm:leading-10 sm:block relative">
                    <span className="relative top-0.5 inline-flex flex-shrink-0 text-blue-700 items-center justify-center size-9 mr-3 sm:mr-3 text-[16px] bg-blue-50 border-2 border-blue-500/50 rounded-full">
                      <Check className="w-5 h-5" />
                    </span>
                    <span>
                      Keeping up with trends and maintaining engagement is <span className="border-b-4 border-blue-200 pb-0.5">exhausting and time-consuming</span>. Our AI analyzes trending content in your niche and helps you create posts that resonate with your audience.
                    </span>
                  </li>

                  <li className="flex items-start justify-start leading-7 text-left sm:leading-10 sm:block relative">
                    <span>
                      ... and the list goes on. <br />
                      <strong className="font-sans text-2xl">
                        Let
                        <span className="inline-flex">
                          <span className="font-semibold text-gray-800 flex justify-center items-center logo mx-2">
                            Big Mouth <span className="text-blue-500"> AI</span>
                          </span>
                        </span>
                        do the <br className="sm:hidden" />
                        <span className="text-blue-500">work for you</span>
                      </strong>
                      .
                    </span>
                  </li>
                </ul>
              </div>
            </div>



            <section className="relative">
              <div className="relative max-w-6xl mx-auto px-8 sm:px-6">
                <div className='p-4'>
                  <section className="py-12 mt-8 mb-8 md:flex sm:grid">
                    <div className="md:w-1/2 sm:w-full">
                      <div className="text-start mt-6 w-full p-4">
                        <h2 className="h2 text-4xl font-semibold mb-4 font-bold font-normal">
                          Write posts on X & BlueSky <span className="font-source-serif-4 font-normal text-blue-600 border-b-4 border-blue-200">in your authentic voice</span>
                        </h2>
                        <p className="text-gray-700">
                          Stop spending hours brainstorming. Our AI learns your unique writing style, tone, and expertise to generate posts that sound exactly like you. Keep your content consistent while saving hours every week.
                        </p>
                        <p className="text-lg text-gray-500 mb-8 grid gap-4 m-auto justify-start mt-4">
                          <span className='flex gap-4'>
                            <CheckCircle2 size={18} className='m-auto mx-0 text-green-500' />
                            Personalized AI trained on your best posts
                          </span>
                          <span className='flex gap-4'>
                            <CheckCircle2 size={18} className='m-auto mx-0 text-green-500' />
                            Smart thread generation & hooks
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-start mt-6 md:w-1/2 sm:w-full rounded bg-blue-200">
                      <div>
                        <img alt="AI Writing Assistant" loading="lazy" width="80" height="100" decoding="async" data-nimg="1" className="w-full rounded" src="/assets/ai-writing.png" />
                      </div>
                    </div>
                  </section>

                  <section className="py-12 mt-8 mb-8 md:flex sm:grid">
                    <div className="md:w-1/2 sm:w-full">
                      <div className="text-start mt-6 w-full p-4">
                        <h2 className="h2 text-4xl font-semibold mb-4 font-bold font-normal">
                          Create viral TikTok & IG videos that <span className="font-source-serif-4 font-normal text-blue-600 border-b-4 border-blue-200">captures attention</span>
                        </h2>
                        <p className="text-gray-700">
                          Transform your expertise into engaging short-form videos. Our AI analyzes trending content in your niche and helps you create scripts that hook viewers in the first 3 seconds and keep them watching till the end.
                        </p>
                        <p className="text-lg text-gray-500 mb-8 grid gap-4 m-auto justify-start mt-4">
                          <span className='flex gap-4'>
                            <CheckCircle2 size={18} className='m-auto mx-0 text-green-500' />
                            Trend-aware script generation
                          </span>
                          <span className='flex gap-4'>
                            <CheckCircle2 size={18} className='m-auto mx-0 text-green-500' />
                            Hook & script templates that convert
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-start mt-6 md:w-1/2 sm:w-full rounded bg-blue-200">
                      <div>
                        <img alt="Video Content Creation" loading="lazy" width="80" height="100" decoding="async" data-nimg="1" className="w-full rounded" src="/assets/video-content.png" />
                      </div>
                    </div>
                  </section>

                  <section className="py-12 mt-8 mb-8 md:flex sm:grid">
                    <div className="md:w-1/2 sm:w-full">
                      <div className="text-start mt-6 w-full p-4">
                        <h2 className="h2 text-4xl font-semibold mb-4 font-bold font-normal">
                          Turn Reddit discussions into <span className="font-source-serif-4 font-normal text-blue-600 border-b-4 border-blue-200">traffic & leads.</span>
                        </h2>
                        <p className="text-gray-700">
                          Never run out of content ideas. Our AI helps you discover trending discussions in your niche and create valuable responses that establish your expertise. Turn real user questions into content that resonates.
                        </p>
                        <p className="text-lg text-gray-500 mb-8 grid gap-4 m-auto justify-start mt-4">
                          <span className='flex gap-4'>
                            <CheckCircle2 size={18} className='m-auto mx-0 text-green-500' />
                            Smart trend & discussion discovery
                          </span>
                          <span className='flex gap-4'>
                            <CheckCircle2 size={18} className='m-auto mx-0 text-green-500' />
                            AI-powered response generation
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-start mt-6 md:w-1/2 sm:w-full rounded bg-blue-200">
                      <div>
                        <img alt="Content Discovery" loading="lazy" width="80" height="100" decoding="async" data-nimg="1" className="w-full rounded" src="/assets/content-discovery.png" />
                      </div>
                    </div>
                  </section>

                  <section className="py-12 mt-8 mb-8 md:flex sm:grid">
                    <div className="md:w-1/2 sm:w-full">
                      <div className="text-start mt-6 w-full p-4">
                        <h2 className="h2 text-4xl font-semibold mb-4 font-bold font-normal">
                          Build your content strategy like a <span className="font-source-serif-4 font-normal text-blue-600 border-b-4 border-blue-200">pro creator</span>
                        </h2>
                        <p className="text-gray-700">
                          Get a birds-eye view of your content strategy. Our AI helps you plan, schedule, and optimize content across all platforms while maintaining your unique voice and expertise in every post.
                        </p>
                        <p className="text-lg text-gray-500 mb-8 grid gap-4 m-auto justify-start mt-4">
                          <span className='flex gap-4'>
                            <CheckCircle2 size={18} className='m-auto mx-0 text-green-500' />
                            Smart Knowledge Wall
                          </span>
                          <span className='flex gap-4'>
                            <CheckCircle2 size={18} className='m-auto mx-0 text-green-500' />
                            Cross-platform optimization
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-start mt-6 md:w-1/2 sm:w-full rounded bg-blue-200">
                      <div>
                        <img alt="Content Strategy" loading="lazy" width="80" height="100" decoding="async" data-nimg="1" className="w-full rounded" src="/assets/content-strategy.png" />
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="p-6">
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700">
                          Choose Your Growth Plan
                        </h3>
                        <p className="text-gray-600 mt-2">Start creating viral content today</p>
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
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white'
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
            </section>

            <footer className="mt-12">
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="grid sm:grid-cols-12 gap-8 py-8 md:py-12 border-t border-gray-200 p-8">
                  <div className="sm:col-span-12 lg:col-span-4">
                    <div className="mb-2">
                      <img src="/logo.png" alt="Big Mouth AI" className="w-fit h-12" />
                      <p className="text-sm text-gray-600 mt-4 mb-4">
                        Big Mouth AI helps content creators automate their content creation while maintaining authenticity. Built by creators, for creators.
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <a className="text-gray-600 hover:text-gray-900 hover:underline transition duration-150 ease-in-out" href="/terms">Terms</a> ·
                      <a className="text-gray-600 hover:text-gray-900 hover:underline transition duration-150 ease-in-out" href="/privacy">Privacy Policy</a>
                    </div>
                  </div>

                  <div className="sm:col-span-6 md:col-span-3 lg:col-span-3">
                    <h6 className="text-gray-800 font-medium mb-2">Product</h6>
                    <ul className="text-sm">
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/dashboard">Dashboard</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/blog">Creator Blog</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/changelog">Whats New</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/templates">Content Templates</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/pricing">Pricing</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/support">Help Center</a></li>
                    </ul>
                  </div>

                  <div className="sm:col-span-6 md:col-span-3 lg:col-span-5">
                    <h6 className="text-gray-800 font-medium mb-2">Create Content For</h6>
                    <ul className="text-sm grid grid-cols-2 gap-2">
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/use-cases/twitter">Twitter/X</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/use-cases/instagram">Instagram</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/use-cases/tiktok">TikTok</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/use-cases/reddit">Reddit</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/use-cases/linkedin">LinkedIn</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/use-cases/youtube">YouTube</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/use-cases/blog">Blog Content</a></li>
                      <li className="mb-2"><a className="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out" href="/use-cases/newsletter">Newsletters</a></li>
                    </ul>
                  </div>
                </div>

                <div className="md:flex md:items-center md:justify-between py-4 md:py-8 border-t border-gray-200">
                  <ul className="flex mb-4 md:order-1 md:ml-4 md:mb-0">
                    <li>
                      <a
                        className="p-1 flex justify-center items-center text-gray-600 hover:text-gray-900 bg-white hover:bg-white-100 rounded-full shadow transition duration-150 ease-in-out border px-4"
                        aria-label="Twitter"
                        href="https://twitter.com/creatoraisuite"
                      >
                        <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                          <path d="m13.063 9 3.495 4.475L20.601 9h2.454l-5.359 5.931L24 23h-4.938l-3.866-4.893L10.771 23H8.316l5.735-6.342L8 9h5.063Zm-.74 1.347h-1.457l8.875 11.232h1.36l-8.778-11.232Z"></path>
                        </svg>
                        <span className="mr-2">Follow us on X</span>
                      </a>
                    </li>
                    <li className="ml-4">
                      <a
                        className="p-2 flex justify-center items-center text-gray-600 hover:text-gray-900 bg-white hover:bg-white-100 rounded-full shadow transition duration-150 ease-in-out border px-4"
                        aria-label="Discord"
                        href="https://discord.gg/creatoraisuite"
                      >
                        <Sparkles className="w-6 h-6 ml-1 text-gray-500 p-1" />
                        <span className="mr-2 ml-2">Join our community</span>
                      </a>
                    </li>
                  </ul>
                  <div className="text-sm text-gray-600 mr-4">
                    © {new Date().getFullYear()} Big Mouth AI. All rights reserved.
                  </div>
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
