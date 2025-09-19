export function getEnvConfig(): { companyName: string; badgeText: 'Client' | 'Vendor' } {

  const companyName = import.meta.env.VITE_COMPANY_NAME;
  const badgeText = import.meta.env.VITE_BADGE_TEXT;

  const validatedCompanyName = typeof companyName === 'string' && companyName.trim()
    ? companyName.trim()
    : 'Sky World Limited'; 
    
  const validatedBadgeText = badgeText === 'Client' || badgeText === 'Vendor'
    ? badgeText
    : 'Vendor';

  return {
    companyName: validatedCompanyName,
    badgeText: validatedBadgeText as 'Client' | 'Vendor'
  };
}