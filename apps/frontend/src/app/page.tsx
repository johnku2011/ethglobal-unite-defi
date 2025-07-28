export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">Welcome to DeFi Unite</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Your gateway to decentralized finance
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Swap</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Exchange tokens with the best rates
          </p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Liquidity</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Provide liquidity and earn rewards
          </p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Staking</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Stake your tokens and earn yield
          </p>
        </div>
      </div>
    </div>
  )
}
