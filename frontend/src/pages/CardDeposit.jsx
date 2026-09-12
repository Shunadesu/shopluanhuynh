import AccountSidebar from '../components/AccountSidebar';
import CardDepositPanel from '../components/CardDepositPanel';
import { Helmet } from 'react-helmet-async';

export default function CardDeposit() {
  return (
    <>
      <Helmet>
        <title>Nạp thẻ cào - Shop Nick Game</title>
        <meta name="description" content="Nạp tiền bằng thẻ cào Viettel, Mobifone, Vinaphone" />
      </Helmet>

      <div className="min-h-screen pt-20 pb-12 bg-light dark:bg-dark">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[280px,1fr] gap-6">
            <AccountSidebar />
            <div className="lg:col-start-2">
              <CardDepositPanel />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
