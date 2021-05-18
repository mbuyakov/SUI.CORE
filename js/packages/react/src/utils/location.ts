export interface ILocation {
  // http(s)://domain
  hostname: string,
  // Empty if not localhost
  host: string
}

export function getLocation(fallbackHostname: string):ILocation {
  let host = '';
  if (typeof location === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    location = {
      host: 'localhost',
      hostname: 'localhost',
    };
  }

  let hostname = location.host;


  if (isLocalServer()) {
    hostname = fallbackHostname;
    host = `http://${hostname}`;
  }

  return {
    hostname,
    host
  }
}


export function isLocalServer(): boolean {
  return location.hostname === 'localhost'
    || location.hostname === '127.0.0.1'
    || Boolean(process.env.IS_APP);
}
