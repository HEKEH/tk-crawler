import axios from 'axios';

export function checkNetwork(url: string): Promise<boolean> {
  return axios
    .get(url)
    .then(() => true)
    .catch(e => {
      console.log('checkNetwork error', e);
      return false;
    });
}
