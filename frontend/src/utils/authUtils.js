export const checkAuthentication = async () => {
    try {
      const response = await fetch('https://my-backend-project-production-c8a7.up.railway.app/api/check-auth', {
        method: 'POST',
        credentials: 'include', // Sertakan cookies HttpOnly
      });
  
      if (!response.ok) {
        // Jika otentikasi gagal, kembalikan false
        return false;
      }
  
      const data = await response.json();
      return data.isAuthenticated; // Misalnya response: { isAuthenticated: true }
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  };