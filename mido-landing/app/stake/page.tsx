import StakingPage from "@/components/Stake";
import Rewards from "@/components/Rewards";
// import WalletConnectionProvider from '@/context/WalletContextProvider'

export default function Home() {
  return (
    <div className="space-y-8">
      <StakingPage />
      <Rewards />
    </div>
  );
}
