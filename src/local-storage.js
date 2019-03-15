  //Clears local storage 
  export const clearAuthToken = () => {
    try {
      console.log('clearing');
        localStorage.removeItem('authToken');
    } catch (e) {
      console.log('there was an error clearing auth token')
    }
  };

  //Load token from storage if it exists
  export const loadAuthToken = () => {
    try {
      return localStorage.getItem('authToken');
    } catch (e) {
      console.log('there was an error retreiving auth token')
    }
  };

  