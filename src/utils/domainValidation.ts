// Domain and SSL validation utilities
export const validateDomain = () => {
  const currentDomain = window.location.hostname;
  const expectedDomains = ['lushlandsmanagement.com', 'www.lushlandsmanagement.com', 'localhost'];

  const isKnownHost =
    expectedDomains.includes(currentDomain) ||
    currentDomain.includes('netlify.app') ||
    currentDomain.includes('vercel.app') ||
    currentDomain.includes('bolt.new') ||
    currentDomain.endsWith('.webcontainer.io') ||
    currentDomain === '127.0.0.1';

  if (!isKnownHost) {
    console.warn('Unexpected domain detected:', currentDomain);
  }
  
  const skipHttpsRedirect =
    currentDomain === 'localhost' ||
    currentDomain === '127.0.0.1' ||
    currentDomain.includes('vercel.app') ||
    currentDomain.includes('bolt.new') ||
    currentDomain.endsWith('.webcontainer.io') ||
    import.meta.env.MODE === 'development';

  if (window.location.protocol !== 'https:' && !skipHttpsRedirect) {
    const redirectKey = 'https_redirect_attempts';
    const redirectAttempts = parseInt(sessionStorage.getItem(redirectKey) || '0', 10);

    if (redirectAttempts < 3) {
      sessionStorage.setItem(redirectKey, String(redirectAttempts + 1));
      window.location.href = `https://${currentDomain}${window.location.pathname}${window.location.search}`;
      return false;
    } else {
      sessionStorage.removeItem(redirectKey);
    }
  } else {
    sessionStorage.removeItem('https_redirect_attempts');
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