import { TeamTicketView } from '@/components/TeamTicketView';

const ActiveTickets = () => {
  return (
    <TeamTicketView 
      title="Active Team Tickets"
      description="All tickets currently assigned to your team that are in progress."
      apiEndpoint="/team-lead/tickets/active"
    />
  );
};

export default ActiveTickets;