import { Inject } from 'typescript-ioc';

export function Autowired(...args: any[]): any {
    // Kludge
    return Inject(args[0], args[1]);
}
