import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 10, // 10 utilisateurs virtuels
  duration: '15s', // pendant 15 secondes (test rapide)
};

export default function () {
  // On teste l'API des écritures du json-server
  const res = http.get('http://localhost:3000/ecritures');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'transaction time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
