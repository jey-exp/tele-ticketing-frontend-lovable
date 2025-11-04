import { TeamTicketView } from '@/components/TeamTicketView';

const SLARisks = () => {
  return (
    <TeamTicketView 
      title="SLA Risk Tickets"
      description="Tickets assigned to your team that are at risk of breaching their SLA within the next 2 hours."
      apiEndpoint="/team-lead/tickets/sla-risk"
    />
  );
};

export default SLARisks;