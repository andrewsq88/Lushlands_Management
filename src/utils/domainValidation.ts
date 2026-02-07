// Domain and SSL validation utilities
export const validateDomain = () => {
  const currentDomain = window.location.hostname;
  const expectedDomains = ['lushlandsmanagement.com', 'www.lushlandsmanagement.com', 'localhost'];
  
  console.log('Current domain:', currentDomain);
  console.log('Protocol:', window.location.protocol);
  console.log('Full URL:', window.location.href);
  
  // Check if we're on the correct domain
  if (!expectedDomains.includes(currentDomain) && !currentDomain.includes('netlify.app')) {
    console.warn('Unexpected domain detected:', currentDomain);
  }
  
  // Check SSL status
  if (window.location.protocol !== 'https:' && currentDomain !== 'localhost') {
    console.error('SSL not enabled - redirecting to HTTPS');
    window.location.href = `https://${currentDomain}${window.location.pathname}${window.location.search}`;
    return false;
  }
  
  return true;
};

export const checkSSLCertificate = async () => {
  try {
    console.log('Checking SSL certificate status...');
    
    // Test HTTPS connectivity
    const response = await fetch(window.location.origin + '/health-check', {
      method: 'HEAD',
      mode: 'no-cors'
    });
    
    console.log('SSL check completed successfully');
    return true;
  } catch (error) {
    console.error('SSL certificate validation failed:', error);
    return false;
  }
};

export const validateEnvironmentVariables = () => {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing environment variables:', missingVars);
    return false;
  }
  
  // Validate Supabase URL format
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl.startsWith('https://')) {
    console.error('Supabase URL must use HTTPS:', supabaseUrl);
    return false;
  }
  
  console.log('Environment variables validated successfully');
  return true;
};

export const logDNSInfo = () => {
  console.log('=== DNS and Domain Information ===');
  console.log('Current URL:', window.location.href);
  console.log('Hostname:', window.location.hostname);
  console.log('Protocol:', window.location.protocol);
  console.log('Port:', window.location.port);
  console.log('User Agent:', navigator.userAgent);
  console.log('Referrer:', document.referrer);
  
  // Check for mixed content
  if (window.location.protocol === 'https:') {
    console.log('✅ HTTPS enabled');
  } else {
    console.warn('⚠️ Not using HTTPS');
  }
  
  // Log environment
  console.log('Environment:', import.meta.env.MODE);
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('=================================');
};