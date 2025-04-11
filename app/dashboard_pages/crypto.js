import { useState, useEffect } from "react";
import { Alchemy, Network } from "alchemy-sdk";
import Web3 from "web3";

const web3 = new Web3("https://eth-mainnet.g.alchemy.com/v2/giadLfKaLWZqvwsi4e8vkTzXLL2kpQ-j");

const tokenMappings = {
  "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5": { name: "Compound ETH (cETH)", decimals: 8, cToken: true, coingeckoId: "compound-ether" },
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": { name: "Wrapped BTC (WBTC)", decimals: 8, coingeckoId: "wrapped-bitcoin" },
  "0xc00e94cb662c3520282e6f5717214004a7f26888": { name: "Compound (COMP)", decimals: 18, coingeckoId: "compound-governance-token" },
  "0x6b175474e89094c44da98b954eedeac495271d0f": { name: "Dai Stablecoin (DAI)", decimals: 18, coingeckoId: "dai", borrowed: true },
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": { name: "Wrapped Ether (WETH)", decimals: 18, coingeckoId: "ethereum" },
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": { name: "USD Coin (USDC)", decimals: 6, coingeckoId: "usd-coin" },
  "0xdac17f958d2ee523a2206206994597c13d831ec7": { name: "Tether (USDT)", decimals: 6, coingeckoId: "tether" }
};

// Compound contracts mapping for transaction history
const compoundContracts = {
  "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5": { name: "cETH", type: "Supply", token: "ETH", coingeckoId: "ethereum", isCollateral: true },
  "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643": { name: "cDAI", type: "Borrow", token: "DAI", coingeckoId: "dai", isCollateral: false },
  "0x39aa39c021dfbae8fac545936693ac917d5e7563": { name: "cUSDC", type: "Supply", token: "USDC", coingeckoId: "usd-coin", isCollateral: true },
  "0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9": { name: "cUSDT", type: "Supply", token: "USDT", coingeckoId: "tether", isCollateral: true },
  "0xccf4429db6322d5c611ee964527d42e5d685dd6a": { name: "cWBTC", type: "Supply", token: "WBTC", coingeckoId: "wrapped-bitcoin", isCollateral: true },
  "0x70e36f6bf80a52b3b46b3af8e106cc0ed743e8e4": { name: "cCOMP", type: "Supply", token: "COMP", coingeckoId: "compound-governance-token", isCollateral: true },
  "0xc11b1268c1a384e55c48c2391d8d480264a3a7f4": { name: "cWBTC Legacy", type: "Supply", token: "WBTC", coingeckoId: "wrapped-bitcoin", isCollateral: true },
  "0xb3319f5d18bc0d84dd1b4825dcde5d5f7266d407": { name: "cZRX", type: "Supply", token: "ZRX", coingeckoId: "0x", isCollateral: true },
  "0xe65cdb6479bac1e22340e4e755fae7e509ecd06c": { name: "cAAVE", type: "Supply", token: "AAVE", coingeckoId: "aave", isCollateral: true },
  "0x95b4ef2869ebd94beb4eee400a99824bf5dc325b": { name: "cMKR", type: "Supply", token: "MKR", coingeckoId: "maker", isCollateral: true },
  "0x4b0181102a0112a2ef11abee5563bb4a3176c9d7": { name: "cSUSHI", type: "Supply", token: "SUSHI", coingeckoId: "sushi", isCollateral: true },
  "0x80a2ae356fc9ef4305676f7a3e2ed04e12c33946": { name: "cYFI", type: "Supply", token: "YFI", coingeckoId: "yearn-finance", isCollateral: true },
  "0x12392f67bdf24fae0af363c24ac620a2f67dad86": { name: "Comptroller", type: "Admin", token: "COMP", coingeckoId: "compound-governance-token", isCollateral: false },
};

// Compound method signatures for transaction history
const compoundSignatures = {
  "0x1249c58b": { name: "mint", description: "Supply", impact: "supply" },
  "0xa0712d68": { name: "mint", description: "Supply", impact: "supply" },
  "0xdb006a75": { name: "redeem", description: "Withdraw", impact: "withdraw" },
  "0x852a12e3": { name: "redeemUnderlying", description: "Withdraw", impact: "withdraw" },
  "0xc5ebeaec": { name: "borrow", description: "Borrow", impact: "borrow" },
  "0x0e752702": { name: "repayBorrow", description: "Repay", impact: "repay" },
  "0x4e4d9fea": { name: "liquidateBorrow", description: "Liquidate", impact: "liquidate" },
  "0xaae40a2a": { name: "liquidateBorrow", description: "Liquidate", impact: "liquidate" },
  "0xf2b9fdb8": { name: "enter", description: "Enter Markets", impact: "none" },
  "0xede4edd0": { name: "exit", description: "Exit Market", impact: "none" },
  "0xd9caed12": { name: "claim", description: "Claim COMP", impact: "none" },
};

