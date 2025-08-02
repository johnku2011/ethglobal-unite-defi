'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useWallet } from '@/providers/WalletProvider';
import { useCurrentWalletChain } from '@/providers/ChainProvider';
import { usePortfolio } from '@/hooks/api/usePortfolioQuery';
import {
  ArrowsRightLeftIcon,
  LinkIcon,
  ShieldCheckIcon,
  CubeTransparentIcon,
  BoltIcon,
  ChartBarIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { CompactDualWalletDisplay } from '@/components/DualWalletDisplay';

export default function LandingPage() {
  const { connectedWallets, connectEthereum } = useWallet();
  const { wallet: currentWallet } = useCurrentWalletChain();

  const isConnected = connectedWallets.length > 0;

  // Portfolio stats for connected users
  const ethereumWallet = connectedWallets.find(
    (wallet) => wallet.type === 'ethereum'
  );
  const walletAddress = currentWallet?.address || ethereumWallet?.address;
  const { data: portfolioData } = usePortfolio(walletAddress);

  const portfolioValue = useMemo(() => {
    if (
      !portfolioData ||
      !('result' in portfolioData) ||
      typeof portfolioData.result !== 'object'
    )
      return '$0.00';
    const result = portfolioData.result as { total?: number };
    const totalValue = result.total || 0;
    return totalValue > 0
      ? `$${totalValue.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : '$0.00';
  }, [portfolioData]);

  const features = [
    {
      icon: ChartBarIcon,
      title: 'Multi-Chain Portfolio Tracking',
      description:
        'Monitor all your assets across Ethereum, Polygon, BSC, and Sui in one unified dashboard.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: ArrowsRightLeftIcon,
      title: 'Optimal Token Swaps',
      description:
        'Get the best rates using 1inch aggregated liquidity across multiple DEXs.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: LinkIcon,
      title: 'Cross-Chain Bridging',
      description:
        'Seamlessly move assets between different blockchains with secure bridge protocols.',
      color: 'from-green-500 to-teal-500',
    },
    {
      icon: BoltIcon,
      title: 'Real-Time Analytics',
      description:
        'Live portfolio performance tracking with detailed charts and profit/loss analysis.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Non-Custodial',
      description:
        'Your keys, your crypto. We never store your private keys or have access to your funds.',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: CubeTransparentIcon,
      title: 'DeFi Protocols Integration',
      description:
        'Connect with major DeFi protocols and track your yields, staking, and LP positions.',
      color: 'from-cyan-500 to-blue-500',
    },
  ];

  // Stats are commented out for now as per user request
  // const stats = [
  //   { value: '$2.4B+', label: 'Total Value Tracked' },
  //   { value: '50K+', label: 'Active Users' },
  //   { value: '15+', label: 'Supported Networks' },
  //   { value: '99.9%', label: 'Uptime' },
  // ];

  const testimonials = [
    {
      quote:
        'UniPortfolio simplified my DeFi portfolio management across multiple chains. The real-time tracking is incredible.',
      author: 'Roy Lei',
      role: 'DeFi Trader',
      avatar: 'MR',
    },
    {
      quote:
        "The cross-chain bridging feature saved me hours. Best DeFi management tool I've used.",
      author: 'Edison Un',
      role: 'Crypto Investor',
      avatar: 'MR',
    },
    {
      quote:
        'Finally, a platform that gives me complete visibility into my multi-chain DeFi positions.',
      author: 'John Ku',
      role: 'Portfolio Manager',
      avatar: 'MR',
    },
  ];

  return (
    <div className='min-h-screen bg-white'>
      {/* Navigation Header */}
      <header className='absolute inset-x-0 top-0 z-50'>
        <nav
          className='flex items-center justify-between p-6 lg:px-8'
          aria-label='Global'
        >
          <div className='flex lg:flex-1'>
            <Link href='/' className='flex items-center space-x-3'>
              <div className='w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>UP</span>
              </div>
              <span className='text-xl font-bold text-gradient'>
                UniPortfolio
              </span>
            </Link>
          </div>
          <div className='flex lg:flex-1 lg:justify-end'>
            {isConnected ? (
              <div className='flex items-center space-x-4'>
                <span className='text-sm text-gray-600'>
                  Portfolio: {portfolioValue}
                </span>
                <Link href='/portfolio' className='btn-primary'>
                  Dashboard
                </Link>
              </div>
            ) : (
              <button onClick={() => connectEthereum()} className='btn-primary'>
                Connect Wallet
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className='relative isolate px-6 pt-14 lg:px-8'>
        <div className='absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80'>
          <div className='relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-500 to-accent-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]'></div>
        </div>

        <div className='mx-auto max-w-4xl py-32 sm:py-48 lg:py-56'>
          <div className='text-center'>
            <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
              Unified <span className='text-gradient'>DeFi Portfolio</span>
              <br />
              Management
            </h1>
            <p className='mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto'>
              Track, manage, and optimize your multi-chain DeFi portfolio across
              Ethereum, Polygon, BSC, and Sui. Get real-time analytics, optimal
              swaps, and seamless cross-chain bridging—all in one platform.
            </p>

            {isConnected ? (
              <div className='mt-10 flex flex-col items-center space-y-4'>
                <div className='bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-soft'>
                  <h3 className='text-sm font-medium text-gray-700 mb-3'>
                    Connected Wallets
                  </h3>
                  <CompactDualWalletDisplay variant='light' />
                  <div className='mt-4 text-2xl font-bold text-gray-900'>
                    Portfolio Value: {portfolioValue}
                  </div>
                  <div className='mt-4'>
                    <Link
                      href='/portfolio'
                      className='btn-primary text-sm px-4 py-2 inline-block text-center'
                    >
                      Go to Dashboard →
                    </Link>
                  </div>
                </div>
                <div className='flex items-center justify-center gap-x-6'>
                  <Link
                    href='/portfolio'
                    className='btn-primary text-lg px-8 py-3'
                  >
                    View Dashboard
                  </Link>
                  <Link href='/swap' className='btn-outline text-lg px-8 py-3'>
                    Start Trading
                  </Link>
                </div>
              </div>
            ) : (
              <div className='mt-10 flex items-center justify-center gap-x-6'>
                <button
                  onClick={() => connectEthereum()}
                  className='btn-primary text-lg px-8 py-3'
                >
                  Connect Wallet
                </button>
                <a href='#features' className='btn-outline text-lg px-8 py-3'>
                  Learn More
                </a>
              </div>
            )}
          </div>
        </div>

        <div className='absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]'>
          <div className='relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-accent-500 to-primary-500 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]'></div>
        </div>
      </div>

      {/* Stats Section */}
      {/* <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Trusted by DeFi users worldwide
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Join thousands of users managing their multi-chain portfolios with UniPortfolio
              </p>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col bg-white p-8">
                  <dt className="text-sm font-semibold leading-6 text-gray-600">{stat.label}</dt>
                  <dd className="order-first text-3xl font-bold tracking-tight text-gray-900">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div> */}

      {/* Features Section */}
      <div id='features' className='py-24 sm:py-32'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center'>
            <h2 className='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
              Everything you need for{' '}
              <span className='text-gradient'>DeFi portfolio management</span>
            </h2>
            <p className='mt-6 text-lg leading-8 text-gray-600'>
              From portfolio tracking to cross-chain bridging, UniPortfolio
              provides all the tools you need to manage your DeFi investments
              effectively.
            </p>
          </div>

          <div className='mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none'>
            <dl className='grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3'>
              {features.map((feature, index) => (
                <div key={index} className='flex flex-col'>
                  <dt className='flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900'>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r ${feature.color}`}
                    >
                      <feature.icon
                        className='h-6 w-6 text-white'
                        aria-hidden='true'
                      />
                    </div>
                    {feature.title}
                  </dt>
                  <dd className='mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600'>
                    <p className='flex-auto'>{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className='bg-gray-50 py-24 sm:py-32'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center'>
            <h2 className='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
              Loved by DeFi enthusiasts
            </h2>
            <p className='mt-6 text-lg leading-8 text-gray-600'>
              See what our users have to say about their experience with
              UniPortfolio
            </p>
          </div>

          <div className='mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none'>
            <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className='bg-white rounded-2xl p-8 shadow-soft'
                >
                  <div className='flex items-center space-x-1 mb-4'>
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className='h-5 w-5 text-yellow-400 fill-current'
                      />
                    ))}
                  </div>
                  <blockquote className='text-gray-900'>
                    <p>&ldquo;{testimonial.quote}&rdquo;</p>
                  </blockquote>
                  <figcaption className='mt-6 flex items-center gap-x-4'>
                    <div className='h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center'>
                      <span className='text-white font-medium text-sm'>
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <div className='font-semibold'>{testimonial.author}</div>
                      <div className='text-gray-600'>{testimonial.role}</div>
                    </div>
                  </figcaption>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className='bg-gradient-to-r from-primary-600 to-accent-600'>
        <div className='px-6 py-24 sm:px-6 sm:py-32 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center'>
            <h2 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
              Ready to take control of your DeFi portfolio?
            </h2>
            <p className='mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100'>
              Join thousands of users who trust UniPortfolio to manage their
              multi-chain DeFi investments. Start tracking your portfolio today.
            </p>
            <div className='mt-10 flex items-center justify-center gap-x-6'>
              {isConnected ? (
                <Link
                  href='/portfolio'
                  className='btn-secondary bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3'
                >
                  Go to Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => connectEthereum()}
                  className='btn-secondary bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3'
                >
                  Connect Wallet & Start
                </button>
              )}
              <a
                href='#features'
                className='text-lg font-semibold leading-6 text-white'
              >
                Learn more <span aria-hidden='true'>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className='bg-white'>
        <div className='mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8'>
          <div className='flex justify-center space-x-6 md:order-2'>
            <Link
              href='/portfolio'
              className='text-gray-400 hover:text-gray-500'
            >
              Portfolio
            </Link>
            <Link href='/swap' className='text-gray-400 hover:text-gray-500'>
              Swap
            </Link>
            <Link href='/bridge' className='text-gray-400 hover:text-gray-500'>
              Bridge
            </Link>
            <Link
              href='/transactions'
              className='text-gray-400 hover:text-gray-500'
            >
              Transactions
            </Link>
          </div>
          <div className='mt-8 md:order-1 md:mt-0'>
            <div className='flex items-center justify-center md:justify-start space-x-3'>
              <div className='w-6 h-6 bg-gradient-to-r from-primary-500 to-accent-500 rounded-md flex items-center justify-center'>
                <span className='text-white font-bold text-xs'>UP</span>
              </div>
              <p className='text-center text-xs leading-5 text-gray-500'>
                &copy; 2025 UniPortfolio. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
