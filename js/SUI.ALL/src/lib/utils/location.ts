export interface ILocation {
  // http(s)://domain
  hostname: string,
  // Empty if not localhost
  host: string
}

export function getLocation(fallbackHostname: string):ILocation {
  let host = '';
  if (typeof location === 'undefined') {
    // @ts-ignore
    location = {
      host: 'localhost',
      hostname: 'localhost',
    };
  }

  let hostname = location.host;


  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    hostname = fallbackHostname;
    host = 'http://' + hostname;
  }

  return {
    hostname,
    host
  }
}