const alchemy = new Alchemy({
  apiKey: "giadLfKaLWZqvwsi4e8vkTzXLL2kpQ-j",
  network: Network.ETH_MAINNET,
});

const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,compound-ether,wrapped-bitcoin,compound-governance-token,dai,usd-coin,tether,0x,aave,maker,sushi,yearn-finance&vs_currencies=usd";

// Manual historical price mapping to avoid rate limiting and get more accurate values
const manualPriceMapping = {
  "ethereum": {
    "2021-04-27": 2600.47,
    "2021-04-28": 2742.81,
    "2021-05-23": 2146.39,
    "2021-06-26": 1829.07,
    "2022-06-10": 1782.61,
    "2022-06-13": 1175.06,
    "2022-06-18": 990.95,
    "2023-07-16": 1921.99,
  },
  "wrapped-bitcoin": {
    "2023-07-16": 30231.52,
  },
  "dai": {
    "2021-06-26": 1.00,
    "2022-06-10": 1.00,
    "2022-06-13": 1.00,
    "2022-06-18": 1.00,
  }
};

export default function App() {
  const [wallet, setWallet] = useState("");
  const [cTokens, setCTokens] = useState([]);
  const [tokenPrices, setTokenPrices] = useState({});
  const [supplied, setSupplied] = useState(0);
  const [borrowed, setBorrowed] = useState(0);
  const [healthFactor, setHealthFactor] = useState(null);
  const [liquidationPrice, setLiquidationPrice] = useState(null);
  
  // New state for transaction history
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [hasMoreTx, setHasMoreTx] = useState(true);
  const [historicalBalances, setHistoricalBalances] = useState([]);

  // Function to get historical price from our manual mapping
  const getHistoricalPrice = (coinId, dateObj) => {
    if (!coinId) return null;
    
    // Format date to YYYY-MM-DD
    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    
    // Check if we have this exact date in our mapping
    if (manualPriceMapping[coinId]?.[dateStr]) {
      return manualPriceMapping[coinId][dateStr];
    }
    
    // If we don't have the exact date, use the closest date before it
    const availableDates = Object.keys(manualPriceMapping[coinId] || {}).sort();
    
    // Find the closest date that's before our target date
    const closestDate = availableDates.reverse().find(date => date <= dateStr);
    
    if (closestDate && manualPriceMapping[coinId][closestDate]) {
      return manualPriceMapping[coinId][closestDate];
    }
    
    // If no historical price is found, use the current price
    return tokenPrices[coinId]?.usd || null;
  };

  const fetchCTokens = async () => {
    if (!wallet) {
      console.error("No wallet address provided.");
      return;
    }
    try {
      const response = await alchemy.core.getTokenBalances(wallet);
      console.log("Alchemy API Response:", response);
      
      if (response && response.tokenBalances) {
        setCTokens(response.tokenBalances);
        await calculateSupplied(response.tokenBalances);
        await calculateBorrowed();
        // Fetch transaction history when wallet is fetched
        fetchTransactionHistory();
      } else {
        setCTokens([]);
        console.error("Unexpected API response format", response);
      }
    } catch (error) {
      console.error("Error fetching token balances:", error);
    }
  };

  const calculateSupplied = async (tokens) => {
    let totalSupplied = 0;
    for (const token of tokens) {
      const tokenInfo = tokenMappings[token.contractAddress];
      if (tokenInfo && tokenInfo.cToken) {
        const contract = new web3.eth.Contract([{
          "constant": true,
          "inputs": [],
          "name": "exchangeRateStored",
          "outputs": [{ "name": "", "type": "uint256" }],
          "type": "function"
        }], token.contractAddress);

        const exchangeRate = await contract.methods.exchangeRateStored().call();
        const rate = parseFloat(exchangeRate.toString()) / 1e28; // Correct scaling for cETH
        const balance = parseFloat(BigInt(token.tokenBalance).toString()) / Math.pow(10, tokenInfo.decimals);
        totalSupplied += balance * rate;
      }
    }
    setSupplied(totalSupplied);
  };

  const calculateBorrowed = async () => {
    const cDaiContract = new web3.eth.Contract([{
      "constant": true,
      "inputs": [{ "name": "account", "type": "address" }],
      "name": "borrowBalanceStored",
      "outputs": [{ "name": "", "type": "uint256" }],
      "type": "function"
    }], "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643"); // cDAI contract

    const borrowBalance = await cDaiContract.methods.borrowBalanceStored(wallet).call();
    const borrowedDAI = parseFloat(BigInt(borrowBalance).toString()) / 1e18;
    setBorrowed(borrowedDAI);
    calculateHealthFactor(borrowedDAI);
  };

  const calculateHealthFactor = (totalBorrowed) => {
    const liquidationThreshold = 0.75;
    if (totalBorrowed > 0 && supplied > 0) {
      const hf = (supplied * liquidationThreshold) / totalBorrowed;
      setHealthFactor(hf);
      
      // Calculate liquidation price safely
      if (supplied * liquidationThreshold > 0) {
        const liquidationPrice = totalBorrowed / (supplied * liquidationThreshold);
        setLiquidationPrice(liquidationPrice);
      } else {
        setLiquidationPrice(null);
      }
    } else {
      setHealthFactor(null);
      setLiquidationPrice(null);
    }
  };

  const fetchTokenPrices = async () => {
    try {
      const res = await fetch(COINGECKO_API);
      const data = await res.json();
      setTokenPrices(data);
    } catch (error) {
      console.error("Error fetching token prices:", error);
    }
  };

  // Helper function to get coingeckoId from asset name
  const getCoingeckoId = (asset) => {
    switch(asset) {
      case "ETH": return "ethereum";
      case "WBTC": return "wrapped-bitcoin";
      case "DAI": return "dai";
      case "USDC": return "usd-coin";
      case "USDT": return "tether";
      case "COMP": return "compound-governance-token";
      default: return null;
    }
  };

  // New function to fetch transaction history with historical prices and fees
  const fetchTransactionHistory = async (page = 1) => {
    if (!wallet) return;
    
    setIsLoadingTx(true);
    try {
      // Get all compound contract addresses
      const compoundAddresses = Object.keys(compoundContracts);
      
      // Get all ERC20 token addresses we're interested in
      const erc20Addresses = Object.keys(tokenMappings);
      
      // Fetch transactions where the user interacted with any contract
      const response = await alchemy.core.getAssetTransfers({
        fromBlock: "0x0",
        toBlock: "latest",
        fromAddress: wallet,
        category: ["external", "erc20", "erc721", "internal"],
        withMetadata: true,
        maxCount: 1000,
        pageKey: page > 1 ? `page-${page}` : undefined
      });

      // Also fetch transactions TO the wallet (for receiving tokens)
      const incomingResponse = await alchemy.core.getAssetTransfers({
        fromBlock: "0x0",
        toBlock: "latest",
        toAddress: wallet,
        category: ["external", "erc20", "erc721", "internal"],
        withMetadata: true,
        maxCount: 1000,
        pageKey: page > 1 ? `page-${page}` : undefined
      });

      // Combine both transaction sets
      const allTransfers = [...response.transfers, ...incomingResponse.transfers];
      
      // Filter for transactions to/from Compound contracts OR involving our tokens of interest
      const relevantTxs = allTransfers.filter(tx => {
        // Check if transaction involves Compound contracts
        const isCompoundTx = 
          compoundAddresses.includes(tx.to?.toLowerCase()) || 
          compoundAddresses.includes(tx.from?.toLowerCase());
        
        // Check if transaction involves tokens we're tracking
        const isRelevantERC20 = 
          tx.asset && ["ETH", "DAI", "WBTC", "USDC", "USDT", "COMP"].includes(tx.asset) ||
          (tx.rawContract && erc20Addresses.includes(tx.rawContract.address?.toLowerCase()));
        
        return isCompoundTx || isRelevantERC20;
      });

      // Remove duplicates (same transaction hash)
      const uniqueTxs = Array.from(new Set(relevantTxs.map(tx => tx.hash)))
        .map(hash => relevantTxs.find(tx => tx.hash === hash));

      // Enrich transaction data
      const enrichedTxs = await Promise.all(uniqueTxs.map(async tx => {
        try {
          // Get transaction details to identify method and fees
          const txDetails = await alchemy.core.getTransaction(tx.hash);
          const txReceipt = await alchemy.core.getTransactionReceipt(tx.hash);
          
          // Calculate transaction fee - properly format numbers
          const gasUsed = parseInt(txReceipt.gasUsed, 16);
          const gasPrice = parseInt(txDetails.gasPrice, 16);
          const txFeeWei = gasUsed * gasPrice;
          const txFeeEth = txFeeWei / 1e18;
          // Also calculate gas price in Gwei for display
          const gasPriceGwei = gasPrice / 1e9;
          
          // Default transaction info
          let method = { 
            name: "transfer", 
            description: "Transfer", 
            impact: "none" 
          };
          
          let contract = { 
            name: tx.asset || "Unknown", 
            type: "Token", 
            token: tx.asset || "Unknown",
            coingeckoId: getCoingeckoId(tx.asset),
            isCollateral: false
          };
          
          // Override with Compound-specific info if it's a Compound transaction
          const contractAddress = tx.to?.toLowerCase() || tx.from?.toLowerCase();
          if (compoundAddresses.includes(contractAddress)) {
            // Identify Compound contract and method
            const methodId = txDetails.data.substring(0, 10);
            if (compoundSignatures[methodId]) {
              method = compoundSignatures[methodId];
            }
            
            if (compoundContracts[contractAddress]) {
              contract = compoundContracts[contractAddress];
            }
          }
          
          // Transaction date
          const txDate = new Date(tx.metadata.blockTimestamp);
          
          // Determine direction (in/out)
          const direction = tx.from?.toLowerCase() === wallet.toLowerCase() ? "out" : "in";
          
          // Get historical price using our manual mapping or current price
          const historicalPrice = getHistoricalPrice(contract.coingeckoId, txDate);
          
          // Calculate USD value
          const valueUSD = historicalPrice ? (parseFloat(tx.value || 0) * historicalPrice) : null;
          
          return {
            ...tx,
            timestamp: txDate.getTime(),
            date: txDate.toLocaleString(),
            contractName: contract.name,
            contractType: contract.type,
            method: method.name,
            action: direction === "out" ? method.description : `Receive ${contract.token}`,
            impact: method.impact,
            isCollateral: contract.isCollateral,
            tokenSymbol: contract.token,
            value: parseFloat(tx.value || 0),
            valueUSD,
            historicalPrice,
            txFeeEth,
            gasUsed,
            gasPriceGwei,
            direction
          };
        } catch (error) {
          console.error("Error enriching transaction:", error);
          return null;
        }
      }));

      // Filter out any null results
      const validTxs = enrichedTxs.filter(tx => tx !== null);

      // Sort transactions by timestamp (newest first)
      const sortedTxs = validTxs.sort((a, b) => b.timestamp - a.timestamp);

// Calculate running loan state balance correctly
      // Start from the earliest transactions and go forward in time
      // First reverse the sorted transactions (oldest first)
      const chronologicalTxs = [...sortedTxs].reverse();
      
      // Initialize balances
      let ethSupplied = 0;
      let daiSupplied = 0;
      let btcSupplied = 0;
      let daiBorrowed = 0;
      let ethBalance = 0;
      let daiBalance = 0;
      let btcBalance = 0;
      let usdcBalance = 0;
      let usdtBalance = 0;
      let cETHBalance = 0;
      let cDAIBalance = 0;
      let cWBTCBalance = 0;
      
      // Process transactions chronologically
      const txsWithBalance = chronologicalTxs.map(tx => {
        // Update Compound position balances based on the contract and action
        if (tx.contractName === "cETH") {
          if (tx.action === "Supply") {
            ethSupplied += tx.value;
            cETHBalance += tx.value;
            ethBalance -= tx.value; // Deduct from ETH balance when supplying
          } 
          else if (tx.action === "Withdraw") {
            ethSupplied -= tx.value;
            cETHBalance -= tx.value;
            ethBalance += tx.value; // Add to ETH balance when withdrawing
          }
        } 
        else if (tx.contractName === "cDAI") {
          if (tx.action === "Supply") {
            daiSupplied += tx.value;
            cDAIBalance += tx.value;
            daiBalance -= tx.value;
          } 
          else if (tx.action === "Withdraw") {
            daiSupplied -= tx.value;
            cDAIBalance -= tx.value;
            daiBalance += tx.value;
          }
          else if (tx.action === "Borrow") {
            daiBorrowed += tx.value;
            daiBalance += tx.value; // Add to DAI balance when borrowing
          }
          else if (tx.action === "Repay") {
            daiBorrowed -= tx.value;
            daiBalance -= tx.value; // Deduct from DAI balance when repaying
          }
        }
        else if (tx.contractName === "cWBTC" || tx.contractName === "cWBTC Legacy") {
          if (tx.action === "Supply") {
            btcSupplied += tx.value;
            cWBTCBalance += tx.value;
            btcBalance -= tx.value;
          } 
          else if (tx.action === "Withdraw") {
            btcSupplied -= tx.value;
            cWBTCBalance -= tx.value;
            btcBalance += tx.value;
          }
        }
        
        // Handle regular token transfers
        if (tx.asset === "ETH" || tx.asset === "WETH") {
          if (tx.direction === "out") ethBalance -= tx.value;
          else if (tx.direction === "in") ethBalance += tx.value;
        } 
        else if (tx.asset === "DAI") {
          if (tx.direction === "out") daiBalance -= tx.value;
          else if (tx.direction === "in") daiBalance += tx.value;
        }
        else if (tx.asset === "WBTC") {
          if (tx.direction === "out") btcBalance -= tx.value;
          else if (tx.direction === "in") btcBalance += tx.value;
        }
        else if (tx.asset === "USDC") {
          if (tx.direction === "out") usdcBalance -= tx.value;
          else if (tx.direction === "in") usdcBalance += tx.value;
        }
        else if (tx.asset === "USDT") {
          if (tx.direction === "out") usdtBalance -= tx.value;
          else if (tx.direction === "in") usdtBalance += tx.value;
        }
        
        // Calculate historical USD values based on the timestamp of this transaction
        const txDate = new Date(tx.timestamp);
        const ethPriceUSD = getHistoricalPrice("ethereum", txDate) || 0;
        const btcPriceUSD = getHistoricalPrice("wrapped-bitcoin", txDate) || 0;
        
        // Calculate USD values for all balances
        const ethBalanceUSD = ethBalance * ethPriceUSD;
        const daiBalanceUSD = daiBalance; // DAI is a stablecoin, 1 DAI ≈ 1 USD
        const btcBalanceUSD = btcBalance * btcPriceUSD;
        const usdcBalanceUSD = usdcBalance; // USDC is a stablecoin, 1 USDC ≈ 1 USD
        const usdtBalanceUSD = usdtBalance; // USDT is a stablecoin, 1 USDT ≈ 1 USD
        
        // Calculate USD values for all supplied/borrowed assets
        const ethSuppliedUSD = ethSupplied * ethPriceUSD;
        const cETHBalanceUSD = cETHBalance * ethPriceUSD;
        const daiSuppliedUSD = daiSupplied; // DAI is a stablecoin
        const daiBorrowedUSD = daiBorrowed; // DAI is a stablecoin
        const btcSuppliedUSD = btcSupplied * btcPriceUSD;
        const cWBTCBalanceUSD = cWBTCBalance * btcPriceUSD;
        
        // Calculate total portfolio value
        const totalPortfolioUSD = ethBalanceUSD + daiBalanceUSD + btcBalanceUSD + usdcBalanceUSD + usdtBalanceUSD + 
                                 ethSuppliedUSD + btcSuppliedUSD - daiBorrowedUSD;
        
        // Calculate net position in ETH equivalent (for comparison)
        const ethValue = ethSupplied;
        const btcInEth = btcSupplied * btcPriceUSD / ethPriceUSD;
        const netPositionETH = ethValue + btcInEth - (daiBorrowed / ethPriceUSD);
        
        return {
          ...tx,
          // Supply/borrow positions
          ethSupplied,
          daiSupplied,
          daiBorrowed,
          btcSupplied,
          cETHBalance,
          cDAIBalance,
          cWBTCBalance,
          
          // Regular token balances
          ethBalance,
          daiBalance,
          btcBalance,
          usdcBalance,
          usdtBalance,
          
          // USD values
          ethBalanceUSD,
          daiBalanceUSD,
          btcBalanceUSD,
          usdcBalanceUSD,
          usdtBalanceUSD,
          ethSuppliedUSD,
          daiSuppliedUSD, 
          daiBorrowedUSD,
          btcSuppliedUSD,
          
          // Summary metrics
          totalPortfolioUSD,
          netPositionETH,
          
          // Store prices for reference
          ethPriceUSD,
          btcPriceUSD
        };
      });
      
      // Sort back to newest-first for display
      const displayTxs = [...txsWithBalance].reverse();
      
      // Set transactions state
      if (page === 1) {
        setTransactions(displayTxs);
      } else {
        setTransactions(prev => [...prev, ...displayTxs]);
      }

      // Extract historical balances for potential charting
      const historicalData = txsWithBalance.map(tx => ({
        date: new Date(tx.timestamp),
        ethSupplied: tx.ethSupplied,
        daiBorrowed: tx.daiBorrowed,
        netPositionETH: tx.netPositionETH,
        ethBalance: tx.ethBalance,
        daiBalance: tx.daiBalance,
        btcBalance: tx.btcBalance
      }));

      setHistoricalBalances(historicalData);

      // Check if there are more pages
      setHasMoreTx(!!(response.pageKey || incomingResponse.pageKey));
      setTxPage(page);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
    } finally {
      setIsLoadingTx(false);
    }
  };

  // Load more transactions
  const loadMoreTransactions = () => {
    if (!isLoadingTx && hasMoreTx) {
      fetchTransactionHistory(txPage + 1);
    }
  };

  useEffect(() => {
    fetchTokenPrices();
  }, []);

  // Helper function to format transaction amount
  const formatAmount = (amount, tokenSymbol) => {
    const precision = ["ETH", "WBTC"].includes(tokenSymbol) ? 4 : 2;
    return `${parseFloat(amount).toFixed(precision)} ${tokenSymbol}`;
  };

  // Helper function to format USD amount
  const formatUSD = (amount) => {
    return amount !== null ? `$${parseFloat(amount).toFixed(2)}` : "-";
  };

  // Helper function to format ETH amount (for transaction fees)
  const formatETH = (amount) => {
    // Format with proper precision for small ETH values
    if (amount < 0.000001) {
      return `< 0.000001 ETH`;
    } else if (amount < 0.001) {
      return `${parseFloat(amount).toFixed(9)} ETH`;
    } else {
      return `${parseFloat(amount).toFixed(6)} ETH`;
    }
  };
  
  // Helper function to format gas price in Gwei
  const formatGwei = (gweiAmount) => {
    return `${parseFloat(gweiAmount).toFixed(2)} Gwei`;
  };

  // Helper function to get transaction status badge
  const getTxStatusBadge = (action) => {
    switch (action) {
      case "Supply":
        return <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-md text-xs font-medium">Supply</span>;
      case "Withdraw":
        return <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-md text-xs font-medium">Withdraw</span>;
      case "Borrow":
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs font-medium">Borrow</span>;
      case "Repay":
        return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs font-medium">Repay</span>;
      case "Liquidate":
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-xs font-medium">Liquidate</span>;
      default:
        if (action.startsWith("Receive")) {
          return <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-md text-xs font-medium">{action}</span>;
        }
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-medium">{action}</span>;
    }
  };

  // Helper function to get loan position indicator
  const getPositionIndicator = (netPosition) => {
    if (netPosition > 0) {
      return <span className="text-slate-600">+{netPosition.toFixed(4)} ETH</span>;
    } else if (netPosition < 0) {
      return <span className="text-red-600">{netPosition.toFixed(4)} ETH</span>;
    } else {
      return <span className="text-gray-600">0.0000 ETH</span>;
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Compound Loan Tracker</h1>

      <div className="flex gap-2 whitespace-nowrap">
        <input 
          type="text" 
          placeholder="Enter Wallet Address" 
          value={wallet} 
          onChange={(e) => setWallet(e.target.value)} 
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
        <button 
          onClick={fetchCTokens} 
          className="mt-2 px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          Fetch cTokens
        </button>
      </div>

      <div className="mt-4 bg-white rounded-lg shadow-md">
        <div className="p-4">
          <h2 className="text-lg font-semibold">Account Health:</h2>
          <p>ETH Price: ${tokenPrices.ethereum?.usd}</p>
          <p>Total Supplied: {supplied.toFixed(4)} ETH (${(supplied * tokenPrices.ethereum?.usd).toFixed(2)})</p>
          <p>Total Borrowed: {borrowed.toFixed(4)} DAI</p>
          <p>Health Factor: {healthFactor ? healthFactor.toFixed(2) : "N/A"}</p>
          {liquidationPrice !== null && <p>Liquidation Price: ${liquidationPrice.toFixed(2)}</p>}
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="mt-6 bg-white rounded-lg shadow-md">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Loan Transaction History</h2>
          

          
          {isLoadingTx && transactions.length === 0 ? (
            <div className="flex justify-center py-8">
              <p>Loading transaction history...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No transactions found for this wallet.</p>
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Action</th>
                      <th className="px-3 py-2 text-left">Asset</th>
                      <th className="px-3 py-2 text-right">Value</th>
                      <th className="px-3 py-2 text-right">USD Value</th>
                      <th className="px-3 py-2 text-center">Direction</th>
                      <th className="px-3 py-2 text-center">Tx Hash</th>
                      <th className="px-3 py-2 text-left">Cumulative Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-3">{tx.date}</td>
                        <td className="px-3 py-3">{getTxStatusBadge(tx.action)}</td>
                        <td className="px-3 py-3">{tx.contractName}</td>
                        <td className="px-3 py-3 text-right">
                          {tx.value > 0 ? formatAmount(tx.value, tx.tokenSymbol) : '-'}
                        </td>
                        <td className="px-3 py-3 text-right">
                          {formatUSD(tx.valueUSD)}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={tx.direction === "out" ? "text-red-600" : "text-slate-600"}>
                            {tx.direction === "out" ? "Outgoing" : "Incoming"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <a 
                            href={`https://etherscan.io/tx/${tx.hash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-slate-600 hover:underline text-sm"
                          >
                            {tx.hash.substring(0, 6)}...{tx.hash.substring(tx.hash.length - 4)}
                          </a>
                        </td>
                        <td className="px-3 py-3 text-left">
                          <div className="text-xs">
                            <div className="font-semibold text-sm mb-1">Tokens:</div>
                            {tx.ethBalance !== 0 && (
                              <div className="mb-1">ETH: {tx.ethBalance.toFixed(4)} (${tx.ethBalanceUSD.toFixed(2)})</div>
                            )}
                            {tx.daiBalance !== 0 && (
                              <div className="mb-1">DAI: {tx.daiBalance.toFixed(2)} (${tx.daiBalanceUSD.toFixed(2)})</div>
                            )}
                            {tx.btcBalance !== 0 && (
                              <div className="mb-1">WBTC: {tx.btcBalance.toFixed(8)} (${tx.btcBalanceUSD.toFixed(2)})</div>
                            )}
                            {tx.usdcBalance !== 0 && (
                              <div className="mb-1">USDC: {tx.usdcBalance.toFixed(2)} (${tx.usdcBalanceUSD.toFixed(2)})</div>
                            )}
                            {tx.usdtBalance !== 0 && (
                              <div className="mb-1">USDT: {tx.usdtBalance.toFixed(2)} (${tx.usdtBalanceUSD.toFixed(2)})</div>
                            )}
                            
                            <div className="font-semibold text-sm mt-2 mb-1">Compound Positions:</div>
                            {tx.cETHBalance !== 0 && (
                              <div className="mb-1 font-medium">cETH: {tx.cETHBalance.toFixed(4)} (${tx.ethSuppliedUSD.toFixed(2)})</div>
                            )}
                            {tx.cWBTCBalance !== 0 && (
                              <div className="mb-1 font-medium">cWBTC: {tx.cWBTCBalance.toFixed(8)} (${tx.btcSuppliedUSD.toFixed(2)})</div>
                            )}
                            {tx.daiBorrowed !== 0 && (
                              <div className="mb-1 font-medium text-red-600">Borrowed DAI: {tx.daiBorrowed.toFixed(2)} (${tx.daiBorrowedUSD.toFixed(2)})</div>
                            )}
                            
                            <div className="font-semibold text-sm text-slate-700 mt-2 border-t pt-1">
                              Total Portfolio: ${tx.totalPortfolioUSD.toFixed(2)}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {hasMoreTx && (
                <div className="mt-4 text-center">
                  <button 
                    onClick={loadMoreTransactions} 
                    disabled={isLoadingTx}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isLoadingTx ? 'Loading...' : 'Load More Transactions'}
                  </button>
                </div>
              )}
              
              <div className="mt-4 text-xs text-gray-500">
                <p>Note: Tracking all ERC20 transactions and Compound interactions.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}